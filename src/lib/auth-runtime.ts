// 该文件由 scripts/convert-auth-config.js 自动生成，请勿手动修改
/* eslint-disable */

export const authConfig = {
  password: 'test123456',
  username: 'admin',
  encryption: {
    enabled: false,
    algorithm: 'AES-256-GCM',
  },
  security: {
    minPasswordLength: 8,
    requireSpecialChars: false,
  },
  version: '1.0',
} as const;

export type AuthRuntimeConfig = typeof authConfig;

export default authConfig;
