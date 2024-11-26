
import { cookies } from 'next/headers'
import { Language } from './language-provider'

export async function getLanguage(): Promise<Language> {
  const cc = await cookies()
  return (cc.get('language')?.value as Language) || 'en'
}