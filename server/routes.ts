import type { Express, Request, Response, NextFunction } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

// Authentication middleware
function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorized - Please login" });
  }
  next();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // ===== Authentication Routes =====
  app.post(api.auth.register.path, async (req, res) => {
    try {
      const input = api.auth.register.input.parse(req.body);
      
      // Check if username already exists
      const existingUsername = await storage.getAdminUserByUsername(input.username);
      if (existingUsername) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      // Check if email already exists
      const existingEmail = await storage.getAdminUserByEmail(input.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }
      
      const user = await storage.createAdminUser(input);
      req.session.userId = user.id;
      
      res.status(201).json({ 
        user, 
        message: "Registration successful" 
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  });

  app.post(api.auth.login.path, async (req, res) => {
    try {
      const input = api.auth.login.input.parse(req.body);
      
      const user = await storage.verifyAdminPassword(input.username, input.password);
      if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      req.session.userId = user.id;
      
      res.json({ 
        user, 
        message: "Login successful" 
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  });

  app.post(api.auth.logout.path, async (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logout successful" });
    });
  });

  app.get(api.auth.me.path, async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const user = await storage.getAdminUserById(req.session.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json(user);
  });

  // ===== Protected Routes (require authentication) =====
  // Users
  app.get(api.users.list.path, requireAuth, async (req, res) => {
    const users = await storage.getUsers();
    res.json(users);
  });

  app.post(api.users.create.path, requireAuth, async (req, res) => {
    try {
      const input = api.users.create.input.parse(req.body);
      const user = await storage.createUser(input);
      res.status(201).json(user);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  });

  app.get(api.users.get.path, requireAuth, async (req, res) => {
    const user = await storage.getUser(Number(req.params.id));
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  });

  app.delete(api.users.delete.path, requireAuth, async (req, res) => {
    await storage.deleteUser(Number(req.params.id));
    res.status(204).send();
  });

  // Fingerprint Verification & Attendance Logic
  app.post(api.fingerprints.verify.path, requireAuth, async (req, res) => {
    try {
      const { templateId } = api.fingerprints.verify.input.parse(req.body);
      
      const fingerprint = await storage.getFingerprintByTemplateId(templateId);
      if (!fingerprint) {
        return res.status(404).json({ message: "Fingerprint not recognized" });
      }

      const user = await storage.getUser(fingerprint.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found for this fingerprint" });
      }

      const settings = await storage.getSystemSettings();
      let action = 'SIGN_IN'; // Default

      if (settings.autoToggleEnabled) {
        const lastLog = await storage.getLastAttendanceLog(user.id);
        if (lastLog && lastLog.action === 'SIGN_IN') {
          // If already signed in, next action is SIGN_OUT
          // (assuming they didn't forget to sign out yesterday, but simpler logic for now)
          
          // Check if last sign in was today to be safe? 
          // For now, simple toggle logic as requested.
          action = 'SIGN_OUT';
        }
      }

      await storage.createAttendanceLog({
        userId: user.id,
        action,
        source: 'fingerprint'
      });

      res.json({
        message: `Successfully ${action === 'SIGN_IN' ? 'Signed In' : 'Signed Out'}`,
        user,
        action: action as 'SIGN_IN' | 'SIGN_OUT'
      });

    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  });

  app.post(api.fingerprints.register.path, requireAuth, async (req, res) => {
    try {
      const input = api.fingerprints.register.input.parse(req.body);
      const fp = await storage.createFingerprint(input);
      res.status(201).json(fp);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  });

  // Attendance Logs
  app.get(api.attendance.list.path, requireAuth, async (req, res) => {
    const logs = await storage.getAttendanceLogs(
      req.query.userId ? Number(req.query.userId) : undefined,
      req.query.date as string
    );
    res.json(logs);
  });
  
  app.post(api.attendance.create.path, requireAuth, async (req, res) => {
    try {
      const input = api.attendance.create.input.parse(req.body);
      const log = await storage.createAttendanceLog(input);
      res.status(201).json(log);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  });

  app.get(api.attendance.stats.path, requireAuth, async (req, res) => {
    const stats = await storage.getAttendanceStats();
    res.json(stats);
  });

  // Settings
  app.get(api.settings.get.path, requireAuth, async (req, res) => {
    const settings = await storage.getSystemSettings();
    res.json(settings);
  });

  app.put(api.settings.update.path, requireAuth, async (req, res) => {
    try {
      const input = api.settings.update.input.parse(req.body);
      const settings = await storage.updateSystemSettings(input);
      res.json(settings);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  });

  // Seed Data (if empty)
  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const users = await storage.getUsers();
  if (users.length === 0) {
    console.log("Seeding database...");
    
    // Create Users
    const u1 = await storage.createUser({ fullName: "Alice Student", category: "student", email: "alice@school.edu" });
    const u2 = await storage.createUser({ fullName: "Bob Staff", category: "staff", email: "bob@school.edu" });
    const u3 = await storage.createUser({ fullName: "Charlie Student", category: "student", email: "charlie@school.edu" });

    // Create Fingerprints (Simulated IDs)
    await storage.createFingerprint({ userId: u1.id, templateId: "fp_alice_001" });
    await storage.createFingerprint({ userId: u2.id, templateId: "fp_bob_002" });
    
    // Create some past logs
    await storage.createAttendanceLog({ userId: u1.id, action: "SIGN_IN", source: "fingerprint" });
    await storage.createAttendanceLog({ userId: u2.id, action: "SIGN_IN", source: "fingerprint" });
    
    console.log("Database seeded!");
  }
}
