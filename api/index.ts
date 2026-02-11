import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import MemoryStore from "memorystore";
import { createServer } from "http";
import { db } from "../server/db.js";
import {
  users, fingerprints, attendanceLogs, systemSettings, adminUsers,
} from "../shared/schema.js";
import { api } from "../shared/routes.js";
import { z } from "zod";
import { eq, desc, sql, and, gte, lte } from "drizzle-orm";
import bcrypt from "bcryptjs";

const app = express();
const httpServer = createServer(app);

const MemoryStoreSession = MemoryStore(session);

declare module "express-session" {
  interface SessionData {
    userId?: number;
  }
}

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "biometric-attendance-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    store: new MemoryStoreSession({
      checkPeriod: 86400000,
    }),
    cookie: {
      secure: true,
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
      sameSite: "lax" as const,
    },
  })
);

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

// ===== Inline all routes for serverless =====

function requireAuth(req: Request, res: Response, next: express.NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorized - Please login" });
  }
  next();
}

// Auth: Register
app.post(api.auth.register.path, async (req, res) => {
  try {
    const input = api.auth.register.input.parse(req.body);
    
    const [existingUsername] = await db.select().from(adminUsers).where(eq(adminUsers.username, input.username));
    if (existingUsername) {
      return res.status(400).json({ message: "Username already exists" });
    }
    
    const [existingEmail] = await db.select().from(adminUsers).where(eq(adminUsers.email, input.email));
    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }
    
    const hashedPassword = await bcrypt.hash(input.password, 10);
    const [newUser] = await db.insert(adminUsers).values({
      username: input.username,
      email: input.email,
      password: hashedPassword,
      fullName: input.fullName,
      role: 'admin'
    }).returning();
    
    const { password, ...userWithoutPassword } = newUser;
    req.session.userId = newUser.id;
    
    res.status(201).json({ user: userWithoutPassword, message: "Registration successful" });
  } catch (err) {
    console.error("[Register Error]", err);
    if (err instanceof z.ZodError) {
      res.status(400).json({ message: err.errors[0].message });
    } else {
      res.status(500).json({ message: err instanceof Error ? err.message : "Internal Server Error" });
    }
  }
});

// Auth: Login
app.post(api.auth.login.path, async (req, res) => {
  try {
    const input = api.auth.login.input.parse(req.body);
    
    const [user] = await db.select().from(adminUsers).where(eq(adminUsers.username, input.username));
    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }
    
    const validPassword = await bcrypt.compare(input.password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: "Invalid username or password" });
    }
    
    req.session.userId = user.id;
    const { password, ...userWithoutPassword } = user;
    
    res.json({ user: userWithoutPassword, message: "Login successful" });
  } catch (err) {
    console.error("[Login Error]", err);
    if (err instanceof z.ZodError) {
      res.status(400).json({ message: err.errors[0].message });
    } else {
      res.status(500).json({ message: err instanceof Error ? err.message : "Internal Server Error" });
    }
  }
});

// Auth: Logout
app.post(api.auth.logout.path, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Failed to logout" });
    }
    res.json({ message: "Logged out successfully" });
  });
});

// Auth: Me
app.get(api.auth.me.path, async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  const [user] = await db.select().from(adminUsers).where(eq(adminUsers.id, req.session.userId));
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  const { password, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

// Users
app.get(api.users.list.path, requireAuth, async (req, res) => {
  const allUsers = await db.select().from(users).orderBy(desc(users.id));
  res.json(allUsers);
});

app.post(api.users.create.path, requireAuth, async (req, res) => {
  try {
    console.log("[User Create] Request body:", req.body);
    const input = api.users.create.input.parse(req.body);
    console.log("[User Create] Validated input:", input);
    const [user] = await db.insert(users).values(input).returning();
    console.log("[User Create] Created user:", user);
    res.status(201).json(user);
  } catch (err) {
    console.error("[User Creation Error]", err);
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: err.errors[0].message });
    }
    res.status(500).json({ message: err instanceof Error ? err.message : "Internal Server Error" });
  }
});

app.delete("/api/users/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  await db.delete(users).where(eq(users.id, id));
  res.json({ message: "User deleted" });
});

// Fingerprints
app.post(api.fingerprints.register.path, requireAuth, async (req, res) => {
  try {
    const input = api.fingerprints.register.input.parse(req.body);
    const [fp] = await db.insert(fingerprints).values(input).returning();
    res.status(201).json(fp);
  } catch (err) {
    console.error("[Fingerprint Register Error]", err);
    res.status(500).json({ message: err instanceof Error ? err.message : "Internal Server Error" });
  }
});

app.post(api.fingerprints.verify.path, requireAuth, async (req, res) => {
  try {
    const { templateId } = req.body;
    const [fp] = await db.select().from(fingerprints).where(eq(fingerprints.templateId, templateId));
    
    if (!fp) {
      return res.status(404).json({ message: "Fingerprint not recognized" });
    }
    
    const [user] = await db.select().from(users).where(eq(users.id, fp.userId));
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Get settings for auto-toggle
    const [settings] = await db.select().from(systemSettings);
    
    let action: 'SIGN_IN' | 'SIGN_OUT' = 'SIGN_IN';
    
    if (settings?.autoToggleEnabled) {
      const [lastLog] = await db.select().from(attendanceLogs)
        .where(eq(attendanceLogs.userId, user.id))
        .orderBy(desc(attendanceLogs.id))
        .limit(1);
      
      if (lastLog && lastLog.action === 'SIGN_IN') {
        action = 'SIGN_OUT';
      }
    }

    // Check daily attendance limit
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const tomorrowDate = new Date(today);
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    const tomorrowStr = tomorrowDate.toISOString().split('T')[0];

    const countResult = await db.select({ count: sql<number>`COUNT(*)::int` })
      .from(attendanceLogs)
      .where(and(
        eq(attendanceLogs.userId, user.id),
        eq(attendanceLogs.action, action),
        gte(attendanceLogs.timestamp, new Date(todayStr)),
        lte(attendanceLogs.timestamp, new Date(tomorrowStr))
      ));
    
    const todayCount = countResult[0]?.count || 0;

    if (todayCount >= 1) {
      return res.status(400).json({ 
        message: `You have already ${action === 'SIGN_IN' ? 'signed in' : 'signed out'} today`,
        alreadyRecorded: true
      });
    }

    const [log] = await db.insert(attendanceLogs).values({
      userId: user.id,
      action,
      source: 'fingerprint'
    }).returning();

    res.json({
      message: `Successfully ${action === 'SIGN_IN' ? 'Signed In' : 'Signed Out'}`,
      user,
      action
    });
  } catch (err) {
    console.error("[Fingerprint Verify Error]", err);
    res.status(500).json({ message: err instanceof Error ? err.message : "Internal Server Error" });
  }
});

// Attendance Logs
app.get(api.attendance.list.path, requireAuth, async (req, res) => {
  try {
    const userId = req.query.userId ? Number(req.query.userId) : undefined;
    const dateStr = req.query.date as string;
    
    let query = db.select({
      id: attendanceLogs.id,
      userId: attendanceLogs.userId,
      action: attendanceLogs.action,
      timestamp: attendanceLogs.timestamp,
      source: attendanceLogs.source,
      user: {
        id: users.id,
        fullName: users.fullName,
        category: users.category,
        email: users.email,
        createdAt: users.createdAt,
      }
    }).from(attendanceLogs)
      .innerJoin(users, eq(attendanceLogs.userId, users.id))
      .orderBy(desc(attendanceLogs.id)) as any;

    const conditions: any[] = [];
    if (userId) conditions.push(eq(attendanceLogs.userId, userId));
    if (dateStr) {
      const startOfDay = new Date(dateStr);
      const endOfDay = new Date(dateStr);
      if (!isNaN(startOfDay.getTime()) && !isNaN(endOfDay.getTime())) {
        startOfDay.setHours(0, 0, 0, 0);
        endOfDay.setHours(23, 59, 59, 999);
        conditions.push(gte(attendanceLogs.timestamp, startOfDay) as any);
        conditions.push(lte(attendanceLogs.timestamp, endOfDay) as any);
      }
    }
    if (conditions.length > 0) {
      query = query.where(and(...conditions) as any) as any;
    }

    const logs = await query;
    res.json(logs);
  } catch (err) {
    console.error("[Get Attendance Logs Error]", err);
    res.status(500).json({ message: err instanceof Error ? err.message : "Internal Server Error" });
  }
});

app.post(api.attendance.create.path, requireAuth, async (req, res) => {
  try {
    const input = api.attendance.create.input.parse(req.body);
    const [log] = await db.insert(attendanceLogs).values(input).returning();
    res.status(201).json(log);
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get(api.attendance.stats.path, requireAuth, async (req, res) => {
  try {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    const todayLogs = await db.select({
      userId: attendanceLogs.userId,
      action: attendanceLogs.action,
      category: users.category,
    }).from(attendanceLogs)
      .innerJoin(users, eq(attendanceLogs.userId, users.id))
      .where(gte(attendanceLogs.timestamp, new Date(todayStr)));

    const signedIn = new Set<number>();
    const signedOut = new Set<number>();
    const userCategories = new Map<number, string>();

    for (const log of todayLogs) {
      userCategories.set(log.userId, log.category);
      if (log.action === 'SIGN_IN') signedIn.add(log.userId);
      if (log.action === 'SIGN_OUT') signedOut.add(log.userId);
    }

    let activeStudents = 0;
    let activeStaff = 0;
    
    for (const userId of Array.from(signedIn)) {
      if (!signedOut.has(userId)) {
        const category = userCategories.get(userId);
        if (category === 'student') activeStudents++;
        if (category === 'staff') activeStaff++;
      }
    }

    res.json({
      totalPresent: activeStudents + activeStaff,
      activeStudents,
      activeStaff,
    });
  } catch (err) {
    console.error("[Stats Error]", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Settings
app.get(api.settings.get.path, requireAuth, async (req, res) => {
  try {
    let [settings] = await db.select().from(systemSettings);
    if (!settings) {
      [settings] = await db.insert(systemSettings).values({ autoToggleEnabled: true }).returning();
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.patch(api.settings.update.path, requireAuth, async (req, res) => {
  try {
    const [existing] = await db.select().from(systemSettings);
    let settings;
    if (existing) {
      [settings] = await db.update(systemSettings).set(req.body).where(eq(systemSettings.id, existing.id)).returning();
    } else {
      [settings] = await db.insert(systemSettings).values(req.body).returning();
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export default app;
