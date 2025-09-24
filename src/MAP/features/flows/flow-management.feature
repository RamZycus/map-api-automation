Feature: Flow Management
    As a QA Engineer
    I want to test Flow management operations
    So that I can ensure proper functionality of Flow CRUD operations

    Background:
        Given I have a valid API endpoint
        And I have test data configured

    @createFlow
    Scenario: Create Flow with Default Values
        Given I prepare default post request for api "createFlowPost"
        When I create a new flow
        Then I validate flow response is successful
        And I validate flow has required fields
        And I store flow id

    @createFlowWithName
    Scenario: Create Flow with Custom Name
        Given I prepare default post request for api "createFlowPost"
        When I create a flow with name "Custom Flow Name"
        Then I validate flow response is successful
        And I validate flow name is "Custom Flow Name"
        And I store flow id

    @createFlowWithDescription
    Scenario: Create Flow with Custom Description
        Given I prepare default post request for api "createFlowPost"
        When I create a flow with description "Custom Flow Description"
        Then I validate flow response is successful
        And I validate flow description is "Custom Flow Description"
        And I store flow id

    @getFlow
    Scenario: Get Flow by ID
        Given I prepare default post request for api "createFlowPost"
        When I create a new flow
        And I store flow id
        When I get flow by id
        Then I validate flow response is successful

    @updateFlow
    Scenario: Update Flow
        Given I prepare default post request for api "createFlowPost"
        When I create a new flow
        And I store flow id
        When I update flow with name "Updated Flow Name"
        Then I validate flow response is successful

    @deleteFlow
    Scenario: Delete Flow
        Given I prepare default post request for api "createFlowPost"
        When I create a new flow
        And I store flow id
        When I delete flow
        Then I validate flow response is successful
