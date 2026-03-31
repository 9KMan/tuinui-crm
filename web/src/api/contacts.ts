import { createApi } from './client'
import type { Contact } from '../types'

export const contactsApi = createApi<Contact>('contacts')

// Activity timeline for a contact
export const contactActivitiesApi = {
  get: (contactId: string) =>
    fetch(`/api/v1/contacts/${contactId}/activities`).then((r) => r.json()),
}
