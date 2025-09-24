Feature: Complete MAP API Workflow
    As a QA Engineer
    I want to test the complete MAP API workflow
    So that I can ensure end-to-end functionality of Flow and Agent management

    Background:
        Given I have a valid API endpoint
        And I have test data configured

    @completeWorkflow
    Scenario: Complete Flow and Agent Lifecycle Management
        # Step 1: Create Flow
        Given I prepare default post request for api "createFlowPost"
        When I create a new flow
        Then I validate flow response is successful
        And I validate flow has required fields
        And I store flow id

        # Step 2: Verify Router Agent is created automatically
        When I get router agent for the created flow
        Then I validate router agent response is successful
        And I validate router agent has required fields
        And I validate router agent details match expected structure
        And I store router agent id

        # Step 3: Create Redirection Agent (only this agent, no test agent)
        When I create redirection agent for the flow
        Then I validate agent response is successful
        And I validate agent has required fields
        And I validate redirection agent details match expected structure
        And I store agent id

        # Step 4: Verify Agent Creation Details
        When I get agent by id
        Then I validate agent response is successful
        And I validate agent details are complete

        # Step 4.5: Verify only Router and Redirection agents exist
        When I get all agents for the flow
        Then I validate only router and redirection agents exist

        # Step 5: Delete Redirection Agent first (agents must be deleted before flow)
        When I delete agent by id
        Then I validate agent deletion is successful

        # Step 6: Delete Flow (after all agents are deleted)
        When I delete flow by id
        Then I validate flow deletion is successful

        # Step 7: Verify Cleanup
        When I verify flow is deleted
        Then I validate flow not found
        When I verify agent is deleted
        Then I validate agent not found
