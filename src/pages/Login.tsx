import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, LockKeyhole, KeyRound } from 'lucide-react';
import { api } from '../services/api';
import { useStore } from '../store/useStore';
import { motion } from 'framer-motion';

export default function Login() {
  const [pin, setPin] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [requires2FA, setRequires2FA] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const login = useStore(state => state.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requires2FA && pin.length !== 6) {
      setError('PIN must be 6 digits');
      return;
    }
    if (requires2FA && totpCode.length !== 6) {
      setError('2FA code must be 6 digits');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const payload = requires2FA ? { pin, totpCode } : { pin };
      const res = await api.post('/auth/login', payload);
      login(res.data.token, res.data.user);
      navigate('/');
    } catch (err: any) {
      if (err.response?.status === 403 && err.response?.data?.requires2FA) {
        setRequires2FA(true);
        setError('');
      } else {
        setError(err.response?.data?.error || 'Authentication failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-deep bg-radial-gradient flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm bg-panel border-t-2 border-t-cyan border-x border-b border-border-subtle rounded-sm p-8 relative"
      >
        <div className="font-mono text-[14px] text-cyan tracking-[2px] mb-10 flex justify-center items-center gap-2.5">
          <span className="w-3 h-3 bg-cyan shadow-cyan block"></span> SAFE VAULT v2.4
        </div>

        <p className="text-center text-tx-dim mb-8 text-[11px] font-mono uppercase tracking-[1px]">
          {requires2FA ? 'Provide 2FA Authenticator Code' : 'Provide Authorization PIN'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!requires2FA ? (
            <div>
              <div className="relative">
                <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tx-dim" />
                <input
                  type="password"
                  placeholder="••••••"
                  maxLength={6}
                  value={pin}
                  onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-deep border border-border-subtle rounded-sm px-10 py-3 text-center text-xl tracking-[0.5em] text-tx-main focus:outline-none focus:border-cyan transition-all font-mono"
                />
              </div>
            </div>
          ) : (
            <div>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tx-dim" />
                <input
                  type="text"
                  placeholder="XXXXXX"
                  maxLength={6}
                  value={totpCode}
                  onChange={e => setTotpCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-deep border border-border-subtle rounded-sm px-10 py-3 text-center text-xl tracking-[0.5em] text-tx-main focus:outline-none focus:border-cyan transition-all font-mono"
                />
              </div>
            </div>
          )}

          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red text-[11px] text-center font-mono bg-red/10 border border-red py-2">
              [AUTH_ERROR] {error}
            </motion.p>
          )}

          <button 
            disabled={loading || (!requires2FA && pin.length !== 6) || (requires2FA && totpCode.length !== 6)}
            className="w-full py-3 px-4 bg-transparent border border-cyan text-cyan text-[12px] font-bold uppercase tracking-[1px] disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:bg-cyan hover:text-black cursor-pointer"
          >
            {loading ? 'AUTHENTICATING...' : (requires2FA ? 'VERIFY 2FA' : 'MOUNT SYSTEM')}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
