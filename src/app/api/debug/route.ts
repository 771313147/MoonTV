import { NextRequest, NextResponse } from 'next/server';
import { getAdminPassword } from '@/lib/auth-config';

export async function GET(request: NextRequest) {
  try {
    const debugInfo = {
      timestamp: new Date().toISOString(),
      environment: 'server',
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      headers: Object.fromEntries(request.headers.entries()),
      url: request.url,
      cookies: request.cookies.getAll(),
      authConfig: {
        hasAdminPassword: !!getAdminPassword(),
        adminPasswordLength: getAdminPassword()?.length || 0,
      },
      environmentVariables: {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL: process.env.VERCEL,
        STORAGE_TYPE: process.env.STORAGE_TYPE,
        AUTH_CONFIG_JSON: process.env.AUTH_CONFIG_JSON ? '已设置' : '未设置',
        AUTH_CONFIG_JSON_LENGTH: process.env.AUTH_CONFIG_JSON?.length || 0,
      },
      runtime: {
        isEdgeRuntime: typeof (globalThis as any).EdgeRuntime !== 'undefined',
        hasProcess: typeof process !== 'undefined',
        hasGlobalThis: typeof globalThis !== 'undefined',
      }
    };

    return NextResponse.json(debugInfo);
  } catch (error: any) {
    return NextResponse.json(
      { 
        error: error.message,
        timestamp: new Date().toISOString(),
        environment: 'server'
      },
      { status: 500 }
    );
  }
}