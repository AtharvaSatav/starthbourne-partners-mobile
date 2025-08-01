import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useWebSocket } from "@/hooks/use-websocket";
import { useAudio } from "@/hooks/use-audio";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Log } from "@shared/schema";
import { 
  Satellite, 
  Plug, 
  Server, 
  List, 
  Power, 
  VolumeX, 
  Trash2, 
  Clock,
  Volume2,
  VolumeOff,
  Inbox
} from "lucide-react";

interface LogsResponse {
  success: boolean;
  logs: Log[];
}

export default function Home() {
  const [sessionStart] = useState(new Date().toLocaleTimeString());
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isConnected, lastMessage, sendKillSwitch } = useWebSocket();
  const { isPlaying, playBeep, stopBeep, startContinuousBeep } = useAudio();

  // Fetch current logs
  const { data: logsData, isLoading } = useQuery<LogsResponse>({
    queryKey: ["/api/logs"],
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const logs = logsData?.logs || [];

  // Clear logs mutation
  const clearLogsMutation = useMutation({
    mutationFn: () => apiRequest("DELETE", "/api/logs"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/logs"] });
      toast({
        title: "Logs cleared",
        description: "All current session logs have been cleared.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to clear logs: " + error.message,
        variant: "destructive",
      });
    },
  });

  // Handle WebSocket messages
  useEffect(() => {
    if (!lastMessage) return;

    switch (lastMessage.type) {
      case "NEW_LOG":
        // Invalidate queries to fetch new logs
        queryClient.invalidateQueries({ queryKey: ["/api/logs"] });
        
        // Start continuous beep if it's a beep type log
        if (lastMessage.data?.beepType === "beep") {
          startContinuousBeep();
        }
        break;
        
      case "CLEAR_LOGS":
        queryClient.invalidateQueries({ queryKey: ["/api/logs"] });
        toast({
          title: "Logs cleared remotely",
          description: "Logs were cleared by another client.",
        });
        break;
        
      case "LOGS_ARCHIVED":
        queryClient.invalidateQueries({ queryKey: ["/api/logs"] });
        toast({
          title: "Daily archival completed",
          description: `${lastMessage.data?.count || 0} logs archived at 6 PM.`,
        });
        break;
        
      case "LOGS_ARCHIVED_AND_CLEARED":
        queryClient.invalidateQueries({ queryKey: ["/api/logs"] });
        toast({
          title: "Daily cleanup completed",
          description: `${lastMessage.data?.count || 0} logs archived and home screen cleared for new day.`,
        });
        break;
    }
  }, [lastMessage, queryClient, startContinuousBeep, toast]);

  const handleKillSwitch = async () => {
    const success = sendKillSwitch();
    if (success) {
      toast({
        title: "Kill switch activated",
        description: "STOP signal sent via WebSocket.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Connection error",
        description: "Failed to send kill switch signal. Check WebSocket connection.",
        variant: "destructive",
      });
    }
  };

  const handleStopBeep = () => {
    stopBeep();
    toast({
      title: "Audio stopped",
      description: "Beep notifications have been silenced.",
    });
  };

  const handleClearLogs = () => {
    if (window.confirm("Are you sure you want to clear all current logs?")) {
      clearLogsMutation.mutate();
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  const getNextCleanupTime = () => {
    const now = new Date();
    const today6PM = new Date(now);
    today6PM.setHours(18, 0, 0, 0);
    
    // If it's already past 6 PM today, show tomorrow's 6 PM
    if (now > today6PM) {
      today6PM.setDate(today6PM.getDate() + 1);
    }
    
    return today6PM.toLocaleString('en-US', {
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="min-h-screen bg-app-light-gray">
      {/* Header */}
      <header className="bg-app-black text-app-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Satellite className="text-white w-8 h-8" />
              <div>
                <h1 className="text-xl font-bold text-white">Starthbourne Partners</h1>
                <p className="text-sm text-gray-300">Monitoring Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
                isConnected 
                  ? 'bg-app-green text-app-white' 
                  : 'bg-app-red text-app-white'
              }`}>
                <div className="w-2 h-2 bg-app-white rounded-full animate-pulse"></div>
                <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard */}
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        
        {/* Control Panel */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-app-black mb-4">System Controls</h2>
            
            {/* Status Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-app-light-gray rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-app-gray">WebSocket</span>
                  <Plug className={isConnected ? "text-app-green" : "text-app-red"} size={20} />
                </div>
                <p className="text-xs text-app-gray">{`${window.location.protocol.replace('http', 'ws')}//${window.location.host}/ws`}</p>
              </div>

              <div className="bg-app-light-gray rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-app-gray">API Endpoint</span>
                  <Server className="text-app-green" size={20} />
                </div>
                <p className="text-xs text-app-gray">POST /api/logs</p>
              </div>

              <div className="bg-app-light-gray rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-app-gray">Active Logs</span>
                  <List className="text-app-black" size={20} />
                </div>
                <p className="text-lg font-bold text-app-black">{logs.length}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={handleKillSwitch}
                className="flex-1 bg-app-red hover:bg-red-700 text-app-white font-semibold py-3 px-6 min-h-[48px] touch-manipulation"
                disabled={!isConnected}
              >
                <Power className="mr-2" size={20} />
                KILL SWITCH
              </Button>

              <Button 
                onClick={handleStopBeep}
                className={`flex-1 font-semibold py-3 px-6 min-h-[48px] touch-manipulation ${
                  isPlaying 
                    ? 'bg-yellow-500 hover:bg-yellow-600 text-black border-2 border-black animate-pulse' 
                    : 'bg-gray-400 hover:bg-gray-500 text-white'
                }`}
                disabled={!isPlaying}
              >
                <VolumeX className="mr-2" size={20} />
                STOP BEEP
              </Button>

              <Button 
                onClick={handleClearLogs}
                className="flex-1 bg-app-gray hover:bg-gray-600 text-app-white font-semibold py-3 px-6 min-h-[48px] touch-manipulation"
                disabled={clearLogsMutation.isPending}
              >
                <Trash2 className="mr-2" size={20} />
                CLEAR LOGS
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Log Feed Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-app-black">Live Log Feed</h2>
          <div className="flex items-center space-x-2 text-sm text-app-gray">
            <Clock size={16} />
            <span>Auto-refresh enabled</span>
          </div>
        </div>

        {/* Log Feed Container */}
        <Card className="overflow-hidden">
          <div className="max-h-[60vh] overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center text-app-gray">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-app-black mx-auto mb-4"></div>
                <p>Loading logs...</p>
              </div>
            ) : logs.length === 0 ? (
              <div className="p-8 text-center text-app-gray">
                <Inbox className="mx-auto mb-4" size={48} />
                <h3 className="text-lg font-medium mb-2">No logs yet</h3>
                <p className="text-sm">Waiting for incoming data from API endpoint...</p>
              </div>
            ) : (
              logs.map((log) => (
                <div 
                  key={log.id}
                  className={`p-4 border-b border-gray-100 transition-colors duration-150 ${
                    log.beepType === 'beep' 
                      ? 'log-entry-beep' 
                      : 'log-entry-silent'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className={`px-2 py-1 rounded text-xs font-medium text-app-white ${
                        log.beepType === 'beep' ? 'bg-app-red' : 'bg-app-green'
                      }`}>
                        {log.beepType.toUpperCase()}
                      </div>
                      {log.beepType === 'beep' ? (
                        <Volume2 className="text-app-red" size={16} />
                      ) : (
                        <VolumeOff className="text-app-green" size={16} />
                      )}
                    </div>
                    <span className="text-xs text-app-gray font-mono">
                      {formatTimestamp(log.timestamp.toString())}
                    </span>
                  </div>
                  <div className="bg-app-white rounded-lg p-3 font-mono text-sm">
                    <div className="text-app-black">{log.message}</div>
                    {log.source && (
                      <div className="text-app-gray text-xs mt-2">Source: {log.source}</div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Footer Info */}
        <Card className="mt-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-app-gray">Next cleanup at</p>
                <p className="text-sm font-semibold text-app-black">{getNextCleanupTime()}</p>
              </div>
              <div>
                <p className="text-xs text-app-gray">Session started</p>
                <p className="text-sm font-semibold text-app-black">{sessionStart}</p>
              </div>
              <div>
                <p className="text-xs text-app-gray">WebSocket Status</p>
                <p className={`text-sm font-semibold ${isConnected ? 'text-app-green' : 'text-app-red'}`}>
                  {isConnected ? 'Connected' : 'Disconnected'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

      </main>
    </div>
  );
}
