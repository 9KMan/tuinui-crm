import { useState, useEffect } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { customFieldsAtom, customFieldsLoadingAtom, loadCustomFieldsAtom } from '../../stores/customFieldsStore';
import { customFieldsApi } from '../../api/customFieldsApi';
import { Button } from '../../components/ui/Button';

const ENTITY_TYPES = ['CONTACT', 'COMPANY', 'DEAL', 'TASK', 'EVENT'] as const;
const FIELD_TYPES = ['TEXT', 'NUMBER', 'DATE', 'BOOLEAN', 'SELECT', 'MULTISELECT'] as const;

interface FieldForm {
  name: string;
  label: string;
  type: 'TEXT' | 'NUMBER' | 'DATE' | 'BOOLEAN' | 'SELECT' | 'MULTISELECT';
  entityType: 'CONTACT' | 'COMPANY' | 'DEAL' | 'TASK' | 'EVENT';
  required: boolean;
  options: string[];
}

const emptyForm: FieldForm = {
  name: '',
  label: '',
  type: 'TEXT',
  entityType: 'CONTACT',
  required: false,
  options: [],
};

export function CustomFieldsPanel() {
  const [fields, setFields] = useAtom(customFieldsAtom);
  const [loading] = useAtom(customFieldsLoadingAtom);
  const loadFields = useSetAtom(loadCustomFieldsAtom);

  const [filterEntity, setFilterEntity] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FieldForm>(emptyForm);

  useEffect(() => {
    loadFields(filterEntity || undefined);
  }, [filterEntity]);

  const handleCreate = async () => {
    await customFieldsApi.create(form);
    setShowForm(false);
    setForm(emptyForm);
    loadFields(filterEntity || undefined);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this field and all its values?')) return;
    await customFieldsApi.delete(id);
    loadFields(filterEntity || undefined);
  };

  const filtered = fields.filter(f => !filterEntity || f.entityType === filterEntity);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Custom Fields</h1>
        <Button onClick={() => setShowForm(true)}>
          + Add Field
        </Button>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <Button
          variant={!filterEntity ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setFilterEntity('')}
        >
          All
        </Button>
        {ENTITY_TYPES.map(t => (
          <Button
            key={t}
            variant={filterEntity === t ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setFilterEntity(t)}
          >
            {t}
          </Button>
        ))}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">New Custom Field</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Label (display name)
                </label>
                <input
                  value={form.label}
                  onChange={e => setForm({ ...form, label: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., LinkedIn URL"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  API Key (kebab-case)
                </label>
                <input
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                  placeholder="e.g., linkedin-url"
                />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    Entity
                  </label>
                  <select
                    value={form.entityType}
                    onChange={e => setForm({ ...form, entityType: e.target.value as FieldForm['entityType'] })}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {ENTITY_TYPES.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    Type
                  </label>
                  <select
                    value={form.type}
                    onChange={e => setForm({ ...form, type: e.target.value as FieldForm['type'] })}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {FIELD_TYPES.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
              {(form.type === 'SELECT' || form.type === 'MULTISELECT') && (
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    Options (comma-separated)
                  </label>
                  <input
                    value={form.options.join(', ')}
                    onChange={e => setForm({
                      ...form,
                      options: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                    })}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Option1, Option2, Option3"
                  />
                </div>
              )}
              <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={form.required}
                  onChange={e => setForm({ ...form, required: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Required field</span>
              </label>
            </div>
            <div className="flex gap-3 mt-6">
              <Button onClick={handleCreate} className="flex-1">
                Create
              </Button>
              <Button variant="ghost" onClick={() => setShowForm(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Fields Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Label</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">API Key</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Entity</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Type</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Required</th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filtered.map(field => (
              <tr key={field.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{field.label}</td>
                <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400 font-mono">{field.name}</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs rounded">
                    {field.entityType}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{field.type}</td>
                <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                  {field.required ? 'Yes' : 'No'}
                </td>
                <td className="py-3 px-4 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(field.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="py-12 text-center text-gray-500 dark:text-gray-400">
                  No custom fields yet. Create one!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
