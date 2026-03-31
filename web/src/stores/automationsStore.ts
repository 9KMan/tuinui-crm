import { atom } from 'jotai';
import { automationsApi } from '../api/automationsApi';

export const automationsAtom = atom<any[]>([]);
export const automationsLoadingAtom = atom(false);

export const loadAutomationsAtom = atom(
  null,
  async (_get, set, activeOnly?: boolean) => {
    set(automationsLoadingAtom, true);
    try {
      const { data } = await automationsApi.list(activeOnly);
      set(automationsAtom, data);
    } finally {
      set(automationsLoadingAtom, false);
    }
  }
);
