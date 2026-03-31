import { NavLink, useNavigate } from 'react-router-dom'
import { useSetAtom } from 'jotai'
import {
  LayoutDashboard,
  Users,
  Building2,
  HandCoins,
  CheckSquare,
  Calendar,
  FileText,
  Settings,
  Workflow,
  Search,
  LogOut,
  Shield,
} from 'lucide-react'
import { logoutAtom } from '../../stores/authStore'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/contacts', icon: Users, label: 'Contacts' },
  { to: '/companies', icon: Building2, label: 'Companies' },
  { to: '/deals', icon: HandCoins, label: 'Deals' },
  { to: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { to: '/calendar', icon: Calendar, label: 'Calendar' },
  { to: '/files', icon: FileText, label: 'Files' },
  { to: '/automation', icon: Workflow, label: 'Automation' },
]

export function Sidebar() {
  const logout = useSetAtom(logoutAtom)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-primary-600">Twenty CRM</h1>
      </div>

      {/* Search */}
      <div className="px-4 py-3">
        <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-500 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors">
          <Search className="w-4 h-4" />
          <span>Search...</span>
          <kbd className="ml-auto text-xs bg-gray-200 px-1.5 py-0.5 rounded">⌘K</kbd>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom actions */}
      <div className="px-3 py-2 border-t border-gray-200 space-y-1">
        <NavLink
          to="/admin/fields"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              isActive
                ? 'bg-primary-50 text-primary-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`
          }
        >
          <Shield className="w-5 h-5" />
          Admin
        </NavLink>
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              isActive
                ? 'bg-primary-50 text-primary-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`
          }
        >
          <Settings className="w-5 h-5" />
          Settings
        </NavLink>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  )
}
