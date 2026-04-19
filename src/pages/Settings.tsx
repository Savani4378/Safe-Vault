import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { api } from '../services/api';
import { KeyRound, ShieldAlert, Timer } from 'lucide-react';

export default function Settings() {
  const { user, stealthMode, setStealthMode, autoLockMinutes, setAutoLockMinutes } = useStore();
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [pinMessage, setPinMessage] = useState('');

  const handlePinChange = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/auth/change-pin', { oldPin, newPin });
      setPinMessage('PIN updated successfully');
      setOldPin('');
      setNewPin('');
    } catch (err: any) {
      setPinMessage(err.response?.data?.error || 'Failed to update PIN');
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-[24px] font-light text-tx-main">Security Settings</h1>
        <p className="text-[13px] text-tx-dim mt-1">Configure your vault security and preferences</p>
      </div>

      <div className="space-y-6">
        
        {/* Master PIN */}
        <section className="bg-black border border-[#333] p-6 rounded-[2px]">
          <div className="flex items-center gap-3 mb-6 border-b border-[#333] pb-4">
            <KeyRound className="w-4 h-4 text-cyan" />
            <h2 className="text-[14px] font-mono text-tx-main uppercase tracking-wider">Change Master PIN</h2>
          </div>
          
          <form onSubmit={handlePinChange} className="space-y-4 max-w-sm">
            <div>
              <label className="block text-[11px] font-mono text-tx-dim uppercase mb-1">Current PIN</label>
              <input 
                type="password" maxLength={6} required value={oldPin} onChange={e => setOldPin(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-[#111] border border-[#333] px-4 py-2 text-white font-mono tracking-[0.3em] focus:outline-none focus:border-cyan"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-tx-dim uppercase mb-1">New PIN</label>
              <input 
                type="password" maxLength={6} required value={newPin} onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-[#111] border border-[#333] px-4 py-2 text-white font-mono tracking-[0.3em] focus:outline-none focus:border-cyan"
              />
            </div>
            <button className="bg-transparent border border-cyan text-cyan hover:bg-cyan/10 px-4 py-2 text-[12px] uppercase tracking-wider transition-colors cursor-pointer">
              Update Security PIN
            </button>
            {pinMessage && <p className="text-[12px] mt-2 font-mono text-cyan">[{pinMessage}]</p>}
          </form>
        </section>

        {/* Stealth Mode */}
        <section className="bg-black border border-[#333] p-6 flex items-center justify-between rounded-[2px]">
          <div className="flex items-start gap-4">
            <div className="p-2 border border-[#333] bg-deep">
              <ShieldAlert className="w-5 h-5 text-[#444]" />
            </div>
            <div>
              <h2 className="text-[14px] font-mono text-tx-main uppercase tracking-wider">Stealth Capabilities</h2>
              <p className="text-[12px] text-tx-dim mt-1">Allow creation of disguised containers with plausible deniability.</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" checked={stealthMode} onChange={e => setStealthMode(e.target.checked)} />
            <div className="w-11 h-6 bg-deep border-border-subtle border peer-focus:outline-none peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-tx-dim after:border-border-subtle after:border after:h-[18px] after:w-[18px] after:transition-all peer-checked:after:bg-cyan"></div>
          </label>
        </section>

        {/* Auto Lock */}
        <section className="bg-black border border-[#333] p-6 rounded-[2px]">
          <div className="flex items-center gap-3 mb-6 border-b border-[#333] pb-4">
            <Timer className="w-4 h-4 text-cyan" />
            <h2 className="text-[14px] font-mono text-tx-main uppercase tracking-wider">Auto Lock Settings</h2>
          </div>
          <div className="max-w-sm">
            <label className="block text-[11px] font-mono text-tx-dim uppercase mb-2">Inactivity TTL Timeout</label>
            <select 
              value={autoLockMinutes}
              onChange={e => setAutoLockMinutes(parseInt(e.target.value, 10))}
              className="w-full bg-[#111] border border-[#333] px-4 py-2 text-[13px] text-tx-main font-mono focus:outline-none focus:border-cyan"
            >
              <option value={1}>1 Minute</option>
              <option value={5}>5 Minutes</option>
              <option value={15}>15 Minutes</option>
              <option value={60}>1 Hour</option>
              <option value={0}>0 (Never)</option>
            </select>
            <p className="text-[11px] text-tx-dim mt-2 font-mono">System mounts will automatically lock after selected TTL.</p>
          </div>
        </section>

      </div>
    </div>
  );
}
