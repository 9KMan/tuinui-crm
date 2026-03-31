import { useAtom, useSetAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { webhooksAtom, webhooksLoadingAtom, loadWebhooksAtom } from '../../stores/webhooksStore';
import { webhooksApi } from '../../api/webhooksApi';
import { Button } from '../../components/ui/Button';

const EVENT_OPTIONS = [
  'contact.created', 'contact.updated', 'contact.deleted',
  'company.created', 'company.updated', 'company.deleted',
  'deal.created', 'deal.stage_changed', 'deal.won', 'deal.lost',
  'task.created', 'task.completed',
  'event.created', 'event.started',
];

export function WebhooksPanel() {
  const [webhooks] = useAtom(webhooksAtom);
  const [loading] = useAtom(webhooksLoadingAtom);
  const load = useSetAtom(loadWebhooksAtom);

  const [showCreate, setShowCreate] = useState(false);
  const [showDeliver, setShowDeliver] = useState<string | null>(null);
  const [deliverPayload, setDeliverPayload] = useState('{}');
  const [form, setForm] = useState({ name: '', url: '', events: [] as string[], secret: '' });

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    await webhooksApi.create(form);
    setShowCreate(false);
    setForm({ name: '', url: '', events: [], secret: '' });
    load();
  };

  const handleToggle = async (id: string) => {
    await webhooksApi.toggle(id);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this webhook?')) return;
    await webhooksApi.delete(id);
    load();
  };

  const handleDeliver = async (id: string) => {
    const payload = JSON.parse(deliverPayload);
    const result = await webhooksApi.deliver(id, payload);
    alert(JSON.stringify(result, null, 2));
  };

  const toggleEvent = (event: string) => {
    const events = form.events.includes(event)
      ? form.events.filter(e => e !== event)
      : [...form.events, event];
    setForm({ ...form, events });
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Webhooks</h1>
        <Button onClick={() => setShowCreate(true)}>+ New Webhook</Button>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg shadow-xl">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">New Webhook</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Name</label>
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., Slack notifications" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">URL</label>
                <input value={form.url} onChange={e => setForm({...form, url: e.target.value})}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="https://..." />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Secret (optional — auto-generated if blank)</label>
                <input value={form.secret} onChange={e => setForm({...form, secret: e.target.value})}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                  placeholder="Leave blank for auto-generate" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Events</label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {EVENT_OPTIONS.map(event => (
                    <label key={event} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="checkbox" checked={form.events.includes(event)}
                        onChange={() => toggleEvent(event)} className="rounded border-gray-300" />
                      <span className="font-mono text-xs text-gray-700 dark:text-gray-300">{event}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button onClick={handleCreate} className="flex-1">Create</Button>
              <Button variant="ghost" onClick={() => setShowCreate(false)} className="flex-1">Cancel</Button>
            </div>
          </div>
        </div>
      )}

      {/* Deliver Test Modal */}
      {showDeliver && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Test Webhook Delivery</h2>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Payload (JSON)</label>
              <textarea value={deliverPayload} onChange={e => setDeliverPayload(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm h-32" />
            </div>
            <div className="flex gap-3">
              <Button onClick={() => { handleDeliver(showDeliver); setShowDeliver(null); }} className="flex-1">Send Test</Button>
              <Button variant="ghost" onClick={() => setShowDeliver(null)} className="flex-1">Cancel</Button>
            </div>
          </div>
        </div>
      )}

      {/* Webhooks List */}
      {loading ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">Loading...</div>
      ) : webhooks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 mb-4">No webhooks configured.</p>
          <Button onClick={() => setShowCreate(true)}>Add your first webhook</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {webhooks.map((w: any) => (
            <div key={w.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{w.name}</h3>
                  <p className="text-sm font-mono text-gray-500 dark:text-gray-400">{w.url}</p>
                </div>
                <div className="flex items-center gap-2">
                  {!w.isActive && <span className="px-2 py-0.5 text-xs rounded bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400">Inactive</span>}
                  <Button
                    variant={w.isActive ? 'secondary' : 'outline'}
                    size="sm"
                    onClick={() => handleToggle(w.id)}
                  >
                    {w.isActive ? 'Disable' : 'Enable'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(w.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    Delete
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {w.events.map((event: string) => (
                  <span key={event} className="px-2 py-0.5 text-xs bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 rounded font-mono">{event}</span>
                ))}
              </div>
              <div className="mt-2">
                <Button variant="outline" size="sm" onClick={() => setShowDeliver(w.id)}>
                  Test Deliver →
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
