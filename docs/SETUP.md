# IT Helpdesk Agent Setup Guide

This guide walks you through setting up the M365 Copilot IT Helpdesk Agent with ServiceNow integration.

## Prerequisites

- Microsoft 365 tenant with Copilot for Microsoft 365 license
- ServiceNow instance (developer instance or production)
- Administrative access to both M365 and ServiceNow
- Node.js 18.x or later
- Teams Toolkit CLI or Teams Toolkit for Visual Studio Code

## Step 1: ServiceNow Configuration

### 1.1 Create OAuth Application in ServiceNow

1. Log in to your ServiceNow instance as an administrator
2. Navigate to **System OAuth > Application Registry**
3. Click **New** and select **Create an OAuth API endpoint for external clients**
4. Configure the application:
   - **Name**: M365 Copilot IT Helpdesk Agent
   - **Client ID**: (auto-generated, save this value)
   - **Client Secret**: (generated, save this value - shown only once)
   - **Redirect URL**: `https://token.botframework.com/.auth/web/redirect`
   - **Refresh Token Lifespan**: 86400 (or as required)
   - **Access Token Lifespan**: 1800 (or as required)
5. Click **Submit**

### 1.2 Configure OAuth Scope

1. After creating the OAuth application, open it
2. In the **OAuth API Scopes** related list, ensure the following scope is included:
   - `useraccount` - Required for accessing user account and incident data
3. If not present, add it by clicking **New** in the OAuth API Scopes section

### 1.3 Verify API Access

Ensure the Table API is enabled:
1. Navigate to **System Web Services > REST > REST API Explorer**
2. Verify that the **Table API** is accessible
3. Test endpoint: `/api/now/table/incident`

## Step 2: M365 Teams App Registration

### 2.1 Register App in Azure AD

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory > App registrations**
3. Click **New registration**
4. Configure:
   - **Name**: IT Helpdesk Agent
   - **Supported account types**: Accounts in this organizational directory only
   - **Redirect URI**: (leave blank for now)
5. Click **Register**
6. Save the **Application (client) ID** - this is your `TEAMS_APP_ID`

### 2.2 Configure API Permissions

1. In your app registration, go to **API permissions**
2. Add the following Microsoft Graph permissions:
   - `User.Read` (Delegated)
   - `Team.ReadBasic.All` (Delegated)
3. Click **Grant admin consent**

## Step 3: Configure the Agent

### 3.1 Set Environment Variables

1. Copy `.env.sample` to `.env`:
   ```bash
   cp .env.sample .env
   ```

2. Edit `.env` and fill in your values:
   ```
   TEAMS_APP_ID=<your-teams-app-id-from-azure>
   SERVICENOW_INSTANCE=<your-instance-name>
   SERVICENOW_OAUTH_CONFIG_ID=<generate-a-unique-id>
   SERVICENOW_CLIENT_ID=<from-servicenow-oauth-app>
   SERVICENOW_CLIENT_SECRET=<from-servicenow-oauth-app>
   ```

### 3.2 Update Manifest Files

The manifest files use environment variable placeholders. Ensure they're replaced during build:

1. `appPackage/manifest.json` - Update `id` with your `TEAMS_APP_ID`
2. `plugins/servicenow-plugin.json` - Update `reference_id` with your OAuth config ID

## Step 4: Configure OAuth in M365 Plugin Vault

### 4.1 Register OAuth Configuration

1. Open **Microsoft Teams Admin Center**
2. Navigate to **Teams apps > Manage apps**
3. Find your app or upload it (see Step 5)
4. Go to **App settings > Plugin authentication**
5. Add new OAuth configuration:
   - **Configuration ID**: (use value from `SERVICENOW_OAUTH_CONFIG_ID`)
   - **Provider name**: ServiceNow
   - **Client ID**: From ServiceNow OAuth app
   - **Client Secret**: From ServiceNow OAuth app
   - **Authorization URL**: `https://<instance>.service-now.com/oauth_auth.do`
   - **Token URL**: `https://<instance>.service-now.com/oauth_token.do`
   - **Scope**: `useraccount`
6. Save the configuration

## Step 5: Package and Deploy the Agent

### 5.1 Install Dependencies (if using build tools)

```bash
npm install
```

### 5.2 Create App Package

You need to create a ZIP file containing:
- `appPackage/manifest.json`
- `appPackage/declarativeAgent.json`
- `appPackage/color.png` (192x192 px icon)
- `appPackage/outline.png` (32x32 px icon)
- `plugins/servicenow-plugin.json`
- `plugins/servicenow-openapi.yaml`

Before packaging, replace the placeholder icon files:
1. Replace `appPackage/color.png.placeholder` with actual `color.png`
2. Replace `appPackage/outline.png.placeholder` with actual `outline.png`

Then create the package:
```bash
cd appPackage
zip -r ../ITHelpdesk-Agent.zip manifest.json declarativeAgent.json color.png outline.png ../plugins/
```

### 5.3 Upload to Teams

**Option A: Using Teams Toolkit CLI**
```bash
teamsfx deploy
```

**Option B: Manual Upload**
1. Open Microsoft Teams
2. Go to **Apps** in the left sidebar
3. Click **Manage your apps** (or **Upload a custom app** if available)
4. Select **Upload an app to your org's app catalog**
5. Choose the `ITHelpdesk-Agent.zip` file
6. Follow the prompts to complete installation

## Step 6: Enable in M365 Copilot

### 6.1 Add to Copilot

1. Open **Microsoft 365 Copilot** (in Teams, Edge, or other M365 apps)
2. Look for the plugin selector or **Manage plugins**
3. Find **IT Helpdesk Agent**
4. Enable it

### 6.2 Authenticate

When you first use the agent:
1. It will prompt you to authenticate with ServiceNow
2. Click **Sign in**
3. Enter your ServiceNow credentials
4. Grant consent for the app to access your account

## Step 7: Test the Agent

### 7.1 Basic Test Scenarios

Try these conversation starters in Copilot:

1. **List tickets**:
   - "Show me my open tickets"
   - "List my ServiceNow incidents"

2. **Create a ticket**:
   - "I need to report an IT issue"
   - "Create a ticket for my laptop problem"

3. **Update a ticket**:
   - "Update ticket INC0010001"
   - "Add notes to my ticket"

4. **Close a ticket**:
   - "Close ticket INC0010001"
   - "Mark my ticket as resolved"

### 7.2 Verify Adaptive Cards

The agent should display:
- **Ticket lists**: Using the `ticketList.json` template
- **Ticket details**: Using the `ticketDetails.json` template
- **Ticket summaries**: Using the `ticketSummary.json` template
- **Creation forms**: Using the `ticketCreationForm.json` template

## Troubleshooting

### Common Issues

1. **Authentication fails**
   - Verify OAuth configuration in ServiceNow
   - Check that redirect URL is correctly configured
   - Ensure client ID and secret are correct

2. **API calls fail**
   - Verify ServiceNow instance is accessible
   - Check that Table API is enabled
   - Verify user has permissions to access incidents

3. **Plugin not appearing**
   - Ensure OAuth is configured in M365 Plugin Vault
   - Verify app is properly uploaded and enabled
   - Check Teams app permissions

4. **Adaptive Cards not displaying**
   - Ensure Adaptive Card templates are included in package
   - Check template JSON syntax
   - Verify data binding expressions

### Logs and Diagnostics

- **ServiceNow logs**: System Logs > All
- **Teams app logs**: Teams Developer Portal > Your App > Analytics
- **OAuth logs**: ServiceNow > System OAuth > OAuth Debug Logs

## Next Steps

- Customize the agent instructions in `declarativeAgent.json`
- Add more conversation starters
- Extend the OpenAPI spec for additional ServiceNow operations
- Create custom Adaptive Card templates for your organization
- Add more ServiceNow categories and workflows

## Support

For issues with:
- **ServiceNow API**: [ServiceNow Developer Portal](https://developer.servicenow.com)
- **M365 Copilot**: [Microsoft Teams Developer Documentation](https://learn.microsoft.com/microsoftteams/)
- **Adaptive Cards**: [Adaptive Cards Documentation](https://adaptivecards.io)
