import { Header } from '../components/layout/Header'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Avatar } from '../components/ui/Avatar'

export default function SettingsPage() {
  return (
    <div>
      <Header title="Settings" subtitle="Manage your workspace settings" />

      <div className="p-6 space-y-6 max-w-4xl">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Profile Settings</h3>
            <p className="text-sm text-gray-500">Update your personal information</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar name="John Doe" size="xl" />
              <Button variant="outline" size="sm">Change Avatar</Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Full Name" defaultValue="John Doe" />
              <Input label="Email" type="email" defaultValue="john@example.com" />
              <Input label="Phone" type="tel" defaultValue="+1 555-0123" />
              <Select
                label="Role"
                options={[
                  { value: 'admin', label: 'Admin' },
                  { value: 'manager', label: 'Manager' },
                  { value: 'user', label: 'User' },
                ]}
                defaultValue="admin"
              />
            </div>
            <div className="flex justify-end">
              <Button>Save Changes</Button>
            </div>
          </CardContent>
        </Card>

        {/* Workspace Settings */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Workspace Settings</h3>
            <p className="text-sm text-gray-500">Configure your workspace preferences</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Company Name" defaultValue="My Company" />
              <Select
                label="Default Currency"
                options={[
                  { value: 'USD', label: 'USD - US Dollar' },
                  { value: 'EUR', label: 'EUR - Euro' },
                  { value: 'GBP', label: 'GBP - British Pound' },
                ]}
                defaultValue="USD"
              />
              <Select
                label="Timezone"
                options={[
                  { value: 'UTC', label: 'UTC' },
                  { value: 'America/New_York', label: 'Eastern Time' },
                  { value: 'Asia/Bangkok', label: 'Bangkok (GMT+7)' },
                ]}
                defaultValue="UTC"
              />
              <Select
                label="Date Format"
                options={[
                  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
                  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
                  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
                ]}
                defaultValue="MM/DD/YYYY"
              />
            </div>
            <div className="flex justify-end">
              <Button>Save Changes</Button>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Security</h3>
            <p className="text-sm text-gray-500">Manage your password and security settings</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input label="Current Password" type="password" />
            <div className="grid grid-cols-2 gap-4">
              <Input label="New Password" type="password" />
              <Input label="Confirm Password" type="password" />
            </div>
            <div className="flex justify-end">
              <Button>Update Password</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
