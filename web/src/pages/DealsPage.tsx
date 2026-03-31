import { Header } from '../components/layout/Header'
import { Card, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Plus, LayoutGrid, List } from 'lucide-react'
import { useState } from 'react'

const stages = [
  { id: '1', name: 'Lead', color: '#9ca3af', deals: 12 },
  { id: '2', name: 'Qualified', color: '#3b82f6', deals: 8 },
  { id: '3', name: 'Proposal', color: '#f59e0b', deals: 5 },
  { id: '4', name: 'Negotiation', color: '#8b5cf6', deals: 3 },
  { id: '5', name: 'Closed Won', color: '#22c55e', deals: 7 },
]

const deals = [
  { id: '1', title: 'Enterprise Deal', amount: 50000, stage: '1', company: 'Acme Corp' },
  { id: '2', title: 'SMB Package', amount: 12000, stage: '2', company: 'Tech Inc' },
  { id: '3', title: 'Pro Plan', amount: 24000, stage: '3', company: 'Startup Co' },
]

export default function DealsPage() {
  const [view, setView] = useState<'kanban' | 'table'>('kanban')

  return (
    <div>
      <Header title="Deals" subtitle="Manage your sales pipeline" onCreateNew={() => {}} />

      <div className="p-6 space-y-6">
        {/* View Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-md">
            <button
              onClick={() => setView('kanban')}
              className={`p-2 rounded-md transition-colors ${
                view === 'kanban' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView('table')}
              className={`p-2 rounded-md transition-colors ${
                view === 'table' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          <Button size="sm">
            <Plus className="w-4 h-4" />
            Add Deal
          </Button>
        </div>

        {/* Pipeline Stats */}
        <div className="grid grid-cols-5 gap-4">
          {stages.map((stage) => (
            <Card key={stage.id} padding="sm">
              <CardContent className="p-3 text-center">
                <div
                  className="w-3 h-3 rounded-full mx-auto mb-2"
                  style={{ backgroundColor: stage.color }}
                />
                <p className="text-sm font-medium text-gray-900">{stage.name}</p>
                <p className="text-lg font-bold text-gray-900">{stage.deals}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Kanban Board */}
        <div className="flex gap-4 overflow-x-auto pb-4">
          {stages.map((stage) => (
            <div
              key={stage.id}
              className="flex-shrink-0 w-72 bg-gray-100 rounded-lg p-3"
            >
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: stage.color }}
                />
                <span className="font-medium text-gray-900">{stage.name}</span>
                <Badge variant="default" size="sm">{stage.deals}</Badge>
              </div>
              <div className="space-y-2">
                {deals
                  .filter((d) => d.stage === stage.id)
                  .map((deal) => (
                    <Card key={deal.id} padding="sm" variant="bordered">
                      <CardContent className="p-3">
                        <p className="font-medium text-gray-900">{deal.title}</p>
                        <p className="text-sm text-gray-500">{deal.company}</p>
                        <p className="text-lg font-bold text-primary-600 mt-2">
                          ${deal.amount.toLocaleString()}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
