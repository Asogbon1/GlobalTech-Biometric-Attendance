import { db } from "./db";
import {
  users, fingerprints, attendanceLogs, systemSettings,
  type User, type InsertUser,
  type Fingerprint, type InsertFingerprint,
  type AttendanceLog, type InsertAttendanceLog,
  type SystemSettings, type InsertSystemSettings,
  type AttendanceStats
} from "@shared/schema";
import { eq, desc, sql, and, gte, lte } from "drizzle-orm";
import { subDays } from "date-fns";

export interface IStorage {
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
  createAttendanceLog(log: InsertAttendanceLog): Promise<AttendanceLog>;
  getAttendanceStats(): Promise<AttendanceStats>;

  // Settings
  getSystemSettings(): Promise<SystemSettings>;
  updateSystemSettings(settings: Partial<InsertSystemSettings>): Promise<SystemSettings>;
}

export class DatabaseStorage implements IStorage {
  async getUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
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
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(dateStr);
      endOfDay.setHours(23, 59, 59, 999);
      
      conditions.push(
        and(
          gte(attendanceLogs.timestamp, startOfDay),
          lte(attendanceLogs.timestamp, endOfDay)
        )
      );
    }

    if (conditions.length > 0) {
      // @ts-ignore
      query = query.where(and(...conditions));
    }

    // @ts-ignore
    return await query;
  }

  async getLastAttendanceLog(userId: number): Promise<AttendanceLog | undefined> {
    const [log] = await db.select()
      .from(attendanceLogs)
      .where(eq(attendanceLogs.userId, userId))
      .orderBy(desc(attendanceLogs.timestamp))
      .limit(1);
    return log;
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
