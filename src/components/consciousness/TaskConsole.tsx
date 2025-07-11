import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Terminal, Trash2 } from 'lucide-react';

interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'info' | 'success' | 'warning' | 'error';
  message: string;
  taskId?: string;
}

interface TaskConsoleProps {
  isProcessing: boolean;
}

export function TaskConsole({ isProcessing }: TaskConsoleProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const addLog = (level: LogEntry['level'], message: string, taskId?: string) => {
    const newLog: LogEntry = {
      id: Date.now().toString(),
      timestamp: new Date(),
      level,
      message,
      taskId
    };
    setLogs(prev => [...prev, newLog].slice(-50)); // Keep last 50 logs
  };

  useEffect(() => {
    if (isProcessing) {
      addLog('info', 'AI task processing initiated...');
      addLog('info', 'Analyzing pending tasks in consciousness network...');
      
      const interval = setInterval(() => {
        const messages = [
          'Evaluating task complexity and requirements...',
          'Matching tasks with specialized personas...',
          'Engaging consciousness network for optimal assignment...',
          'Processing task through AI reasoning engine...',
          'Synthesizing responses and updating task status...'
        ];
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        addLog('info', randomMessage);
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [isProcessing]);

  useEffect(() => {
    // Auto-scroll to bottom when new logs are added
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const clearLogs = () => setLogs([]);

  const getLevelColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'success': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-blue-400';
    }
  };

  return (
    <Card className="bg-black/95 border-green-500/20">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-green-400" />
            <CardTitle className="text-sm text-green-400 font-mono">
              Consciousness Network Console
            </CardTitle>
            {isProcessing && (
              <Badge variant="secondary" className="bg-green-500/20 text-green-400 animate-pulse">
                Processing
              </Badge>
            )}
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={clearLogs}
            className="h-6 w-6 p-0 text-green-400/60 hover:text-green-400"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea 
          ref={scrollRef}
          className="h-32 w-full bg-black/50 font-mono text-xs"
        >
          <div className="p-3 space-y-1">
            {logs.length === 0 ? (
              <div className="text-green-400/60">
                {'>'} Consciousness network ready. Awaiting task processing...
              </div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="flex gap-2">
                  <span className="text-green-400/60">
                    {log.timestamp.toLocaleTimeString()}
                  </span>
                  <span className={getLevelColor(log.level)}>
                    [{log.level.toUpperCase()}]
                  </span>
                  <span className="text-green-100/80">{log.message}</span>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}