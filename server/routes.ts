import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { logDataSchema } from "@shared/schema";
import cron from "node-cron";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // WebSocket server setup
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Store WebSocket connections
  const wsConnections = new Set<WebSocket>();

  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    wsConnections.add(ws);

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log('WebSocket message received:', data);
        
        // Broadcast to all connected clients
        wsConnections.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
          }
        });
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket client disconnected');
      wsConnections.delete(ws);
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      wsConnections.delete(ws);
    });
  });

  // API Routes
  
  // POST endpoint to receive log data
  app.post('/api/logs', async (req, res) => {
    try {
      const validatedData = logDataSchema.parse(req.body);
      
      const log = await storage.createLog(validatedData);
      
      // Broadcast new log to all WebSocket clients
      const logMessage = JSON.stringify({ type: 'NEW_LOG', data: log });
      wsConnections.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(logMessage);
        }
      });

      res.status(201).json({ success: true, log });
    } catch (error) {
      console.error('Error creating log:', error);
      res.status(400).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Invalid log data' 
      });
    }
  });

  // GET endpoint to fetch current logs
  app.get('/api/logs', async (req, res) => {
    try {
      const logs = await storage.getCurrentLogs();
      res.json({ success: true, logs });
    } catch (error) {
      console.error('Error fetching logs:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch logs' 
      });
    }
  });

  // DELETE endpoint to clear current logs
  app.delete('/api/logs', async (req, res) => {
    try {
      await storage.clearCurrentLogs();
      
      // Broadcast clear logs to all WebSocket clients
      const clearMessage = JSON.stringify({ type: 'CLEAR_LOGS' });
      wsConnections.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(clearMessage);
        }
      });

      res.json({ success: true, message: 'Logs cleared successfully' });
    } catch (error) {
      console.error('Error clearing logs:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to clear logs' 
      });
    }
  });

  // Daily archival cron job - runs at 6 PM every day
  cron.schedule('0 18 * * *', async () => {
    try {
      console.log('Running daily log archival at 6 PM...');
      const archivedCount = await storage.archiveOldLogs();
      console.log(`Archived ${archivedCount} logs`);
      
      // Broadcast archive notification and clear logs from home screen
      const archiveMessage = JSON.stringify({ 
        type: 'LOGS_ARCHIVED_AND_CLEARED', 
        data: { count: archivedCount, timestamp: new Date().toISOString() }
      });
      wsConnections.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(archiveMessage);
        }
      });
    } catch (error) {
      console.error('Error during daily archival:', error);
    }
  });

  return httpServer;
}
