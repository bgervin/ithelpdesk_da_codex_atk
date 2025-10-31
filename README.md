# IT Helpdesk Agent - M365 Copilot Declarative Agent

An intelligent M365 Copilot declarative agent that helps users manage ServiceNow IT support tickets through natural language conversations.

## Overview

The IT Helpdesk Agent enables end users to interact with ServiceNow incident management through Microsoft 365 Copilot. Users can create, update, close, and list their IT support tickets using conversational language, with rich responses displayed using Adaptive Cards.

This project was scaffolded using the [Microsoft 365 Agents Toolkit CLI](https://aka.ms/teamsfx-toolkit-cli) (`atk`).

## Features

- 🎫 **Ticket Management**: Create, update, close, and list ServiceNow incidents
- 💬 **Natural Language Interface**: Interact with IT support using conversational prompts
- 🔐 **OAuth Authentication**: Secure integration with ServiceNow using OAuth 2.0
- 🎨 **Rich UI**: Adaptive Cards for displaying ticket information
- 🔌 **API Plugin**: OpenAPI-based ServiceNow integration
- 🚀 **M365 Copilot Integration**: Works seamlessly within Microsoft 365 ecosystem

## Project Structure

```
.
├── appPackage/                    # Teams app package files
│   ├── manifest.json             # Teams app manifest
│   ├── declarativeAgent.json     # Declarative agent configuration
│   ├── apiPlugin.json            # API plugin manifest
│   ├── servicenow-openapi.yaml   # OpenAPI specification for ServiceNow
│   ├── instruction.txt           # Agent instructions
│   ├── color.png                 # App icon (192x192)
│   └── outline.png               # App icon (32x32)
├── adaptiveCards/                # Adaptive Card templates
│   ├── ticketList.json           # List view for multiple tickets
│   ├── ticketSummary.json        # Summary view for single ticket
│   ├── ticketDetails.json        # Detailed view for single ticket
│   └── ticketCreationForm.json   # Form for creating new tickets
├── docs/                         # Documentation
│   ├── SETUP.md                  # Setup and configuration guide
│   ├── OAUTH_CONFIGURATION.md    # OAuth setup details
│   ├── ADAPTIVE_CARDS.md         # Adaptive Cards guide
│   └── TEST_FLOWS.md             # Test scenarios and examples
├── env/                          # Environment configuration
├── m365agents.yml                # M365 Agents Toolkit configuration
├── .env.sample                   # Sample environment variables
└── README.md                     # This file
```

## Prerequisites

- [Node.js](https://nodejs.org/) 18.x or later
- [Microsoft 365 Agents Toolkit](https://aka.ms/teamsfx-toolkit-cli) (`npm install -g @microsoft/m365agentstoolkit-cli`)
- Microsoft 365 tenant with [Copilot for Microsoft 365 license](https://learn.microsoft.com/microsoft-365-copilot/extensibility/prerequisites#prerequisites)
- ServiceNow instance (developer or production)
- Administrative access to both M365 and ServiceNow

## Quick Start

### 1. Clone and Setup

```bash
git clone https://github.com/bgervin/ithelpdesk_da_codex_atk.git
cd ithelpdesk_da_codex_atk
```

### 2. Configure Environment

```bash
cp .env.sample env/.env.dev
# Edit env/.env.dev with your ServiceNow instance details
```

### 3. Configure ServiceNow OAuth

See [`docs/OAUTH_CONFIGURATION.md`](docs/OAUTH_CONFIGURATION.md) for detailed OAuth setup instructions.

### 4. Provision the App

```bash
# Sign in to M365
atk auth login m365

# Provision the app (creates Teams app ID)
atk provision --env dev
```

### 5. Deploy to M365

```bash
# Package and deploy the app
atk publish --env dev
```

### 6. Test in Copilot

Open Microsoft 365 Copilot and enable the IT Helpdesk Agent plugin to start managing ServiceNow tickets conversationally!

## Usage Examples

Once configured and deployed, users can interact with the agent:

**List tickets:**
```
Show me my open tickets
```

**Create a ticket:**
```
I need to report an IT issue - my laptop won't connect to WiFi
```

**Update a ticket:**
```
Update ticket INC0010001 - the issue is resolved
```

**Close a ticket:**
```
Close ticket INC0010001
```

See [`docs/TEST_FLOWS.md`](docs/TEST_FLOWS.md) for comprehensive test scenarios.

## ServiceNow Operations

The agent supports these ServiceNow incident management operations:

| Operation | Method | Endpoint | Description |
|-----------|--------|----------|-------------|
| **listMyTickets** | GET | `/api/now/table/incident` | List user's incidents |
| **createTicket** | POST | `/api/now/table/incident` | Create new incident |
| **getTicket** | GET | `/api/now/table/incident/{sys_id}` | Get incident details |
| **updateTicket** | PATCH | `/api/now/table/incident/{sys_id}` | Update incident |
| **closeTicket** | PUT | `/api/now/table/incident/{sys_id}` | Close incident |

All operations use OAuth 2.0 authorization code flow for secure authentication.

## Documentation

- **[Setup Guide](docs/SETUP.md)** - Complete setup and configuration
- **[OAuth Configuration](docs/OAUTH_CONFIGURATION.md)** - OAuth 2.0 setup details
- **[Adaptive Cards Guide](docs/ADAPTIVE_CARDS.md)** - Card customization
- **[Test Flows](docs/TEST_FLOWS.md)** - Sample conversations and testing

## Development

### Using VS Code

1. Install [Microsoft 365 Agents Toolkit extension](https://aka.ms/teams-toolkit)
2. Open the project in VS Code
3. Sign in to M365 using the Toolkit
4. Click "Provision" in the Lifecycle section
5. Select "Preview in Copilot" to test

### Using CLI

```bash
# Provision resources
atk provision --env dev

# Preview locally
atk preview --env dev

# Deploy to M365
atk publish --env dev
```

## Customization

### Modify Agent Behavior

Edit [`appPackage/instruction.txt`](appPackage/instruction.txt) to update agent instructions.

### Extend ServiceNow Operations

Edit [`appPackage/servicenow-openapi.yaml`](appPackage/servicenow-openapi.yaml) to add new API endpoints.

### Customize Adaptive Cards

Edit templates in [`adaptiveCards/`](adaptiveCards/) directory to match your branding.

## Architecture

```
┌─────────────┐
│   User in   │
│ M365 Copilot│
└──────┬──────┘
       │ Natural Language
       ▼
┌─────────────────────┐
│  Declarative Agent  │
│  (Instructions +    │
│   Actions)          │
└──────┬──────────────┘
       │ API Calls (OAuth)
       ▼
┌─────────────────────┐
│  ServiceNow Plugin  │
│  (OpenAPI Spec)     │
└──────┬──────────────┘
       │ REST API
       ▼
┌─────────────────────┐
│   ServiceNow        │
│   Incident Table    │
└─────────────────────┘
```

## Security

- OAuth 2.0 tokens encrypted and securely managed by Bot Framework
- Each user accesses only their own ServiceNow data
- ServiceNow RBAC enforced per user
- HTTPS required for all communication

## Troubleshooting

### Common Issues

1. **Authentication fails**: Verify OAuth config in ServiceNow and M365 Plugin Vault
2. **Plugin not visible**: Ensure app is deployed and enabled
3. **API calls fail**: Check ServiceNow instance URL and accessibility
4. **Adaptive Cards not displaying**: Validate JSON syntax

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

- [Microsoft 365 Agents Toolkit Documentation](https://aka.ms/teamsfx-toolkit-cli)
- [ServiceNow Developer Portal](https://developer.servicenow.com)
- [Adaptive Cards Documentation](https://adaptivecards.io)

## Acknowledgments

- Scaffolded with [Microsoft 365 Agents Toolkit CLI](https://aka.ms/teamsfx-toolkit-cli)
- Powered by [ServiceNow API](https://developer.servicenow.com)
- UI components from [Adaptive Cards](https://adaptivecards.io)

---

**Version**: 1.0.0  
**Scaffolded with**: Microsoft 365 Agents Toolkit CLI (`atk`)
