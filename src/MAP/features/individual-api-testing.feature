Feature: Individual API Testing - MAP APIs
    As a QA Engineer
    I want to test each MAP API endpoint individually
    So that I can ensure proper functionality before creating complete workflows

    Background:
        Given I have a valid API endpoint
        And I have test data configured

    @testCreateFlow
    Scenario: Test Create Flow API
        Given I prepare default post request for api "createFlowPost"
        When I submit post request for api "createFlowPost"
        Then I validate response is successful
        And I validate fields "id,name,description"
        And I store "id" as "flowId"

    @testGetAgentsByFlowId
    Scenario: Test Get Agents by Flow ID API
        Given I prepare default get request for api "getAgentsByFlowId"
        And I set value for field "flowId" to variable "flowId"
        When I submit get request for api "getAgentsByFlowId"
        Then I validate response is successful
        And I validate response status is 200

    @testCreateAgent
    Scenario: Test Create Agent API
        Given I prepare default post request for api "createAgentPost"
        And I set value for field "flowId" to variable "flowId"
        And I set value for field "name" to "Test Agent"
        When I submit post request for api "createAgentPost"
        Then I validate response is successful
        And I validate fields "id,flowId,name"
        And I store "id" as "agentId"

    @testGetAgentById
    Scenario: Test Get Agent by ID API
        Given I prepare default get request for api "getAgentById"
        And I set value for field "agentId" to variable "agentId"
        When I submit get request for api "getAgentById"
        Then I validate response is successful
        And I validate fields "id,flowId,name,description,type,status"

    @testChatApi
    Scenario: Test Chat API
        Given I prepare default post request for api "chatApiPost"
        And I set value for field "conversationref.conversation_id" to "test_conversation_123"
        And I set value for field "conversationref.utterance_id" to "test_utterance_456"
        And I set value for field "payload.message" to "search pr123"
        When I submit post request for api "chatApiPost"
        Then I validate response is successful
        And I validate response status is 200
