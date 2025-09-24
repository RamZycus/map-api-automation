// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  statusCode: number;
  timestamp: string;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  message?: string;
  statusCode: number;
  timestamp: string;
}

// Flow Types
export interface Flow {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive';
  tags: string[];
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface CreateFlowRequest {
  name: string;
  description: string;
  status?: 'active' | 'inactive';
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface UpdateFlowRequest {
  name?: string;
  description?: string;
  status?: 'active' | 'inactive';
  tags?: string[];
  metadata?: Record<string, any>;
}

// Agent Types
export interface Agent {
  id: string;
  name: string;
  description: string;
  type: 'custom' | 'router' | 'system';
  flowId: string;
  configuration: Record<string, any>;
  status: 'draft' | 'active' | 'inactive';
  version: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface CreateAgentRequest {
  name: string;
  description: string;
  type: 'custom' | 'router' | 'system';
  flowId: string;
  configuration: Record<string, any>;
  status?: 'draft' | 'active' | 'inactive';
  version?: string;
}

export interface UpdateAgentRequest {
  name?: string;
  description?: string;
  type?: 'custom' | 'router' | 'system';
  configuration?: Record<string, any>;
  status?: 'draft' | 'active' | 'inactive';
  version?: string;
}

// Deployment Types
export interface Deployment {
  id: string;
  agentId: string;
  flowId: string;
  status: 'pending' | 'deploying' | 'deployed' | 'failed' | 'cancelled';
  version: string;
  environment: 'development' | 'staging' | 'production';
  deployedAt?: string;
  deployedBy: string;
  logs?: string[];
  metadata: Record<string, any>;
}

export interface DeployAgentRequest {
  agentId: string;
  flowId: string;
  environment: 'development' | 'staging' | 'production';
  version?: string;
  metadata?: Record<string, any>;
}

export interface PromoteAgentRequest {
  deploymentId: string;
  targetEnvironment: 'staging' | 'production';
  metadata?: Record<string, any>;
}

// Chat API Types
export interface ChatMessage {
  id: string;
  message: string;
  flowId: string;
  agentId?: string;
  userId: string;
  sessionId: string;
  metadata: Record<string, any>;
  timestamp: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

export interface ChatRequest {
  message: string;
  flowId: string;
  agentId?: string;
  userId: string;
  sessionId: string;
  metadata?: Record<string, any>;
}

export interface ChatResponse {
  id: string;
  message: string;
  response: string;
  flowId: string;
  agentId: string;
  userId: string;
  sessionId: string;
  metadata: Record<string, any>;
  timestamp: string;
  processingTime: number;
  status: 'success' | 'error';
}

// Ably Types
export interface AblyMessage {
  id: string;
  type: 'chat_response' | 'deployment_status' | 'agent_status';
  data: any;
  timestamp: string;
  channel: string;
}

// Error Types
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
}

// Test Data Types
export interface TestContext {
  flowId?: string;
  agentId?: string;
  deploymentId?: string;
  sessionId?: string;
  userId?: string;
  testData: Record<string, any>;
}

export interface TestResult {
  testName: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  error?: string;
  assertions: AssertionResult[];
  metadata: Record<string, any>;
}

export interface AssertionResult {
  description: string;
  status: 'passed' | 'failed';
  expected?: any;
  actual?: any;
  message?: string;
}
