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
import { Search, Plus, ArrowUpDown, Trash2, Edit, Eye, Building2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Header } from '../../components/layout/Header'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { companiesStateAtom, addCompanyAtom, updateCompanyAtom, deleteCompanyAtom } from '../../stores/companiesStore'
import { contactsStateAtom } from '../../stores/contactsStore'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { Company } from '../../types'

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

export function CompaniesListPage() {
  const navigate = useNavigate()
  const companiesState = useAtomValue(companiesStateAtom)
  const contactsState = useAtomValue(contactsStateAtom)
  const addCompany = useSetAtom(addCompanyAtom)
  const updateCompany = useSetAtom(updateCompanyAtom)
  const deleteCompany = useSetAtom(deleteCompanyAtom)

  const [search, setSearch] = useState('')
  const [sorting, setSorting] = useState<SortingState>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCompany, setEditingCompany] = useState<Company | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CompanyForm>({
    resolver: zodResolver(companySchema),
    defaultValues: { name: '', domain: '', industry: '', size: undefined, address: '' },
  })

  const getContactCount = (companyId: string) =>
    contactsState.contacts.filter((c) => c.companyId === companyId).length

  const columns = useMemo<ColumnDef<Company>[]>(
    () => [
      {
        accessorKey: 'name',
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 text-xs font-medium text-gray-500 uppercase hover:text-gray-700"
            onClick={() => column.toggleSorting()}
          >
            Company
            <ArrowUpDown className="w-3 h-3" />
          </button>
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-gray-400" />
            </div>
            <div>
              <span className="font-medium text-gray-900">{row.original.name}</span>
              {row.original.domain && (
                <p className="text-xs text-gray-500">{row.original.domain}</p>
              )}
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'industry',
        header: () => <span className="text-xs font-medium text-gray-500 uppercase">Industry</span>,
        cell: ({ row }) => (
          <Badge variant="default">{row.original.industry || '—'}</Badge>
        ),
      },
      {
        accessorKey: 'size',
        header: () => <span className="text-xs font-medium text-gray-500 uppercase">Size</span>,
        cell: ({ row }) =>
          row.original.size ? (
            <Badge variant={sizeVariant[row.original.size]} size="sm">
              {row.original.size}
            </Badge>
          ) : (
            <span className="text-sm text-gray-400">—</span>
          ),
      },
      {
        accessorKey: 'contacts',
        header: () => <span className="text-xs font-medium text-gray-500 uppercase">Contacts</span>,
        cell: ({ row }) => (
          <Badge variant="secondary">{getContactCount(row.original.id)}</Badge>
        ),
      },
      {
        id: 'actions',
        header: () => <span className="text-xs font-medium text-gray-500 uppercase">Actions</span>,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/companies/${row.original.id}`)}
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
    [contactsState.contacts, navigate]
  )

  const filteredData = useMemo(() => {
    return companiesState.companies.filter((c) => {
      const q = search.toLowerCase()
      return (
        c.name.toLowerCase().includes(q) ||
        c.domain?.toLowerCase().includes(q) ||
        c.industry?.toLowerCase().includes(q)
      )
    })
  }, [companiesState.companies, search])

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
    setEditingCompany(null)
    reset({ name: '', domain: '', industry: '', size: undefined, address: '' })
    setIsModalOpen(true)
  }

  const openEditModal = (company: Company) => {
    setEditingCompany(company)
    reset({
      name: company.name,
      domain: company.domain || '',
      industry: company.industry || '',
      size: company.size,
      address: company.address || '',
    })
    setIsModalOpen(true)
  }

  const onFormSubmit = (data: CompanyForm) => {
    if (editingCompany) {
      updateCompany({
        ...editingCompany,
        ...data,
      })
    } else {
      const newCompany: Company = {
        id: Date.now().toString(),
        ...data,
        customFields: {},
        createdById: '1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      addCompany(newCompany)
    }
    setIsModalOpen(false)
  }

  const handleDelete = (id: string) => {
    deleteCompany(id)
    setDeleteConfirmId(null)
  }

  return (
    <div>
      <Header title="Companies" subtitle={`${companiesState.companies.length} companies`} onCreateNew={openAddModal} />

      <div className="p-6 space-y-6">
        <Card>
          <CardContent className="p-4">
            {/* Toolbar */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search companies..."
                  className="pl-10"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button variant="outline" size="sm" onClick={openAddModal}>
                <Plus className="w-4 h-4" />
                Add Company
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
                        No companies found
                      </td>
                    </tr>
                  ) : (
                    table.getRowModel().rows.map((row) => (
                      <tr
                        key={row.id}
                        className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                        onClick={() => navigate(`/companies/${row.original.id}`)}
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
        title={editingCompany ? 'Edit Company' : 'Add Company'}
        size="md"
      >
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
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
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editingCompany ? 'Save Changes' : 'Add Company'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        title="Delete Company"
        size="sm"
      >
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete this company? This action cannot be undone.
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
