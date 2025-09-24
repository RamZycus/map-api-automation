Feature: Agent Management
    As a QA Engineer
    I want to test Agent management operations
    So that I can ensure proper functionality of Agent CRUD operations

    Background:
        Given I have a valid API endpoint
        And I have test data configured

    @createAgent
    Scenario: Create Agent with Default Values
        Given I prepare default post request for api "createAgentPost"
        When I create a new agent
        Then I validate agent response is successful
        And I validate agent has required fields
        And I store agent id

    @createAgentWithName
    Scenario: Create Agent with Custom Name
        Given I prepare default post request for api "createAgentPost"
        When I create an agent with name "Custom Agent Name"
        Then I validate agent response is successful
        And I validate agent name is "Custom Agent Name"
        And I store agent id

    @createAgentForFlow
    Scenario: Create Agent for Existing Flow
        Given I prepare default post request for api "createFlowPost"
        When I create a new flow
        And I store flow id
        Given I prepare default post request for api "createAgentPost"
        When I create an agent for flow
        Then I validate agent response is successful
        And I validate agent has required fields
        And I store agent id

    @createAgentWithFlowFromDump
    Scenario: Create Agent using Flow ID from Dump
        Given I prepare default post request for api "createFlowPost"
        When I create a new flow
        And I store flow id
        Given I prepare default post request for api "createAgentPost"
        When I create an agent with flow id from dump
        Then I validate agent response is successful
        And I validate agent has required fields
        And I store agent id

    @createAgentWithModel
    Scenario: Create Agent with Custom Model
        Given I prepare default post request for api "createAgentPost"
        When I create an agent with configuration model "gpt-4"
        Then I validate agent response is successful
        And I validate agent has required fields
        And I store agent id

    @getAgent
    Scenario: Get Agent by ID
        Given I prepare default post request for api "createAgentPost"
        When I create a new agent
        And I store agent id
        When I get agent by id
        Then I validate agent response is successful

    @updateAgent
    Scenario: Update Agent
        Given I prepare default post request for api "createAgentPost"
        When I create a new agent
        And I store agent id
        When I update agent with name "Updated Agent Name"
        Then I validate agent response is successful

    @deleteAgent
    Scenario: Delete Agent
        Given I prepare default post request for api "createAgentPost"
        When I create a new agent
        And I store agent id
        When I delete agent
        Then I validate agent response is successful
