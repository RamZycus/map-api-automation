import { faker } from '@faker-js/faker';
import { v4 as uuidv4 } from 'uuid';
import { CreateFlowRequest, CreateAgentRequest, ChatRequest } from '../types/api-types';

export class DataGenerator {
  /**
   * Generate a random flow name
   */
  static generateFlowName(): string {
    return `Flow-${faker.company.name()}-${Date.now()}`;
  }

  /**
   * Generate a random flow description
   */
  static generateFlowDescription(): string {
    return faker.lorem.sentence(10);
  }

  /**
   * Generate a random agent name
   */
  static generateAgentName(): string {
    return `Agent-${faker.name.firstName()}-${Date.now()}`;
  }

  /**
   * Generate a random agent description
   */
  static generateAgentDescription(): string {
    return faker.lorem.sentence(8);
  }

  /**
   * Generate a random chat message
   */
  static generateChatMessage(): string {
    return faker.lorem.sentence(5);
  }

  /**
   * Generate a random user ID
   */
  static generateUserId(): string {
    return `user-${uuidv4()}`;
  }

  /**
   * Generate a random session ID
   */
  static generateSessionId(): string {
    return `session-${uuidv4()}`;
  }

  /**
   * Generate a random flow ID
   */
  static generateFlowId(): string {
    return `flow-${uuidv4()}`;
  }

  /**
   * Generate a random agent ID
   */
  static generateAgentId(): string {
    return `agent-${uuidv4()}`;
  }

  /**
   * Generate a random deployment ID
   */
  static generateDeploymentId(): string {
    return `deployment-${uuidv4()}`;
  }

  /**
   * Generate a random email
   */
  static generateEmail(): string {
    return faker.internet.email();
  }

  /**
   * Generate a random phone number
   */
  static generatePhoneNumber(): string {
    return faker.phone.number();
  }

  /**
   * Generate a random company name
   */
  static generateCompanyName(): string {
    return faker.company.name();
  }

  /**
   * Generate a random URL
   */
  static generateUrl(): string {
    return faker.internet.url();
  }

  /**
   * Generate a random IP address
   */
  static generateIpAddress(): string {
    return faker.internet.ip();
  }

  /**
   * Generate a random UUID
   */
  static generateUuid(): string {
    return uuidv4();
  }

  /**
   * Generate a random timestamp
   */
  static generateTimestamp(): string {
    return new Date().toISOString();
  }

  /**
   * Generate a random future timestamp
   */
  static generateFutureTimestamp(daysFromNow: number = 30): string {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysFromNow);
    return futureDate.toISOString();
  }

  /**
   * Generate a random past timestamp
   */
  static generatePastTimestamp(daysAgo: number = 30): string {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - daysAgo);
    return pastDate.toISOString();
  }

  /**
   * Generate a random number between min and max
   */
  static generateNumber(min: number = 0, max: number = 100): number {
    return faker.datatype.number({ min, max });
  }

  /**
   * Generate a random boolean
   */
  static generateBoolean(): boolean {
    return faker.datatype.boolean();
  }

  /**
   * Generate a random array of strings
   */
  static generateStringArray(length: number = 5): string[] {
    return Array.from({ length }, () => faker.lorem.word());
  }

  /**
   * Generate a random array of numbers
   */
  static generateNumberArray(length: number = 5, min: number = 0, max: number = 100): number[] {
    return Array.from({ length }, () => this.generateNumber(min, max));
  }

  /**
   * Generate a random object with specified keys
   */
  static generateObject(keys: string[]): Record<string, any> {
    const obj: Record<string, any> = {};
    keys.forEach(key => {
      obj[key] = faker.lorem.word();
    });
    return obj;
  }

  /**
   * Generate a random metadata object
   */
  static generateMetadata(): Record<string, any> {
    return {
      source: 'automation-test',
      timestamp: this.generateTimestamp(),
      version: '1.0.0',
      environment: 'test',
      tags: this.generateStringArray(3)
    };
  }

  /**
   * Generate a complete flow data object
   */
  static generateFlowData(overrides: Partial<CreateFlowRequest> = {}): CreateFlowRequest {
    return {
      name: this.generateFlowName(),
      description: this.generateFlowDescription(),
      status: 'active',
      tags: this.generateStringArray(3),
      metadata: this.generateMetadata(),
      ...overrides
    };
  }

  /**
   * Generate a complete agent data object
   */
  static generateAgentData(flowId: string, overrides: Partial<CreateAgentRequest> = {}): CreateAgentRequest {
    return {
      name: this.generateAgentName(),
      description: this.generateAgentDescription(),
      type: 'custom',
      flowId,
      configuration: {
        model: 'gpt-3.5-turbo',
        temperature: this.generateNumber(0, 1),
        maxTokens: this.generateNumber(100, 2000),
        ...overrides.configuration
      },
      status: 'draft',
      version: '1.0.0',
      ...overrides
    };
  }

  /**
   * Generate a complete chat request object
   */
  static generateChatRequest(flowId: string, overrides: Partial<ChatRequest> = {}): ChatRequest {
    return {
      message: this.generateChatMessage(),
      flowId,
      userId: this.generateUserId(),
      sessionId: this.generateSessionId(),
      metadata: this.generateMetadata(),
      ...overrides
    };
  }

  /**
   * Generate invalid flow data for negative testing
   */
  static generateInvalidFlowData(): Partial<CreateFlowRequest>[] {
    return [
      { name: '' }, // Empty name
      { description: '' }, // Empty description
      { name: 'a'.repeat(101) }, // Name too long
      { description: 'a'.repeat(501) }, // Description too long
      { status: 'invalid' as any }, // Invalid status
      { tags: ['a'.repeat(51)] }, // Tag too long
    ];
  }

  /**
   * Generate invalid agent data for negative testing
   */
  static generateInvalidAgentData(): Partial<CreateAgentRequest>[] {
    return [
      { name: '' }, // Empty name
      { description: '' }, // Empty description
      { flowId: '' }, // Empty flow ID
      { type: 'invalid' as any }, // Invalid type
      { status: 'invalid' as any }, // Invalid status
      { configuration: {} }, // Empty configuration
    ];
  }

  /**
   * Generate invalid chat request data for negative testing
   */
  static generateInvalidChatRequest(): Partial<ChatRequest>[] {
    return [
      { message: '' }, // Empty message
      { flowId: '' }, // Empty flow ID
      { userId: '' }, // Empty user ID
      { sessionId: '' }, // Empty session ID
      { message: 'a'.repeat(1001) }, // Message too long
    ];
  }

  /**
   * Generate test data variations for comprehensive testing
   */
  static generateTestVariations<T>(
    baseData: T,
    variations: Array<Partial<T>>
  ): T[] {
    return variations.map(variation => ({
      ...baseData,
      ...variation
    }));
  }

  /**
   * Generate edge case data
   */
  static generateEdgeCaseData(): Record<string, any> {
    return {
      emptyString: '',
      nullValue: null,
      undefinedValue: undefined,
      emptyArray: [],
      emptyObject: {},
      veryLongString: 'a'.repeat(10000),
      specialCharacters: '!@#$%^&*()_+-=[]{}|;:,.<>?',
      unicodeString: '🚀🌟💫⭐️✨',
      numericString: '1234567890',
      booleanString: 'true',
      jsonString: '{"key": "value"}',
      htmlString: '<script>alert("test")</script>',
      sqlInjection: "'; DROP TABLE users; --",
      xssString: '<img src=x onerror=alert(1)>',
    };
  }
}
