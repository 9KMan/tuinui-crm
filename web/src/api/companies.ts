import { createApi } from './client'
import type { Company } from '../types'

export const companiesApi = createApi<Company>('companies')
