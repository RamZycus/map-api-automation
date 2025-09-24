Feature: Tools and Utilities
    As a QA Engineer
    I want to test utility operations and dump management
    So that I can ensure proper functionality of data manipulation tools

    Background:
        Given I have a valid API endpoint
        And I have test data configured

    @dumpOperations
    Scenario: Test Dump Operations
        Given I prepare default post request for api "createFlowPost"
        When I create a new flow
        And I store flow id
        And I show available dumps
        When I get value of attribute "id" from latest dump
        And I get value of attribute "name" from latest dump
        When I clear all stored field values

    @requestChaining
    Scenario: Test Request Chaining
        Given I prepare default post request for api "createFlowPost"
        When I create a new flow
        And I store flow id
        Given I prepare default post request for api "createAgentPost"
        When I set value for field "flowId" to value of attribute "id" from latest dump
        When I create a new agent
        Then I validate agent response is successful
        And I validate agent has required fields
        And I store agent id
        And I show available dumps

    @fieldManipulation
    Scenario: Test Field Manipulation
        When I set value for field "customField" to "customValue"
        And I set value for field "nestedField" to "nestedValue"
        And I show available dumps
        When I clear all stored field values
        And I show available dumps

    @dataExtraction
    Scenario: Test Data Extraction from Dumps
        Given I prepare default post request for api "createFlowPost"
        When I create a new flow
        And I store flow id
        When I get value of attribute "id" from latest dump
        And I get value of attribute "name" from latest dump
        And I get value of attribute "description" from latest dump
        When I store value of attribute "id" from latest dump as "extractedFlowId"
        And I show available dumps
