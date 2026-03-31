import { atom } from 'jotai'
import type { Company } from '../types'

export interface CompaniesState {
  companies: Company[]
  selectedCompany: Company | null
  isLoading: boolean
  searchQuery: string
  filterIndustry: string
}

// Mock data
const mockCompanies: Company[] = [
  {
    id: '1',
    name: 'Acme Corp',
    domain: 'acme.com',
    industry: 'Technology',
    size: 'mid',
    address: '123 Tech Street, San Francisco, CA',
    customFields: {},
    createdById: '1',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-03-20T00:00:00Z',
  },
  {
    id: '2',
    name: 'Tech Inc',
    domain: 'techinc.com',
    industry: 'Software',
    size: 'startup',
    address: '456 Startup Ave, Austin, TX',
    customFields: {},
    createdById: '1',
    createdAt: '2026-01-10T00:00:00Z',
    updatedAt: '2026-03-18T00:00:00Z',
  },
  {
    id: '3',
    name: 'Global Industries',
    domain: 'global.com',
    industry: 'Manufacturing',
    size: 'enterprise',
    address: '789 Industrial Blvd, Chicago, IL',
    customFields: {},
    createdById: '1',
    createdAt: '2026-01-05T00:00:00Z',
    updatedAt: '2026-03-15T00:00:00Z',
  },
  {
    id: '4',
    name: 'FinanceHub',
    domain: 'financehub.com',
    industry: 'Finance',
    size: 'mid',
    address: '101 Wall Street, New York, NY',
    customFields: {},
    createdById: '1',
    createdAt: '2026-02-01T00:00:00Z',
    updatedAt: '2026-03-22T00:00:00Z',
  },
  {
    id: '5',
    name: 'Innovate.io',
    domain: 'innovate.io',
    industry: 'Technology',
    size: 'startup',
    address: '202 Innovation Dr, Seattle, WA',
    customFields: {},
    createdById: '1',
    createdAt: '2026-02-15T00:00:00Z',
    updatedAt: '2026-03-25T00:00:00Z',
  },
]

export const companiesStateAtom = atom<CompaniesState>({
  companies: mockCompanies,
  selectedCompany: null,
  isLoading: false,
  searchQuery: '',
  filterIndustry: '',
})

// Derived atoms
export const selectedCompanyAtom = atom(
  (get) => get(companiesStateAtom).selectedCompany
)

export const filteredCompaniesAtom = atom((get) => {
  const { companies, searchQuery } = get(companiesStateAtom)
  return companies.filter((company) => {
    const q = searchQuery.toLowerCase()
    return (
      company.name.toLowerCase().includes(q) ||
      company.domain?.toLowerCase().includes(q)
    )
  })
})

// Action atoms
export const addCompanyAtom = atom(null, (_get, set, company: Company) => {
  set(companiesStateAtom, (state) => ({
    ...state,
    companies: [company, ...state.companies],
  }))
})

export const updateCompanyAtom = atom(null, (_get, set, company: Company) => {
  set(companiesStateAtom, (state) => ({
    ...state,
    companies: state.companies.map((c) => (c.id === company.id ? company : c)),
    selectedCompany: state.selectedCompany?.id === company.id ? company : state.selectedCompany,
  }))
})

export const deleteCompanyAtom = atom(null, (_get, set, id: string) => {
  set(companiesStateAtom, (state) => ({
    ...state,
    companies: state.companies.filter((c) => c.id !== id),
    selectedCompany: state.selectedCompany?.id === id ? null : state.selectedCompany,
  }))
})

export const setSelectedCompanyAtom = atom(null, (_get, set, company: Company | null) => {
  set(companiesStateAtom, (state) => ({ ...state, selectedCompany: company }))
})

export const setCompaniesSearchAtom = atom(null, (_get, set, query: string) => {
  set(companiesStateAtom, (state) => ({ ...state, searchQuery: query }))
})
