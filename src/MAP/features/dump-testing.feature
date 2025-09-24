Feature: JSON Dump Testing
    As a QA Engineer
    I want to test JSON dump functionality
    So that I can verify response data is properly stored and retrievable

    Background:
        Given I have a valid API endpoint
        And I have test data configured

    @testDump
    Scenario: Test JSON Dump Storage and Retrieval
        Given I prepare default post request for api "createFlowPost"
        When I submit post request for api "createFlowPost"
        Then I validate response is successful
        And I show available dumps
        When I get value of attribute "id" from latest dump
        And I get value of attribute "name" from latest dump
        Then I validate fields "id,name,description"
        And I store "id" as "flowId"
