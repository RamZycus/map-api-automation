export interface EnvironmentConfig {
    baseUrl: string;
    apiKey: string;
    timeout: number;
    retries: number;
    chatApiUrl: string;
    ablyApiKey: string;
    ablyChannel: string;
}
export declare const environments: {
    development: {
        baseUrl: string;
        apiKey: string;
        timeout: number;
        retries: number;
        chatApiUrl: string;
        ablyApiKey: string;
        ablyChannel: string;
    };
    staging: {
        baseUrl: string;
        apiKey: string;
        timeout: number;
        retries: number;
        chatApiUrl: string;
        ablyApiKey: string;
        ablyChannel: string;
    };
    production: {
        baseUrl: string;
        apiKey: string;
        timeout: number;
        retries: number;
        chatApiUrl: string;
        ablyApiKey: string;
        ablyChannel: string;
    };
};
export declare const getEnvironment: () => EnvironmentConfig;
