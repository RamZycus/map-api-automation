import * as fs from 'fs';
import * as path from 'path';

export interface AblyMessage {
  id?: string;
  timestamp?: number;
  data: {
    conversation_id?: string;
    utterance_id?: string;
    message?: {
      conversation_id?: string;
      utterance_id?: string;
      content?: string;
      response?: string;
      intent?: string;
      next_steps?: string;
    };
    api_success?: boolean;
    assertion_success?: boolean;
    validation_scores?: any;
  };
}

export interface ParsedMessage {
  timestamp?: number;
  message_id?: string;
  conversation_id?: string;
  utterance_id?: string;
  content?: string;
  response?: string;
  intent?: string;
  next_steps?: string;
  api_success?: boolean;
  assertion_success?: boolean;
  validation_scores?: any;
  raw_data?: any;
}

export interface ConversationData {
  conversation_id: string;
  utterance_id: string;
  messages: ParsedMessage[];
  total_messages: number;
  parsed_at: string;
}

export interface ConversationTurn {
  turn_number: number;
  timestamp?: number;
  intent?: string;
  content?: string;
  response?: string;
  next_steps?: string;
  api_success?: boolean;
  assertion_success?: boolean;
  validation_scores?: any;
}

export class AblyMessageParser {
  
  /**
   * Parse Ably channel messages and filter by utterance ID and conversation ID
   */
  static parseAblyMessagesByUtteranceAndConversation(
    ablyMessages: AblyMessage[],
    utteranceId: string,
    conversationId: string
  ): ConversationData {
    const filteredMessages: ParsedMessage[] = [];
    
    const conversationData: ConversationData = {
      conversation_id: conversationId,
      utterance_id: utteranceId,
      messages: [],
      total_messages: 0,
      parsed_at: new Date().toISOString()
    };

    for (const message of ablyMessages) {
      try {
        // Extract message content
        const messageData = message.data || {};
        
        // Check if this message belongs to the target conversation and utterance
        let msgConversationId = messageData.conversation_id;
        let msgUtteranceId = messageData.utterance_id;
        
        // Also check nested structures
        if (!msgConversationId) {
          msgConversationId = messageData.message?.conversation_id;
        }
        if (!msgUtteranceId) {
          msgUtteranceId = messageData.message?.utterance_id;
        }
        
        // Check if this message matches our criteria
        if (msgConversationId === conversationId && msgUtteranceId === utteranceId) {
          // Parse the message content
          const parsedMessage: ParsedMessage = {
            timestamp: message.timestamp,
            message_id: message.id,
            conversation_id: msgConversationId,
            utterance_id: msgUtteranceId,
            content: messageData.message?.content || '',
            response: messageData.message?.response || '',
            intent: messageData.message?.intent || '',
            next_steps: messageData.message?.next_steps || '',
            api_success: messageData.api_success || false,
            assertion_success: messageData.assertion_success || false,
            validation_scores: messageData.validation_scores || {},
            raw_data: messageData
          };
          
          filteredMessages.push(parsedMessage);
        }
      } catch (error) {
        console.error('Error parsing message:', error);
        continue;
      }
    }

    conversationData.messages = filteredMessages;
    conversationData.total_messages = filteredMessages.length;
    
    return conversationData;
  }

  /**
   * Parse Ably messages from a JSON file and filter by utterance ID and conversation ID
   */
  static parseAblyMessagesFromJsonFile(
    jsonFilePath: string,
    utteranceId: string,
    conversationId: string
  ): ConversationData {
    try {
      const data = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
      let ablyMessages: AblyMessage[] = [];

      // Handle different JSON structures
      if (Array.isArray(data)) {
        ablyMessages = data;
      } else if (typeof data === 'object') {
        // Check if messages are nested in a specific key
        if (data.ably_messages) {
          ablyMessages = data.ably_messages;
        } else if (data.messages) {
          ablyMessages = data.messages;
        } else if (data.results) {
          ablyMessages = data.results;
        } else {
          // Assume the entire dict is a single message
          ablyMessages = [data];
        }
      } else {
        throw new Error('Invalid JSON structure');
      }

      return this.parseAblyMessagesByUtteranceAndConversation(
        ablyMessages, utteranceId, conversationId
      );
    } catch (error) {
      console.error('Error reading file:', error);
      return {
        conversation_id: conversationId,
        utterance_id: utteranceId,
        messages: [],
        total_messages: 0,
        parsed_at: new Date().toISOString()
      };
    }
  }

  /**
   * Extract conversation flow from parsed Ably messages
   */
  static extractConversationFlow(parsedData: ConversationData): ConversationTurn[] {
    const conversationFlow: ConversationTurn[] = [];

    for (let i = 0; i < parsedData.messages.length; i++) {
      const message = parsedData.messages[i];
      const turn: ConversationTurn = {
        turn_number: i + 1,
        timestamp: message.timestamp,
        intent: message.intent,
        content: message.content,
        response: message.response,
        next_steps: message.next_steps,
        api_success: message.api_success,
        assertion_success: message.assertion_success,
        validation_scores: message.validation_scores
      };
      conversationFlow.push(turn);
    }

    return conversationFlow;
  }

  /**
   * Validate Ably response against expected criteria
   */
  static validateAblyResponse(
    parsedData: ConversationData,
    expectedCriteria: {
      expectedIntent?: string;
      expectedContent?: string;
      expectedResponse?: string;
      minMessages?: number;
      requireApiSuccess?: boolean;
    }
  ): { isValid: boolean; validationResults: any } {
    const validationResults: any = {
      total_messages: parsedData.total_messages,
      criteria_met: {},
      errors: []
    };

    // Check minimum messages
    if (expectedCriteria.minMessages) {
      const hasMinMessages = parsedData.total_messages >= expectedCriteria.minMessages;
      validationResults.criteria_met.minMessages = hasMinMessages;
      if (!hasMinMessages) {
        validationResults.errors.push(`Expected at least ${expectedCriteria.minMessages} messages, got ${parsedData.total_messages}`);
      }
    }

    // Check each message for criteria
    for (const message of parsedData.messages) {
      // Check intent
      if (expectedCriteria.expectedIntent) {
        const hasExpectedIntent = message.intent?.includes(expectedCriteria.expectedIntent);
        validationResults.criteria_met.expectedIntent = hasExpectedIntent;
        if (!hasExpectedIntent) {
          validationResults.errors.push(`Expected intent '${expectedCriteria.expectedIntent}' not found in message`);
        }
      }

      // Check content
      if (expectedCriteria.expectedContent) {
        const hasExpectedContent = message.content?.includes(expectedCriteria.expectedContent);
        validationResults.criteria_met.expectedContent = hasExpectedContent;
        if (!hasExpectedContent) {
          validationResults.errors.push(`Expected content '${expectedCriteria.expectedContent}' not found in message`);
        }
      }

      // Check response
      if (expectedCriteria.expectedResponse) {
        const hasExpectedResponse = message.response?.includes(expectedCriteria.expectedResponse);
        validationResults.criteria_met.expectedResponse = hasExpectedResponse;
        if (!hasExpectedResponse) {
          validationResults.errors.push(`Expected response '${expectedCriteria.expectedResponse}' not found in message`);
        }
      }

      // Check API success
      if (expectedCriteria.requireApiSuccess) {
        const hasApiSuccess = message.api_success === true;
        validationResults.criteria_met.requireApiSuccess = hasApiSuccess;
        if (!hasApiSuccess) {
          validationResults.errors.push('API success not achieved');
        }
      }
    }

    const isValid = validationResults.errors.length === 0;
    return { isValid, validationResults };
  }
}
