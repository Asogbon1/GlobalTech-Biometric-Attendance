import { db } from "./db.js";
import {
  users, fingerprints, attendanceLogs, systemSettings, adminUsers,
  type User, type InsertUser,
  type Fingerprint, type InsertFingerprint,
  type AttendanceLog, type InsertAttendanceLog,
  type SystemSettings, type InsertSystemSettings,
  type AttendanceStats,
  type AdminUser, type InsertAdminUser, type RegisterInput
} from "@shared/schema.js";
import { eq, desc, sql, and, gte, lte } from "drizzle-orm";
import { subDays } from "date-fns";
import bcrypt from "bcryptjs";

export interface IStorage {
  // Auth
  createAdminUser(user: RegisterInput): Promise<Omit<AdminUser, 'password'>>;
  getAdminUserByUsername(username: string): Promise<AdminUser | undefined>;
  getAdminUserByEmail(email: string): Promise<AdminUser | undefined>;
  getAdminUserById(id: number): Promise<Omit<AdminUser, 'password'> | undefined>;
  verifyAdminPassword(username: string, password: string): Promise<Omit<AdminUser, 'password'> | null>;

  // Users
  getUsers(): Promise<User[]>;
  getUser(id: number): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  deleteUser(id: number): Promise<void>;

  // Fingerprints
  getFingerprintByTemplateId(templateId: string): Promise<Fingerprint | undefined>;
  createFingerprint(fingerprint: InsertFingerprint): Promise<Fingerprint>;

  // Attendance
  getAttendanceLogs(userId?: number, dateStr?: string): Promise<(AttendanceLog & { user: User })[]>;
  getLastAttendanceLog(userId: number): Promise<AttendanceLog | undefined>;
  getTodayAttendanceCount(userId: number, action: 'SIGN_IN' | 'SIGN_OUT'): Promise<number>;
  createAttendanceLog(log: InsertAttendanceLog): Promise<AttendanceLog>;
  getAttendanceStats(): Promise<AttendanceStats>;

  // Settings
  getSystemSettings(): Promise<SystemSettings>;
  updateSystemSettings(settings: Partial<InsertSystemSettings>): Promise<SystemSettings>;
}

export class DatabaseStorage implements IStorage {
  // Authentication Methods
  async createAdminUser(user: RegisterInput): Promise<Omit<AdminUser, 'password'>> {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const [newUser] = await db.insert(adminUsers).values({
      username: user.username,
      email: user.email,
      password: hashedPassword,
      fullName: user.fullName,
      role: 'admin'
    }).returning();
    
    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  async getAdminUserByUsername(username: string): Promise<AdminUser | undefined> {
    const [user] = await db.select().from(adminUsers).where(eq(adminUsers.username, username));
    return user;
  }

  async getAdminUserByEmail(email: string): Promise<AdminUser | undefined> {
    const [user] = await db.select().from(adminUsers).where(eq(adminUsers.email, email));
    return user;
  }

  async getAdminUserById(id: number): Promise<Omit<AdminUser, 'password'> | undefined> {
    const [user] = await db.select().from(adminUsers).where(eq(adminUsers.id, id));
    if (!user) return undefined;
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async verifyAdminPassword(username: string, password: string): Promise<Omit<AdminUser, 'password'> | null> {
    const user = await this.getAdminUserByUsername(username);
    if (!user) return null;
    
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return null;
    
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async getUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    try {
      console.log("[Creating User] Input data:", user);
      const [newUser] = await db.insert(users).values(user).returning();
      console.log("[Creating User] Success:", newUser);
      return newUser;
    } catch (error) {
      console.error("[Creating User] Database error:", error);
      throw error;
    }
  }

  async deleteUser(id: number): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async getFingerprintByTemplateId(templateId: string): Promise<Fingerprint | undefined> {
    const [fp] = await db.select().from(fingerprints).where(eq(fingerprints.templateId, templateId));
    return fp;
  }

  async createFingerprint(fingerprint: InsertFingerprint): Promise<Fingerprint> {
    const [fp] = await db.insert(fingerprints).values(fingerprint).returning();
    return fp;
  }

  async getAttendanceLogs(userId?: number, dateStr?: string): Promise<(AttendanceLog & { user: User })[]> {
    let query = db
      .select({
        id: attendanceLogs.id,
        userId: attendanceLogs.userId,
        action: attendanceLogs.action,
        timestamp: attendanceLogs.timestamp,
        source: attendanceLogs.source,
        user: users
      })
      .from(attendanceLogs)
      .innerJoin(users, eq(attendanceLogs.userId, users.id))
      .orderBy(desc(attendanceLogs.timestamp));

    const conditions = [];
    if (userId) {
      conditions.push(eq(attendanceLogs.userId, userId));
    }
    if (dateStr) {
      // Very basic date filtering - assumes YYYY-MM-DD
      const startOfDay = new Date(dateStr);
      const endOfDay = new Date(dateStr);
      
      // Check if dates are valid
      if (!isNaN(startOfDay.getTime()) && !isNaN(endOfDay.getTime())) {
        startOfDay.setHours(0, 0, 0, 0);
        endOfDay.setHours(23, 59, 59, 999);
        
        conditions.push(
          gte(attendanceLogs.timestamp, startOfDay) as any,
          lte(attendanceLogs.timestamp, endOfDay) as any
        );
      }
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions) as any) as any;
    }

    return await query as any;
  }

  async getLastAttendanceLog(userId: number): Promise<AttendanceLog | undefined> {
    const [log] = await db.select()
      .from(attendanceLogs)
      .where(eq(attendanceLogs.userId, userId))
      .orderBy(desc(attendanceLogs.timestamp))
      .limit(1);
    return log;
  }

  async getTodayAttendanceCount(userId: number, action: 'SIGN_IN' | 'SIGN_OUT'): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const result = await db.select({ count: sql<number>`count(*)` })
      .from(attendanceLogs)
      .where(
        and(
          eq(attendanceLogs.userId, userId),
          eq(attendanceLogs.action, action),
          sql`${attendanceLogs.timestamp} >= ${today.toISOString()}`,
          sql`${attendanceLogs.timestamp} < ${tomorrow.toISOString()}`
        )
      );
    
    return Number(result[0]?.count || 0);
  }

  async createAttendanceLog(log: InsertAttendanceLog): Promise<AttendanceLog> {
    const [newLog] = await db.insert(attendanceLogs).values(log).returning();
    return newLog;
  }

  async getAttendanceStats(): Promise<AttendanceStats> {
    // Get unique users present today
    const today = new Date();
    today.setHours(0,0,0,0);
    
    // This is a simplified "Present" logic - anyone who signed IN today
    const presentLogs = await db
      .select({ 
        userId: attendanceLogs.userId, 
        category: users.category 
      })
      .from(attendanceLogs)
      .innerJoin(users, eq(attendanceLogs.userId, users.id))
      .where(
        and(
          eq(attendanceLogs.action, 'SIGN_IN'),
          gte(attendanceLogs.timestamp, today)
        )
      )
      .groupBy(attendanceLogs.userId, users.category);

    const students = presentLogs.filter(l => l.category === 'student').length;
    const staff = presentLogs.filter(l => l.category === 'staff').length;

    return {
      totalPresent: presentLogs.length,
      activeStudents: students,
      activeStaff: staff
    };
  }

  async getSystemSettings(): Promise<SystemSettings> {
    const [settings] = await db.select().from(systemSettings).limit(1);
    if (!settings) {
      // Default settings
      const [newSettings] = await db.insert(systemSettings).values({ autoToggleEnabled: true }).returning();
      return newSettings;
    }
    return settings;
  }

  async updateSystemSettings(updates: Partial<InsertSystemSettings>): Promise<SystemSettings> {
    const current = await this.getSystemSettings();
    const [updated] = await db
      .update(systemSettings)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(systemSettings.id, current.id))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
