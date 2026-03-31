import { atom } from 'jotai';
import { apiKeysApi } from '../api/apiKeysApi';

export const apiKeysAtom = atom<any[]>([]);
export const apiKeysLoadingAtom = atom(false);

export const loadApiKeysAtom = atom(
  null,
  async (_get, set) => {
    set(apiKeysLoadingAtom, true);
    try {
      const { data } = await apiKeysApi.list();
      set(apiKeysAtom, data);
    } finally {
      set(apiKeysLoadingAtom, false);
    }
  }
);
