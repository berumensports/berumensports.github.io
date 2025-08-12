import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './auth/Login';
import ProtectedRoute from './auth/ProtectedRoute';
import PrivateLayout from './layouts/PrivateLayout';
import Dashboard from './pages/Dashboard';
import Equipos from './pages/Equipos';
import Arbitros from './pages/Arbitros';
import Delegaciones from './pages/Delegaciones';
import Temporadas from './pages/Temporadas';
import Tarifas from './pages/Tarifas';
import Partidos from './pages/Partidos';
import Cobros from './pages/Cobros';
import Reportes from './pages/Reportes';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <PrivateLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="equipos" element={<Equipos />} />
        <Route path="arbitros" element={<Arbitros />} />
        <Route path="delegaciones" element={<Delegaciones />} />
        <Route path="temporadas" element={<Temporadas />} />
        <Route path="tarifas" element={<Tarifas />} />
        <Route path="partidos" element={<Partidos />} />
        <Route path="cobros" element={<Cobros />} />
        <Route path="reportes" element={<Reportes />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
