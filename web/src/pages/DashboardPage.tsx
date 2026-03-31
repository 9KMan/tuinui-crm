import { Header } from '../components/layout/Header'
import { Card, CardContent } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'

export default function DashboardPage() {
  return (
    <div>
      <Header title="Dashboard" subtitle="Overview of your CRM" />

      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-500">Total Contacts</p>
              <p className="text-2xl font-bold text-gray-900">1,234</p>
              <p className="text-xs text-success-600 mt-1">+12% this month</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-500">Active Deals</p>
              <p className="text-2xl font-bold text-gray-900">$456K</p>
              <p className="text-xs text-success-600 mt-1">+23% this month</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-500">Tasks Due Today</p>
              <p className="text-2xl font-bold text-gray-900">18</p>
              <p className="text-xs text-warning-600 mt-1">5 overdue</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-500">Win Rate</p>
              <p className="text-2xl font-bold text-gray-900">68%</p>
              <p className="text-xs text-success-600 mt-1">+5% this month</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0">
                    <div className="w-2 h-2 rounded-full bg-primary-500 mt-2" />
                    <div>
                      <p className="text-sm text-gray-900">Contact updated: John Smith</p>
                      <p className="text-xs text-gray-500">2 hours ago</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-4">Upcoming Tasks</h3>
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div className="flex items-center gap-3">
                      <input type="checkbox" className="rounded border-gray-300" />
                      <span className="text-sm text-gray-900">Follow up with client</span>
                    </div>
                    <Badge variant={i === 1 ? 'warning' : 'default'}>Today</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
