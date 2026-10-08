import { useContext } from 'react';
import { AuthContext } from '../AuthContext';
import { ShieldCheck, LogOut } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="bg-slate-900 border-b border-slate-800 text-white px-6 py-4 flex justify-between items-center shadow-lg">
      <div className="flex items-center space-x-2">
        <ShieldCheck className="w-8 h-8 text-indigo-500" />
        <span className="text-xl font-bold tracking-wide">SecureStash</span>
      </div>
      {user && (
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-slate-300">Welcome, {user.name}</span>
          <button
            onClick={logout}
            className="flex items-center space-x-1 bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white px-3 py-1.5 rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      )}
    </nav>
  );
}