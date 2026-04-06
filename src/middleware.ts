import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const backendUrl = process.env.API_URL || 'http://localhost:9001';
    
    // Create new URL by replacing the base URL
    const url = new URL(request.nextUrl.pathname + request.nextUrl.search, backendUrl);
    
    return NextResponse.rewrite(url);
  }
}

export const config = {
  matcher: '/api/:path*',
};
