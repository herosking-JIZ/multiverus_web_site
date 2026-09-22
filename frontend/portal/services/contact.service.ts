import api from '@/lib/axios'
import type { ContactPayload, ContactResponse } from '@/types/contact.types'

export const sendContact = (payload: ContactPayload) =>
  api.post<ContactResponse>('/contact', payload).then((r) => r.data)
