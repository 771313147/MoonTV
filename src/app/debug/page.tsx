'use client';

import { useEffect, useState } from 'react';

export default function DebugPage() {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const collectDebugInfo = async () => {
      try {
        const info: any = {
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href,
          cookies: document.cookie,
          localStorage: {},
          sessionStorage: {},
          environment: 'client',
        };

        // 收集localStorage信息
        try {
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key) {
              info.localStorage[key] = localStorage.getItem(key);
            }
          }
        } catch (e: any) {
          info.localStorage = { error: e.message };
        }

        // 收集sessionStorage信息
        try {
          for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            if (key) {
              info.sessionStorage[key] = sessionStorage.getItem(key);
            }
          }
        } catch (e: any) {
          info.sessionStorage = { error: e.message };
        }

        // 测试API端点
        try {
          const response = await fetch('/api/debug', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const serverInfo = await response.json();
            info.server = serverInfo;
          } else {
            info.server = {
              error: `HTTP ${response.status}: ${response.statusText}`,
            };
          }
        } catch (e: any) {
          info.server = { error: e.message };
        }

        setDebugInfo(info);
      } catch (error: any) {
        setDebugInfo({ error: error.message });
      } finally {
        setLoading(false);
      }
    };

    collectDebugInfo();
  }, []);

  const testLogin = async () => {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'admin',
          password: 'test123',
        }),
      });

      const result = await response.json();
      alert(`登录测试结果: ${JSON.stringify(result, null, 2)}`);
    } catch (error: any) {
      alert(`登录测试错误: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gray-100'>
        <div className='text-xl'>正在收集调试信息...</div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-100 p-8'>
      <div className='mx-auto max-w-4xl'>
        <h1 className='mb-8 text-center text-3xl font-bold'>系统调试信息</h1>

        <div className='mb-6 rounded-lg bg-white p-6 shadow-lg'>
          <h2 className='mb-4 text-xl font-semibold'>操作面板</h2>
          <div className='space-x-4'>
            <button
              onClick={testLogin}
              className='rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700'
            >
              测试登录API
            </button>
            <button
              onClick={() => window.location.reload()}
              className='rounded bg-green-500 px-4 py-2 font-bold text-white hover:bg-green-700'
            >
              刷新调试信息
            </button>
            <button
              onClick={() => (window.location.href = '/login')}
              className='rounded bg-purple-500 px-4 py-2 font-bold text-white hover:bg-purple-700'
            >
              前往登录页面
            </button>
          </div>
        </div>

        <div className='rounded-lg bg-white p-6 shadow-lg'>
          <h2 className='mb-4 text-xl font-semibold'>调试信息</h2>
          <pre className='overflow-auto rounded bg-gray-100 p-4 text-sm'>
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
