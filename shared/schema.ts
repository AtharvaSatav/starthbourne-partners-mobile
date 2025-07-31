import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const logs = pgTable("logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  message: text("message").notNull(),
  beepType: text("beep_type").notNull(), // 'beep' or 'silent'
  source: text("source"), // optional source information
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  archived: boolean("archived").default(false).notNull(),
  archivedAt: timestamp("archived_at"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertLogSchema = createInsertSchema(logs).pick({
  message: true,
  beepType: true,
  source: true,
});

export const logDataSchema = z.object({
  message: z.string().min(1, "Message is required"),
  beepType: z.enum(["beep", "silent"], {
    required_error: "Beep type must be either 'beep' or 'silent'",
  }),
  source: z.string().optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertLog = z.infer<typeof insertLogSchema>;
export type Log = typeof logs.$inferSelect;
export type LogData = z.infer<typeof logDataSchema>;
