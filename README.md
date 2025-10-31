# IT Helpdesk M365 Copilot Declarative Agent

🪪 **Overview**

This is a Microsoft 365 Copilot Declarative Agent for IT Helpdesk that helps end-users ask common IT support questions and manage ServiceNow tickets. The agent integrates with ServiceNow through an OpenAPI plugin, supports OAuth authentication, and includes Adaptive Cards for rich user interaction.

## Architecture

The solution consists of:
- **Declarative Agent**: Microsoft 365 Copilot agent with custom instructions for IT helpdesk scenarios
- **OpenAPI Plugin**: Integration with ServiceNow REST API for incident management
- **OAuth Authentication**: Secure authentication to ServiceNow using OAuth 2.0
- **Adaptive Cards**: Rich, interactive UI for displaying ticket information
- **SharePoint Knowledge Base**: Local knowledge retrieval before ticket creation

## Features

✅ List user's ServiceNow incidents  
✅ Create new IT support tickets  
✅ Get detailed incident information  
✅ Update existing incidents  
✅ Close/resolve incidents  
✅ Search SharePoint knowledge base for solutions  
✅ Intelligent triage before ticket creation  

---

## 🧰 Local Setup

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher
- M365 Agent Toolkit CLI
- ServiceNow instance with OAuth configured (for production)
- Microsoft 365 tenant with Copilot license

### Installation

1. **Install M365 Agent Toolkit CLI**
   \`\`\`bash
   npm install -g @microsoft/m365agentstoolkit-cli
   \`\`\`

2. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/bgervin/ithelpdesk_da_codex_atk.git
   cd ithelpdesk_da_codex_atk
   \`\`\`

3. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

4. **Configure environment variables**
   \`\`\`bash
   cp .env.example .env
   # Edit .env with your ServiceNow instance name and credentials
   \`\`\`

### Local Development with Prism Mock Server

For local development and testing without a live ServiceNow instance, you can use the Prism mock server:

#### Option 1: One-Click F5 in VS Code

1. Open the project in VS Code
2. Ensure your \`.env\` file is configured with the following variables:
   \`\`\`bash
   API_HOST=localhost
   API_PORT=4010
   SPEC_SERVER_PORT=8081
   OPENAPI_URL=http://localhost:8081/openapi.local.yaml
   SERVICENOW_INSTANCE=your-instance
   \`\`\`
3. Press **F5** or select **"Launch Agent + Prism"** from the debug menu

This will automatically:
- Generate a localized OpenAPI spec (`.tmp/openapi.local.yaml`)
- Convert any CSV files in `data/` to JSON examples
- Start the Prism mock server on `http://localhost:4010`
- Start a static file server for the OpenAPI spec on `http://localhost:8081`
- Launch the agent with the local configuration

#### Option 2: Manual Commands

Run these commands in separate terminal windows:

1. **Generate local OpenAPI spec**
   \`\`\`bash
   npm run spec:local
   \`\`\`

2. **Seed example data from CSV**
   \`\`\`bash
   npm run seed:examples
   \`\`\`

3. **Start Prism mock server**
   \`\`\`bash
   npm run mock:start
   \`\`\`

4. **Start OpenAPI spec server**
   \`\`\`bash
   npm run spec:serve
   \`\`\`

5. **Preview the agent**
   \`\`\`bash
   atk preview --env local
   \`\`\`

#### Adding Sample Data

To add sample incident data for local testing:

1. Create CSV files in the `data/` directory (e.g., `data/incidents.csv`)
2. Run `npm run seed:examples` to convert them to JSON in the `examples/` directory
3. The generated JSON files follow the ServiceNow response format: `{ result: [...] }`

Example CSV format:
\`\`\`csv
sys_id,number,short_description,description,state,priority,urgency
001,INC0010001,VPN issue,Cannot connect to VPN,2,2,2
\`\`\`

### Production Preview

To preview the agent with a live ServiceNow instance:

\`\`\`bash
cp .env.example env/.env.dev
# Edit env/.env.dev with your ServiceNow and Azure credentials
atk preview --env dev
\`\`\`

The agent will be available in Microsoft Teams for testing.

---

## 🔐 OAuth Registration for ServiceNow

To enable OAuth authentication between the M365 Copilot agent and ServiceNow:

### Step 1: Register OAuth Application in ServiceNow

1. Log into your ServiceNow instance as an administrator
2. Navigate to **System OAuth → Application Registry**
3. Click **New** → **Create an OAuth API endpoint for external clients**
4. Configure the following:
   - **Name**: M365 Copilot IT Helpdesk Agent
   - **Client ID**: (auto-generated, copy this)
   - **Client Secret**: (auto-generated, copy this)
   - **Redirect URL**: Add your Microsoft 365 redirect URL
     - Format: \`https://token.botframework.com/.auth/web/redirect\`
   - **Access Token Lifespan**: 3600 seconds (or as required)
   - **Refresh Token Lifespan**: 86400 seconds (or as required)

5. Click **Submit** to save the configuration

### Step 2: Update Environment Variables

Update your \`env/.env.dev\` file with the ServiceNow OAuth credentials:

\`\`\`bash
# ServiceNow OAuth Configuration
CLIENT_ID=<client-id-from-servicenow>
CLIENT_SECRET=<client-secret-from-servicenow>

# ServiceNow Instance
SERVICENOW_INSTANCE=dev12345  # Replace with your instance name
SERVICENOW_BASE_URL=https://\${SERVICENOW_INSTANCE}.service-now.com

# Microsoft Configuration
TENANT_ID=<your-microsoft-tenant-id>
OAUTH2_REGISTRATION_ID=<generated-during-deployment>
\`\`\`

### Step 3: Register OAuth in Azure AD

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory → App registrations**
3. Create a new app registration or use existing
4. Add **API permissions** for Microsoft Graph:
   - \`User.Read\`
   - \`Files.Read.All\` (for SharePoint knowledge base)
5. Configure **Authentication**:
   - Add redirect URI for Bot Framework
   - Enable implicit grant flow for ID tokens
6. Copy the **Application (client) ID** and **Directory (tenant) ID**

### Step 4: Update OpenAPI Spec

Edit \`openapi.yaml\` to update the ServiceNow instance URL:

\`\`\`yaml
servers:
  - url: https://YOUR_INSTANCE.service-now.com/api/now/
    description: ServiceNow Instance (replace YOUR_INSTANCE with your instance name)
\`\`\`

Also update the OAuth URLs in the security schemes section:

\`\`\`yaml
components:
  securitySchemes:
    OAuth2:
      type: oauth2
      flows:
        authorizationCode:
          authorizationUrl: https://YOUR_INSTANCE.service-now.com/oauth_auth.do
          tokenUrl: https://YOUR_INSTANCE.service-now.com/oauth_token.do
\`\`\`

---

## 📂 Adding a SharePoint Knowledge Source

The agent can search a SharePoint document library for IT help documentation before creating tickets. This enables self-service resolution for common issues.

### Step 1: Create SharePoint Document Library

1. Navigate to your SharePoint site (e.g., \`https://YOUR_TENANT.sharepoint.com/sites/ITHelp\`)
2. Create a new document library named **IT-Knowledge** or use an existing one
3. Upload IT help documentation:
   - VPN setup guides
   - Password reset procedures
   - Software installation instructions
   - Troubleshooting guides
   - FAQ documents

### Step 2: Grant Access to the Copilot Agent

1. In the SharePoint document library, click **Settings → Library settings**
2. Under **Permissions and Management**, click **Permissions for this document library**
3. Grant **Read** permissions to:
   - Your M365 service principal
   - All users who will use the IT Helpdesk agent

### Step 3: Configure Knowledge Source in Manifest

The \`appPackage/declarativeAgent.json\` already includes a SharePoint knowledge source configuration:

\`\`\`json
"capabilities": [
    {
        "name": "OneDriveAndSharePoint",
        "items_by_url": [
            {
                "url": "https://YOUR_TENANT.sharepoint.com/sites/ITHelp/Shared%20Documents/Knowledge"
            }
        ]
    }
],
\`\`\`

**Update this URL** to match your SharePoint site and document library path.

### Step 4: How Knowledge Lookup Works

The agent is instructed to:
1. **First**, search the SharePoint knowledge base when a user reports an issue
2. **If found**, share the solution with the user
3. **Only create a ticket** if:
   - No solution found in knowledge base
   - Issue requires IT administrator intervention
   - User explicitly requests ticket creation

Example user interactions:
- ❓ **User**: "How do I reset my password?"  
  ✅ **Agent**: Searches SharePoint, finds password reset guide, shares steps with user
  
- ❓ **User**: "My VPN is not connecting"  
  ✅ **Agent**: Searches SharePoint for VPN guides, shares troubleshooting steps
  
- ❓ **User**: "I need admin access to install software"  
  ✅ **Agent**: No self-service solution available, creates ServiceNow ticket

---

## 💡 Usage

### Example Prompts

**List Tickets**
\`\`\`
Show my open ServiceNow tickets
What are my current IT incidents?
\`\`\`

**Create Ticket**
\`\`\`
Create a new IT ticket for a broken VPN connection
I need help with printer not working
Open a ticket for password reset
\`\`\`

**Get Ticket Details**
\`\`\`
Show me details for ticket INC0012345
What's the status of my VPN ticket?
\`\`\`

**Update Ticket**
\`\`\`
Add a note to ticket INC0012345: I tried restarting my computer
Update my ticket with additional information
\`\`\`

**Close Ticket**
\`\`\`
Close my resolved tickets
Mark ticket INC0012345 as resolved
\`\`\`

**Knowledge Base Queries**
\`\`\`
How do I reset my password?
What are the steps to configure VPN?
How do I install Microsoft Office?
\`\`\`

---

## 📁 Project Structure

\`\`\`
ithelpdesk_da_codex_atk/
├── openapi.yaml                        # ServiceNow API specification
├── appPackage/
│   ├── declarativeAgent.json          # Agent manifest with instructions
│   ├── instruction.txt                # System instructions for the agent
│   ├── ai-plugin.json                 # Plugin configuration with OAuth
│   ├── manifest.json                  # Teams app manifest
│   └── adaptiveCards/
│       ├── listIncidents.json         # Card for listing tickets
│       ├── getIncidentById.json       # Card for ticket details
│       ├── createIncident.json        # Card for ticket creation confirmation
│       ├── updateIncident.json        # Card for ticket update confirmation
│       └── closeIncident.json         # Card for ticket closure confirmation
├── env/
│   └── .env.dev                       # Environment configuration
├── .env.example                       # Environment variables template
├── m365agents.yml                     # M365 Agent Toolkit configuration
└── README.md                          # This file
\`\`\`

---

## 🔧 Development

### Modifying System Instructions

Edit \`appPackage/instruction.txt\` to customize agent behavior:
- Change greeting messages
- Add new triage logic
- Modify knowledge base search behavior
- Customize ticket creation rules

### Updating Adaptive Cards

The agent uses Adaptive Cards for rich UI. Card templates are in \`appPackage/adaptiveCards/\`:
- Use [Adaptive Cards Designer](https://adaptivecards.io/designer/) to create/edit cards
- Test card rendering with sample data
- Deploy updated cards and test in M365 Copilot

### Testing OAuth Flow

1. Start local preview: \`atk preview --env dev\`
2. Open agent in Microsoft Teams
3. Trigger an API call (e.g., "Show my tickets")
4. OAuth consent screen should appear
5. Authenticate with ServiceNow credentials
6. Verify API call succeeds

---

## 🔄 Local vs Production Configuration

### Local Development (Prism Mock)

When developing locally with the Prism mock server:
- **OpenAPI Spec**: `.tmp/openapi.local.yaml` (auto-generated from `openapi.yaml`)
- **API Base URL**: `http://localhost:4010` (Prism mock server)
- **Spec URL**: `http://localhost:8081/openapi.local.yaml` (served by http-server)
- **Authentication**: Not required for mock server
- **Data**: Served from generated examples or Prism's auto-generated responses

### Production (ServiceNow)

When deploying to production:
- **OpenAPI Spec**: `appPackage/apiSpecificationFile/openapi.yaml` (canonical file)
- **API Base URL**: `https://{SERVICENOW_INSTANCE}.service-now.com/api/now/`
- **Spec URL**: `apiSpecificationFile/openapi.yaml` (relative path in app package)
- **Authentication**: OAuth 2.0 via ServiceNow
- **Data**: Live ServiceNow incident data

The `ai-plugin.json` uses the `OPENAPI_URL` environment variable to switch between local and production specs:
- **Local**: Set `OPENAPI_URL=http://localhost:8081/openapi.local.yaml`
- **Production**: Leave `OPENAPI_URL` unset (defaults to `apiSpecificationFile/openapi.yaml`)

---

## 🚀 Deployment

### Deploy to Microsoft 365

\`\`\`bash
atk deploy --env dev
\`\`\`

This will:
1. Package the agent
2. Upload to Microsoft Teams admin center
3. Register OAuth connections
4. Make agent available to users

### Production Checklist

- [ ] Update \`openapi.yaml\` with production ServiceNow instance
- [ ] Configure production OAuth credentials in Azure and ServiceNow
- [ ] Update SharePoint knowledge base URL in \`declarativeAgent.json\`
- [ ] Test all operations (list, create, update, close tickets)
- [ ] Verify OAuth flow works in production
- [ ] Test SharePoint knowledge base search
- [ ] Deploy to Microsoft Teams admin center
- [ ] Assign licenses to users

---

## 📚 Additional Resources

- [Microsoft 365 Agent Toolkit Documentation](https://learn.microsoft.com/en-us/microsoft-365-copilot/extensibility/)
- [Declarative Agents for Microsoft 365 Copilot](https://learn.microsoft.com/en-us/microsoft-365-copilot/extensibility/overview-declarative-agent)
- [ServiceNow REST API Documentation](https://developer.servicenow.com/dev.do#!/reference/api/vancouver/rest/)
- [Adaptive Cards Documentation](https://adaptivecards.io/)
- [OAuth 2.0 with ServiceNow](https://docs.servicenow.com/bundle/vancouver-platform-security/page/administer/security/concept/c_OAuthApplications.html)

---

## 🐛 Troubleshooting

### OAuth Authentication Fails

**Symptom**: Agent prompts for authentication but fails to connect to ServiceNow

**Solutions**:
1. Verify \`CLIENT_ID\` and \`CLIENT_SECRET\` in \`env/.env.dev\`
2. Check redirect URI in ServiceNow matches Bot Framework URL
3. Ensure OAuth app is active in ServiceNow
4. Verify user has appropriate permissions in ServiceNow

### SharePoint Knowledge Base Not Working

**Symptom**: Agent doesn't search knowledge base before creating tickets

**Solutions**:
1. Verify SharePoint URL in \`declarativeAgent.json\` is correct
2. Ensure agent has Read permissions on SharePoint library
3. Check that knowledge documents are in supported formats (PDF, DOCX, TXT)
4. Test SharePoint permissions manually

### Adaptive Cards Not Rendering

**Symptom**: API calls succeed but cards don't display

**Solutions**:
1. Validate JSON syntax in adaptive card files
2. Test cards in [Adaptive Cards Designer](https://adaptivecards.io/designer/)
3. Check card version compatibility (use v1.5)
4. Verify data binding expressions match API response structure

### Agent Not Available in Teams

**Symptom**: Can't find agent in Microsoft Teams

**Solutions**:
1. Run \`atk preview --env dev\` to start local preview
2. Verify app is deployed: \`atk deploy --env dev\`
3. Check Teams admin center for app status
4. Ensure user has appropriate M365 Copilot license

---

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

---

**Made with ❤️ using Microsoft 365 Agent Toolkit**
