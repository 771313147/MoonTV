declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_STORAGE_TYPE?: string;
      SITE_NAME?: string;
      ANNOUNCEMENT?: string;
      NEXT_PUBLIC_SEARCH_MAX_PAGE?: string;
      NEXT_PUBLIC_IMAGE_PROXY?: string;
      NEXT_PUBLIC_DOUBAN_PROXY?: string;
      NEXT_PUBLIC_DISABLE_YELLOW_FILTER?: string;
      NEXT_PUBLIC_ENABLE_REGISTER?: string;
      REDIS_URL?: string;
      UPSTASH_URL?: string;
      UPSTASH_TOKEN?: string;
      DOCKER_ENV?: string;
      NODE_ENV?: string;
      HOSTNAME?: string;
      PORT?: string;
      AUTH_CONFIG_JSON?: string;
      USERNAME?: string;
      PASSWORD?: string;
    }
  }
}

export {};