Feature: Common Dump Operations Testing
    As a QA Engineer
    I want to test common dump operations and request chaining
    So that I can verify all dump methods work correctly

    Background:
        Given I have a valid API endpoint
        And I have test data configured

    @dumpOperations
    Scenario: Test All Common Dump Operations
        # Create Flow and demonstrate dump operations
        Given I prepare default post request for api "createFlowPost"
        When I submit post request for api "createFlowPost"
        Then I validate response is successful
        And I store "id" as "flowId"

        # Test different ways to get values from dumps
        When I get value of attribute "id" from latest dump
        And I get value of attribute "name" from latest dump
        And I get value of attribute "id" from "createFlowPost" dump

        # Test different ways to set fields from dumps
        Given I prepare default post request for api "createAgentPost"
        And I set value for field "flowId" to value of attribute "id" from dump
        And I set value for field "name" to value of attribute "name" from latest dump
        And I set value for field "description" to value of attribute "description" from "createFlowPost" dump

        # Submit request with chained data
        When I submit post request for api "createAgentPost"
        Then I validate response is successful
        And I validate fields "id,flowId,name"

        # Test storing values from dumps as variables
        When I store value of attribute "id" from latest dump as "agentId"

        # Show all available dumps with details
        And I show available dumps

        # Test clearing stored fields
        When I clear all stored field values
