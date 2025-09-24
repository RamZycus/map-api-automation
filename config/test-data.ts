// Test Data Configuration
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

export const testData: TestDataConfig = {
  flows: {
    validFlow: {
      name: 'Test Flow',
      description: 'A test flow for automation',
      status: 'active',
      tags: ['test', 'automation'],
      metadata: {
        createdBy: 'automation-test',
        environment: 'test'
      }
    },
    invalidFlow: {
      name: '', // Invalid: empty name
      description: 'Invalid flow data'
    },
    updatedFlow: {
      name: 'Updated Test Flow',
      description: 'An updated test flow for automation',
      status: 'active',
      tags: ['test', 'automation', 'updated'],
      metadata: {
        createdBy: 'automation-test',
        environment: 'test',
        updatedAt: new Date().toISOString()
      }
    }
  },
  agents: {
    validAgent: {
      name: 'Test Agent',
      description: 'A test agent for automation',
      type: 'custom',
      flowId: '', // Will be set dynamically
      configuration: {
        model: 'gpt-3.5-turbo',
        temperature: 0.7,
        maxTokens: 1000
      },
      status: 'draft',
      version: '1.0.0'
    },
    invalidAgent: {
      name: '', // Invalid: empty name
      description: 'Invalid agent data'
    },
    updatedAgent: {
      name: 'Updated Test Agent',
      description: 'An updated test agent for automation',
      type: 'custom',
      flowId: '', // Will be set dynamically
      configuration: {
        model: 'gpt-4',
        temperature: 0.5,
        maxTokens: 2000
      },
      status: 'active',
      version: '1.1.0'
    },
    routerAgent: {
      name: 'Router Agent',
      description: 'Default router agent created with flow',
      type: 'router',
      flowId: '', // Will be set dynamically
      configuration: {
        routingStrategy: 'round-robin',
        fallbackAgent: 'default'
      },
      status: 'active',
      version: '1.0.0'
    }
  },
  chatMessages: {
    validMessage: {
      message: 'Hello, this is a test message',
      flowId: '', // Will be set dynamically
      userId: 'test-user-123',
      sessionId: 'test-session-456',
      metadata: {
        source: 'automation-test',
        timestamp: new Date().toISOString()
      }
    },
    invalidMessage: {
      message: '', // Invalid: empty message
      flowId: 'invalid-flow-id'
    }
  }
};
