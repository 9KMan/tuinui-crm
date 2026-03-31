import { atom } from 'jotai';
import { webhooksApi } from '../api/webhooksApi';

export const webhooksAtom = atom<any[]>([]);
export const webhooksLoadingAtom = atom(false);

export const loadWebhooksAtom = atom(
  null,
  async (_get, set, activeOnly?: boolean) => {
    set(webhooksLoadingAtom, true);
    try {
      const { data } = await webhooksApi.list(activeOnly);
      set(webhooksAtom, data);
    } finally {
      set(webhooksLoadingAtom, false);
    }
  }
);
