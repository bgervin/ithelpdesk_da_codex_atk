# Adaptive Cards Guide

This document explains how Adaptive Cards are used in the IT Helpdesk Agent to display ServiceNow ticket information and enable user interactions.

## Overview

Adaptive Cards are platform-agnostic UI snippets that provide a rich, interactive way to present data. The IT Helpdesk Agent uses four main Adaptive Card templates:

1. **Ticket List** - Display multiple tickets in a list view
2. **Ticket Summary** - Show brief ticket information
3. **Ticket Details** - Display complete ticket information
4. **Ticket Creation Form** - Interactive form for creating new tickets

## Card Templates

### 1. Ticket List (`ticketList.json`)

**Purpose**: Display a list of open tickets with basic information

**Data Structure**:
```json
{
  "tickets": [
    {
      "sys_id": "abc123",
      "number": "INC0010001",
      "short_description": "Cannot access email",
      "state": "New",
      "priority": "3 - Moderate",
      "opened_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

**Features**:
- Displays ticket count
- Shows ticket number, description, priority, and state
- Each ticket is clickable to view details
- Includes "Create New Ticket" and "Refresh List" actions

**Usage**:
- Returned when user asks "Show me my tickets"
- Displayed after listing all open incidents

**Example Rendering**:
```
┌─────────────────────────────────────────┐
│ Your Open Tickets                       │
│ You have 3 open ticket(s)               │
├─────────────────────────────────────────┤
│ INC0010001                              │
│ Cannot access email                     │
│ Priority: 3 - Moderate | Opened: 2024...│
│                               [New] ⚠️  │
├─────────────────────────────────────────┤
│ INC0010002                              │
│ Laptop running slowly                   │
│ Priority: 4 - Low | Opened: 2024...     │
│                        [In Progress] ✓  │
├─────────────────────────────────────────┤
│ [Create New Ticket] [Refresh List]      │
└─────────────────────────────────────────┘
```

### 2. Ticket Summary (`ticketSummary.json`)

**Purpose**: Display condensed ticket information suitable for quick viewing

**Data Structure**:
```json
{
  "sys_id": "abc123",
  "number": "INC0010001",
  "short_description": "Cannot access email",
  "description": "I cannot log into my Outlook...",
  "state": "New",
  "priority": "3 - Moderate",
  "urgency": "2 - Medium",
  "opened_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T11:45:00Z",
  "instance": "dev12345"
}
```

**Features**:
- Shows ticket number and state prominently
- Displays key metadata (priority, urgency, timestamps)
- Includes actions: View in ServiceNow, Update, Close
- State is color-coded (New=Red, In Progress=Green, etc.)

**Usage**:
- Returned after creating a ticket
- Displayed in search results
- Shown after updating a ticket

### 3. Ticket Details (`ticketDetails.json`)

**Purpose**: Display comprehensive ticket information with all available fields

**Data Structure**:
```json
{
  "sys_id": "abc123",
  "number": "INC0010001",
  "short_description": "Cannot access email",
  "description": "Detailed description...",
  "state": "In Progress",
  "priority": "3 - Moderate",
  "urgency": "2 - Medium",
  "impact": "2 - Medium",
  "category": "Email",
  "subcategory": "Outlook",
  "opened_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T14:20:00Z",
  "assigned_to": {
    "display_value": "John Smith"
  },
  "work_notes": "Investigated issue...",
  "close_notes": "",
  "instance": "dev12345"
}
```

**Features**:
- Full ticket information display
- Organized into sections (Summary, Description, Information, Notes)
- Multiple action buttons
- Conditional visibility for work notes and close notes
- Direct link to ServiceNow with branded icon

**Usage**:
- When user asks to "view ticket INC0010001"
- After clicking a ticket in the list
- When requesting detailed ticket information

### 4. Ticket Creation Form (`ticketCreationForm.json`)

**Purpose**: Interactive form for collecting information to create a new incident

**Fields**:
- **Short Description** (required) - Text input, max 160 characters
- **Detailed Description** (required) - Multi-line text input
- **Urgency** (required) - Choice set (High/Medium/Low)
- **Category** (optional) - Choice set (Hardware/Software/Network/Email/Access/Other)
- **Subcategory** (optional) - Text input

**Features**:
- Client-side validation (required fields)
- Default values (Urgency defaults to Low)
- Helpful placeholder text
- Submit and Cancel actions

**Usage**:
- When user says "Create a ticket" or "Report an issue"
- Shown as a form before calling the createTicket API

**Data Submission**:
```json
{
  "action": "submitTicket",
  "shortDescription": "Cannot access email",
  "description": "I cannot log into Outlook...",
  "urgency": "2",
  "category": "Email",
  "subcategory": "Outlook"
}
```

## Data Binding

Adaptive Cards use template syntax for data binding:

### Basic Binding
```json
{
  "type": "TextBlock",
  "text": "${short_description}"
}
```

### Conditional Visibility
```json
{
  "type": "TextBlock",
  "text": "${description}",
  "isVisible": "${!empty(description)}"
}
```

### Conditional Colors
```json
{
  "type": "TextBlock",
  "text": "${state}",
  "color": "${if(state == 'New', 'Attention', 'Default')}"
}
```

### Date Formatting
```json
{
  "type": "TextBlock",
  "text": "${formatDateTime(opened_at, 'yyyy-MM-dd HH:mm')}"
}
```

### Array Iteration
```json
{
  "type": "Container",
  "$data": "${tickets}",
  "items": [
    {
      "type": "TextBlock",
      "text": "${number}"
    }
  ]
}
```

## Styling Guidelines

### Colors

State-based colors used in the cards:

| State | Color | Usage |
|-------|-------|-------|
| New | `Attention` (Red) | Indicates new, unassigned tickets |
| In Progress | `Good` (Green) | Shows active work is being done |
| Resolved | `Good` (Green) | Ticket is resolved |
| Closed | `Default` (Gray) | Ticket is closed |

### Text Sizes

| Size | Usage |
|------|-------|
| `ExtraLarge` | Main ticket number in details view |
| `Large` | Section headers, ticket numbers |
| `Medium` | Subheadings, important labels |
| `Default` | Body text, descriptions |
| `Small` | Metadata, timestamps, subtle information |

### Weights

| Weight | Usage |
|--------|-------|
| `Bolder` | Ticket numbers, states, section headers |
| `Default` | Body text, descriptions |
| `Lighter` | Subtle information (rarely used) |

## Actions

### Action Types

1. **Action.Submit** - Posts data back to the agent
   ```json
   {
     "type": "Action.Submit",
     "title": "Update Ticket",
     "data": {
       "action": "update",
       "sys_id": "${sys_id}"
     }
   }
   ```

2. **Action.OpenUrl** - Opens URL in browser
   ```json
   {
     "type": "Action.OpenUrl",
     "title": "View in ServiceNow",
     "url": "https://${instance}.service-now.com/nav_to.do?uri=incident.do?sys_id=${sys_id}"
   }
   ```

3. **selectAction** - Makes container clickable
   ```json
   {
     "type": "Container",
     "selectAction": {
       "type": "Action.Submit",
       "data": {"action": "viewTicket", "sys_id": "${sys_id}"}
     }
   }
   ```

### Action Styles

- `"style": "positive"` - Green button (for primary actions like "Create")
- `"style": "destructive"` - Red button (for dangerous actions like "Delete")
- No style - Default blue button

## Customization Guide

### Adding Custom Fields

To add custom ServiceNow fields to cards:

1. **Update the OpenAPI schema** in `servicenow-openapi.yaml`:
   ```yaml
   properties:
     custom_field:
       type: string
       description: Your custom field
   ```

2. **Add to the Adaptive Card template**:
   ```json
   {
     "type": "TextBlock",
     "text": "Custom Field: ${custom_field}",
     "wrap": true
   }
   ```

3. **Ensure data includes the field** when rendering the card

### Creating New Card Templates

1. **Design the card** using [Adaptive Cards Designer](https://adaptivecards.io/designer/)
2. **Add data binding expressions** (use `${}` syntax)
3. **Save as JSON** in the `adaptiveCards/` directory
4. **Reference in your agent logic** when appropriate
5. **Test with sample data** to verify rendering

### Responsive Design

Adaptive Cards automatically adapt to different screen sizes. Best practices:

- Use `"wrap": true` for TextBlocks with long content
- Use ColumnSets for side-by-side layouts on wide screens
- Set column widths: `"stretch"` for flexible, `"auto"` for content-based
- Test on mobile and desktop

## Testing Cards

### Online Designer

Use the [Adaptive Cards Designer](https://adaptivecards.io/designer/) to:
1. Load your card JSON
2. Provide sample data
3. Preview rendering
4. Test actions

### Sample Data for Testing

**Ticket List Sample**:
```json
{
  "tickets": [
    {
      "sys_id": "abc123",
      "number": "INC0010001",
      "short_description": "Cannot access email",
      "state": "New",
      "priority": "3 - Moderate",
      "opened_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

**Ticket Details Sample**:
```json
{
  "sys_id": "abc123",
  "number": "INC0010001",
  "short_description": "Cannot access email",
  "description": "Detailed description of the email access issue",
  "state": "In Progress",
  "priority": "3 - Moderate",
  "urgency": "2 - Medium",
  "impact": "2 - Medium",
  "category": "Email",
  "subcategory": "Outlook",
  "opened_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T14:20:00Z",
  "assigned_to": {
    "display_value": "John Smith"
  },
  "work_notes": "Checked user permissions",
  "instance": "dev12345"
}
```

## Troubleshooting

### Card Not Rendering

**Issue**: Card appears blank or doesn't render

**Solutions**:
- Validate JSON syntax using a JSON validator
- Check that schema URL is correct
- Verify Adaptive Card version is supported (use 1.5 or earlier)
- Test in Adaptive Cards Designer

### Data Binding Errors

**Issue**: Fields show `${fieldname}` instead of values

**Solutions**:
- Ensure data object includes all referenced fields
- Check spelling of field names (case-sensitive)
- Verify data structure matches template expectations

### Actions Not Working

**Issue**: Buttons don't respond or error occurs

**Solutions**:
- Verify `Action.Submit` data structure
- Check that URLs in `Action.OpenUrl` are valid
- Ensure action handlers are implemented in bot logic
- Test with simplified action first

## Best Practices

1. **Keep cards focused** - One card per purpose (list vs. details)
2. **Use proper spacing** - Apply `spacing` property for visual separation
3. **Make text scannable** - Use headers, bold text, and fact sets
4. **Provide clear actions** - Button text should be action-oriented ("Update Ticket", not "Update")
5. **Handle missing data** - Use `isVisible` to hide sections with no data
6. **Test with real data** - Use actual ServiceNow data for testing
7. **Consider accessibility** - Ensure text has sufficient contrast, use proper semantic structure
8. **Keep it responsive** - Test on different screen sizes

## Resources

- [Adaptive Cards Official Site](https://adaptivecards.io/)
- [Adaptive Cards Designer](https://adaptivecards.io/designer/)
- [Adaptive Cards Schema](https://adaptivecards.io/explorer/)
- [Templating Language Guide](https://docs.microsoft.com/adaptive-cards/templating/)
- [Microsoft Teams Adaptive Cards](https://learn.microsoft.com/microsoftteams/platform/task-modules-and-cards/cards/design-effective-cards)
