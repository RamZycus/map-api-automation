"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEnvironment = exports.environments = void 0;
exports.environments = {
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
const getEnvironment = () => {
    const env = process.env.NODE_ENV || 'development';
    return exports.environments[env] || exports.environments.development;
};
exports.getEnvironment = getEnvironment;
