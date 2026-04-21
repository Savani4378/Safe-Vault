import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { FolderLock, Plus, Unlock, Trash2, ShieldAlert, FileOutput } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';

interface Vault {
  id: string;
  vault_name: string;
  is_hidden: boolean;
}

export default function Dashboard() {
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  
  const [newVaultName, setNewVaultName] = useState('');
  const [newVaultPin, setNewVaultPin] = useState('');
  const [isHidden, setIsHidden] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [createLoading, setCreateLoading] = useState(false);
  
  const [unlockId, setUnlockId] = useState<string | null>(null);
  const [unlockPin, setUnlockPin] = useState('');
  
  const stealthModeEnabled = useStore(state => state.stealthMode);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchVaults = async () => {
    try {
      const res = await api.get('/vault/list');
      setVaults(res.data.vaults);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVaults();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) return alert('Please select files');
    if (newVaultPin.length !== 6) return alert('PIN must be exactly 6 digits');
    
    setCreateLoading(true);
    const formData = new FormData();
    formData.append('vault_name', newVaultName);
    formData.append('is_hidden', isHidden.toString());
    
    if (isHidden) {
      formData.append('custom_pin', newVaultPin);
    } else {
      formData.append('pin', newVaultPin); 
      // If it's standard vault, we use the PIN to encrypt it.
    }
    
    files.forEach(f => formData.append('files', f));

    try {
      await api.post('/vault/create', formData);
      setShowCreate(false);
      setNewVaultName('');
      setNewVaultPin('');
      setFiles([]);
      setIsHidden(false);
      fetchVaults();
    } catch (e: any) {
      alert(e.response?.data?.error || 'Creation failed');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleUnlock = async (id: string, name: string) => {
    if (unlockPin.length !== 6) return alert('PIN must be exactly 6 digits');
    try {
      const res = await api.post('/vault/unlock', { vault_id: id, pin: unlockPin }, { responseType: 'blob' });
      // Download blob
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${name}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setUnlockId(null);
      setUnlockPin('');
    } catch (e) {
      alert('Failed to unlock. Incorrect PIN or corrupted.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this vault?')) return;
    try {
      await api.delete(`/vault/remove/${id}`);
      fetchVaults();
    } catch (e) {
      alert('Delete failed');
    }
  };

  if (loading) return <div className="text-white text-center py-20">Decrypting dashboard...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-[24px] font-light text-tx-main">Secure Containers</h1>
          <p className="text-[13px] text-tx-dim mt-1">AES-256-GCM Hardware Encrypted Storage</p>
        </div>
        <button 
          onClick={() => setShowCreate(!showCreate)}
          className="border border-cyan text-cyan px-4 py-2 text-[12px] bg-transparent cursor-pointer font-sans tracking-[1px] uppercase transition-colors hover:bg-cyan/10"
        >
          + NEW CONTAINER
        </button>
      </div>

      {showCreate && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border-subtle p-6 mb-8 rounded-sm">
          <h2 className="text-lg font-medium text-tx-main mb-6 uppercase tracking-wider">Initialize Container</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-mono text-tx-dim mb-2 uppercase">Vault Label</label>
                <input 
                  required
                  value={newVaultName}
                  onChange={e => setNewVaultName(e.target.value)}
                  className="w-full bg-deep border border-border-subtle p-3 text-[13px] text-tx-main focus:outline-none focus:border-cyan"
                  placeholder="e.g. SECURE_DATA_01"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-tx-dim mb-2 uppercase">Encryption PIN (6 digits)</label>
                <input 
                  required
                  type="password"
                  maxLength={6}
                  value={newVaultPin}
                  onChange={e => setNewVaultPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-deep border border-border-subtle p-3 text-[13px] text-tx-main focus:outline-none focus:border-cyan font-mono tracking-widest"
                  placeholder="••••••"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-tx-dim mb-2 uppercase">Target Data</label>
              <input 
                type="file"
                multiple
                webkitdirectory="" // Adding this attribute to support folder upload natively in supported browsers
                ref={fileInputRef}
                onChange={e => setFiles(Array.from(e.target.files || []))}
                className="block w-full text-sm text-tx-dim border border-border-subtle bg-deep file:mr-4 file:py-2 file:px-4 file:border-0 file:border-r file:border-border-subtle file:text-[12px] file:font-mono file:bg-panel file:text-tx-main hover:file:bg-border-subtle transition-all cursor-pointer"
              />
              <p className="text-[11px] text-tx-dim mt-2 font-mono">Uncheck 'webkitdirectory' in devtools to select single files.</p>
            </div>

            {stealthModeEnabled && (
              <div className="flex items-center gap-3 bg-deep p-4 border border-dashed border-[#444] mt-4">
                <ShieldAlert className="w-5 h-5 text-[#444]" />
                <div className="flex-1">
                  <p className="text-[12px] font-mono text-[#aaa]">HIDDEN_SLOT_DETECTED</p>
                  <p className="text-[10px] text-tx-dim font-mono">Uses .bin extension and a custom derivative PIN hash.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={isHidden} onChange={e => setIsHidden(e.target.checked)} />
                  <div className="w-11 h-6 bg-panel border-border-subtle border peer-focus:outline-none peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-tx-dim after:border-border-subtle after:border after:h-[18px] after:w-[18px] after:transition-all peer-checked:after:bg-cyan"></div>
                </label>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-6 border-t border-border-subtle mt-6">
              <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-[12px] text-tx-dim hover:text-tx-main tracking-widest uppercase transition-colors">Abort</button>
              <button disabled={createLoading} className="px-6 py-2 bg-cyan text-black text-[12px] font-bold uppercase transition-colors disabled:opacity-50 hover:bg-cyan/80">
                {createLoading ? 'ENCRYPTING...' : 'LOCK CONTAINER'}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {vaults.length === 0 ? (
        <div className="text-center py-20 bg-transparent border border-border-subtle border-dashed p-6 rounded-sm">
          <FolderLock className="w-12 h-12 text-[#444] mx-auto mb-4" />
          <h3 className="text-lg font-medium text-[#777] font-mono text-[13px] uppercase tracking-widest">No Active Containers</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {vaults.filter(v => stealthModeEnabled ? true : !v.is_hidden).map(vault => (
            <motion.div key={vault.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`bg-card border border-border-subtle p-5 rounded-[4px] relative group ${vault.is_hidden ? 'border-dashed !bg-transparent border-[#444]' : (unlockId === vault.id ? 'border-l-4 border-l-cyan gradient-unlocked' : 'border-l-4 border-l-red')}`}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3 w-full">
                  <div className="flex flex-col w-full">
                    <div className="flex justify-between items-center mb-4">
                      <span className={`font-mono text-[10px] px-1.5 py-0.5 border border-current ${unlockId === vault.id ? 'text-cyan' : 'text-red'}`}>
                        {unlockId === vault.id ? 'MOUNTING' : 'ENCRYPTED'}
                      </span>
                      <div className="flex items-center gap-3">
                        <button onClick={() => handleDelete(vault.id)} className="text-tx-dim hover:text-red p-1 opacity-0 group-hover:opacity-100 transition-all cursor-pointer">
                          <Trash2 className="w-4 h-4" />
                        </button>
                        {vault.is_hidden ? <ShieldAlert className="w-5 h-5 text-[#444]" /> : <FolderLock className={`w-5 h-5 ${unlockId === vault.id ? 'text-cyan' : 'text-red'}`} />}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-[18px] font-medium text-tx-main mb-1">{vault.vault_name}</h3>
                      <p className="text-[12px] text-tx-dim font-mono">/vol/containers/{vault.id.split('-')[0]}{vault.is_hidden ? '.bin' : '.vault'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {unlockId === vault.id ? (
                <div className="flex gap-2 mt-4">
                  <input 
                    type="password"
                    maxLength={6}
                    placeholder="Enter PIN"
                    value={unlockPin}
                    onChange={e => setUnlockPin(e.target.value.replace(/\D/g, ''))}
                    className="flex-1 bg-deep border border-border-subtle px-3 text-sm text-center text-tx-main tracking-[0.5em] font-mono focus:outline-none focus:border-cyan"
                  />
                  <button onClick={() => handleUnlock(vault.id, vault.vault_name)} className="bg-cyan text-black px-4 text-[12px] font-bold uppercase cursor-pointer hover:bg-cyan/80">
                    Unlock
                  </button>
                  <button onClick={() => setUnlockId(null)} className="px-2 text-tx-dim hover:text-tx-main">✕</button>
                </div>
              ) : (
                <div className="mt-4 pt-4 border-t border-border-subtle">
                  <button 
                    onClick={() => setUnlockId(vault.id)}
                    className="w-full flex items-center justify-center gap-2 py-2 text-[12px] tracking-[1px] text-cyan uppercase bg-transparent border border-cyan cursor-pointer hover:bg-cyan/10 transition-colors"
                  >
                    <Unlock className="w-4 h-4" />
                    Mount Volume
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
