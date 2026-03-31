import { useState, useMemo } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import { Search, Plus, ArrowUpDown, Trash2, Edit, Eye } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Header } from '../../components/layout/Header'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { Avatar } from '../../components/ui/Avatar'
import { contactsStateAtom, addContactAtom, updateContactAtom, deleteContactAtom } from '../../stores/contactsStore'
import { companiesStateAtom } from '../../stores/companiesStore'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { Contact } from '../../types'

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  jobTitle: z.string().optional(),
  companyId: z.string().optional(),
})

type ContactForm = z.infer<typeof contactSchema>

export function ContactsListPage() {
  const navigate = useNavigate()
  const contactsState = useAtomValue(contactsStateAtom)
  const companiesState = useAtomValue(companiesStateAtom)
  const addContact = useSetAtom(addContactAtom)
  const updateContact = useSetAtom(updateContactAtom)
  const deleteContact = useSetAtom(deleteContactAtom)

  const [search, setSearch] = useState('')
  const [sorting, setSorting] = useState<SortingState>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: '', email: '', phone: '', jobTitle: '', companyId: '' },
  })

  const columns = useMemo<ColumnDef<Contact>[]>(
    () => [
      {
        accessorKey: 'name',
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 text-xs font-medium text-gray-500 uppercase hover:text-gray-700"
            onClick={() => column.toggleSorting()}
          >
            Name
            <ArrowUpDown className="w-3 h-3" />
          </button>
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <Avatar name={row.original.name} size="sm" />
            <span className="font-medium text-gray-900">{row.original.name}</span>
          </div>
        ),
      },
      {
        accessorKey: 'email',
        header: () => <span className="text-xs font-medium text-gray-500 uppercase">Email</span>,
        cell: ({ row }) => <span className="text-sm text-gray-600">{row.original.email || '—'}</span>,
      },
      {
        accessorKey: 'phone',
        header: () => <span className="text-xs font-medium text-gray-500 uppercase">Phone</span>,
        cell: ({ row }) => <span className="text-sm text-gray-600">{row.original.phone || '—'}</span>,
      },
      {
        accessorKey: 'companyId',
        header: () => <span className="text-xs font-medium text-gray-500 uppercase">Company</span>,
        cell: ({ row }) => {
          const company = companiesState.companies.find((c) => c.id === row.original.companyId)
          return company ? (
            <Badge variant="secondary">{company.name}</Badge>
          ) : (
            <span className="text-sm text-gray-400">—</span>
          )
        },
      },
      {
        accessorKey: 'jobTitle',
        header: () => <span className="text-xs font-medium text-gray-500 uppercase">Job Title</span>,
        cell: ({ row }) => <span className="text-sm text-gray-600">{row.original.jobTitle || '—'}</span>,
      },
      {
        id: 'actions',
        header: () => <span className="text-xs font-medium text-gray-500 uppercase">Actions</span>,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/contacts/${row.original.id}`)}
              className="p-1.5 text-gray-400 hover:text-primary-600 rounded hover:bg-gray-100"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => openEditModal(row.original)}
              className="p-1.5 text-gray-400 hover:text-primary-600 rounded hover:bg-gray-100"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDeleteConfirmId(row.original.id)}
              className="p-1.5 text-gray-400 hover:text-error-600 rounded hover:bg-error-50"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ),
      },
    ],
    [companiesState.companies, navigate]
  )

  const filteredData = useMemo(() => {
    return contactsState.contacts.filter((c) => {
      const q = search.toLowerCase()
      return (
        c.name.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.phone?.includes(q)
      )
    })
  }, [contactsState.contacts, search])

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  const openAddModal = () => {
    setEditingContact(null)
    reset({ name: '', email: '', phone: '', jobTitle: '', companyId: '' })
    setIsModalOpen(true)
  }

  const openEditModal = (contact: Contact) => {
    setEditingContact(contact)
    reset({
      name: contact.name,
      email: contact.email || '',
      phone: contact.phone || '',
      jobTitle: contact.jobTitle || '',
      companyId: contact.companyId || '',
    })
    setIsModalOpen(true)
  }

  const onFormSubmit = (data: ContactForm) => {
    if (editingContact) {
      updateContact({
        ...editingContact,
        ...data,
        companyId: data.companyId || undefined,
      })
    } else {
      const newContact: Contact = {
        id: Date.now().toString(),
        ...data,
        companyId: data.companyId || undefined,
        customFields: {},
        createdById: '1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      addContact(newContact)
    }
    setIsModalOpen(false)
  }

  const handleDelete = (id: string) => {
    deleteContact(id)
    setDeleteConfirmId(null)
  }

  return (
    <div>
      <Header title="Contacts" subtitle={`${contactsState.contacts.length} contacts`} onCreateNew={openAddModal} />

      <div className="p-6 space-y-6">
        <Card>
          <CardContent className="p-4">
            {/* Toolbar */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search contacts..."
                  className="pl-10"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button variant="outline" size="sm" onClick={openAddModal}>
                <Plus className="w-4 h-4" />
                Add Contact
              </Button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id} className="border-b border-gray-200">
                      {headerGroup.headers.map((header) => (
                        <th key={header.id} className="text-left py-3 px-4">
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.length === 0 ? (
                    <tr>
                      <td colSpan={columns.length} className="py-12 text-center text-gray-500">
                        No contacts found
                      </td>
                    </tr>
                  ) : (
                    table.getRowModel().rows.map((row) => (
                      <tr
                        key={row.id}
                        className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                        onClick={() => navigate(`/contacts/${row.original.id}`)}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id} className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingContact ? 'Edit Contact' : 'Add Contact'}
        size="md"
      >
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
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
              {companiesState.companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editingContact ? 'Save Changes' : 'Add Contact'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        title="Delete Contact"
        size="sm"
      >
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete this contact? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  )
}
