# IT Helpdesk Agent - M365 Copilot Declarative Agent

An intelligent M365 Copilot declarative agent that helps users manage ServiceNow IT support tickets through natural language conversations.

## Overview

The IT Helpdesk Agent enables end users to interact with ServiceNow incident management through Microsoft 365 Copilot. Users can create, update, close, and list their IT support tickets using conversational language, with responses displayed using rich Adaptive Cards.

## Features

- 🎫 **Ticket Management**: Create, update, close, and list ServiceNow incidents
- 💬 **Natural Language Interface**: Interact with IT support using conversational prompts
- 🔐 **OAuth Authentication**: Secure integration with ServiceNow using OAuth 2.0
- 🎨 **Rich UI**: Adaptive Cards for displaying ticket information
- 🔌 **Plugin Architecture**: OpenAPI-based plugin for ServiceNow integration
- 🚀 **M365 Copilot Integration**: Works seamlessly within Microsoft 365 ecosystem

## Project Structure

```
.
├── appPackage/                 # Teams app package files
│   ├── manifest.json          # Teams app manifest
│   ├── declarativeAgent.json  # Declarative agent configuration
│   ├── color.png.placeholder  # Placeholder for app icon (192x192)
│   └── outline.png.placeholder # Placeholder for app icon (32x32)
├── plugins/                    # Plugin definitions
│   ├── servicenow-plugin.json # Plugin manifest
│   └── servicenow-openapi.yaml # OpenAPI specification for ServiceNow
├── adaptiveCards/              # Adaptive Card templates
│   ├── ticketList.json        # List view for multiple tickets
│   ├── ticketSummary.json     # Summary view for single ticket
│   ├── ticketDetails.json     # Detailed view for single ticket
│   └── ticketCreationForm.json # Form for creating new tickets
├── docs/                       # Documentation
│   ├── SETUP.md               # Setup and configuration guide
│   ├── OAUTH_CONFIGURATION.md # OAuth setup details
│   ├── ADAPTIVE_CARDS.md      # Adaptive Cards guide
│   └── TEST_FLOWS.md          # Test scenarios and sample conversations
├── .env.sample                # Sample environment configuration
└── README.md                  # This file
```

## Quick Start

### Prerequisites

- Microsoft 365 tenant with Copilot for Microsoft 365
- ServiceNow instance (developer or production)
- Administrative access to both M365 and ServiceNow
- Node.js 18.x or later (for development)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/bgervin/ithelpdesk_da_codex_atk.git
   cd ithelpdesk_da_codex_atk
   ```

2. **Configure environment variables**
   ```bash
   cp .env.sample .env
   # Edit .env with your ServiceNow and M365 credentials
   ```

3. **Follow the setup guide**
   
   See [`docs/SETUP.md`](docs/SETUP.md) for detailed configuration steps including:
   - ServiceNow OAuth application setup
   - M365 app registration
   - Plugin vault configuration
   - Packaging and deployment

## Usage

Once configured and deployed, users can interact with the agent in M365 Copilot:

### Example Conversations

**List your tickets:**
```
User: Show me my open tickets
Agent: [Displays Adaptive Card with list of open tickets]
```

**Create a new ticket:**
```
User: I need to report an IT issue
Agent: I can help you create a ticket. What's the issue?
User: My laptop won't connect to WiFi
Agent: [Creates ticket and shows confirmation card]
```

**Update a ticket:**
```
User: Update ticket INC0010001 - the issue is resolved
Agent: [Updates ticket and shows updated card]
```

**Close a ticket:**
```
User: Close ticket INC0010001
Agent: [Closes ticket and shows final status]
```

See [`docs/TEST_FLOWS.md`](docs/TEST_FLOWS.md) for more comprehensive test scenarios.

## ServiceNow Operations

The agent supports the following ServiceNow incident management operations via OpenAPI plugin:

| Operation | API Endpoint | Description |
|-----------|--------------|-------------|
| **List Tickets** | `GET /api/now/table/incident` | Retrieve user's incidents |
| **Create Ticket** | `POST /api/now/table/incident` | Create new incident |
| **Get Ticket** | `GET /api/now/table/incident/{sys_id}` | Get incident details |
| **Update Ticket** | `PATCH /api/now/table/incident/{sys_id}` | Update incident |
| **Close Ticket** | `PUT /api/now/table/incident/{sys_id}` | Close incident |

See [`plugins/servicenow-openapi.yaml`](plugins/servicenow-openapi.yaml) for the complete API specification.

## Adaptive Cards

The agent uses four main Adaptive Card templates:

1. **Ticket List** - Display multiple tickets with key information
2. **Ticket Summary** - Show brief ticket details
3. **Ticket Details** - Comprehensive ticket information view
4. **Ticket Creation Form** - Interactive form for new tickets

All templates support:
- Dynamic data binding
- Conditional visibility
- Interactive actions
- Responsive design

See [`docs/ADAPTIVE_CARDS.md`](docs/ADAPTIVE_CARDS.md) for customization guide.

## OAuth Authentication

The agent uses OAuth 2.0 Authorization Code flow for secure ServiceNow integration:

- User authenticates with ServiceNow credentials
- Access tokens are securely managed by Microsoft Bot Framework
- Tokens automatically refresh
- Each user accesses only their own data

See [`docs/OAUTH_CONFIGURATION.md`](docs/OAUTH_CONFIGURATION.md) for detailed OAuth setup.

## Customization

### Modifying Agent Behavior

Edit [`appPackage/declarativeAgent.json`](appPackage/declarativeAgent.json) to:
- Update agent instructions
- Add conversation starters
- Modify agent name and description

### Extending ServiceNow Operations

Edit [`plugins/servicenow-openapi.yaml`](plugins/servicenow-openapi.yaml) to:
- Add new API endpoints
- Include custom ServiceNow fields
- Support additional ServiceNow tables (e.g., service requests, change requests)

### Customizing Adaptive Cards

Edit templates in [`adaptiveCards/`](adaptiveCards/) directory to:
- Match your organization's branding
- Add custom fields
- Modify layouts and styling

## Documentation

- **[Setup Guide](docs/SETUP.md)** - Complete setup and configuration instructions
- **[OAuth Configuration](docs/OAUTH_CONFIGURATION.md)** - Detailed OAuth setup guide
- **[Adaptive Cards Guide](docs/ADAPTIVE_CARDS.md)** - Card customization and usage
- **[Test Flows](docs/TEST_FLOWS.md)** - Sample conversations and test scenarios

## Architecture

```
┌─────────────┐
│   User in   │
│ M365 Copilot│
└──────┬──────┘
       │
       │ Natural Language
       │
       ▼
┌─────────────────────┐
│  Declarative Agent  │
│  (Instructions +    │
│   Plugin)           │
└──────┬──────────────┘
       │
       │ API Calls (OAuth)
       │
       ▼
┌─────────────────────┐
│  ServiceNow Plugin  │
│  (OpenAPI Spec)     │
└──────┬──────────────┘
       │
       │ REST API
       │
       ▼
┌─────────────────────┐
│   ServiceNow        │
│   Incident Table    │
└─────────────────────┘
```

## Requirements

### M365 Requirements
- Microsoft 365 E3/E5 or Copilot for Microsoft 365 license
- Azure AD app registration
- Teams admin access for app deployment

### ServiceNow Requirements
- ServiceNow instance (Developer instance or licensed instance)
- OAuth provider configuration
- Table API access
- User accounts with `itil` role or incident access

## Security Considerations

- OAuth tokens are encrypted and securely stored
- Each user only accesses their own ServiceNow data
- ServiceNow role-based access control (RBAC) is enforced
- No credentials are stored in the agent code
- HTTPS required for all communication

## Troubleshooting

### Common Issues

1. **Authentication fails**: Verify OAuth configuration in ServiceNow and M365 Plugin Vault
2. **Plugin not visible**: Ensure app is uploaded and enabled in Teams admin center
3. **API calls fail**: Check ServiceNow instance URL and API accessibility
4. **Adaptive Cards not displaying**: Validate JSON syntax and data bindings

See documentation for detailed troubleshooting guides.

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is provided as-is for educational and demonstration purposes.

## Support

For issues and questions:
- **ServiceNow API**: [ServiceNow Developer Portal](https://developer.servicenow.com)
- **M365 Copilot**: [Microsoft Teams Platform Documentation](https://learn.microsoft.com/microsoftteams/)
- **Adaptive Cards**: [Adaptive Cards Documentation](https://adaptivecards.io)

## Acknowledgments

- Built with [Microsoft 365 Copilot](https://www.microsoft.com/microsoft-365/copilot)
- Powered by [ServiceNow API](https://developer.servicenow.com)
- UI components from [Adaptive Cards](https://adaptivecards.io)

---

**Version**: 1.0.0  
**Last Updated**: 2024-01-16
