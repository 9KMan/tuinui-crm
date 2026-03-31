import { useAtom, useSetAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { rolesAtom, rolesLoadingAtom, loadRolesAtom } from '../../stores/rolesStore';
import { rolesApi } from '../../api/rolesApi';
import { Button } from '../../components/ui/Button';

const PERMISSION_OPTIONS = [
  { group: 'Contacts', perms: ['contacts:read', 'contacts:write', 'contacts:delete'] },
  { group: 'Companies', perms: ['companies:read', 'companies:write', 'companies:delete'] },
  { group: 'Deals', perms: ['deals:read', 'deals:write', 'deals:delete'] },
  { group: 'Tasks', perms: ['tasks:read', 'tasks:write', 'tasks:delete'] },
  { group: 'Events', perms: ['events:read', 'events:write', 'events:delete'] },
  { group: 'Notes', perms: ['notes:read', 'notes:write', 'notes:delete'] },
  { group: 'Files', perms: ['files:read', 'files:write', 'files:delete'] },
  { group: 'Admin', perms: ['admin'] },
];

export function RolesPanel() {
  const [roles, setRoles] = useAtom(rolesAtom);
  const [loading, setLoading] = useAtom(rolesLoadingAtom);
  const load = useSetAtom(loadRolesAtom);

  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', permissions: [] as string[] });

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    await rolesApi.create(form);
    setShowCreate(false);
    setForm({ name: '', description: '', permissions: [] });
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this role?')) return;
    await rolesApi.delete(id);
    load();
  };

  const togglePerm = (perm: string) => {
    const perms = form.permissions.includes(perm)
      ? form.permissions.filter(p => p !== perm)
      : [...form.permissions, perm];
    setForm({ ...form, permissions: perms });
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Roles & Permissions</h1>
          <p className="text-sm text-gray-500 mt-1">Manage user roles and access control</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => rolesApi.seed().then(() => load())}>
            Seed Defaults
          </Button>
          <Button onClick={() => setShowCreate(true)}>+ New Role</Button>
        </div>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">New Role</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Role Name</label>
                <input
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value.toUpperCase() })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., SALES_MANAGER"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Description</label>
                <input
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Permissions</label>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {PERMISSION_OPTIONS.map(({ group, perms }) => (
                    <div key={group}>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{group}</p>
                      <div className="grid grid-cols-1 gap-1">
                        {perms.map(perm => (
                          <label key={perm} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                            <input
                              type="checkbox"
                              checked={form.permissions.includes(perm)}
                              onChange={() => togglePerm(perm)}
                              className="rounded border-gray-300"
                            />
                            <span className="font-mono text-xs">{perm}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button onClick={handleCreate} className="flex-1">Create Role</Button>
              <Button variant="ghost" onClick={() => setShowCreate(false)} className="flex-1">Cancel</Button>
            </div>
          </div>
        </div>
      )}

      {/* Roles Grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles.map((role: any) => (
            <div key={role.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">{role.name}</h3>
                  {role.description && <p className="text-sm text-gray-500">{role.description}</p>}
                  <p className="text-xs text-gray-400 mt-1">{role._count?.users || 0} users</p>
                </div>
                {role.isDefault && (
                  <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 rounded">Default</span>
                )}
              </div>
              <div className="flex flex-wrap gap-1">
                {(typeof role.permissions === 'string' ? JSON.parse(role.permissions) : role.permissions || []).map((perm: string) => (
                  <span key={perm} className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded font-mono">{perm}</span>
                ))}
              </div>
              {!role.isDefault && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(role.id)}
                  className="mt-3 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  Delete Role
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
