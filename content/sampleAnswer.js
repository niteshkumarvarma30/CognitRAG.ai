/**
 * CognitRAG Sample Answer Data Module
 * Purely static sample data for public homepage interactive demo.
 * Colour meaning:
 * - Green (--em): Structured data read directly from tools (Jira, GitHub PR merge state)
 * - Cyan (--cy): Extracted knowledge inferred from discussions/text (Slack, design notes)
 * - Amber (--am): Conflict or potentially outdated source
 */

export const SAMPLE_QUESTION = "Why did we switch to Stripe billing and is the staging 401 issue resolved?";

export const SAMPLE_SOURCES = [
  {
    id: "src-jira",
    number: 1,
    tier: "structured",
    tierName: "Structured (Tool API)",
    tool: "Jira",
    toolColor: "#0052CC",
    title: "BILL-101: Fix 401 Unauthorized in Stripe Staging",
    author: "John Doe (Assignee)",
    date: "Yesterday at 16:42",
    snippet: "Status: Done / Resolved. Following Sarah's report in Slack, verified staging EC2 instance was accidentally pulling sk_live_ keys instead of test keys. Resolved via PR #45.",
    badgeClass: "badge-structured",
    color: "var(--em, #22C55E)"
  },
  {
    id: "src-github",
    number: 2,
    tier: "structured",
    tierName: "Structured (Tool API)",
    tool: "GitHub",
    toolColor: "#818CF8",
    title: "PR #45: Update Stripe staging keys in AWS Secrets Manager",
    author: "John Doe (Merged by Sarah Chen)",
    date: "Yesterday at 17:15",
    snippet: "Merged into main. Resolved BILL-101. Updated config.yml to pull sk_test_ keys from AWS Secrets Manager for staging instead of hardcoded environment values.",
    badgeClass: "badge-structured",
    color: "var(--em, #22C55E)"
  },
  {
    id: "src-slack",
    number: 3,
    tier: "extracted",
    tierName: "Extracted (Inferred from conversation)",
    tool: "Slack",
    toolColor: "#4A154B",
    title: "#engineering-alerts > Sarah Chen",
    author: "Sarah Chen (Lead Engineer)",
    date: "Yesterday at 15:30",
    snippet: "\"Staging pe Stripe checkout fail ho raha hai with 401 error. Lagta hai environment variables galat hain, please verify before QA test begins.\"",
    badgeClass: "badge-extracted",
    color: "var(--cy, #38BDF8)"
  },
  {
    id: "src-notion",
    number: 4,
    tier: "outdated",
    tierName: "Conflict / Outdated Doc",
    tool: "Notion",
    toolColor: "#E2E8F0",
    title: "PRD: Q3 Billing Integration & Gateway Migration",
    author: "Product Strategy & Architecture",
    date: "Updated 3 weeks ago",
    snippet: "Goal: Migrate core payment gateway from Braintree to Stripe Elements to support multi-currency and webhooks. Note: Draft specifies storing staging keys in EC2 local .env, which conflicts with current AWS Secrets Manager setup.",
    badgeClass: "badge-conflict",
    color: "var(--am, #F59E0B)"
  }
];

export const CONFLICT_NOTICE = {
  id: "conflict-spec",
  tier: "outdated",
  tierName: "Documentation Conflict",
  title: "Notion PRD vs. GitHub Secrets Implementation",
  date: "Detected across 2 sources",
  snippet: "Notion PRD section 4.2 states staging keys reside in local .env files on EC2. However, GitHub PR #45 and Jira BILL-101 confirm keys are now managed in AWS Secrets Manager. The Notion document has been flagged as outdated.",
  color: "var(--am, #F59E0B)"
};

export const SAMPLE_ANSWER_BLOCKS = [
  {
    text: "The team switched from Braintree to Stripe billing as part of the Q3 billing initiative to support multi-currency webhooks and Stripe Elements UI ",
    chips: [{ sourceId: "src-notion", label: "Source 4: Notion PRD", tier: "outdated" }]
  },
  {
    text: ". Yesterday, a staging 401 error was reported by Sarah Chen in #engineering-alerts due to misconfigured API credentials ",
    chips: [{ sourceId: "src-slack", label: "Source 3: Slack #alerts", tier: "extracted" }]
  },
  {
    text: ". John Doe investigated and resolved the issue under ticket BILL-101 ",
    chips: [{ sourceId: "src-jira", label: "Source 1: Jira BILL-101", tier: "structured" }]
  },
  {
    text: ", merging PR #45 to route test keys (sk_test_) through AWS Secrets Manager. The staging environment is now operational ",
    chips: [{ sourceId: "src-github", label: "Source 2: GitHub PR #45", tier: "structured" }]
  }
];
