import { NextRequest, NextResponse } from 'next/server'

const getTargetBase = () => {
  const envUrl = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:8080/api/v1' : 'https://multiverus-web-site.vercel.app/api/v1');
  return envUrl.replace(/\/+$/, '');
};

async function proxyRequest(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params
  const searchParams = request.nextUrl.searchParams.toString()
  const targetBase = getTargetBase()
  const apiUrl = `${targetBase}/${path.join('/')}${searchParams ? `?${searchParams}` : ''}`

  const headers = new Headers(request.headers)
  headers.delete('host')

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 15000) // 15s timeout

  try {
    const response = await fetch(apiUrl, {
      method: request.method,
      headers: headers,
      body: request.method !== 'GET' && request.method !== 'HEAD' ? await request.blob() : undefined,
      cache: 'no-store',
      signal: controller.signal
    })
    clearTimeout(timeoutId)

    const responseHeaders = new Headers()
    response.headers.forEach((value, key) => {
      if (!['content-encoding', 'transfer-encoding', 'connection'].includes(key.toLowerCase())) {
        responseHeaders.set(key, value)
      }
    })

    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json()
      return NextResponse.json(data, {
        status: response.status,
        headers: responseHeaders
      })
    } else {
      const text = await response.text()
      return new NextResponse(text, {
        status: response.status,
        headers: responseHeaders
      })
    }
  } catch (error: any) {
    clearTimeout(timeoutId)
    const errorMsg = `[API Proxy Error] ${new Date().toISOString()} ${request.method} ${request.nextUrl.pathname}: ${error.message}\n`
    console.error(errorMsg, error)
    return NextResponse.json({
      error: 'Proxy implementation error',
      message: error.name === 'AbortError' ? 'Request timeout' : error.message
    }, { status: error.name === 'AbortError' ? 504 : 502 })
  }
}

export const GET = proxyRequest
export const POST = proxyRequest
export const PUT = proxyRequest
export const PATCH = proxyRequest
export const DELETE = proxyRequest
