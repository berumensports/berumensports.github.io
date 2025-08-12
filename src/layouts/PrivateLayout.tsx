import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import {
  Home,
  Users,
  Calendar,
  DollarSign,
  FileText,
  ClipboardList,
  UserCheck,
  Flag,
} from 'lucide-react';

const navItems = [
  { to: '/', icon: Home, label: 'Dashboard' },
  { to: '/equipos', icon: Users, label: 'Equipos' },
  { to: '/arbitros', icon: UserCheck, label: 'Árbitros' },
  { to: '/delegaciones', icon: Flag, label: 'Delegaciones' },
  { to: '/temporadas', icon: Calendar, label: 'Temporadas' },
  { to: '/tarifas', icon: ClipboardList, label: 'Tarifas' },
  { to: '/partidos', icon: Calendar, label: 'Partidos' },
  { to: '/cobros', icon: DollarSign, label: 'Cobros' },
  { to: '/reportes', icon: FileText, label: 'Reportes' },
];

export default function PrivateLayout() {
  const { user, role } = useAuth();
  return (
    <div className="flex min-h-screen">
      <aside className="w-48 bg-gray-800 text-white p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center space-x-2 p-2 rounded hover:bg-gray-700 ${
                isActive ? 'bg-gray-700' : ''
              }`
            }
            end
          >
            <item.icon className="w-4" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </aside>
      <main className="flex-1">
        <header className="flex justify-between items-center p-4 border-b">
          <div>
            {user?.displayName} ({role})
          </div>
          <button
            className="text-sm text-blue-500"
            onClick={() => signOut(auth)}
          >
            Cerrar sesión
          </button>
        </header>
        <div className="p-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
