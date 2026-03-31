import { Bell, Plus, Moon, Sun } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAtomValue, useSetAtom } from 'jotai'
import { Button } from '../ui/Button'
import { Avatar } from '../ui/Avatar'
import { Dropdown } from '../ui/Dropdown'
import { userAtom, logoutAtom } from '../../stores/authStore'

interface HeaderProps {
  title: string
  subtitle?: string
  onCreateNew?: () => void
}

export function Header({ title, subtitle, onCreateNew }: HeaderProps) {
  const [isDark, setIsDark] = useState(false)
  const user = useAtomValue(userAtom)
  const logout = useSetAtom(logoutAtom)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const userMenuItems = [
    { label: 'Profile', value: 'profile', onClick: () => navigate('/settings') },
    { label: 'Settings', value: 'settings', onClick: () => navigate('/settings') },
    { label: 'Logout', value: 'logout', onClick: handleLogout, danger: true },
  ]

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      {/* Left side */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {onCreateNew && (
          <Button onClick={onCreateNew} size="sm">
            <Plus className="w-4 h-4" />
            Create New
          </Button>
        )}

        <button
          onClick={() => setIsDark(!isDark)}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-error-500 rounded-full" />
        </button>

        <Dropdown
          trigger={
            <button className="flex items-center gap-2 p-1 hover:bg-gray-100 rounded-md transition-colors">
              <Avatar name={user?.name || 'User'} size="sm" />
              <span className="text-sm font-medium text-gray-700">{user?.name || 'User'}</span>
            </button>
          }
          items={userMenuItems}
        />
      </div>
    </header>
  )
}
