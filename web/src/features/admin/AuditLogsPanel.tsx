import { useAtom, useSetAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { auditLogsAtom, auditLoadingAtom, auditTotalAtom, auditPageAtom, loadAuditLogsAtom } from '../../stores/auditStore';
import { Button } from '../../components/ui/Button';

const ACTION_COLORS: Record<string, string> = {
  CREATE: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
  UPDATE: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
  DELETE: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
  LOGIN: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300',
  LOGOUT: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  EXPORT: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300',
};

export function AuditLogsPanel() {
  const [logs] = useAtom(auditLogsAtom);
  const [loading] = useAtom(auditLoadingAtom);
  const [total] = useAtom(auditTotalAtom);
  const [page] = useAtom(auditPageAtom);
  const load = useSetAtom(loadAuditLogsAtom);

  const [filters, setFilters] = useState({ entityType: '', action: '', from: '', to: '' });

  useEffect(() => {
    load({ ...filters, page: 1 });
  }, []);

  const applyFilters = () => { load({ ...filters, page: 1 }); };

  const changePage = (newPage: number) => { load({ ...filters, page: newPage }); };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Audit Logs</h1>
        <p className="text-sm text-gray-500 mt-1">Track all changes and user actions</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6 items-end">
        <div>
          <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-gray-300">Entity</label>
          <select
            value={filters.entityType}
            onChange={e => setFilters({ ...filters, entityType: e.target.value })}
            className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">All</option>
            <option value="Contact">Contact</option>
            <option value="Company">Company</option>
            <option value="Deal">Deal</option>
            <option value="Task">Task</option>
            <option value="Event">Event</option>
            <option value="Note">Note</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-gray-300">Action</label>
          <select
            value={filters.action}
            onChange={e => setFilters({ ...filters, action: e.target.value })}
            className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">All</option>
            <option value="CREATE">Create</option>
            <option value="UPDATE">Update</option>
            <option value="DELETE">Delete</option>
            <option value="LOGIN">Login</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-gray-300">From</label>
          <input
            type="date"
            value={filters.from}
            onChange={e => setFilters({ ...filters, from: e.target.value })}
            className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-gray-300">To</label>
          <input
            type="date"
            value={filters.to}
            onChange={e => setFilters({ ...filters, to: e.target.value })}
            className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        <Button onClick={applyFilters} size="sm">Filter</Button>
      </div>

      {/* Logs Table */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : logs.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No audit logs found.</div>
      ) : (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">When</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">User</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Action</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Entity</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Changes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {logs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="py-3 px-4 text-sm text-gray-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <div className="font-medium text-gray-900 dark:text-white">{log.user?.name || '—'}</div>
                      <div className="text-xs text-gray-400">{log.user?.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 text-xs rounded ${ACTION_COLORS[log.action] || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {log.entityType ? (
                        <span className="font-medium text-gray-900 dark:text-white">{log.entityType}</span>
                      ) : '—'}
                      {log.entityId && <span className="text-gray-400 text-xs ml-1">#{log.entityId.slice(0, 8)}</span>}
                    </td>
                    <td className="py-3 px-4 text-xs font-mono max-w-xs truncate text-gray-500">
                      {log.changes ? JSON.stringify(log.changes) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-gray-500">{total} total logs</p>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => changePage(page - 1)} disabled={page <= 1}>← Prev</Button>
              <span className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300">Page {page}</span>
              <Button variant="ghost" size="sm" onClick={() => changePage(page + 1)} disabled={logs.length < 50}>Next →</Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
