import { useAtom, useSetAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { automationsAtom, automationsLoadingAtom, loadAutomationsAtom } from '../../stores/automationsStore';
import { automationsApi } from '../../api/automationsApi';
import { Button } from '../../components/ui/Button';

const TRIGGER_TYPES = [
  { value: 'RECORD_CREATED', label: 'Record Created', color: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' },
  { value: 'RECORD_UPDATED', label: 'Record Updated', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' },
  { value: 'RECORD_DELETED', label: 'Record Deleted', color: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' },
  { value: 'FIELD_CHANGED', label: 'Field Changed', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300' },
  { value: 'SCHEDULE', label: 'Schedule (Cron)', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300' },
  { value: 'WEBHOOK', label: 'Webhook', color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' },
];

function getTriggerColor(type: string) {
  return TRIGGER_TYPES.find(t => t.value === type)?.color || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
}
function getTriggerLabel(type: string) {
  return TRIGGER_TYPES.find(t => t.value === type)?.label || type;
}

export function AutomationsPanel() {
  const [automations] = useAtom(automationsAtom);
  const [loading] = useAtom(automationsLoadingAtom);
  const load = useSetAtom(loadAutomationsAtom);

  const [showCreate, setShowCreate] = useState(false);
  const [showLogs, setShowLogs] = useState<string | null>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [form, setForm] = useState({
    name: '', description: '', triggerType: 'RECORD_CREATED',
    triggerConfig: {}, conditions: [], actions: [{ type: 'LOG', config: {} }],
  });

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    await automationsApi.create(form);
    setShowCreate(false);
    setForm({ name: '', description: '', triggerType: 'RECORD_CREATED', triggerConfig: {}, conditions: [], actions: [{ type: 'LOG', config: {} }] });
    load();
  };

  const handleToggle = async (id: string) => {
    await automationsApi.toggle(id);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this automation?')) return;
    await automationsApi.delete(id);
    load();
  };

  const handleTest = async (id: string) => {
    const result = await automationsApi.test(id);
    const data = result.data;
    alert(data?.success ? 'Test triggered successfully!' : `Test failed: ${data?.error}`);
  };

  const viewLogs = async (id: string) => {
    const { data } = await automationsApi.logs(id);
    setLogs(data);
    setShowLogs(id);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Automations</h1>
        <Button onClick={() => setShowCreate(true)}>+ New Automation</Button>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">New Automation</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Name</label>
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., Notify on new deal" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Trigger Type</label>
                <select value={form.triggerType} onChange={e => setForm({...form, triggerType: e.target.value})}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  {TRIGGER_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Description (optional)</label>
                <input value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button onClick={handleCreate} className="flex-1">Create</Button>
              <Button variant="ghost" onClick={() => setShowCreate(false)} className="flex-1">Cancel</Button>
            </div>
          </div>
        </div>
      )}

      {/* Logs Modal */}
      {showLogs && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-xl">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Automation Logs</h2>
            {logs.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">No logs yet. Run a test to generate logs.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-2 text-gray-700 dark:text-gray-300">Status</th>
                    <th className="text-left py-2 text-gray-700 dark:text-gray-300">Executed</th>
                    <th className="text-left py-2 text-gray-700 dark:text-gray-300">Duration</th>
                    <th className="text-left py-2 text-gray-700 dark:text-gray-300">Error</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {logs.map(log => (
                    <tr key={log.id}>
                      <td className="py-2">
                        <span className={`px-2 py-0.5 text-xs rounded ${log.status === 'SUCCESS' ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' : log.status === 'FAILED' ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300'}`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="py-2 text-gray-500 dark:text-gray-400">{new Date(log.executedAt).toLocaleString()}</td>
                      <td className="py-2 text-gray-700 dark:text-gray-300">{log.durationMs}ms</td>
                      <td className="py-2 text-red-500 text-xs">{log.error || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <div className="mt-4">
              <Button variant="ghost" onClick={() => setShowLogs(null)} className="w-full">Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* Automations List */}
      {loading ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">Loading...</div>
      ) : automations.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 mb-4">No automations yet.</p>
          <Button onClick={() => setShowCreate(true)}>Create your first automation</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {automations.map((a: any) => (
            <div key={a.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex items-center justify-between bg-white dark:bg-gray-800 hover:shadow-sm transition-shadow">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{a.name}</h3>
                  <span className={`px-2 py-0.5 text-xs rounded ${getTriggerColor(a.triggerType)}`}>
                    {getTriggerLabel(a.triggerType)}
                  </span>
                  {!a.isActive && <span className="px-2 py-0.5 text-xs rounded bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400">Inactive</span>}
                </div>
                {a.description && <p className="text-sm text-gray-500 dark:text-gray-400">{a.description}</p>}
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Run count: {a.runCount} · Last run: {a.lastRunAt ? new Date(a.lastRunAt).toLocaleString() : 'Never'}
                </p>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <Button variant="outline" size="sm" onClick={() => handleTest(a.id)}>Test</Button>
                <Button variant="ghost" size="sm" onClick={() => viewLogs(a.id)}>Logs</Button>
                <Button
                  variant={a.isActive ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={() => handleToggle(a.id)}
                >
                  {a.isActive ? 'Pause' : 'Activate'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(a.id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
