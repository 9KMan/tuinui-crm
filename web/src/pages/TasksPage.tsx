import React from 'react'
import { Header } from '../components/layout/Header'
import { Card, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Badge } from '../components/ui/Badge'
import { Avatar } from '../components/ui/Avatar'
import { Search, Plus, Filter, CheckCircle2, Circle, Clock } from 'lucide-react'

const tasks = [
  { id: '1', title: 'Follow up with John', dueDate: '2026-03-29', priority: 'high', status: 'todo', assignee: 'Jane Doe' },
  { id: '2', title: 'Send proposal', dueDate: '2026-03-30', priority: 'medium', status: 'in_progress', assignee: 'Jane Doe' },
  { id: '3', title: 'Review contract', dueDate: '2026-03-28', priority: 'urgent', status: 'done', assignee: 'John Smith' },
  { id: '4', title: 'Schedule demo', dueDate: '2026-03-31', priority: 'low', status: 'todo', assignee: 'Jane Doe' },
]

const priorityVariant: Record<string, 'error' | 'warning' | 'default' | 'success'> = {
  urgent: 'error',
  high: 'warning',
  medium: 'default',
  low: 'success',
}

const statusIcon: Record<string, React.ReactElement> = {
  todo: <Circle className="w-5 h-5 text-gray-400" />,
  in_progress: <Clock className="w-5 h-5 text-warning-500" />,
  done: <CheckCircle2 className="w-5 h-5 text-success-500" />,
}

export default function TasksPage() {
  return (
    <div>
      <Header title="Tasks" subtitle="Manage your tasks" onCreateNew={() => {}} />

      <div className="p-6 space-y-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input placeholder="Search tasks..." className="pl-10" />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4" />
                Filters
              </Button>
              <Button size="sm">
                <Plus className="w-4 h-4" />
                Add Task
              </Button>
            </div>

            {/* Tasks List */}
            <div className="space-y-2">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg hover:border-primary-200 hover:bg-primary-50/50 transition-colors"
                >
                  {statusIcon[task.status]}
                  <div className="flex-1">
                    <p className={`font-medium ${task.status === 'done' ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={priorityVariant[task.priority]} size="sm">
                        {task.priority}
                      </Badge>
                      <span className="text-xs text-gray-500">Due: {task.dueDate}</span>
                    </div>
                  </div>
                  <Avatar name={task.assignee} size="sm" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
