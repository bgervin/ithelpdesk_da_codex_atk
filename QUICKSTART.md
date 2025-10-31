# IT Helpdesk Agent - Quick Start Guide

Get your IT Helpdesk Copilot Agent up and running in under 30 minutes!

## 🚀 Fast Track Setup

### Prerequisites (5 minutes)

Install required tools:

```bash
# Install Node.js 18+ (if not already installed)
# Download from: https://nodejs.org/

# Install M365 Agent Toolkit CLI
npm install -g @microsoft/m365agentstoolkit-cli

# Verify installation
atk --version
```

### Configuration (10 minutes)

#### 1. Clone and Navigate

```bash
git clone https://github.com/bgervin/ithelpdesk_da_codex_atk.git
cd ithelpdesk_da_codex_atk
```

#### 2. Get ServiceNow Credentials

In ServiceNow:
- Navigate to: **System OAuth → Application Registry → New**
- Select: **Create an OAuth API endpoint for external clients**
- Name: `M365 Copilot IT Helpdesk`
- Copy: **Client ID** and **Client Secret**

#### 3. Get Azure Credentials

In [Azure Portal](https://portal.azure.com):
- Go to: **Azure Active Directory → App registrations → New**
- Register app: `IT Helpdesk Copilot Agent`
- Copy: **Application ID** and **Tenant ID**
- Create secret: **Certificates & secrets → New client secret**
- Copy: **Secret value**

#### 4. Update Configuration Files

**a) Update `env/.env.dev`:**

```bash
SERVICENOW_INSTANCE=your_instance_name
CLIENT_ID=your_servicenow_client_id
CLIENT_SECRET=your_servicenow_client_secret
TENANT_ID=your_azure_tenant_id
```

**b) Update `openapi.yaml` (line 7):**

```yaml
servers:
  - url: https://YOUR_INSTANCE.service-now.com/api/now/
```

**c) Update `appPackage/declarativeAgent.json` (SharePoint URL):**

```json
"url": "https://YOUR_TENANT.sharepoint.com/sites/ITHelp/Shared%20Documents/IT-Knowledge"
```

### Test Locally (5 minutes)

#### 1. Validate Setup

```bash
./validate-setup.sh
```

Should show all ✅ checks passing.

#### 2. Preview in Teams

```bash
atk preview --env dev
```

Microsoft Teams will open with your agent ready to test!

### Test the Agent (5 minutes)

Try these prompts:

```
1. "Show my open ServiceNow tickets"
2. "How do I reset my password?"
3. "Create a new IT ticket for VPN connection issues"
4. "Show me details for ticket INC0012345"
5. "Close my resolved tickets"
```

### Deploy to Production (5 minutes)

When ready for your organization:

```bash
# Provision resources
atk provision --env dev

# Deploy to M365
atk deploy --env dev

# Publish to organization
atk publish --env dev
```

---

## 🎯 Common First-Time Issues

### Issue: "OAuth authentication failed"

**Quick Fix:**
1. Verify Client ID and Secret in `env/.env.dev`
2. Check ServiceNow OAuth app is **Active**
3. Ensure redirect URI is: `https://token.botframework.com/.auth/web/redirect`

### Issue: "SharePoint access denied"

**Quick Fix:**
1. Verify SharePoint URL format is correct
2. Check you have **Read** permissions on the library
3. Test manual access: open URL in browser

### Issue: "Agent not showing in Teams"

**Quick Fix:**
1. Clear Teams cache: Close Teams → Delete `%appdata%\Microsoft\Teams\Cache`
2. Restart Teams
3. Re-run: `atk preview --env dev`

---

## 📋 Configuration Checklist

Use this checklist to ensure everything is configured:

### ServiceNow
- [ ] OAuth app created
- [ ] Client ID copied
- [ ] Client Secret copied
- [ ] Redirect URI configured
- [ ] OAuth app is Active

### Azure AD
- [ ] App registered
- [ ] Application ID copied
- [ ] Tenant ID copied
- [ ] Client secret created
- [ ] API permissions granted (User.Read, Files.Read.All)
- [ ] Admin consent granted

### SharePoint
- [ ] Document library created (IT-Knowledge)
- [ ] IT documentation uploaded
- [ ] Permissions granted to users
- [ ] URL copied and updated in config

### Configuration Files
- [ ] `env/.env.dev` updated with all credentials
- [ ] `openapi.yaml` updated with ServiceNow instance URL
- [ ] `appPackage/declarativeAgent.json` updated with SharePoint URL
- [ ] Validation script passed: `./validate-setup.sh`

---

## 🧪 Testing Scenarios

After deployment, test these scenarios:

### 1. Knowledge Base Query
**Prompt**: "How do I reset my password?"  
**Expected**: Agent searches SharePoint, returns password reset guide

### 2. List Tickets
**Prompt**: "Show my open ServiceNow tickets"  
**Expected**: Adaptive card displays user's open incidents

### 3. Create Ticket
**Prompt**: "Create a new ticket - my VPN is not working"  
**Expected**: Creates incident in ServiceNow, shows confirmation card

### 4. Get Ticket Details
**Prompt**: "Show me details for ticket INC0012345"  
**Expected**: Displays ticket details in adaptive card

### 5. Update Ticket
**Prompt**: "Add a note to ticket INC0012345: I tried restarting"  
**Expected**: Updates ticket, shows confirmation

### 6. Close Ticket
**Prompt**: "Close ticket INC0012345, it's resolved"  
**Expected**: Closes ticket, shows closure confirmation

---

## 💡 Pro Tips

### Tip 1: Use Environment Variables

For sensitive data, use environment variables instead of hardcoding:

```bash
export SERVICENOW_CLIENT_ID="your-client-id"
export SERVICENOW_CLIENT_SECRET="your-client-secret"
```

### Tip 2: Create Multiple Environments

Create separate configs for dev, staging, and production:

```bash
cp env/.env.dev env/.env.staging
cp env/.env.dev env/.env.prod
```

Then deploy to each:
```bash
atk preview --env staging
atk preview --env prod
```

### Tip 3: Customize System Instructions

Edit `appPackage/instruction.txt` to customize agent behavior:
- Add company-specific policies
- Customize greeting messages
- Add escalation procedures
- Include SLA information

### Tip 4: Monitor Usage

Enable Application Insights for monitoring:
1. Create Application Insights resource in Azure
2. Add instrumentation key to agent
3. Monitor queries, errors, and performance

### Tip 5: Regular Updates

Keep your knowledge base fresh:
- Review and update documents monthly
- Add new troubleshooting guides
- Archive outdated information
- Collect user feedback

---

## 📚 Next Steps

After basic setup:

1. **Customize Adaptive Cards**: Update colors, branding, and layout in `appPackage/adaptiveCards/`
2. **Expand Knowledge Base**: Add more IT documentation to SharePoint
3. **Add More Operations**: Extend `openapi.yaml` with additional ServiceNow APIs
4. **Configure Alerts**: Set up monitoring and alerting for production
5. **Train Users**: Create user guides and training materials

---

## 🆘 Getting Help

**Stuck? Try these resources:**

1. **Validate Configuration**:
   ```bash
   ./validate-setup.sh
   ```

2. **Check Logs**:
   - Teams: **Settings → About → Open log files**
   - ServiceNow: **System Logs → System Log → All**
   - Azure: **App registrations → [Your App] → Monitoring**

3. **Documentation**:
   - Full setup: `README.md`
   - Detailed deployment: `DEPLOYMENT_GUIDE.md`
   - Troubleshooting: `README.md` (Troubleshooting section)

4. **Community Support**:
   - [Microsoft 365 Community](https://techcommunity.microsoft.com/t5/microsoft-365/ct-p/microsoft365)
   - [ServiceNow Community](https://www.servicenow.com/community/)
   - [M365 Agent Toolkit GitHub](https://github.com/OfficeDev/TeamsFx)

---

## ✅ Success Indicators

You're all set when:

- ✅ `validate-setup.sh` shows all green checks
- ✅ `atk preview --env dev` launches without errors
- ✅ Agent appears in Microsoft Teams Copilot
- ✅ OAuth authentication succeeds
- ✅ All test prompts return expected results
- ✅ Adaptive cards display correctly
- ✅ SharePoint knowledge base searches work

**Congratulations! You're ready to empower your organization with AI-driven IT support!** 🎉

---

**Estimated Total Time**: 30 minutes  
**Difficulty Level**: Intermediate  
**Prerequisites**: ServiceNow access, Azure AD admin, M365 Copilot license
