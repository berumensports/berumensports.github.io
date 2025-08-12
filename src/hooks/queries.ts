import { useQuery } from '@tanstack/react-query';
import { listEquipos } from '../services/equipos';

export const useEquipos = () => {
  return useQuery({ queryKey: ['equipos'], queryFn: listEquipos });
};
