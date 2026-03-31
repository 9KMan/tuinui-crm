import { atom } from 'jotai';
import { rolesApi } from '../api/rolesApi';

export const rolesAtom = atom<any[]>([]);
export const rolesLoadingAtom = atom(false);

export const loadRolesAtom = atom(
  null,
  async (_get, set) => {
    set(rolesLoadingAtom, true);
    try {
      const { data } = await rolesApi.list();
      set(rolesAtom, data);
    } finally {
      set(rolesLoadingAtom, false);
    }
  }
);
