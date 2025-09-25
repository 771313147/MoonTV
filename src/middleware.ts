/* eslint-disable no-console */

import { NextRequest, NextResponse } from 'next/server';

import { getAuthInfoFromCookie } from '@/lib/auth';
import { getAdminPassword } from '@/lib/auth-config';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 跳过不需要验证的路径
  if (shouldSkipAuth(pathname)) {
    return NextResponse.next();
  }

  // 获取管理员密码
  const adminPassword = getAdminPassword();
  console.log('中间件: 管理员密码状态:', adminPassword ? '已配置' : '未配置');
  
  if (!adminPassword) {
    console.log('中间件: 未找到管理员密码，重定向到警告页面');
    return NextResponse.redirect(new URL('/warning', request.url));
  }

  // 获取存储类型
  const storageType = (typeof globalThis.process !== 'undefined' && globalThis.process.env.STORAGE_TYPE) || 'localstorage';
  console.log('中间件: 存储类型:', storageType);

  if (storageType === 'localstorage') {
    // localstorage模式下跳过服务端验证
    console.log('中间件: localstorage模式，跳过服务端验证');
    return NextResponse.next();
  }

  // 其他模式下进行cookie验证
  const authInfo = getAuthInfoFromCookie(request);
  console.log('中间件: 认证信息状态:', authInfo ? '已找到' : '未找到');
  
  if (!authInfo) {
    console.log('中间件: 未找到认证信息，重定向到登录页面');
    return handleAuthFailure(request, pathname);
  }

  const { username, timestamp, signature } = authInfo;

  // 验证必要字段
  if (!username || !timestamp || !signature) {
    console.log('中间件: 认证信息不完整');
    return handleAuthFailure(request, pathname);
  }

  // 验证时间戳（24小时有效期）
  const now = Date.now();
  const tokenAge = now - timestamp;
  const maxAge = 24 * 60 * 60 * 1000; // 24小时

  if (tokenAge > maxAge) {
    console.log('中间件: 认证令牌已过期');
    return handleAuthFailure(request, pathname);
  }

  // 验证签名
  const data = `${username}:${timestamp}`;
  const isValidSignature = await verifySignature(data, signature, adminPassword);

  if (!isValidSignature) {
    console.log('中间件: 签名验证失败');
    return handleAuthFailure(request, pathname);
  }

  console.log('中间件: 认证成功，允许访问');
  return NextResponse.next();
}

// 验证签名
async function verifySignature(
  data: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(data);

  try {
    // 导入密钥
    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    // 将十六进制字符串转换为Uint8Array
    const signatureBuffer = new Uint8Array(
      signature.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []
    );

    // 验证签名
    return await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBuffer,
      messageData
    );
  } catch (error) {
    console.error('签名验证失败:', error);
    return false;
  }
}

// 处理认证失败的情况
function handleAuthFailure(
  request: NextRequest,
  pathname: string
): NextResponse {
  // 如果是 API 路由，返回 401 状态码
  if (pathname.startsWith('/api')) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  // 否则重定向到登录页面
  const loginUrl = new URL('/login', request.url);
  // 保留完整的URL，包括查询参数
  const fullUrl = `${pathname}${request.nextUrl.search}`;
  loginUrl.searchParams.set('redirect', fullUrl);
  return NextResponse.redirect(loginUrl);
}

// 判断是否需要跳过认证的路径
function shouldSkipAuth(pathname: string): boolean {
  const skipPaths = [
    '/api/login',
    '/api/register', 
    '/api/logout',
    '/login',
    '/register',
    '/warning',
    '/debug',  // 添加调试页面
    '/api/debug',  // 添加调试API
    '/_next',
    '/favicon.ico',
    '/robots.txt',
    '/manifest.json',
    '/icons/',
    '/logo.png',
    '/screenshot.png',
  ];

  return skipPaths.some((path) => pathname.startsWith(path));
}

// 配置middleware匹配规则
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|login|warning|api/login|api/register|api/logout|api/cron|api/server-config).*)',
  ],
};
