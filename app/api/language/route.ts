
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { language } = await request.json()
  
  // Validate language
  if (language !== 'en' && language !== 'he') {
    return NextResponse.json({ error: 'Invalid language' }, { status: 400 })
  }

  const cc = await cookies()

  // Set cookie
  cc.set('language', language, {
    httpOnly: true,
    path: '/',
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
  })

  return NextResponse.json({ success: true })
}