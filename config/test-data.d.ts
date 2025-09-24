export interface TestDataConfig {
    flows: {
        validFlow: FlowData;
        invalidFlow: Partial<FlowData>;
        updatedFlow: FlowData;
    };
    agents: {
        validAgent: AgentData;
        invalidAgent: Partial<AgentData>;
        updatedAgent: AgentData;
        routerAgent: AgentData;
    };
    chatMessages: {
        validMessage: ChatMessageData;
        invalidMessage: Partial<ChatMessageData>;
    };
}
export interface FlowData {
    name: string;
    description: string;
    status: 'active' | 'inactive';
    tags?: string[];
    metadata?: Record<string, any>;
}
export interface AgentData {
    name: string;
    description: string;
    type: 'custom' | 'router' | 'system';
    flowId: string;
    configuration: Record<string, any>;
    status: 'draft' | 'active' | 'inactive';
    version?: string;
}
export interface ChatMessageData {
    message: string;
    flowId: string;
    agentId?: string;
    userId: string;
    sessionId: string;
    metadata?: Record<string, any>;
}
export declare const testData: TestDataConfig;
