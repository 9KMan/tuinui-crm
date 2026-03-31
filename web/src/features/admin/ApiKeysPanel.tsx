import { useAtom, useSetAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { apiKeysAtom, apiKeysLoadingAtom, loadApiKeysAtom } from '../../stores/apiKeysStore';
import { apiKeysApi } from '../../api/apiKeysApi';
import { Button } from '../../components/ui/Button';

export function ApiKeysPanel() {
  const [keys] = useAtom(apiKeysAtom);
  const [loading] = useAtom(apiKeysLoadingAtom);
  const load = useSetAtom(loadApiKeysAtom);

  const [showCreate, setShowCreate] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyExpiry, setNewKeyExpiry] = useState('');
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    const result = await apiKeysApi.create({
      name: newKeyName,
      expiresAt: newKeyExpiry || undefined,
    });
    setNewlyCreatedKey(result.key);
    setShowCreate(false);
    setNewKeyName('');
    setNewKeyExpiry('');
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Revoke this API key? This cannot be undone.')) return;
    await apiKeysApi.delete(id);
    load();
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">API Keys</h1>
          <p className="text-sm text-gray-500 mt-1">Programmatic access for integrations</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>+ New API Key</Button>
      </div>

      {/* Show newly created key ONCE */}
      {newlyCreatedKey && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">
            ✅ API Key created! Copy it now — you won't see it again.
          </p>
          <div className="flex gap-2">
            <code className="flex-1 bg-white dark:bg-gray-800 border border-green-200 dark:border-green-700 rounded px-3 py-2 text-sm font-mono text-gray-900 dark:text-white">
              {newlyCreatedKey}
            </code>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { navigator.clipboard.writeText(newlyCreatedKey); alert('Copied!'); }}
            >
              Copy
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setNewlyCreatedKey(null)}>Dismiss</Button>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">New API Key</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Key Name</label>
                <input
                  value={newKeyName}
                  onChange={e => setNewKeyName(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., Zapier Integration"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Expires (optional)</label>
                <input
                  type="date"
                  value={newKeyExpiry}
                  onChange={e => setNewKeyExpiry(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <p className="text-xs text-gray-500">The full key will only be shown once after creation.</p>
            </div>
            <div className="flex gap-3 mt-6">
              <Button onClick={handleCreate} className="flex-1">Create Key</Button>
              <Button variant="ghost" onClick={() => setShowCreate(false)} className="flex-1">Cancel</Button>
            </div>
          </div>
        </div>
      )}

      {/* Keys List */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : keys.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="mb-4">No API keys yet.</p>
          <Button onClick={() => setShowCreate(true)}>Create your first API key</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {keys.map((k: any) => (
            <div key={k.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{k.name}</h3>
                <div className="flex items-center gap-4 mt-1">
                  <code className="text-sm font-mono text-gray-500">{k.prefix}••••••••</code>
                  {k.lastUsedAt && (
                    <span className="text-xs text-gray-400">Last used: {new Date(k.lastUsedAt).toLocaleString()}</span>
                  )}
                  {k.expiresAt && (
                    <span className={`text-xs ${new Date(k.expiresAt) < new Date() ? 'text-red-500' : 'text-gray-400'}`}>
                      Expires: {new Date(k.expiresAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1">Created: {new Date(k.createdAt).toLocaleString()}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(k.id)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 border border-red-200 dark:border-red-800"
              >
                Revoke
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
