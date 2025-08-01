export interface Log {
  id: string;
  message: string;
  beepType: 'beep' | 'silent';
  source: string;
  timestamp: string;
  archived: boolean;
  archivedAt: string | null;
}

export interface CreateLogRequest {
  message: string;
  beepType: 'beep' | 'silent';
  source: string;
}