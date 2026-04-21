import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { api } from '../services/api';
import { KeyRound, ShieldAlert, Timer, Smartphone } from 'lucide-react';

export default function Settings() {
  const { user, stealthMode, setStealthMode, autoLockMinutes, setAutoLockMinutes } = useStore();
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [pinMessage, setPinMessage] = useState('');

  const [show2FASetup, setShow2FASetup] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [totpInput, setTotpInput] = useState('');
  const [totpMessage, setTotpMessage] = useState('');
  const [showDisable2FA, setShowDisable2FA] = useState(false);
  const [disablePin, setDisablePin] = useState('');

  const handlePinChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (oldPin.length !== 6 || newPin.length !== 6) {
      setPinMessage('PIN must be exactly 6 digits');
      return;
    }
    try {
      await api.post('/auth/change-pin', { oldPin, newPin });
      setPinMessage('PIN updated successfully');
      setOldPin('');
      setNewPin('');
    } catch (err: any) {
      setPinMessage(err.response?.data?.error || 'Failed to update PIN');
    }
  };

  const handleGenerate2FA = async () => {
    try {
      const res = await api.post('/auth/generate-2fa');
      setQrCodeUrl(res.data.qrCodeUrl);
      setShow2FASetup(true);
      setTotpMessage('');
    } catch (err: any) {
      setTotpMessage(err.response?.data?.error || 'Failed to generate 2FA');
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (totpInput.length !== 6) return;
    try {
      const res = await api.post('/auth/verify-enable-2fa', { totpCode: totpInput });
      useStore.getState().login(useStore.getState().token!, res.data.user);
      setShow2FASetup(false);
      setTotpInput('');
      setTotpMessage('2FA enabled successfully!');
    } catch (err: any) {
      setTotpMessage(err.response?.data?.error || 'Failed to verify OTP');
    }
  };

  const handleDisable2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/disable-2fa', { pin: disablePin });
      useStore.getState().login(useStore.getState().token!, res.data.user);
      setShowDisable2FA(false);
      setDisablePin('');
      setTotpMessage('2FA disabled successfully');
    } catch (err: any) {
      setTotpMessage(err.response?.data?.error || 'Failed to disable 2FA');
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
            {pinMessage && (
              <p className={`text-[12px] mt-2 font-mono ${pinMessage.includes('successfully') ? 'text-cyan' : 'text-red'}`}>
                [{pinMessage}]
              </p>
            )}
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

        {/* 2FA Section */}
        <section className="bg-black border border-[#333] p-6 rounded-[2px]">
          <div className="flex items-center gap-3 mb-6 border-b border-[#333] pb-4">
            <Smartphone className="w-4 h-4 text-cyan" />
            <h2 className="text-[14px] font-mono text-tx-main uppercase tracking-wider">Two-Factor Authentication</h2>
          </div>

          {!user?.totp_enabled ? (
            <div className="space-y-4">
              <p className="text-[12px] text-tx-dim font-mono">Add an extra layer of security using a TOTP Authenticator (e.g., Google Authenticator, Authy).</p>
              
              {!show2FASetup ? (
                <button onClick={handleGenerate2FA} className="bg-transparent border border-cyan text-cyan hover:bg-cyan/10 px-4 py-2 text-[12px] uppercase tracking-wider transition-colors cursor-pointer">
                  Setup 2FA
                </button>
              ) : (
                <div className="bg-[#111] border border-[#333] p-4 flex flex-col gap-4 max-w-sm">
                  <p className="text-[11px] text-tx-dim uppercase tracking-wider">1. Scan QR Code</p>
                  {qrCodeUrl && <img src={qrCodeUrl} alt="2FA QR Code" className="w-48 h-48 bg-white p-2 mx-auto" />}
                  
                  <p className="text-[11px] text-tx-dim uppercase tracking-wider mt-2">2. Verify Token</p>
                  <form onSubmit={handleVerify2FA} className="flex gap-2">
                    <input 
                      type="text" maxLength={6} required value={totpInput} onChange={e => setTotpInput(e.target.value.replace(/\D/g, ''))}
                      placeholder="XXXXXX"
                      className="w-full bg-deep border border-[#333] px-3 py-2 text-center text-white font-mono tracking-[0.3em] focus:outline-none focus:border-cyan"
                    />
                    <button className="bg-cyan text-black hover:bg-cyan/80 px-4 py-2 text-[11px] uppercase font-bold tracking-wider transition-colors cursor-pointer">
                      Verify
                    </button>
                  </form>
                  <button type="button" onClick={() => setShow2FASetup(false)} className="text-[11px] font-mono text-tx-dim hover:text-white mt-1 uppercase">Cancel</button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4 max-w-sm">
              <div className="flex items-center gap-2 bg-cyan/10 border border-cyan/30 text-cyan p-3 rounded-sm font-mono text-[12px]">
                <Smartphone className="w-4 h-4" /> 2FA is Currently Active
              </div>

              {!showDisable2FA ? (
                <button onClick={() => setShowDisable2FA(true)} className="bg-transparent border border-red text-red hover:bg-red/10 px-4 py-2 text-[12px] uppercase tracking-wider transition-colors cursor-pointer">
                  Disable 2FA
                </button>
              ) : (
                <form onSubmit={handleDisable2FA} className="bg-[#111] border border-[#333] p-4 flex flex-col gap-4">
                  <label className="block text-[11px] font-mono text-tx-dim uppercase">Verify PIN to Disable</label>
                  <input 
                    type="password" maxLength={6} required value={disablePin} onChange={e => setDisablePin(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••••"
                    className="w-full bg-deep border border-[#333] px-4 py-2 text-white font-mono tracking-[0.3em] focus:outline-none focus:border-cyan"
                  />
                  <div className="flex gap-2">
                    <button type="submit" className="flex-1 bg-red text-white hover:bg-red/80 px-4 py-2 text-[11px] uppercase font-bold tracking-wider transition-colors cursor-pointer">
                      Confirm Disable
                    </button>
                    <button type="button" onClick={() => setShowDisable2FA(false)} className="px-4 py-2 text-[11px] font-mono text-tx-dim hover:text-white uppercase transition-colors">
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {totpMessage && (
            <p className={`text-[12px] mt-4 font-mono ${totpMessage.includes('successfully') ? 'text-cyan' : 'text-red'}`}>
              [{totpMessage}]
            </p>
          )}
        </section>

      </div>
    </div>
  );
}
