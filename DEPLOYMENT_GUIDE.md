# IT Helpdesk Agent Deployment Guide

This guide walks you through deploying the IT Helpdesk M365 Copilot Declarative Agent to your organization.

## Prerequisites Checklist

Before you begin, ensure you have:

- [ ] ServiceNow instance with administrator access
- [ ] Microsoft 365 tenant with Copilot license
- [ ] Azure Active Directory admin access
- [ ] SharePoint site for knowledge base
- [ ] Node.js 18+ and npm installed
- [ ] M365 Agent Toolkit CLI installed (`npm install -g @microsoft/m365agentstoolkit-cli`)

## Step 1: ServiceNow OAuth Configuration

### 1.1 Create OAuth Application

1. Log into ServiceNow as administrator
2. Navigate to **System OAuth → Application Registry**
3. Click **New** → **Create an OAuth API endpoint for external clients**
4. Fill in the details:
   ```
   Name: M365 Copilot IT Helpdesk Agent
   Redirect URL: https://token.botframework.com/.auth/web/redirect
   ```
5. Click **Submit**
6. **Save the Client ID and Client Secret** - you'll need these

### 1.2 Configure Scopes (Optional)

If your ServiceNow instance requires specific scopes:
1. In the OAuth application, navigate to **OAuth Scopes**
2. Add `useraccount` scope or as required by your organization

## Step 2: Azure Active Directory Configuration

### 2.1 Register Application

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory → App registrations**
3. Click **New registration**
4. Configure:
   ```
   Name: IT Helpdesk Copilot Agent
   Supported account types: Single tenant
   Redirect URI: https://token.botframework.com/.auth/web/redirect
   ```
5. Click **Register**
6. **Save the Application (client) ID and Directory (tenant) ID**

### 2.2 Add API Permissions

1. In your app registration, go to **API permissions**
2. Click **Add a permission**
3. Select **Microsoft Graph**
4. Add these permissions:
   - `User.Read` (Delegated)
   - `Files.Read.All` (Delegated) - for SharePoint knowledge base
5. Click **Grant admin consent** for your organization

### 2.3 Create Client Secret

1. Go to **Certificates & secrets**
2. Click **New client secret**
3. Add description: "IT Helpdesk Agent Secret"
4. Set expiration (recommended: 12 months)
5. Click **Add**
6. **Save the secret value immediately** - it won't be shown again

## Step 3: Configure Environment Variables

### 3.1 Update env/.env.dev

Edit `env/.env.dev` with your credentials:

```bash
# Built-in environment variables
TEAMSFX_ENV=dev
APP_NAME_SUFFIX=dev

# ServiceNow Configuration
SERVICENOW_INSTANCE=YOUR_INSTANCE_NAME  # e.g., dev12345
CLIENT_ID=YOUR_SERVICENOW_CLIENT_ID
CLIENT_SECRET=YOUR_SERVICENOW_CLIENT_SECRET

# Microsoft Configuration
TENANT_ID=YOUR_AZURE_TENANT_ID
OAUTH2_REGISTRATION_ID=  # Leave empty, will be generated during provision

# Generated during provision
TEAMS_APP_ID=
```

### 3.2 Update OpenAPI Specification

Edit `openapi.yaml`:

1. Update the server URL (line 7):
   ```yaml
   servers:
     - url: https://YOUR_INSTANCE.service-now.com/api/now/
       description: ServiceNow Instance
   ```

2. Update OAuth URLs (lines 266-269):
   ```yaml
   authorizationUrl: https://YOUR_INSTANCE.service-now.com/oauth_auth.do
   tokenUrl: https://YOUR_INSTANCE.service-now.com/oauth_token.do
   ```

Replace `YOUR_INSTANCE` with your actual ServiceNow instance name (e.g., `dev12345`).

## Step 4: Configure SharePoint Knowledge Base

### 4.1 Create Document Library

1. Navigate to your SharePoint site
2. Create a new document library named **IT-Knowledge**
3. Upload IT support documentation:
   - VPN setup guides
   - Password reset procedures
   - Software installation guides
   - Troubleshooting FAQs

### 4.2 Set Permissions

1. In the library settings, manage permissions
2. Grant **Read** access to all users who will use the agent
3. Ensure the service principal has access

### 4.3 Update Agent Configuration

Edit `appPackage/declarativeAgent.json`:

```json
"capabilities": [
    {
        "name": "OneDriveAndSharePoint",
        "items_by_url": [
            {
                "url": "https://YOUR_TENANT.sharepoint.com/sites/ITHelp/Shared%20Documents/IT-Knowledge"
            }
        ]
    }
],
```

Replace `YOUR_TENANT` with your actual tenant name.

## Step 5: Validate Configuration

Run the validation script to ensure everything is configured correctly:

```bash
./validate-setup.sh
```

This will check:
- All required files exist
- JSON and YAML syntax is valid
- ATK CLI is installed

## Step 6: Preview Locally

Test the agent in your local environment:

```bash
atk preview --env dev
```

This will:
1. Package the agent
2. Launch Microsoft Teams
3. Open the agent for testing

### Test Scenarios

Try these prompts to verify functionality:

1. **List Tickets**: "Show my open ServiceNow tickets"
2. **Knowledge Query**: "How do I reset my password?"
3. **Create Ticket**: "Create a new IT ticket for VPN issues"
4. **Get Details**: "Show details for ticket INC0012345"
5. **Update Ticket**: "Add a note to my VPN ticket"
6. **Close Ticket**: "Close ticket INC0012345"

## Step 7: Provision to Microsoft 365

When ready for production:

### 7.1 Provision Resources

```bash
atk provision --env dev
```

This creates:
- Teams app registration
- M365 title and app ID
- OAuth registrations

### 7.2 Deploy the Agent

```bash
atk deploy --env dev
```

This will:
1. Build the app package
2. Validate the manifest
3. Upload to Microsoft 365
4. Make available to users

### 7.3 Publish to Organization

For organization-wide deployment:

```bash
atk publish --env dev
```

This submits the app to Teams Admin Center for approval.

## Step 8: Grant User Access

### 8.1 In Teams Admin Center

1. Go to [Teams Admin Center](https://admin.teams.microsoft.com)
2. Navigate to **Teams apps → Manage apps**
3. Find "IT Helpdesk Agent"
4. Set to **Available** for your organization
5. Configure assignment policies

### 8.2 Assign Licenses

Ensure users have:
- Microsoft 365 Copilot license
- ServiceNow user account with appropriate permissions

## Troubleshooting

### OAuth Connection Fails

**Problem**: Authentication errors when connecting to ServiceNow

**Solution**:
1. Verify Client ID and Secret are correct
2. Check redirect URI matches exactly
3. Ensure OAuth app is active in ServiceNow
4. Verify user has ServiceNow permissions

### SharePoint Access Denied

**Problem**: Agent can't access knowledge base

**Solution**:
1. Verify SharePoint URL is correct
2. Check service principal has Read permissions
3. Ensure users have access to the library
4. Test manual access to the SharePoint library

### Adaptive Cards Not Rendering

**Problem**: Cards don't display or show errors

**Solution**:
1. Validate JSON in [Adaptive Cards Designer](https://adaptivecards.io/designer/)
2. Check data binding matches API response structure
3. Verify card version is 1.5
4. Clear Teams cache and restart

### Agent Not Available

**Problem**: Can't find agent in Microsoft Teams

**Solution**:
1. Verify `atk provision` completed successfully
2. Check app status in Teams Admin Center
3. Ensure user has Copilot license
4. Check app assignment policies

## Production Best Practices

### Security

- [ ] Rotate OAuth secrets every 6-12 months
- [ ] Use Azure Key Vault for secret management
- [ ] Enable MFA for all admin accounts
- [ ] Regularly audit ServiceNow permissions
- [ ] Monitor OAuth token usage

### Monitoring

- [ ] Set up Application Insights for telemetry
- [ ] Monitor ServiceNow API rate limits
- [ ] Track user adoption metrics
- [ ] Review feedback and issues regularly

### Maintenance

- [ ] Keep knowledge base documents updated
- [ ] Review and update system instructions quarterly
- [ ] Test agent after ServiceNow updates
- [ ] Update Adaptive Cards based on user feedback
- [ ] Monitor M365 Agent Toolkit for updates

## Support Resources

- **Microsoft 365 Copilot Documentation**: https://learn.microsoft.com/microsoft-365-copilot/
- **ServiceNow Developer Portal**: https://developer.servicenow.com/
- **M365 Agent Toolkit**: https://aka.ms/teams-toolkit
- **Adaptive Cards Designer**: https://adaptivecards.io/designer/
- **Azure Portal**: https://portal.azure.com

## Need Help?

If you encounter issues:

1. Check the **Troubleshooting** section in README.md
2. Run `./validate-setup.sh` to verify configuration
3. Review logs in Teams Developer Portal
4. Check ServiceNow system logs for API errors
5. Consult Microsoft 365 admin center for deployment status

---

**Success Criteria**

You've successfully deployed when:
- ✅ Agent appears in Microsoft Teams Copilot
- ✅ OAuth authentication works with ServiceNow
- ✅ All 5 ticket operations function correctly
- ✅ SharePoint knowledge base searches return results
- ✅ Adaptive Cards display properly
- ✅ Users can complete end-to-end workflows

**Congratulations! Your IT Helpdesk Agent is ready to help your organization!** 🎉
