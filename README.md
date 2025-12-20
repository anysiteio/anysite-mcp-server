<div align="center">

<img src="icon.png" alt="Anysite MCP Server Logo" width="200" />

# 🌐 Anysite MCP Server

**Agent-First Web Scraping Infrastructure via Model Context Protocol**

Connect your AI agents to real-time data from LinkedIn, Instagram, Reddit, Twitter, and any website through a single MCP server.

[![npm version](https://img.shields.io/npm/v/@anysiteio/mcp.svg)](https://www.npmjs.com/package/@anysiteio/mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub stars](https://img.shields.io/github/stars/anysiteio/anysite-mcp-server)](https://github.com/anysiteio/anysite-mcp-server/stargazers)
[![Documentation](https://img.shields.io/badge/docs-anysite.io-blue)](https://docs.anysite.io/mcp-server)

[🚀 Quick Start](#-quick-start) • [📖 Documentation](https://docs.anysite.io/mcp-server) • [🐦 Twitter](#)

</div>

---

## 💎 MCP Unlimited Plan

**Unlimited access to all 65+ Anysite MCP tools for just $30/month** - perfect for AI agents and automation.

Get unlimited requests through Remote MCP Server with no request limits. Ideal for Claude Desktop, Cursor, n8n, and any MCP-compatible client.

**[📖 Learn more about MCP Unlimited →](https://docs.anysite.io/mcp-unlimited)**

**Available integrations:**
- [Make.com Integration](https://docs.anysite.io/mcp-server/unlimited-plan-make) - Connect with Make.com workflows
- [Clay Integration](https://docs.anysite.io/mcp-server/unlimited-plan-clay) - Use with Clay enrichment platform

---

## 🎯 What is Anysite MCP Server?

Anysite MCP Server is a **Model Context Protocol (MCP)** implementation that gives AI agents direct access to web data through platform-specific APIs. Unlike traditional web scrapers, Anysite provides:

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
3. Copy your OAuth URL: `https://mcp.anysite.io/`

#### Step 2: Add to Your MCP Client

<details>
<summary><b>Claude Desktop</b> (Click to expand)</summary>

1. Open **Claude Desktop** → **Settings** → **Connectors**
2. Click **Add Custom Connector**
3. Fill in:
   - **Name:** Anysite MCP
   - **OAuth URL:** `https://mcp.anysite.io/`
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
        "ANYSITE_OAUTH_URL": "https://mcp.anysite.io/mcp"
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
- `duckduckgo_search`
- `search_youtube_videos`
- `parse_webpage`
- ... and **65+ more tools**

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
Get the latest 20 Instagram posts mentioning @yourbrand
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
- [Anysite MCP Server Docs](https://docs.anysite.io/mcp-server)
- [API Reference](https://docs.anysite.io/api-reference)
- [All Available Tools](https://docs.anysite.io/mcp-server/tools)

### 🔧 Tool Categories (65+ Total)

<details>
<summary><b>Web Search (1 tool)</b></summary>

- `duckduckgo_search` - Web search powered by DuckDuckGo (up to 20 results)

</details>

<details>
<summary><b>Y Combinator (3 tools)</b></summary>

- `get_yc_company` - Get comprehensive YC company information by slug
- `search_yc_companies` - Search YC companies with filters (batch, status, industry)
- `search_yc_founders` - Search YC founders by name, company, batch, industry

</details>

<details>
<summary><b>YouTube (3 tools)</b></summary>

- `search_youtube_videos` - Search YouTube videos by query
- `get_youtube_video` - Get detailed video information by ID or URL
- `get_youtube_video_subtitles` - Extract video subtitles with timestamps

</details>

<details>
<summary><b>SEC (2 tools)</b></summary>

- `search_sec_companies` - Search SEC EDGAR filings with advanced filters
- `get_sec_document` - Retrieve full SEC document content by URL

</details>

<details>
<summary><b>LinkedIn Tools (35 tools)</b></summary>

**Search & Discovery (11 tools)**
- `search_linkedin_users` - Advanced user search with 10+ filters
- `linkedin_sales_navigator_search_users` - Sales Navigator advanced search
- `search_linkedin_companies` - Search companies with advanced filters
- `search_linkedin_educations` - Search educational institutions for filtering
- `search_linkedin_industries` - Search industries for filtering
- `search_linkedin_locations` - Search locations for filtering
- `search_linkedin_jobs` - Search job postings with filters
- `find_linkedin_user_email` - Find users by email address
- `get_linkedin_user_email_db` - Get email from internal database (up to 10 profiles)
- `get_linkedin_google_company` - Find companies via Google search
- `get_linkedin_company` - Company details lookup

**User Profiles & Details (12 tools)**
- `get_linkedin_profile` - Full profile with experience, education, skills
- `get_linkedin_user_posts` - User's post history
- `get_linkedin_user_comments` - User's comment history
- `get_linkedin_user_reactions` - Posts user reacted to
- `get_linkedin_user_endorsers` - Skill endorsers
- `get_linkedin_user_certificates` - Professional certificates
- `get_linkedin_user_education` - Education history
- `get_linkedin_user_experience` - Work experience details
- `get_linkedin_user_skills` - Skills and endorsements
- `get_linkedin_user_honors` - Awards and honors
- `get_linkedin_user_patents` - Patent information
- `get_linkedin_user_languages` - Language proficiencies

**Company Information (4 tools)**
- `get_linkedin_company_employee_stats` - Employee statistics
- `get_linkedin_company_employees` - Employee list with filters
- `get_linkedin_company_posts` - Company updates
- `get_linkedin_management_company_mentions` - Track company mentions (requires ACCOUNT_ID)

**Content & Posts (4 tools)**
- `search_linkedin_posts` - Search posts by keywords, author, date
- `get_linkedin_post_comments` - Comment threads
- `get_linkedin_post_reactions` - Who reacted and how
- `get_linkedin_post_reposts` - Reshare analysis

**Management & Actions (3 tools)** - Require ACCOUNT_ID
- `get_linkedin_management_me` - Your account profile
- `send_linkedin_chat_message` - Send direct messages
- `get_linkedin_chat_messages` - Get conversation history
- `get_linkedin_chat_attachment_base64` - Download chat attachments
- `send_linkedin_connection_request` - Connect with users
- `send_linkedin_post_comment` - Comment on posts
- `send_linkedin_post` - Create new posts
- `get_linkedin_conversations` - Get all conversations
- `get_linkedin_user_connections` - Get connections list

**Groups (1 tool)**
- `get_linkedin_group` - Get group information and members

</details>

<details>
<summary><b>Instagram Tools (8 tools)</b></summary>

- `get_instagram_user` - Profile info, followers, posts count
- `get_instagram_user_posts` - Post history with media
- `get_instagram_user_reels` - Reels/videos
- `get_instagram_user_friendships` - Followers/following lists
- `get_instagram_post` - Post details with metrics
- `get_instagram_post_comments` - Comment threads
- `get_instagram_post_likes` - Who liked the post
- `search_instagram_posts` - Hashtag and keyword search

</details>

<details>
<summary><b>Twitter/X Tools (4 tools)</b></summary>

- `get_twitter_user` - Profile details
- `search_twitter_users` - Find users
- `get_twitter_user_posts` - Tweet history
- `search_twitter_posts` - Advanced tweet search with 15+ filters

</details>

<details>
<summary><b>Reddit Tools (5 tools)</b></summary>

- `search_reddit_posts` - Search with sort, time, subreddit filters
- `get_reddit_posts` - Post details with score, comments
- `get_reddit_post_comments` - Comment trees with nested replies
- `get_reddit_user_posts` - Get posts from a specific Reddit user
- `get_reddit_user_comments` - Get comments from a specific Reddit user

</details>

<details>
<summary><b>Web Parsing Tools (2 tools)</b></summary>

- `parse_webpage` - Extract content with 14+ CSS selector options
- `get_sitemap` - Parse website sitemaps

</details>

---

## 🤝 Integrations

Anysite MCP Server works with any MCP-compatible client:

### AI Assistants
- ✅ **Claude Desktop** - Native OAuth support
- ✅ **Cline** - MCP configuration
- ✅ **Cursor** - Custom MCP server
- ✅ **Windsurf** - MCP integration
- ✅ **Any MCP Client** - Standard protocol

### Development Tools
- 🔧 **n8n** - [Anysite n8n nodes](https://github.com/anysiteio/n8n-nodes-anysite)
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
| **Credentials** | Managed by Anysite | Self-managed |
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
│  Anysite MCP    │
│     Server      │
└────────┬────────┘
         │ REST API
         │
┌────────▼────────┐
│  Anysite API    │ ← OAuth Authentication
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
│   ├── index.ts              # MCP server entry point (Smithery runtime)
│   ├── server.ts             # Server implementation (Traditional MCP)
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
- ✅ All 65+ tools available
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
- **No Credential Storage** - Your API keys stay with Anysite
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

**⭐ Star us on GitHub if Anysite MCP Server helps your AI agents!**

Made with ❤️ by the [Anysite.io](https://anysite.io) team

[Website](https://anysite.io) • [Documentation](https://docs.anysite.io) • [API Playground](https://app.anysite.io)

</div>
