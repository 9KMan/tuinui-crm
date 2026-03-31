import { atom } from 'jotai';
import { customFieldsApi } from '../api/customFieldsApi';

export interface CustomField {
  id: string;
  name: string;
  label: string;
  type: 'TEXT' | 'NUMBER' | 'DATE' | 'BOOLEAN' | 'SELECT' | 'MULTISELECT';
  entityType: 'CONTACT' | 'COMPANY' | 'DEAL' | 'TASK' | 'EVENT';
  required: boolean;
  options?: string[];
}

export const customFieldsAtom = atom<CustomField[]>([]);
export const customFieldsLoadingAtom = atom(false);

export const loadCustomFieldsAtom = atom(
  null,
  async (get, set, entityType?: string) => {
    set(customFieldsLoadingAtom, true);
    try {
      const { data } = await customFieldsApi.list(entityType);
      set(customFieldsAtom, data);
    } finally {
      set(customFieldsLoadingAtom, false);
    }
  }
);
