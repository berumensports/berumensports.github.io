import { useState } from 'react';
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
  Menu as MenuIcon,
  X,
} from 'lucide-react';
import { Dialog } from '@headlessui/react';

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
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <Dialog
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <Dialog.Panel className="fixed inset-y-0 left-0 w-48 bg-gray-800 text-white p-4 space-y-2">
          <button
            className="absolute top-4 right-4 text-white"
            onClick={() => setMenuOpen(false)}
          >
            <X />
          </button>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center space-x-2 p-2 rounded hover:bg-gray-700 ${
                  isActive ? 'bg-gray-700' : ''
                }`
              }
              onClick={() => setMenuOpen(false)}
              end
            >
              <item.icon className="w-4" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </Dialog.Panel>
      </Dialog>

      <header className="flex items-center justify-between p-4 border-b">
        <button
          className="p-2"
          onClick={() => setMenuOpen(true)}
        >
          <MenuIcon />
        </button>
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

      <main className="flex-1 p-4">
        <Outlet />
      </main>
    </div>
  );
}
