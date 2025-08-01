import {Log} from '../types/Log';

const API_BASE_URL = 'https://c7a311a9-5bb5-4fe9-82f2-6ebfa5e9ffff-00-36r638d8u9zww.picard.replit.dev';

export const api = {
  async getLogs(): Promise<{success: boolean; logs: Log[]}> {
    const response = await fetch(`${API_BASE_URL}/api/logs`);
    return response.json();
  },

  async clearLogs(): Promise<{success: boolean; message: string}> {
    const response = await fetch(`${API_BASE_URL}/api/logs`, {
      method: 'DELETE',
    });
    return response.json();
  },
};

export const WS_URL = `wss://c7a311a9-5bb5-4fe9-82f2-6ebfa5e9ffff-00-36r638d8u9zww.picard.replit.dev/ws`;