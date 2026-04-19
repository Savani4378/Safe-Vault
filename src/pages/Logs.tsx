import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Activity, ShieldAlert, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface AuditLog {
  id: string;
  event_type: string;
  timestamp: string;
  details: string;
}

export default function Logs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get('/vault/logs');
        setLogs(res.data.logs);
      } catch (err) {
        console.error('Failed to fetch logs', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const getIcon = (type: string) => {
    if (type.includes('FAILED') || type.includes('ERROR')) return <XCircle className="w-5 h-5 text-red-500" />;
    if (type.includes('SUCCESS') || type.includes('SETUP')) return <CheckCircle className="w-5 h-5 text-green-400" />;
    return <ShieldAlert className="w-5 h-5 text-indigo-400" />;
  };

  if (loading) return <div className="text-white text-center py-20 font-mono text-[11px]">Analyzing security logs...</div>;

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-light text-white flex items-center gap-3">
          <Activity className="w-8 h-8 text-indigo-500" /> Security Audit
        </h1>
        <p className="text-neutral-400 mt-1">Review system activity, authentication attempts, and vault modifications.</p>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
        {logs.length === 0 ? (
          <div className="text-center py-12 text-neutral-500 font-mono text-[11px]">No security events logged yet.</div>
        ) : (
          <div className="divide-y divide-neutral-800">
            {logs.map((log) => (
              <motion.div 
                key={log.id} 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 hover:bg-neutral-800/20 transition-colors flex items-start gap-4"
              >
                <div className="mt-1">
                  {getIcon(log.event_type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1 text-sm font-mono">
                    <span className={`tracking-wide ${log.event_type.includes('FAILED') ? 'text-red-400' : 'text-indigo-400'}`}>
                      {log.event_type}
                    </span>
                    <span className="text-neutral-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-300">{log.details}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
