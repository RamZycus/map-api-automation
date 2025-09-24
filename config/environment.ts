// Environment Configuration
export interface EnvironmentConfig {
  baseUrl: string;
  apiKey: string;
  timeout: number;
  retries: number;
  chatApiUrl: string;
  ablyApiKey: string;
  ablyChannel: string;
}

export const environments = {
  development: {
    baseUrl: process.env.BASE_URL || 'http://hpx-up1.app.inmu.qc.zycus.local:39405',
    apiKey: process.env.API_KEY || '',
    timeout: 30000,
    retries: 3,
    chatApiUrl: process.env.CHAT_API_URL || 'http://hpx-up1.app.inmu.qc.zycus.local:39405/chat-api',
    ablyApiKey: process.env.ABLY_API_KEY || '',
    ablyChannel: process.env.ABLY_CHANNEL || 'test-channel'
  },
  staging: {
    baseUrl: process.env.BASE_URL || 'http://hpx-up1.app.inmu.qc.zycus.local:39405',
    apiKey: process.env.API_KEY || '',
    timeout: 30000,
    retries: 3,
    chatApiUrl: process.env.CHAT_API_URL || 'http://hpx-up1.app.inmu.qc.zycus.local:39405/chat-api',
    ablyApiKey: process.env.ABLY_API_KEY || '',
    ablyChannel: process.env.ABLY_CHANNEL || 'staging-channel'
  },
  production: {
    baseUrl: process.env.BASE_URL || 'http://hpx-up1.app.inmu.qc.zycus.local:39405',
    apiKey: process.env.API_KEY || '',
    timeout: 30000,
    retries: 2,
    chatApiUrl: process.env.CHAT_API_URL || 'http://hpx-up1.app.inmu.qc.zycus.local:39405/chat-api',
    ablyApiKey: process.env.ABLY_API_KEY || '',
    ablyChannel: process.env.ABLY_CHANNEL || 'production-channel'
  }
};

export const getEnvironment = (): EnvironmentConfig => {
  const env = process.env.NODE_ENV || 'development';
  return environments[env as keyof typeof environments] || environments.development;
};
