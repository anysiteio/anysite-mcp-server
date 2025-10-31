<div align="center">

# 🌐 AnySite MCP Server

**Agent-First Web Scraping Infrastructure via Model Context Protocol**

Connect your AI agents to real-time data from LinkedIn, Instagram, Reddit, Twitter, and any website through a single MCP server.

[![npm version](https://img.shields.io/npm/v/@anysite/mcp.svg)](https://www.npmjs.com/package/@anysite/mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub stars](https://img.shields.io/github/stars/anysiteio/anysite-mcp-server)](https://github.com/anysiteio/anysite-mcp-server/stargazers)
[![Documentation](https://img.shields.io/badge/docs-anysite.io-blue)](https://docs.anysite.io/mcp-server)

[🚀 Quick Start](#-quick-start) • [📖 Documentation](https://docs.anysite.io/mcp-server) • [🎮 Playground](https://app.anysite.io) • [💬 Discord](#) • [🐦 Twitter](#)

</div>

---

## 🎯 What is AnySite MCP Server?

AnySite MCP Server is a **Model Context Protocol (MCP)** implementation that gives AI agents direct access to web data through platform-specific APIs. Unlike traditional web scrapers, AnySite provides:

- **🔒 OAuth Authentication** - Secure, one-click connection for Claude Desktop and other MCP clients
- **🌐 Multi-Platform Support** - LinkedIn, Instagram, Reddit, Twitter, and custom web parsing
- **🤖 Agent-First Design** - Built specifically for AI agents with structured data formats
- **🔄 Self-Healing APIs** - Auto-recovery from platform changes and rate limits
- **⚡ Real-Time Data** - Fresh data extraction without stale caches

> **Perfect for:** AI research, lead generation, market intelligence, content monitoring, competitive analysis

---

## ⚡ Key Features

### 🎪 Supported Platforms

| Platform | Search | Profiles | Posts | Comments | DMs | Analytics |
|----------|--------|----------|-------|----------|-----|-----------|
| **LinkedIn** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Instagram** | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| **Reddit** | ✅ | ✅ | ✅ | ✅ | ❌ | ⚠️ |
| **Twitter/X** | ✅ | ✅ | ✅ | ⚠️ | ❌ | ⚠️ |
| **Any Website** | ✅ | - | - | - | - | - |

### 🛠️ Core Capabilities

- **Advanced Search & Filtering** - Find people by title, company, location, education, skills
- **Bulk Data Extraction** - Extract thousands of profiles, posts, or comments in one request
- **Network Analysis** - Map connections, followers, engagement patterns
- **Content Monitoring** - Track posts, comments, reactions in real-time
- **Account Management** - Send messages, connection requests, post comments (LinkedIn)
- **Smart Web Parsing** - Extract structured data from any website using CSS selectors

### 🔐 Enterprise-Grade Features

- **Rate Limit Management** - Automatic backoff and retry with exponential delays
- **Proxy Rotation** - Built-in proxy support for high-volume requests
- **Error Recovery** - Self-healing mechanisms for platform changes
- **Usage Analytics** - Track API consumption and costs
- **Team Management** - Multi-user accounts with role-based access

---

## 🚀 Quick Start

### Option 1: Remote MCP with OAuth (Recommended)

Perfect for **Claude Desktop, Cline, Cursor, Windsurf**, and other MCP clients that support OAuth.

#### Step 1: Get Your OAuth URL

1. Sign up at [app.anysite.io](https://app.anysite.io) (100 free credits included)
2. Navigate to **MCP Server Integration**
3. Copy your OAuth URL: `https://api.anysite.io/mcp/sse`

#### Step 2: Add to Your MCP Client

<details>
<summary><b>Claude Desktop</b> (Click to expand)</summary>

1. Open **Claude Desktop** → **Settings** → **Connectors**
2. Click **Add Custom Connector**
3. Fill in:
   - **Name:** AnySite MCP
   - **OAuth URL:** `https://api.anysite.io/mcp/sse`
4. Click **Add** → **Connect** → **Allow Access**

📖 [Detailed Claude Desktop Setup Guide](https://docs.anysite.io/mcp-server/claude-desktop-tool/installation)

</details>

<details>
<summary><b>Cline / Cursor / Windsurf</b></summary>

Add to your MCP configuration file:

```json
{
  "mcpServers": {
    "anysite": {
      "command": "npx",
      "args": ["-y", "@anysite/mcp"],
      "env": {
        "ANYSITE_OAUTH_URL": "https://api.anysite.io/mcp/sse"
      }
    }
  }
}
```

Configuration file locations:
- **Cline:** `.cline/mcp_settings.json`
- **Cursor:** `.cursor/mcp_config.json`
- **Windsurf:** `.windsurf/mcp_config.json`

</details>

#### Step 3: Verify Connection

Ask your AI agent:
```
What MCP tools do you have access to?
```

Expected response should include:
- `search_linkedin_users`
- `get_linkedin_profile`
- `get_instagram_user`
- `search_reddit_posts`
- `google_search`
- ... and 40+ more tools

---

### Option 2: Local MCP Server (For Development)

Perfect for **testing, development, custom integrations**.

#### Installation

```bash
# Clone the repository
git clone https://github.com/anysiteio/anysite-mcp-server.git
cd anysite-mcp-server

# Install dependencies
npm install

# Build the project
npm run build
```

#### Configuration

Create `.env` file:
```env
ANYSITE_ACCESS_TOKEN=your_access_token
ANYSITE_ACCOUNT_ID=your_account_id
```

Get your credentials from [app.anysite.io](https://app.anysite.io/settings/api-keys)

#### Run Server

```bash
npm start
```

#### Connect to MCP Client

Add to your MCP configuration:

```json
{
  "mcpServers": {
    "anysite-local": {
      "command": "node",
      "args": ["/path/to/anysite-mcp-server/build/index.js"],
      "env": {
        "ANYSITE_ACCESS_TOKEN": "your_token",
        "ANYSITE_ACCOUNT_ID": "your_account_id"
      }
    }
  }
}
```

---

## 🎮 Usage Examples

### LinkedIn: Find Decision Makers

```
Find me 10 CTOs at AI companies in San Francisco
```

The MCP server will:
1. Search LinkedIn users with title="CTO", company_keywords="AI", location="San Francisco"
2. Return structured profiles with name, headline, company, location
3. Provide direct LinkedIn URLs for each profile

### Instagram: Monitor Brand Mentions

```
Get the latest 20 Instagram posts mentioning @yourbranding
```

### Reddit: Analyze Discussions

```
Search Reddit for posts about "LLM agents" in the last week,
sorted by top engagement
```

### Multi-Platform Research

```
1. Find the LinkedIn profile of John Doe at Company X
2. Get his recent posts and engagement metrics
3. Find his Twitter profile and latest tweets
4. Cross-reference with Instagram presence
```

---

## 📖 Documentation

### 📚 Full Documentation
- [AnySite MCP Server Docs](https://docs.anysite.io/mcp-server)
- [API Reference](https://docs.anysite.io/api-reference)
- [All Available Tools](https://docs.anysite.io/mcp-server/tools)

### 🔧 Tool Categories

<details>
<summary><b>LinkedIn Tools (25+)</b></summary>

**Search & Discovery**
- `search_linkedin_users` - Advanced user search with 10+ filters
- `search_linkedin_companies` - Find companies by industry, size, location
- `search_linkedin_posts` - Search posts by keywords, author, date range
- `search_linkedin_jobs` - Job listings with filters

**Profile & Data**
- `get_linkedin_profile` - Full profile with experience, education, skills
- `get_linkedin_user_posts` - User's post history
- `get_linkedin_user_reactions` - Posts user reacted to
- `get_linkedin_user_comments` - User's comment history
- `get_linkedin_user_connections` - Network connections
- `find_linkedin_user_email` - Email lookup

**Company Intelligence**
- `get_linkedin_company` - Company details, size, industry
- `get_linkedin_company_employees` - Employee list with filters
- `get_linkedin_company_posts` - Company updates
- `get_linkedin_company_employee_stats` - Headcount by role/location

**Engagement**
- `get_linkedin_post` - Post details, content, metrics
- `get_linkedin_post_comments` - Comment threads
- `get_linkedin_post_reactions` - Who reacted and how
- `get_linkedin_post_reposts` - Reshare analysis

**Account Management** (Requires authenticated session)
- `send_linkedin_chat_message` - Send DMs
- `get_linkedin_chat_messages` - Retrieve conversations
- `send_linkedin_connection` - Send connection requests
- `send_linkedin_post_comment` - Comment on posts

</details>

<details>
<summary><b>Instagram Tools (10+)</b></summary>

- `get_instagram_user` - Profile info, followers, posts count
- `get_instagram_user_posts` - Post history with media
- `get_instagram_user_reels` - Reels/videos
- `get_instagram_user_friendships` - Followers/following lists
- `get_instagram_post` - Post details with metrics
- `get_instagram_post_comments` - Comment threads
- `get_instagram_post_likes` - Who liked
- `search_instagram_posts` - Hashtag and keyword search

</details>

<details>
<summary><b>Reddit Tools (5+)</b></summary>

- `search_reddit_posts` - Search with sort, time, subreddit filters
- `get_reddit_post` - Post details with score, comments
- `get_reddit_post_comments` - Comment trees with nested replies

</details>

<details>
<summary><b>Twitter/X Tools (5+)</b></summary>

- `search_twitter_posts` - Advanced tweet search
- `search_twitter_users` - Find users
- `get_twitter_user` - Profile details
- `get_twitter_user_posts` - Tweet history

</details>

<details>
<summary><b>Web Parsing Tools</b></summary>

- `google_search` - Google search with clean results
- `parse_webpage` - Extract content with CSS selectors
- `get_sitemap` - Parse website sitemaps

</details>

---

## 🤝 Integrations

AnySite MCP Server works with any MCP-compatible client:

### AI Assistants
- ✅ **Claude Desktop** - Native OAuth support
- ✅ **Cline** - MCP configuration
- ✅ **Cursor** - Custom MCP server
- ✅ **Windsurf** - MCP integration
- ✅ **Any MCP Client** - Standard protocol

### Development Tools
- 🔧 **n8n** - [AnySite n8n nodes](https://github.com/anysiteio/n8n-nodes-anysite)
- 🔧 **LangChain** - Custom tool integration
- 🔧 **AutoGen** - Agent tool registration
- 🔧 **REST API** - Direct API access

### Comparison: Remote vs Local

| Feature | Remote MCP (OAuth) | Local MCP |
|---------|-------------------|-----------|
| **Setup Time** | < 2 minutes | ~10 minutes |
| **Authentication** | OAuth (secure, one-click) | API keys in config |
| **Updates** | Automatic | Manual git pull |
| **Best For** | Production, end-users | Development, testing |
| **Credentials** | Managed by AnySite | Self-managed |
| **Revocation** | One-click in dashboard | Manual removal |
| **MCP Clients** | Claude Desktop, Cline, etc. | Any MCP client |

**Recommendation:** Use **Remote MCP** for production and **Local MCP** for development/testing.

---

## 🏗️ Architecture

```
┌─────────────────┐
│   MCP Client    │ (Claude Desktop, Cline, etc.)
│   (AI Agent)    │
└────────┬────────┘
         │ MCP Protocol
         │
┌────────▼────────┐
│  AnySite MCP    │
│     Server      │
└────────┬────────┘
         │ REST API
         │
┌────────▼────────┐
│  AnySite API    │ ← OAuth Authentication
│   Platform      │ ← Rate Limiting
└────────┬────────┘ ← Proxy Rotation
         │
    ┌────┴────┬────────┬─────────┬──────────┐
    ▼         ▼        ▼         ▼          ▼
LinkedIn  Instagram  Reddit  Twitter  Any Website
```

**Key Components:**
- **MCP Protocol Layer** - Standardized tool interface for AI agents
- **API Abstraction** - Platform-specific API adapters with error handling
- **Authentication** - OAuth 2.0 for secure credential management
- **Self-Healing** - Auto-retry and fallback mechanisms
- **Rate Limiting** - Smart backoff to prevent API bans

---

## 💡 Use Cases

### 🎯 Lead Generation & Sales
- Find decision makers by title, company, location
- Enrich CRM data with LinkedIn profiles
- Monitor competitor hiring and expansion

### 📊 Market Intelligence
- Track brand mentions across platforms
- Analyze competitor social media strategy
- Monitor industry trends and discussions

### 🔍 Research & Analytics
- Collect datasets for AI training
- Social network analysis
- Content performance tracking

### 🤖 AI Agent Workflows
- Multi-platform data correlation
- Automated outreach campaigns
- Cross-platform identity resolution

---

## 🛠️ Development

### Building from Source

```bash
# Clone repository
git clone https://github.com/anysiteio/anysite-mcp-server.git
cd anysite-mcp-server

# Install dependencies
npm install

# Build TypeScript
npm run build

# Run in development mode
npm run dev

# Run tests
npm test
```

### Project Structure

```
anysite-mcp-server/
├── src/                      # Source code
│   ├── index.ts              # MCP server entry point
│   ├── server.ts             # Server implementation
│   └── types.ts              # TypeScript type definitions
├── build/                    # Compiled JavaScript
│   ├── index.js              # Main entry point
│   ├── server.js             # Server executable
│   ├── types.js              # Type definitions
│   ├── remote-server.js      # Remote server support
│   ├── streamable-server.js  # Streaming support
│   └── smithery.js           # Smithery integration
├── .claude/                  # Claude Code settings
│   └── settings.local.json
├── .cursor/                  # Cursor IDE settings
│   └── rules/
├── .smithery/                # Smithery CLI files
│   └── index.cjs
├── package.json              # npm package configuration
├── package-lock.json
├── tsconfig.json             # TypeScript configuration
├── smithery.yaml             # Smithery config
├── glama.json                # Glama integration
├── .env                      # Environment variables (local)
├── .npmrc                    # npm configuration
├── .gitignore
├── README.md                 # Documentation
├── CLAUDE.md                 # Claude Code instructions
├── LICENSE.md                # MIT License
└── LICENSE
```

### Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

**Areas we need help with:**
- 📝 Documentation improvements
- 🐛 Bug fixes and testing
- ✨ New platform integrations
- 🌍 Translations

---

## 📊 Pricing & Limits

### Free Tier
- ✅ 100 free credits on signup
- ✅ All tools available
- ✅ OAuth authentication
- ⚠️ Rate limits apply

### Pro Plans
- 🚀 Higher rate limits
- 🚀 Priority support
- 🚀 Dedicated proxies
- 🚀 Team collaboration

See [pricing details](https://anysite.io/pricing)

---

## 🔒 Security & Privacy

- **OAuth 2.0** - Industry-standard authentication
- **No Credential Storage** - Your API keys stay with AnySite
- **Encrypted Transport** - All data transmitted over HTTPS
- **GDPR Compliant** - Data processing follows EU regulations
- **Revocable Access** - One-click disconnect in dashboard

⚠️ **Important:** Always comply with platform terms of service and local regulations when scraping data.

---

## 💬 Community & Support

- 📖 [Documentation](https://docs.anysite.io)
- 💬 [Discord Community](#) - Ask questions, share workflows
- 🐦 [Twitter](https://twitter.com/anysite_io) - Latest updates
- 📧 [Email Support](mailto:support@anysite.io)
- 🐛 [GitHub Issues](https://github.com/anysiteio/anysite-mcp-server/issues)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE.md).

---

## 🙏 Acknowledgments

Built with:
- [Model Context Protocol](https://modelcontextprotocol.io/) by Anthropic
- [TypeScript](https://www.typescriptlang.org/)
- [Node.js](https://nodejs.org/)

Special thanks to the MCP community for feedback and contributions.

---

<div align="center">

**⭐ Star us on GitHub if AnySite MCP Server helps your AI agents!**

Made with ❤️ by the [AnySite.io](https://anysite.io) team

[Website](https://anysite.io) • [Documentation](https://docs.anysite.io) • [API Playground](https://app.anysite.io)

</div>
