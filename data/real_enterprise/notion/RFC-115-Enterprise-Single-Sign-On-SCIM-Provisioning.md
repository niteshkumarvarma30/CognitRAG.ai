# RFC-115: Enterprise Single Sign-On (SSO) & SCIM 2.0 User Provisioning
Author: David Kim, IAM Specialist
Status: Implemented | Compatible IDPs: Okta, Azure AD / Entra ID, PingIdentity

## 1. Capabilities
- **SAML 2.0 / OIDC:** SP-initiated and IDP-initiated SSO authentication.
- **SCIM 2.0 Protocol:** Real-time synchronization of users and user groups from corporate identity providers.
- **Role Mapping:** Automatically maps corporate group memberships (e.g. `engineering-leads`, `finance-auditors`) to CognitRAG role-based access control (RBAC) permissions.