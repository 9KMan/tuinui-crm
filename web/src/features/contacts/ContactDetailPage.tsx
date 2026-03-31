import { useParams, useNavigate } from 'react-router-dom'
import { useAtomValue, useSetAtom } from 'jotai'
import { format } from 'date-fns'
import { ArrowLeft, Mail, Phone, Building2, Calendar, Edit, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Header } from '../../components/layout/Header'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Avatar } from '../../components/ui/Avatar'
import { Modal } from '../../components/ui/Modal'
import { contactsStateAtom, updateContactAtom, deleteContactAtom } from '../../stores/contactsStore'
import { companiesStateAtom } from '../../stores/companiesStore'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '../../components/ui/Input'

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  jobTitle: z.string().optional(),
  companyId: z.string().optional(),
})

type ContactForm = z.infer<typeof contactSchema>

// Mock activity timeline data
const mockActivities = [
  { id: '1', type: 'email', subject: 'Follow-up email sent', body: 'Sent follow-up regarding product demo', createdAt: '2026-03-25T10:00:00Z' },
  { id: '2', type: 'call', subject: 'Sales call', body: 'Discussed pricing and requirements', createdAt: '2026-03-22T14:00:00Z' },
  { id: '3', type: 'note', subject: 'Meeting note', body: 'Met at conference - interested in enterprise plan', createdAt: '2026-03-20T09:00:00Z' },
  { id: '4', type: 'email', subject: 'Welcome email', body: 'Introduction and product overview sent', createdAt: '2026-03-15T11:00:00Z' },
]

const activityIcon: Record<string, string> = {
  email: '✉️',
  call: '📞',
  note: '📝',
  event: '📅',
  task: '✅',
}

export function ContactDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const contactsState = useAtomValue(contactsStateAtom)
  const companiesState = useAtomValue(companiesStateAtom)
  const updateContact = useSetAtom(updateContactAtom)
  const deleteContact = useSetAtom(deleteContactAtom)

  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  const contact = contactsState.contacts.find((c) => c.id === id)
  const company = contact?.companyId ? companiesState.companies.find((c) => c.id === contact.companyId) : null

  const { register, handleSubmit, formState: { errors } } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: contact?.name || '',
      email: contact?.email || '',
      phone: contact?.phone || '',
      jobTitle: contact?.jobTitle || '',
      companyId: contact?.companyId || '',
    },
  })

  if (!contact) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Contact not found</p>
        <Button variant="ghost" onClick={() => navigate('/contacts')} className="mt-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Contacts
        </Button>
      </div>
    )
  }

  const onEditSubmit = (data: ContactForm) => {
    updateContact({
      ...contact,
      ...data,
      companyId: data.companyId || undefined,
    })
    setIsEditModalOpen(false)
  }

  const handleDelete = () => {
    deleteContact(contact.id)
    navigate('/contacts')
  }

  return (
    <div>
      <Header title={contact.name} subtitle="Contact Details" />

      <div className="p-6 space-y-6">
        {/* Back button */}
        <Button variant="ghost" size="sm" onClick={() => navigate('/contacts')}>
          <ArrowLeft className="w-4 h-4" />
          Back to Contacts
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center mb-6">
                  <Avatar name={contact.name} size="xl" className="mb-4" />
                  <h2 className="text-xl font-semibold text-gray-900">{contact.name}</h2>
                  {contact.jobTitle && (
                    <p className="text-gray-500">{contact.jobTitle}</p>
                  )}
                  {company && (
                    <Badge variant="secondary" className="mt-2">
                      <Building2 className="w-3 h-3 mr-1" />
                      {company.name}
                    </Badge>
                  )}
                </div>

                <div className="space-y-4">
                  {contact.email && (
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <a href={`mailto:${contact.email}`} className="text-primary-600 hover:underline">
                        {contact.email}
                      </a>
                    </div>
                  )}
                  {contact.phone && (
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <a href={`tel:${contact.phone}`} className="text-gray-700">
                        {contact.phone}
                      </a>
                    </div>
                  )}
                  {company && (
                    <div className="flex items-center gap-3 text-sm">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">{company.name}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-500">
                      Added {format(new Date(contact.createdAt), 'MMM d, yyyy')}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 mt-6 pt-6 border-t">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => setIsEditModalOpen(true)}>
                    <Edit className="w-4 h-4" />
                    Edit
                  </Button>
                  <Button variant="danger" size="sm" className="flex-1" onClick={() => setIsDeleteModalOpen(true)}>
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Activity Timeline */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Timeline</h3>
                <div className="space-y-4">
                  {mockActivities.map((activity) => (
                    <div key={activity.id} className="flex gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-lg">
                        {activityIcon[activity.type] || '📌'}
                      </div>
                      <div className="flex-1 pb-4 border-b border-gray-100 last:border-0">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900">{activity.subject}</span>
                          <span className="text-xs text-gray-500">
                            {format(new Date(activity.createdAt), 'MMM d, yyyy')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{activity.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Contact"
        size="md"
      >
        <form onSubmit={handleSubmit(onEditSubmit)} className="space-y-4">
          <Input label="Name *" placeholder="John Doe" error={errors.name?.message} {...register('name')} />
          <Input label="Email" type="email" placeholder="john@example.com" error={errors.email?.message} {...register('email')} />
          <Input label="Phone" placeholder="+1 555-0123" {...register('phone')} />
          <Input label="Job Title" placeholder="CEO" {...register('jobTitle')} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
            <select
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:border-primary-500 focus:ring-primary-500"
              {...register('companyId')}
            >
              <option value="">Select a company</option>
              {companiesState.companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Contact"
        size="sm"
      >
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete <strong>{contact.name}</strong>? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  )
}
