Feature: Request Chaining with JSON Dumps
    As a QA Engineer
    I want to test request chaining using JSON dumps
    So that I can verify data flows between API calls

    Background:
        Given I have a valid API endpoint
        And I have test data configured

    @requestChaining
    Scenario: Create Flow then Create Agent using Flow ID
        Given I prepare default post request for api "createFlowPost"
        When I submit post request for api "createFlowPost"
        Then I validate response is successful
        And I store "id" as "flowId"

        Given I prepare default post request for api "createAgentPost"
        And I set value for field "flowId" to value of attribute "id" from dump
        When I submit post request for api "createAgentPost"
        Then I validate response is successful
        And I validate fields "id,flowId,name"
        And I store "id" as "agentId"

        And I show available dumps
