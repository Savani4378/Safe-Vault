import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Shield, Settings, LogOut, Lock, Activity } from 'lucide-react';

export default function Layout() {
  const logout = useStore(state => state.logout);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen bg-deep text-tx-main font-sans selection:bg-cyan/30">
      <aside className="w-64 border-r border-[#333] bg-panel flex flex-col">
        <div className="p-6 flex items-center gap-3 border-b border-[#333]">
          <span className="w-3 h-3 bg-cyan shadow-cyan block"></span>
          <span className="text-[13px] font-bold tracking-[2px] uppercase text-cyan font-mono">Safe Vault</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <Link 
            to="/" 
            className={`flex items-center gap-3 px-4 py-3 text-[12px] uppercase tracking-wider font-bold transition-colors ${isActive('/') ? 'bg-cyan/10 text-cyan border-l-2 border-cyan' : 'text-tx-dim hover:text-tx-main hover:bg-[#111] border-l-2 border-transparent'}`}
          >
            <Lock className="w-4 h-4" />
            Vaults
          </Link>
          <Link 
            to="/logs" 
            className={`flex items-center gap-3 px-4 py-3 text-[12px] uppercase tracking-wider font-bold transition-colors ${isActive('/logs') ? 'bg-cyan/10 text-cyan border-l-2 border-cyan' : 'text-tx-dim hover:text-tx-main hover:bg-[#111] border-l-2 border-transparent'}`}
          >
            <Activity className="w-4 h-4" />
            Audit Logs
          </Link>
          <Link 
            to="/settings" 
            className={`flex items-center gap-3 px-4 py-3 text-[12px] uppercase tracking-wider font-bold transition-colors ${isActive('/settings') ? 'bg-cyan/10 text-cyan border-l-2 border-cyan' : 'text-tx-dim hover:text-tx-main hover:bg-[#111] border-l-2 border-transparent'}`}
          >
            <Settings className="w-4 h-4" />
            Settings
          </Link>
        </nav>

        <div className="p-4 border-t border-[#333]">
          <button 
            onClick={handleLogout}
            className="flex items-center w-full gap-3 px-4 py-3 text-[12px] uppercase tracking-wider font-bold text-red hover:bg-red/10 border border-transparent hover:border-red transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Lock Session
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto relative bg-deep bg-radial-gradient">
        <div className="max-w-5xl mx-auto p-12">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
