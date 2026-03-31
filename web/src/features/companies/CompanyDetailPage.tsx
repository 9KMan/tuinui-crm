import { useParams, useNavigate } from 'react-router-dom'
import { useAtomValue, useSetAtom } from 'jotai'
import { format } from 'date-fns'
import { ArrowLeft, Globe, MapPin, Calendar, Users, Edit, Trash2, Building2 } from 'lucide-react'
import { useState } from 'react'
import { Header } from '../../components/layout/Header'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Avatar } from '../../components/ui/Avatar'
import { Modal } from '../../components/ui/Modal'
import { Input } from '../../components/ui/Input'
import { companiesStateAtom, updateCompanyAtom, deleteCompanyAtom } from '../../stores/companiesStore'
import { contactsStateAtom } from '../../stores/contactsStore'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const companySchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  domain: z.string().url().optional().or(z.literal('')),
  industry: z.string().optional(),
  size: z.enum(['startup', 'smb', 'mid', 'enterprise']).optional(),
  address: z.string().optional(),
})

type CompanyForm = z.infer<typeof companySchema>

const sizeVariant: Record<string, 'success' | 'default' | 'primary' | 'secondary'> = {
  startup: 'success',
  smb: 'default',
  mid: 'primary',
  enterprise: 'secondary',
}

export function CompanyDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const companiesState = useAtomValue(companiesStateAtom)
  const contactsState = useAtomValue(contactsStateAtom)
  const updateCompany = useSetAtom(updateCompanyAtom)
  const deleteCompany = useSetAtom(deleteCompanyAtom)

  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  const company = companiesState.companies.find((c) => c.id === id)
  const linkedContacts = contactsState.contacts.filter((c) => c.companyId === id)

  const { register, handleSubmit, formState: { errors } } = useForm<CompanyForm>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: company?.name || '',
      domain: company?.domain || '',
      industry: company?.industry || '',
      size: company?.size,
      address: company?.address || '',
    },
  })

  if (!company) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Company not found</p>
        <Button variant="ghost" onClick={() => navigate('/companies')} className="mt-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Companies
        </Button>
      </div>
    )
  }

  const onEditSubmit = (data: CompanyForm) => {
    updateCompany({ ...company, ...data })
    setIsEditModalOpen(false)
  }

  const handleDelete = () => {
    deleteCompany(company.id)
    navigate('/companies')
  }

  return (
    <div>
      <Header title={company.name} subtitle="Company Details" />

      <div className="p-6 space-y-6">
        {/* Back button */}
        <Button variant="ghost" size="sm" onClick={() => navigate('/companies')}>
          <ArrowLeft className="w-4 h-4" />
          Back to Companies
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
                    <Building2 className="w-10 h-10 text-gray-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">{company.name}</h2>
                  {company.industry && (
                    <Badge variant="default" className="mt-2">{company.industry}</Badge>
                  )}
                  {company.size && (
                    <Badge variant={sizeVariant[company.size]} size="sm" className="mt-1">
                      {company.size}
                    </Badge>
                  )}
                </div>

                <div className="space-y-4">
                  {company.domain && (
                    <div className="flex items-center gap-3 text-sm">
                      <Globe className="w-4 h-4 text-gray-400" />
                      <a href={`https://${company.domain}`} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                        {company.domain}
                      </a>
                    </div>
                  )}
                  {company.address && (
                    <div className="flex items-start gap-3 text-sm">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                      <span className="text-gray-700">{company.address}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-500">
                      Added {format(new Date(company.createdAt), 'MMM d, yyyy')}
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

          {/* Linked Contacts */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Linked Contacts ({linkedContacts.length})
                  </h3>
                  <Button variant="outline" size="sm" onClick={() => navigate('/contacts')}>
                    View All Contacts
                  </Button>
                </div>

                {linkedContacts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No contacts linked to this company yet.</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={() => navigate('/contacts')}
                    >
                      Add Contact
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {linkedContacts.map((contact) => (
                      <div
                        key={contact.id}
                        className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => navigate(`/contacts/${contact.id}`)}
                      >
                        <Avatar name={contact.name} size="md" />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{contact.name}</p>
                          <p className="text-sm text-gray-500">{contact.jobTitle || 'No title'}</p>
                        </div>
                        {contact.email && (
                          <span className="text-sm text-gray-500">{contact.email}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Company"
        size="md"
      >
        <form onSubmit={handleSubmit(onEditSubmit)} className="space-y-4">
          <Input label="Company Name *" placeholder="Acme Corp" error={errors.name?.message} {...register('name')} />
          <Input label="Domain" placeholder="https://acme.com" error={errors.domain?.message} {...register('domain')} />
          <Input label="Industry" placeholder="Technology" {...register('industry')} />
          <Input label="Address" placeholder="123 Main St, City, Country" {...register('address')} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Size</label>
            <select
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:border-primary-500 focus:ring-primary-500"
              {...register('size')}
            >
              <option value="">Select size</option>
              <option value="startup">Startup</option>
              <option value="smb">SMB</option>
              <option value="mid">Mid-Market</option>
              <option value="enterprise">Enterprise</option>
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
        title="Delete Company"
        size="sm"
      >
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete <strong>{company.name}</strong>? This action cannot be undone.
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
