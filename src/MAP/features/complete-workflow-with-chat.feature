Feature: Complete MAP API Workflow Testing
    As a QA Engineer
    I want to test the complete MAP API workflow
    So that I can ensure end-to-end functionality including Chat API and Ably responses

    Background:
        Given I have a valid API endpoint
        And I have test data configured

    @completeWorkflowWithChat
    Scenario: Complete Flow with Chat API and Ably Validation
        # Step 1: Create Flow
        Given I prepare default post request for api "createFlowPost"
        When I submit post request for api "createFlowPost"
        Then I validate response is successful
        And I validate fields "id,name,description"
        And I store "id" as "flowId"

        # Step 2: Verify Router Agent Created by Default
        Given I prepare default get request for api "getAgentsByFlowId"
        And I set value for field "flowId" to variable "flowId"
        When I submit get request for api "getAgentsByFlowId"
        Then I validate response is successful
        And I validate response status is 200
        And I validate field "0.name" equals "Router Agent"
        And I validate field "0.type" equals "SYSTEM"
        And I store "0.id" as "routerAgentId"

        # Step 3: Create New Agent
        Given I prepare default post request for api "createAgentPost"
        And I set value for field "flowId" to variable "flowId"
        And I set value for field "name" to "Test Automation Agent"
        When I submit post request for api "createAgentPost"
        Then I validate response is successful
        And I validate fields "id,flowId,name"
        And I store "id" as "agentId"

        # Step 4: Get Agent Details
        Given I prepare default get request for api "getAgentById"
        And I set value for field "agentId" to variable "agentId"
        When I submit get request for api "getAgentById"
        Then I validate response is successful
        And I validate fields "id,flowId,name,description,type,status"
        And I validate field "name" equals "Test Automation Agent"

        # Step 5: Deploy Agent (placeholder - API to be provided)
        Given I prepare default post request for api "deployAgentPost"
        And I set value for field "agentId" to variable "agentId"
        And I set value for field "userId" to "955d3bda-a85d-4e01-afc5-511d33a476be"
        And I set value for field "tenantId" to "aebb6598-276a-4266-afeb-f950334c9845"
        When I submit post request for api "deployAgentPost"
        Then I validate response is successful

        # Step 6: Hit Chat API
        Given I prepare default post request for api "chatApiPost"
        And I set value for field "conversationref.conversation_id" to "test_conversation_123"
        And I set value for field "conversationref.utterance_id" to "test_utterance_456"
        And I set value for field "conversationref.user_id" to "955d3bda-a85d-4e01-afc5-511d33a476be"
        And I set value for field "conversationref.tenant_id" to "aebb6598-276a-4266-afeb-f950334c9845"
        And I set value for field "payload.message" to "search pr123"
        When I submit post request for api "chatApiPost"
        Then I validate response is successful
        And I validate response status is 200

        # Step 7: Wait for Ably Response and Validate
        Given I wait for ably response with conversation_id "test_conversation_123" and utterance_id "test_utterance_456"
        Then I validate ably response contains expected content "search pr123"
        And I validate ably response has api_success true

        # Step 8: Edit Agent
        Given I prepare default put request for api "updateAgentPut"
        And I set value for field "agentId" to variable "agentId"
        And I set value for field "name" to "Updated Test Agent"
        And I set value for field "description" to "Updated description for testing"
        When I submit put request for api "updateAgentPut"
        Then I validate response is successful

        # Step 9: Deploy Updated Agent
        Given I prepare default post request for api "deployAgentPost"
        And I set value for field "agentId" to variable "agentId"
        And I set value for field "userId" to "955d3bda-a85d-4e01-afc5-511d33a476be"
        And I set value for field "tenantId" to "aebb6598-276a-4266-afeb-f950334c9845"
        When I submit post request for api "deployAgentPost"
        Then I validate response is successful

        # Step 10: Hit Chat API Again
        Given I prepare default post request for api "chatApiPost"
        And I set value for field "conversationref.conversation_id" to "test_conversation_124"
        And I set value for field "conversationref.utterance_id" to "test_utterance_457"
        And I set value for field "conversationref.user_id" to "955d3bda-a85d-4e01-afc5-511d33a476be"
        And I set value for field "conversationref.tenant_id" to "aebb6598-276a-4266-afeb-f950334c9845"
        And I set value for field "payload.message" to "search pr124"
        When I submit post request for api "chatApiPost"
        Then I validate response is successful
        And I validate response status is 200

        # Step 11: Validate Updated Agent Response
        Given I wait for ably response with conversation_id "test_conversation_124" and utterance_id "test_utterance_457"
        Then I validate ably response contains expected content "search pr124"
        And I validate ably response has api_success true

        # Step 12: Cleanup - Delete Agent First
        Given I prepare default delete request for api "deleteAgentPost"
        And I set value for field "agentIds" to variable "agentId"
        When I submit delete request for api "deleteAgentPost"
        Then I validate response is successful
        And I validate response status is 200

        # Step 13: Cleanup - Delete Flow After Agent
        Given I prepare default delete request for api "deleteFlowPost"
        And I set value for field "flowIds" to variable "flowId"
        When I submit delete request for api "deleteFlowPost"
        Then I validate response is successful
        And I validate response status is 200
