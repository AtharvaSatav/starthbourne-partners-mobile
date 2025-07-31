import { logs, type Log, type InsertLog } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  createLog(log: InsertLog): Promise<Log>;
  getCurrentLogs(): Promise<Log[]>;
  archiveOldLogs(): Promise<number>;
  clearCurrentLogs(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async createLog(insertLog: InsertLog): Promise<Log> {
    const [log] = await db
      .insert(logs)
      .values(insertLog)
      .returning();
    return log;
  }

  async getCurrentLogs(): Promise<Log[]> {
    return await db
      .select()
      .from(logs)
      .where(eq(logs.archived, false))
      .orderBy(desc(logs.timestamp));
  }

  async archiveOldLogs(): Promise<number> {
    const result = await db
      .update(logs)
      .set({ 
        archived: true, 
        archivedAt: new Date() 
      })
      .where(eq(logs.archived, false));
    
    return result.rowCount || 0;
  }

  async clearCurrentLogs(): Promise<void> {
    await db
      .delete(logs)
      .where(eq(logs.archived, false));
  }
}

export const storage = new DatabaseStorage();
