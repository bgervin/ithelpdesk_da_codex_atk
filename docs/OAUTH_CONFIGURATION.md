# OAuth Authentication Configuration Guide

This document provides detailed information about configuring OAuth authentication for the ServiceNow plugin in the M365 Copilot IT Helpdesk Agent.

## Overview

The IT Helpdesk Agent uses OAuth 2.0 Authorization Code flow to authenticate with ServiceNow. This ensures secure, user-specific access to ServiceNow incident data without exposing credentials.

## OAuth 2.0 Flow

```
┌──────────┐                                           ┌─────────────┐
│          │                                           │             │
│  User in │                                           │ ServiceNow  │
│ Copilot  │                                           │  Instance   │
│          │                                           │             │
└────┬─────┘                                           └──────┬──────┘
     │                                                        │
     │ 1. User invokes plugin action                         │
     │                                                        │
     │ 2. Bot Framework checks auth                          │
     ├────────────────────────────────────────────────►      │
     │                                                        │
     │ 3. Redirect to ServiceNow OAuth                       │
     │    (if not authenticated)                             │
     │◄───────────────────────────────────────────────       │
     │                                                        │
     │ 4. User logs in to ServiceNow                         │
     ├────────────────────────────────────────────────►      │
     │                                                        │
     │ 5. ServiceNow redirects with auth code               │
     │◄───────────────────────────────────────────────       │
     │                                                        │
     │ 6. Bot Framework exchanges code for token            │
     ├────────────────────────────────────────────────►      │
     │                                                        │
     │ 7. ServiceNow returns access token                   │
     │◄───────────────────────────────────────────────       │
     │                                                        │
     │ 8. API call with access token                        │
     ├────────────────────────────────────────────────►      │
     │                                                        │
     │ 9. ServiceNow returns incident data                  │
     │◄───────────────────────────────────────────────       │
     │                                                        │
```

## ServiceNow OAuth Application Setup

### Step 1: Create OAuth Application

1. **Navigate to OAuth Application Registry**
   - Go to your ServiceNow instance
   - Navigate to: **System OAuth > Application Registry**
   - Click **New**

2. **Select Application Type**
   - Choose **Create an OAuth API endpoint for external clients**

3. **Configure Application Details**

   | Field | Value | Description |
   |-------|-------|-------------|
   | Name | M365 Copilot IT Helpdesk Agent | Descriptive name for the OAuth app |
   | Client ID | (auto-generated) | Save this - you'll need it for M365 config |
   | Client Secret | (click lock to generate) | Save this immediately - shown only once |
   | Redirect URL | `https://token.botframework.com/.auth/web/redirect` | Microsoft Bot Framework OAuth callback |
   | Refresh Token Lifespan | 86400 | 24 hours (adjust as needed) |
   | Access Token Lifespan | 1800 | 30 minutes (adjust as needed) |

4. **Save the Application**
   - Click **Submit**
   - Store the Client ID and Client Secret securely

### Step 2: Configure OAuth Scopes

1. **Open the OAuth Application** you just created
2. **Scroll to OAuth API Scopes** related list
3. **Add Required Scope**:
   - Click **New**
   - **OAuth Scope**: `useraccount`
   - **Description**: Access user account and incident data
   - Click **Submit**

### Step 3: Verify Permissions

Ensure the OAuth application has appropriate permissions:

1. **Navigate to** System OAuth > OAuth Application > your app
2. **Check Access Control** tab
3. Verify that:
   - Application is active
   - Redirect URL is exactly: `https://token.botframework.com/.auth/web/redirect`
   - Required scope `useraccount` is present

## M365 Plugin Vault Configuration

The plugin vault securely stores OAuth credentials for your Teams plugins.

### Step 1: Access Plugin Vault

There are two ways to configure OAuth in the plugin vault:

**Method A: Through Teams Admin Center (Recommended)**

1. Go to [Teams Admin Center](https://admin.teams.microsoft.com)
2. Navigate to **Teams apps > Manage apps**
3. Find your uploaded IT Helpdesk Agent app
4. Click on the app name
5. Go to **App settings** > **Plugin authentication**

**Method B: Through Developer Portal**

1. Go to [Teams Developer Portal](https://dev.teams.microsoft.com)
2. Navigate to **Apps**
3. Select your IT Helpdesk Agent app
4. Go to **Configure** > **Plugins**

### Step 2: Add OAuth Configuration

Configure the OAuth settings:

```json
{
  "configurationId": "<unique-config-id>",
  "providerName": "ServiceNow",
  "clientId": "<client-id-from-servicenow>",
  "clientSecret": "<client-secret-from-servicenow>",
  "authorizationUrl": "https://<instance>.service-now.com/oauth_auth.do",
  "tokenUrl": "https://<instance>.service-now.com/oauth_token.do",
  "scope": "useraccount",
  "tokenExchangeUrl": "https://token.botframework.com/.auth/v3/token"
}
```

| Parameter | Description | Example |
|-----------|-------------|---------|
| configurationId | Unique identifier for this OAuth config | `servicenow-oauth-prod` |
| providerName | Display name for the OAuth provider | `ServiceNow` |
| clientId | Client ID from ServiceNow OAuth app | `a1b2c3d4e5f6...` |
| clientSecret | Client Secret from ServiceNow OAuth app | `x9y8z7w6v5u4...` |
| authorizationUrl | ServiceNow OAuth authorization endpoint | `https://dev12345.service-now.com/oauth_auth.do` |
| tokenUrl | ServiceNow OAuth token endpoint | `https://dev12345.service-now.com/oauth_token.do` |
| scope | OAuth scope(s) - space-separated if multiple | `useraccount` |

### Step 3: Reference in Plugin Manifest

Update `plugins/servicenow-plugin.json` to reference this OAuth config:

```json
{
  "auth": {
    "type": "OAuthPluginVault",
    "reference_id": "servicenow-oauth-prod"
  }
}
```

The `reference_id` must match the `configurationId` from the plugin vault.

## Environment Variables

Store sensitive OAuth configuration in environment variables:

```bash
# .env file
SERVICENOW_INSTANCE=dev12345
SERVICENOW_OAUTH_CONFIG_ID=servicenow-oauth-prod
SERVICENOW_CLIENT_ID=a1b2c3d4e5f6...
SERVICENOW_CLIENT_SECRET=x9y8z7w6v5u4...
```

**Security Best Practices**:
- Never commit `.env` to version control
- Use `.gitignore` to exclude `.env`
- Use Azure Key Vault or similar for production secrets
- Rotate client secrets periodically
- Use different OAuth apps for dev/staging/production

## Testing OAuth Flow

### Manual Test

1. **Open M365 Copilot** in Teams or Edge
2. **Enable the IT Helpdesk Agent** plugin
3. **Send a message**: "Show me my tickets"
4. **Expected flow**:
   - First time: Sign-in prompt appears
   - Click "Sign in"
   - Redirect to ServiceNow login page
   - Enter ServiceNow credentials
   - Grant consent
   - Redirect back to Copilot
   - Plugin executes and shows tickets

### Verify Token

After successful authentication:

1. **In ServiceNow**:
   - Navigate to **System OAuth > OAuth Tokens**
   - Find tokens for your OAuth application
   - Verify user and expiration time

2. **In Bot Framework**:
   - Token is securely stored and automatically refreshed
   - You should not need to sign in again until token expires

## Troubleshooting OAuth Issues

### Issue: "Authentication Required" keeps appearing

**Possible Causes**:
- Incorrect redirect URL in ServiceNow
- Client ID/Secret mismatch
- OAuth config not properly registered in plugin vault

**Solution**:
1. Verify redirect URL is exactly: `https://token.botframework.com/.auth/web/redirect`
2. Double-check client ID and secret match ServiceNow app
3. Ensure `reference_id` in plugin matches `configurationId` in vault

### Issue: "Invalid Scope" error

**Possible Causes**:
- Scope `useraccount` not added to ServiceNow OAuth app

**Solution**:
1. Go to ServiceNow OAuth app
2. Add `useraccount` scope in OAuth API Scopes
3. Try authentication again

### Issue: Token expires too quickly

**Possible Causes**:
- Access token lifespan too short in ServiceNow

**Solution**:
1. Edit ServiceNow OAuth application
2. Increase **Access Token Lifespan** (e.g., to 3600 seconds)
3. Increase **Refresh Token Lifespan** (e.g., to 86400 seconds)

### Issue: Cannot access incident data after authentication

**Possible Causes**:
- User lacks permissions in ServiceNow
- Scope doesn't grant necessary access

**Solution**:
1. Verify user has `itil` role or appropriate incident access
2. Check ServiceNow ACLs for incident table
3. Ensure scope `useraccount` provides necessary permissions

## Security Considerations

### Token Storage
- Tokens are stored securely by Microsoft Bot Framework
- Tokens are encrypted at rest
- Tokens are specific to each user
- Tokens automatically refresh before expiration

### Data Access
- Each user only accesses their own ServiceNow data
- OAuth scope limits what data can be accessed
- ServiceNow ACLs still apply (role-based access control)

### Best Practices
1. **Use HTTPS only** - ServiceNow OAuth requires HTTPS
2. **Rotate secrets regularly** - Update client secrets every 90 days
3. **Monitor OAuth tokens** - Check ServiceNow OAuth token logs
4. **Limit token lifespan** - Balance security vs. user experience
5. **Review permissions** - Regularly audit which users have access

## Advanced Configuration

### Multiple Environments

For dev/staging/production environments:

```json
// dev environment
{
  "configurationId": "servicenow-oauth-dev",
  "authorizationUrl": "https://dev12345.service-now.com/oauth_auth.do",
  ...
}

// production environment
{
  "configurationId": "servicenow-oauth-prod",
  "authorizationUrl": "https://prod67890.service-now.com/oauth_auth.do",
  ...
}
```

### Custom Scopes

If your ServiceNow instance has custom scopes:

```json
{
  "scope": "useraccount custom_scope_1 custom_scope_2"
}
```

### Token Refresh

Token refresh is handled automatically by the Bot Framework. If you need manual refresh:

1. Navigate to ServiceNow > System OAuth > OAuth Tokens
2. Find the user's token
3. Click **Revoke** to force re-authentication

## References

- [ServiceNow OAuth Documentation](https://docs.servicenow.com/bundle/vancouver-platform-security/page/administer/security/concept/c_OAuthApplications.html)
- [Microsoft Bot Framework Authentication](https://learn.microsoft.com/azure/bot-service/bot-builder-authentication)
- [Teams Plugin OAuth](https://learn.microsoft.com/microsoftteams/platform/bots/how-to/authentication/add-authentication)
- [OAuth 2.0 RFC](https://tools.ietf.org/html/rfc6749)
