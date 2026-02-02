import { pgTable, text, serial, boolean, timestamp, uuid, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===

// Users (Students/Staff)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  category: text("category").notNull(), // 'student' | 'staff'
  email: text("email").unique(), // Optional, for linkage
  createdAt: timestamp("created_at").defaultNow(),
});

// Fingerprints linked to users
export const fingerprints = pgTable("fingerprints", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  templateId: text("template_id").notNull().unique(), // ID from the local fingerprint SDK
  createdAt: timestamp("created_at").defaultNow(),
});

// Attendance Logs
export const attendanceLogs = pgTable("attendance_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  action: text("action").notNull(), // 'SIGN_IN' | 'SIGN_OUT'
  timestamp: timestamp("timestamp").defaultNow(),
  source: text("source").notNull(), // 'fingerprint' | 'manual'
});

// System Settings
export const systemSettings = pgTable("system_settings", {
  id: serial("id").primaryKey(),
  autoToggleEnabled: boolean("auto_toggle_enabled").default(true).notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// === SCHEMAS ===

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertFingerprintSchema = createInsertSchema(fingerprints).omit({ id: true, createdAt: true });
export const insertAttendanceLogSchema = createInsertSchema(attendanceLogs).omit({ id: true, timestamp: true });
export const insertSystemSettingsSchema = createInsertSchema(systemSettings).omit({ id: true, updatedAt: true });

// === TYPES ===

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Fingerprint = typeof fingerprints.$inferSelect;
export type InsertFingerprint = z.infer<typeof insertFingerprintSchema>;

export type AttendanceLog = typeof attendanceLogs.$inferSelect;
export type InsertAttendanceLog = z.infer<typeof insertAttendanceLogSchema>;

export type SystemSettings = typeof systemSettings.$inferSelect;
export type InsertSystemSettings = z.infer<typeof insertSystemSettingsSchema>;

// Request/Response Types
export type AttendanceStats = {
  totalPresent: number;
  activeStudents: number;
  activeStaff: number;
};
