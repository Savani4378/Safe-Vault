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
    if (type.includes('FAILED') || type.includes('ERROR')) return <XCircle className="w-5 h-5 text-red" />;
    if (type.includes('SUCCESS') || type.includes('SETUP')) return <CheckCircle className="w-5 h-5 text-cyan" />;
    return <ShieldAlert className="w-5 h-5 text-tx-dim" />;
  };

  if (loading) return <div className="text-white text-center py-20 font-mono text-[11px]">Analyzing security logs...</div>;

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <Activity className="w-8 h-8 text-cyan" />
          <h1 className="text-[24px] font-light text-tx-main">Security Audit</h1>
        </div>
        <p className="text-[13px] text-tx-dim mt-1">Review system activity, authentication attempts, and vault modifications.</p>
      </div>

      <div className="bg-black border border-[#333] rounded-[2px] overflow-hidden">
        {logs.length === 0 ? (
          <div className="text-center py-12 text-tx-dim font-mono text-[11px]">No security events logged yet.</div>
        ) : (
          <div className="divide-y divide-[#333]">
            {logs.map((log) => (
              <motion.div 
                key={log.id} 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 hover:bg-[#111] transition-colors flex items-start gap-4"
              >
                <div className="mt-1">
                  {getIcon(log.event_type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1 text-sm font-mono">
                    <span className={`tracking-wide text-[11px] uppercase ${log.event_type.includes('FAILED') ? 'text-red' : 'text-cyan'}`}>
                      {log.event_type}
                    </span>
                    <span className="text-[11px] text-tx-dim">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-[13px] text-tx-main">{log.details}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
