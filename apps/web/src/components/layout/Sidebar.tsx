import { Link, useLocation } from 'react-router-dom';
import { FileText, Code2, StickyNote, Search, FolderOpen, LogOut, Network, BookText } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const Sidebar = () => {
  const location = useLocation();
  const { logout, user } = useAuth();

  const isActive = (path: string) => location.pathname.startsWith(path);

  const navItems = [
    { path: '/projects', icon: FolderOpen, label: 'Projects' },
    { path: '/documents', icon: FileText, label: 'Documents' },
    { path: '/codes', icon: Code2, label: 'Codes' },
    { path: '/memos', icon: StickyNote, label: 'Memos' },
    { path: '/network', icon: Network, label: 'Network' },
    { path: '/query', icon: Search, label: 'Query' },
  ];

  return (
    <div className="w-64 bg-gray-900 text-white h-screen flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-xl font-bold">QUALI</h1>
        <p className="text-sm text-gray-400 mt-1">{user?.name}</p>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-800 w-full"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};
