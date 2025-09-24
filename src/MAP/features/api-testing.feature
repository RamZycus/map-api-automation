Feature: MAP API Testing - Flow and Agent Management
    As a QA Engineer
    I want to test MAP API endpoints
    So that I can ensure proper functionality of Flow and Agent operations

    Background:
        Given I have a valid API endpoint
        And I have test data configured

    @createAgent
    Scenario: Create Agent with Custom Values
        Given I prepare default post request for api "createAgentPost"
        And I set value for header field "authorization" to value of attribute "payload.authorization" from dump
        And I set value for field "flowId" to variable "flowId"
        And I set value for field "name" to "Redirection Agent"
        When I submit post request for api "createAgentPost"
        Then I validate response is successful
        And I validate fields "id,flowId,name"
        And I store "id" as "agentId"

    @createFlow
    Scenario: Create Flow with Default Values
        Given I prepare default post request for api "createFlowPost"
        And I set value for header field "authorization" to value of attribute "payload.authorization" from dump
        When I submit post request for api "createFlowPost"
        Then I validate response is successful
        And I validate fields "id,name,description"
        And I store "id" as "flowId"

    @getAgentById
    Scenario: Get Agent by ID
        Given I prepare default get request for api "getAgentById"
        And I set value for header field "authorization" to value of attribute "payload.authorization" from dump
        And I set value for field "agentId" to variable "agentId"
        When I submit get request for api "getAgentById"
        Then I validate response is successful
        And I validate fields "id,flowId,name"

    @getAgentsByFlowId
    Scenario: Get Agents by Flow ID
        Given I prepare default get request for api "getAgentsByFlowId"
        And I set value for header field "authorization" to value of attribute "payload.authorization" from dump
        And I set value for field "flowId" to variable "flowId"
        When I submit get request for api "getAgentsByFlowId"
        Then I validate response is successful
        And I validate response status is 200

    @deleteAgent
    Scenario: Delete Agent
        Given I prepare default delete request for api "deleteAgentPost"
        And I set value for header field "authorization" to value of attribute "payload.authorization" from dump
        And I set value for field "agentIds" to variable "agentId"
        When I submit delete request for api "deleteAgentPost"
        Then I validate response is successful
        And I validate response status is 200

    @deleteFlow
    Scenario: Delete Flow
        Given I prepare default delete request for api "deleteFlowPost"
        And I set value for header field "authorization" to value of attribute "payload.authorization" from dump
        And I set value for field "flowIds" to variable "flowId"
        When I submit delete request for api "deleteFlowPost"
        Then I validate response is successful
        And I validate response status is 200

    @oldCompleteWorkflow
    Scenario: Complete Flow and Agent Lifecycle (Old Version)
        Given I prepare default post request for api "createFlowPost"
        When I submit post request for api "createFlowPost"
        Then I validate response is successful
        And I store "id" as "flowId"

        Given I prepare default post request for api "createAgentPost"
        And I set value for field "flowId" to variable "flowId"
        And I set value for field "name" to "Test Automation Agent"
        When I submit post request for api "createAgentPost"
        Then I validate response is successful
        And I store "id" as "agentId"

        Given I prepare default get request for api "getAgentById"
        And I set value for field "agentId" to variable "agentId"
        When I submit get request for api "getAgentById"
        Then I validate response is successful
        And I validate field "name" equals "Test Automation Agent"

        # Cleanup: Delete Agent First
        Given I prepare default delete request for api "deleteAgentPost"
        And I set value for field "agentIds" to variable "agentId"
        When I submit delete request for api "deleteAgentPost"
        Then I validate response is successful
        And I validate response status is 200

        # Cleanup: Delete Flow After Agent
        Given I prepare default delete request for api "deleteFlowPost"
        And I set value for field "flowIds" to variable "flowId"
        When I submit delete request for api "deleteFlowPost"
        Then I validate response is successful
        And I validate response status is 200