import { atom } from 'jotai';
import { auditApi } from '../api/auditApi';

export const auditLogsAtom = atom<any[]>([]);
export const auditLoadingAtom = atom(false);
export const auditTotalAtom = atom(0);
export const auditPageAtom = atom(1);

export const loadAuditLogsAtom = atom(
  null,
  async (_get, set, params?: { entityType?: string; action?: string; from?: string; to?: string; page?: number }) => {
    set(auditLoadingAtom, true);
    try {
      const { data } = await auditApi.list(params);
      set(auditLogsAtom, data.data);
      set(auditTotalAtom, data.total);
      set(auditPageAtom, data.page);
    } finally {
      set(auditLoadingAtom, false);
    }
  }
);
