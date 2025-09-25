/* eslint-disable no-console */

export interface AuthConfig {
  password: string;
  username?: string;
  encryption?: {
    enabled: boolean;
    algorithm: string;
  };
  security?: {
    minPasswordLength: number;
    requireSpecialChars: boolean;
  };
  version?: string;
}

// 缓存配置以避免重复解析
let cachedAuthConfig: AuthConfig | null = null;

/**
 * 从环境变量读取JSON格式的认证配置
 * 环境变量名: AUTH_CONFIG_JSON
 * 格式: {"password":"your_password","username":"admin"}
 */
function parseAuthConfigFromEnv(): AuthConfig | null {
  // 检查是否在支持process的环境中
  if (typeof globalThis.process === 'undefined') {
    return null;
  }

  try {
    const configJson = globalThis.process.env.AUTH_CONFIG_JSON;
    if (!configJson) {
      return null;
    }

    const config: AuthConfig = JSON.parse(configJson);
    
    // 验证配置格式
    if (!config.password || typeof config.password !== 'string') {
      throw new Error('配置中缺少有效的密码字段');
    }

    return config;
  } catch (error) {
    console.error('解析认证配置失败:', error);
    return null;
  }
}

/**
 * 获取认证配置
 */
export function getAuthConfig(): AuthConfig | null {
  if (cachedAuthConfig) {
    return cachedAuthConfig;
  }

  // 尝试从环境变量解析配置
  const envConfig = parseAuthConfigFromEnv();
  if (envConfig) {
    cachedAuthConfig = envConfig;
    return envConfig;
  }

  return null;
}

/**
 * 获取管理员密码
 * 优先从配置读取，如果不存在则回退到环境变量
 */
export function getAdminPassword(): string | null {
  // 首先尝试从配置读取
  const authConfig = getAuthConfig();
  if (authConfig && authConfig.password) {
    return authConfig.password;
  }
  
  // 回退到环境变量（向后兼容）
  return (typeof globalThis.process !== 'undefined' && globalThis.process.env.PASSWORD) || null;
}

/**
 * 获取管理员用户名
 * 优先从配置读取，如果不存在则回退到环境变量
 */
export function getAdminUsername(): string | null {
  // 首先尝试从配置读取
  const authConfig = getAuthConfig();
  if (authConfig && authConfig.username) {
    return authConfig.username;
  }
  
  // 回退到环境变量（向后兼容）
  return (typeof globalThis.process !== 'undefined' && globalThis.process.env.USERNAME) || null;
}

/**
 * 验证密码强度（如果配置中启用了安全检查）
 */
export function validatePassword(password: string): { valid: boolean; message?: string } {
  const authConfig = getAuthConfig();
  
  if (!authConfig || !authConfig.security) {
    return { valid: true };
  }
  
  const { minPasswordLength = 8, requireSpecialChars = false } = authConfig.security;
  
  if (password.length < minPasswordLength) {
    return {
      valid: false,
      message: `密码长度至少需要 ${minPasswordLength} 个字符`
    };
  }
  
  if (requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return {
      valid: false,
      message: '密码必须包含特殊字符'
    };
  }
  
  return { valid: true };
}

/**
 * 清除配置缓存（用于测试或配置更新后）
 */
export function clearAuthConfigCache(): void {
  cachedAuthConfig = null;
}