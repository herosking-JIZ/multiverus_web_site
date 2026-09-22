import { NextRequest, NextResponse } from 'next/server'
import { appendFileSync } from 'fs'

async function proxyRequest(request: NextRequest, { params }: { params: { path: string[] } }) {
  const { path } = await params
  const searchParams = request.nextUrl.searchParams.toString()
  const apiUrl = `http://10.3.3.50:8080/api/v1/${path.join('/')}${searchParams ? `?${searchParams}` : ''}`

  const logMsg = `[${new Date().toISOString()}] ${request.method} ${request.nextUrl.pathname} -> ${apiUrl}\n`
  try {
    appendFileSync('/tmp/proxy.log', logMsg)
  } catch (e) { }

  const headers = new Headers(request.headers)
  headers.set('host', '10.3.3.50:8080')

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
    try { appendFileSync('/tmp/proxy.log', errorMsg) } catch (e) { }
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
