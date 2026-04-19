import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Shield, Settings, LogOut, Lock, Activity } from 'lucide-react';
import { api } from '../services/api';

export default function Layout() {
  const logout = useStore(state => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-neutral-950 text-neutral-200 font-sans selection:bg-neutral-800">
      <aside className="w-64 border-r border-neutral-800 bg-neutral-900/50 flex flex-col">
        <div className="p-6 flex items-center gap-3 border-b border-neutral-800">
          <Shield className="w-8 h-8 text-indigo-500" />
          <span className="text-xl font-bold tracking-tight text-white">VaultGuard</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/" className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg hover:bg-neutral-800 hover:text-white transition-colors">
            <Lock className="w-4 h-4" />
            Vaults
          </Link>
          <Link to="/logs" className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg hover:bg-neutral-800 hover:text-white transition-colors">
            <Activity className="w-4 h-4" />
            Audit Logs
          </Link>
          <Link to="/settings" className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg hover:bg-neutral-800 hover:text-white transition-colors">
            <Settings className="w-4 h-4" />
            Settings
          </Link>
        </nav>

        <div className="p-4 border-t border-neutral-800">
          <button 
            onClick={handleLogout}
            className="flex items-center w-full gap-3 px-4 py-3 text-sm font-medium rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Lock Session
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto relative">
        <div className="max-w-5xl mx-auto p-12">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
