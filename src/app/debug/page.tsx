'use client';

import { useState, useEffect } from 'react';

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
          environment: 'client'
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
            info.server = { error: `HTTP ${response.status}: ${response.statusText}` };
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
          password: 'test123'
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
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">正在收集调试信息...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">系统调试信息</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">操作面板</h2>
          <div className="space-x-4">
            <button
              onClick={testLogin}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              测试登录API
            </button>
            <button
              onClick={() => window.location.reload()}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              刷新调试信息
            </button>
            <button
              onClick={() => window.location.href = '/login'}
              className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
            >
              前往登录页面
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">调试信息</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}