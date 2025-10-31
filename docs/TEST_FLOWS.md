# Test Flows and Sample Conversations

This document provides sample conversation flows to test the IT Helpdesk Agent functionality.

## Prerequisites

Before testing:
1. Complete the setup guide (see `SETUP.md`)
2. Ensure OAuth authentication is configured
3. Have access to a ServiceNow instance with test data
4. Enable the IT Helpdesk Agent in M365 Copilot

## Test Flow 1: List Existing Tickets

### Objective
Verify that the agent can retrieve and display a user's open ServiceNow tickets.

### Steps

1. **Open M365 Copilot** (in Teams, Edge, or Office apps)

2. **Enable the IT Helpdesk Agent**
   - Look for plugin/agent selector
   - Enable "IT Helpdesk Agent"

3. **Send the message**: 
   ```
   Show me my open tickets
   ```

4. **Expected Response**:
   - Agent uses `listMyTickets` operation
   - OAuth authentication prompt (if first time)
   - Returns Adaptive Card with ticket list
   - Shows ticket numbers, descriptions, states, and priorities

5. **Verify**:
   - Ticket count is displayed
   - Each ticket shows: number, description, priority, state
   - Tickets are ordered (typically by update time)
   - Actions available: "Create New Ticket", "Refresh List"

### Sample Data Response

```json
{
  "result": [
    {
      "sys_id": "abc123def456",
      "number": "INC0010001",
      "short_description": "Cannot access email",
      "state": "2",
      "priority": "3",
      "urgency": "2",
      "opened_at": "2024-01-15 10:30:00",
      "updated_at": "2024-01-15 14:20:00"
    },
    {
      "sys_id": "xyz789ghi012",
      "number": "INC0010002",
      "short_description": "Laptop running slowly",
      "state": "2",
      "priority": "4",
      "urgency": "3",
      "opened_at": "2024-01-14 09:15:00",
      "updated_at": "2024-01-15 11:00:00"
    }
  ]
}
```

### Alternative Prompts
- "List my ServiceNow incidents"
- "What tickets do I have open?"
- "Show my IT issues"

---

## Test Flow 2: Create a New Ticket

### Objective
Verify that the agent can create a new ServiceNow incident with user-provided information.

### Steps

1. **Send the message**:
   ```
   I need to report an IT issue
   ```

2. **Expected Response**:
   - Agent asks for issue details
   - May present Adaptive Card form (ticketCreationForm.json)

3. **Provide details** (agent will prompt for these):
   ```
   I cannot access my email account. When I try to log in to Outlook, 
   I get an "Authentication failed" error message. This is blocking my work.
   ```

4. **Agent prompts for additional details**:
   - **Urgency**: "This is urgent, I need email access"
   - **Category**: "Email" or "Software"
   - **Priority**: Agent may infer or ask

5. **Agent creates the ticket** using `createTicket` operation

6. **Expected Response**:
   - Confirmation message: "I've created ticket INC0010003 for you"
   - Adaptive Card showing ticket summary
   - Ticket number, description, priority, state
   - Actions: "View in ServiceNow", "Update Ticket"

### Sample API Request

```json
{
  "short_description": "Cannot access email - Authentication failed",
  "description": "I cannot access my email account. When I try to log in to Outlook, I get an 'Authentication failed' error message. This is blocking my work.",
  "urgency": "2",
  "priority": "3",
  "category": "Email",
  "subcategory": "Outlook"
}
```

### Sample API Response

```json
{
  "result": {
    "sys_id": "new123ticket456",
    "number": "INC0010003",
    "short_description": "Cannot access email - Authentication failed",
    "description": "I cannot access my email account...",
    "state": "1",
    "priority": "3",
    "urgency": "2",
    "opened_at": "2024-01-16 08:45:00",
    "opened_by": {
      "display_value": "Jane Doe"
    }
  }
}
```

### Verify
- Ticket is created in ServiceNow
- Ticket number is returned
- Details match what was provided
- State is "New" (1)
- User can click "View in ServiceNow" to see full ticket

### Alternative Prompts
- "Create a ticket for my laptop issue"
- "I need help with a problem"
- "Report an incident"

---

## Test Flow 3: Update an Existing Ticket

### Objective
Verify that the agent can update a ticket with new information or work notes.

### Steps

1. **Send the message**:
   ```
   Update ticket INC0010001
   ```

2. **Agent prompts for update details**:
   ```
   What would you like to update on ticket INC0010001?
   ```

3. **Provide update**:
   ```
   I tried resetting my password and now I can access email. 
   You can close this ticket.
   ```

4. **Agent updates the ticket** using `updateTicket` operation

5. **Expected Response**:
   - Confirmation message
   - Updated ticket details in Adaptive Card
   - Shows work notes or updated description
   - Updated timestamp

### Sample API Request

```json
{
  "work_notes": "User reports: Tried resetting password and now can access email. User requests ticket closure."
}
```

### Sample API Response

```json
{
  "result": {
    "sys_id": "abc123def456",
    "number": "INC0010001",
    "short_description": "Cannot access email",
    "state": "2",
    "priority": "3",
    "work_notes": "User reports: Tried resetting password...",
    "updated_at": "2024-01-16 09:30:00"
  }
}
```

### Verify
- Ticket is updated in ServiceNow
- Work notes or description are added
- Updated timestamp reflects change
- No data loss on other fields

### Alternative Prompts
- "Add a note to INC0010001"
- "Change priority on my ticket"
- "Update the description of my incident"

---

## Test Flow 4: Close a Ticket

### Objective
Verify that the agent can close a resolved ticket.

### Steps

1. **Send the message**:
   ```
   Close ticket INC0010001
   ```

2. **Agent may ask for confirmation** or close notes:
   ```
   Would you like to add closing notes?
   ```

3. **Provide close notes** (optional):
   ```
   Issue resolved by resetting password
   ```

4. **Agent closes the ticket** using `closeTicket` operation

5. **Expected Response**:
   - Confirmation message: "Ticket INC0010001 has been closed"
   - Final ticket summary in Adaptive Card
   - State shows "Resolved" (6) or "Closed" (7)
   - Close notes visible if provided

### Sample API Request

```json
{
  "state": "6",
  "close_notes": "Issue resolved by resetting password",
  "close_code": "Solved (Permanently)"
}
```

### Sample API Response

```json
{
  "result": {
    "sys_id": "abc123def456",
    "number": "INC0010001",
    "short_description": "Cannot access email",
    "state": "6",
    "close_notes": "Issue resolved by resetting password",
    "closed_at": "2024-01-16 10:00:00"
  }
}
```

### Verify
- Ticket state is "Resolved" or "Closed"
- Close notes are recorded
- Closed timestamp is set
- Ticket no longer appears in "open tickets" list

### Alternative Prompts
- "Resolve ticket INC0010001"
- "Mark INC0010001 as complete"
- "This issue is fixed, close the ticket"

---

## Test Flow 5: View Ticket Details

### Objective
Verify that the agent can retrieve and display detailed information for a specific ticket.

### Steps

1. **Send the message**:
   ```
   Show me details for ticket INC0010002
   ```

2. **Agent retrieves ticket** using `getTicket` operation

3. **Expected Response**:
   - Detailed Adaptive Card (ticketDetails.json)
   - Shows all available fields:
     - Ticket number and state
     - Summary and description
     - Priority, urgency, impact
     - Category and subcategory
     - Opened, updated, closed timestamps
     - Assigned to
     - Work notes
     - Close notes (if closed)
   - Actions: "Open in ServiceNow", "Add Work Notes", "Update Status", "Close Ticket"

### Sample API Response

```json
{
  "result": {
    "sys_id": "xyz789ghi012",
    "number": "INC0010002",
    "short_description": "Laptop running slowly",
    "description": "Laptop has been running very slowly for the past week. Programs take a long time to load and system frequently freezes.",
    "state": "2",
    "priority": "4",
    "urgency": "3",
    "impact": "3",
    "category": "Hardware",
    "subcategory": "Laptop",
    "opened_at": "2024-01-14 09:15:00",
    "updated_at": "2024-01-15 11:00:00",
    "assigned_to": {
      "display_value": "Support Team"
    },
    "work_notes": "Checked system resources. Will run diagnostics."
  }
}
```

### Verify
- All ticket fields are displayed
- Formatting is clean and readable
- Actions are appropriate for ticket state
- Can click through to ServiceNow

### Alternative Prompts
- "What's the status of INC0010002?"
- "Tell me about ticket INC0010002"
- "Get details on my laptop ticket"

---

## Test Flow 6: Natural Language Troubleshooting

### Objective
Verify that the agent can provide helpful responses beyond just ticket management.

### Steps

1. **Send the message**:
   ```
   My computer is running slowly, what should I do?
   ```

2. **Expected Response**:
   - Agent provides troubleshooting suggestions
   - May suggest common fixes:
     - Restart the computer
     - Close unused applications
     - Check for updates
     - Run virus scan
   - Offers to create a ticket if issue persists

3. **Follow-up**:
   ```
   I tried that but it's still slow. Can you create a ticket?
   ```

4. **Agent creates ticket** with context from conversation

### Verify
- Agent provides useful guidance
- Can transition from advice to ticket creation
- Maintains context throughout conversation
- Ticket includes relevant details from discussion

---

## Test Flow 7: Multi-Ticket Operations

### Objective
Verify that the agent can handle questions about multiple tickets.

### Steps

1. **Send the message**:
   ```
   How many open tickets do I have?
   ```

2. **Expected Response**:
   - Agent queries ServiceNow
   - Returns count: "You have 3 open tickets"
   - May show list of tickets

3. **Follow-up**:
   ```
   Which one is the highest priority?
   ```

4. **Expected Response**:
   - Agent identifies highest priority ticket
   - Shows details for that ticket
   - Suggests actions

### Verify
- Agent can analyze multiple tickets
- Correctly identifies priority levels
- Can filter and sort tickets
- Provides actionable insights

---

## Test Flow 8: Error Handling

### Objective
Verify that the agent handles errors gracefully.

### Test Cases

1. **Invalid Ticket Number**:
   ```
   Show me ticket INC9999999
   ```
   - **Expected**: "I couldn't find ticket INC9999999. Please check the ticket number."

2. **Missing Required Fields**:
   ```
   Create a ticket
   ```
   (Don't provide description)
   - **Expected**: Agent prompts for required information

3. **Authentication Expired**:
   - Token expires during session
   - **Expected**: Seamless re-authentication or clear prompt to sign in again

4. **ServiceNow Unavailable**:
   - ServiceNow instance is down
   - **Expected**: Graceful error message, offer to retry later

---

## Performance Testing

### Response Time Benchmarks

| Operation | Expected Time | Acceptable Time |
|-----------|---------------|-----------------|
| List tickets | < 2 seconds | < 5 seconds |
| Create ticket | < 3 seconds | < 7 seconds |
| Update ticket | < 2 seconds | < 5 seconds |
| Close ticket | < 2 seconds | < 5 seconds |
| Get ticket details | < 2 seconds | < 5 seconds |

### Load Testing

1. Create 10 tickets in quick succession
2. List tickets repeatedly (5 times within 1 minute)
3. Update multiple tickets concurrently

---

## Integration Testing Checklist

- [ ] OAuth authentication works on first use
- [ ] Tokens refresh automatically
- [ ] All five API operations work correctly
- [ ] Adaptive Cards render properly
- [ ] Actions on cards function as expected
- [ ] Links to ServiceNow open correctly
- [ ] Error messages are clear and helpful
- [ ] Agent maintains conversation context
- [ ] Works in Teams
- [ ] Works in M365 Copilot in Edge
- [ ] Works in M365 Copilot in Office apps
- [ ] Mobile experience is functional
- [ ] Multi-turn conversations work
- [ ] Can handle rapid successive requests

---

## Troubleshooting Test Issues

### Agent doesn't respond
- Check if agent is enabled in Copilot
- Verify OAuth configuration
- Check ServiceNow instance accessibility

### Wrong data returned
- Verify API query parameters
- Check user permissions in ServiceNow
- Review OpenAPI specification

### Adaptive Cards don't display
- Validate card JSON syntax
- Check data binding expressions
- Test cards in Adaptive Cards Designer

### Actions don't work
- Verify action handlers are implemented
- Check data passed in action
- Review bot framework logs

---

## Automated Testing

### Sample Test Script (Pseudocode)

```javascript
// Test Suite: IT Helpdesk Agent

describe('IT Helpdesk Agent', () => {
  
  test('List tickets returns valid data', async () => {
    const response = await agent.sendMessage('Show me my tickets');
    expect(response).toContainAdaptiveCard('ticketList');
    expect(response.tickets.length).toBeGreaterThan(0);
  });
  
  test('Create ticket succeeds', async () => {
    const response = await agent.sendMessage('Create a ticket for email issue');
    // Agent prompts for details
    await agent.sendMessage('Cannot access Outlook');
    expect(response).toContainTicketNumber();
  });
  
  test('Update ticket adds work notes', async () => {
    const response = await agent.sendMessage('Update ticket INC0010001 with test notes');
    expect(response).toContainConfirmation();
  });
  
  test('Close ticket changes state', async () => {
    const response = await agent.sendMessage('Close ticket INC0010001');
    expect(response.state).toBe('Resolved');
  });
  
});
```

---

## Next Steps

After completing these test flows:

1. **Document any issues** encountered
2. **Refine agent instructions** based on user interactions
3. **Add more conversation starters** that performed well
4. **Customize Adaptive Cards** for your organization
5. **Train users** on effective prompts
6. **Monitor usage** and gather feedback
7. **Iterate** on the agent design

---

## Feedback and Improvements

When testing, note:
- Which prompts work best
- Which responses are confusing
- What additional features users request
- Performance bottlenecks
- UI/UX improvements for Adaptive Cards

Use this feedback to continuously improve the agent.
