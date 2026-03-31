import { atom } from 'jotai'
import type { Contact } from '../types'

export interface ContactsState {
  contacts: Contact[]
  selectedContact: Contact | null
  isLoading: boolean
  searchQuery: string
  filterCompany: string
}

// Mock data
const mockContacts: Contact[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john@acme.com',
    phone: '+1 555-0123',
    companyId: '1',
    jobTitle: 'CEO',
    customFields: {},
    createdById: '1',
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-03-20T14:30:00Z',
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah@techinc.com',
    phone: '+1 555-0124',
    companyId: '2',
    jobTitle: 'CTO',
    customFields: {},
    createdById: '1',
    createdAt: '2026-01-20T09:00:00Z',
    updatedAt: '2026-03-18T11:00:00Z',
  },
  {
    id: '3',
    name: 'Mike Wilson',
    email: 'mike@startupco.com',
    phone: '+1 555-0125',
    companyId: '3',
    jobTitle: 'Developer',
    customFields: {},
    createdById: '1',
    createdAt: '2026-02-01T08:00:00Z',
    updatedAt: '2026-03-15T16:00:00Z',
  },
  {
    id: '4',
    name: 'Emily Davis',
    email: 'emily@global.com',
    phone: '+1 555-0126',
    companyId: '4',
    jobTitle: 'VP Sales',
    customFields: {},
    createdById: '1',
    createdAt: '2026-02-10T12:00:00Z',
    updatedAt: '2026-03-22T09:00:00Z',
  },
  {
    id: '5',
    name: 'Chris Brown',
    email: 'chris@innovate.io',
    phone: '+1 555-0127',
    companyId: '5',
    jobTitle: 'Product Manager',
    customFields: {},
    createdById: '1',
    createdAt: '2026-02-15T14:00:00Z',
    updatedAt: '2026-03-25T10:00:00Z',
  },
]

export const contactsStateAtom = atom<ContactsState>({
  contacts: mockContacts,
  selectedContact: null,
  isLoading: false,
  searchQuery: '',
  filterCompany: '',
})

// Derived atoms
export const selectedContactAtom = atom(
  (get) => get(contactsStateAtom).selectedContact
)

export const filteredContactsAtom = atom((get) => {
  const { contacts, searchQuery } = get(contactsStateAtom)
  return contacts.filter((contact) => {
    const q = searchQuery.toLowerCase()
    return (
      contact.name.toLowerCase().includes(q) ||
      contact.email?.toLowerCase().includes(q) ||
      contact.phone?.includes(q)
    )
  })
})

// Action atoms
export const addContactAtom = atom(null, (_get, set, contact: Contact) => {
  set(contactsStateAtom, (state) => ({
    ...state,
    contacts: [contact, ...state.contacts],
  }))
})

export const updateContactAtom = atom(null, (_get, set, contact: Contact) => {
  set(contactsStateAtom, (state) => ({
    ...state,
    contacts: state.contacts.map((c) => (c.id === contact.id ? contact : c)),
    selectedContact: state.selectedContact?.id === contact.id ? contact : state.selectedContact,
  }))
})

export const deleteContactAtom = atom(null, (_get, set, id: string) => {
  set(contactsStateAtom, (state) => ({
    ...state,
    contacts: state.contacts.filter((c) => c.id !== id),
    selectedContact: state.selectedContact?.id === id ? null : state.selectedContact,
  }))
})

export const setSelectedContactAtom = atom(null, (_get, set, contact: Contact | null) => {
  set(contactsStateAtom, (state) => ({ ...state, selectedContact: contact }))
})

export const setContactsSearchAtom = atom(null, (_get, set, query: string) => {
  set(contactsStateAtom, (state) => ({ ...state, searchQuery: query }))
})
