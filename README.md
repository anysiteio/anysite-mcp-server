# AnySite MCP Server
[![smithery badge](https://smithery.ai/badge/@anysite/mcp)](https://smithery.ai/server/@anysite/mcp)

A comprehensive Model Context Protocol (MCP) server providing access to **57 tools** across multiple social media platforms and web services through the AnySite API. This server enables data retrieval, account management, and content extraction from LinkedIn, Instagram, Twitter/X, Reddit, and any website.

---

## Platform Coverage

### LinkedIn (26 tools)
- **Search & Discovery:** User search, Sales Navigator advanced search, email lookup, company search
- **Profile Data:** Complete profiles, posts, reactions, comments, connections, endorsers, certificates
- **Company Data:** Company profiles, employees, posts
- **Management:** Account profile, chat messages, connection requests, post creation & commenting

### Instagram (8 tools)
- **User Data:** Profiles, posts, reels, followers/following
- **Content:** Post details, likes, comments, search posts

### Twitter/X (5 tools)
- **User Data:** Profiles, user search
- **Content:** Posts, post search with advanced filters, tweet details

### Reddit (3 tools)
- **Search:** Post search with filters
- **Content:** Post details, comments

### Web Parser (2 tools)
- **Extraction:** Parse any webpage with flexible filtering, extract contacts/links
- **Discovery:** Fetch website sitemaps

### Other (3 tools)
- **Google Search:** Web search functionality
- **ChatGPT Deep Research:** Optimized search and fetch tools for ChatGPT

---

## Key Features

- **Comprehensive LinkedIn Integration:** 26 tools covering search, profiles, posts, companies, and account management
- **Multi-Platform Support:** Extract data from LinkedIn, Instagram, Twitter, Reddit, and any website
- **Advanced Filtering:** Sales Navigator search, post search with 15+ parameters, flexible web parsing
- **Account Management:** LinkedIn chat, connections, posting (requires ACCOUNT_ID)
- **Web Scraping:** Parse any webpage with CSS selectors, extract contacts, social links
- **Flexible Authentication:** API key-based authentication with optional account management

---

## Tools

AnySite MCP Server exposes several tools through the MCP protocol. Each tool is defined with its name, description, and input parameters:

1. **Search LinkedIn Users**  
   **Name:** `search_linkedin_users`  
   **Description:** Search for LinkedIn users with various filters.  
   **Parameters:**  
   - `keywords` (optional): Any keyword for search.  
   - `first_name`, `last_name`, `title`, `company_keywords`, `school_keywords` (optional).  
   - `current_company`, `past_company`, `location`, `industry`, `education` (optional).  
   - `count` (optional, default: 10): Maximum number of results (max 1000).  
   - `timeout` (optional, default: 300): Timeout in seconds (20–1500).

2. **Get LinkedIn Profile**  
   **Name:** `get_linkedin_profile`  
   **Description:** Retrieve detailed profile information about a LinkedIn user.  
   **Parameters:**  
   - `user` (required): User alias, URL, or URN.  
   - `with_experience`, `with_education`, `with_skills` (optional, default: true).

3. **Get LinkedIn Email User**  
   **Name:** `get_linkedin_email_user`  
   **Description:** Look up LinkedIn user details by email.  
   **Parameters:**  
   - `email` (required): Email address.  
   - `count` (optional, default: 5).  
   - `timeout` (optional, default: 300).

4. **Get LinkedIn User Posts**  
   **Name:** `get_linkedin_user_posts`  
   **Description:** Retrieve posts for a LinkedIn user by URN.  
   **Parameters:**  
   - `urn` (required): User URN (must include prefix, e.g. `fsd_profile:...`).  
   - `count` (optional, default: 10).  
   - `timeout` (optional, default: 300).

5. **Get LinkedIn User Reactions**  
   **Name:** `get_linkedin_user_reactions`  
   **Description:** Retrieve reactions for a LinkedIn user by URN.  
   **Parameters:**  
   - `urn` (required).  
   - `count` (optional, default: 10).  
   - `timeout` (optional, default: 300).

6. **Get LinkedIn User Comments**  
   **Name:** `get_linkedin_user_comments`  
   **Description:** Retrieve comments for a LinkedIn user by URN.  
   **Parameters:**  
   - `urn` (required): User URN (with prefix).  
   - `count` (optional, default: 10).  
   - `timeout` (optional, default: 300).  
   - `commented_after` (optional): Filter comments created after the specified timestamp.

7. **Get LinkedIn Chat Messages**  
   **Name:** `get_linkedin_chat_messages`  
   **Description:** Retrieve top chat messages from the LinkedIn management API.  
   **Parameters:**  
   - `user` (required): User URN (with prefix).  
   - `count` (optional, default: 20).  
   - `timeout` (optional, default: 300).

8. **Send LinkedIn Chat Message**  
   **Name:** `send_linkedin_chat_message`  
   **Description:** Send a chat message using the LinkedIn management API.  
   **Parameters:**  
   - `user` (required): Recipient user URN (with prefix).  
   - `text` (required): Message text.  
   - `timeout` (optional, default: 300).

9. **Send LinkedIn Connection Request**  
   **Name:** `send_linkedin_connection`  
   **Description:** Send a connection invitation to a LinkedIn user.  
   **Parameters:**  
   - `user` (required).  
   - `timeout` (optional, default: 300).

10. **Send LinkedIn Post Comment**  
   **Name:** `send_linkedin_post_comment`  
   **Description:** Create a comment on a LinkedIn post or reply.  
   **Parameters:**  
   - `text` (required): Comment text.  
   - `urn` (required): Activity or comment URN.  
   - `timeout` (optional, default: 300).

11. **Get LinkedIn User Connections**  
    **Name:** `get_linkedin_user_connections`  
    **Description:** Retrieve a list of LinkedIn user connections.  
    **Parameters:**  
    - `connected_after` (optional): Timestamp filter.  
    - `count` (optional, default: 20).  
    - `timeout` (optional, default: 300).

12. **Get LinkedIn Post Reposts**  
    **Name:** `get_linkedin_post_reposts`  
    **Description:** Retrieve reposts for a LinkedIn post.  
    **Parameters:**  
    - `urn` (required): Post URN (must start with `activity:`).  
    - `count` (optional, default: 10).  
    - `timeout` (optional, default: 300).

13. **Get LinkedIn Post Comments**  
    **Name:** `get_linkedin_post_comments`  
    **Description:** Retrieve comments for a LinkedIn post.  
    **Parameters:**  
    - `urn` (required).  
    - `sort` (optional, default: `"relevance"`; allowed values: `"relevance"`, `"recent"`).  
    - `count` (optional, default: 10).  
    - `timeout` (optional, default: 300).

14. **Get LinkedIn Post Reactions**  
    **Name:** `get_linkedin_post_reactions`  
    **Description:** Retrieve reactions for a LinkedIn post.  
    **Parameters:**  
    - `urn` (required): Post URN (must start with `activity:`).  
    - `count` (optional, default: 50).  
    - `timeout` (optional, default: 300).

15. **Get LinkedIn Google Company**  
    **Name:** `get_linkedin_google_company`  
    **Description:** Search for LinkedIn companies via Google – the first result is typically the best match.  
    **Parameters:**  
    - `keywords` (required): Array of company keywords.  
    - `with_urn` (optional, default: false).  
    - `count_per_keyword` (optional, default: 1; range 1–10).  
    - `timeout` (optional, default: 300).

16. **Get LinkedIn Company**  
    **Name:** `get_linkedin_company`  
    **Description:** Retrieve detailed information about a LinkedIn company.  
    **Parameters:**  
    - `company` (required): Company alias, URL, or URN.  
    - `timeout` (optional, default: 300).

17. **Get LinkedIn Company Employees**  
    **Name:** `get_linkedin_company_employees`  
    **Description:** Retrieve employees of a LinkedIn company.  
    **Parameters:**  
    - `companies` (required): Array of company URNs.  
    - `keywords`, `first_name`, `last_name` (optional).  
    - `count` (optional, default: 10).  
    - `timeout` (optional, default: 300).

18. **Search Reddit Posts**  
    **Name:** `search_reddit_posts`  
    **Description:** Search for Reddit posts with various filters.  
    **Parameters:**  
    - `query` (required): Main search query.  
    - `sort` (optional, default: `"relevance"`; allowed values: `"relevance"`, `"hot"`, `"top"`, `"new"`, `"comments"`).  
    - `time_filter` (optional, default: `"all"`; allowed values: `"all"`, `"year"`, `"month"`, `"week"`, `"day"`, `"hour"`).  
    - `count` (required): Max result count.  
    - `timeout` (optional, default: 300).

19. **Get Instagram User**  
    **Name:** `get_instagram_user`  
    **Description:** Get Instagram user information by URL, alias or ID.  
    **Parameters:**  
    - `user` (required): User ID, alias or URL.  
    - `timeout` (optional, default: 300): Timeout in seconds (20-1500).

20. **Get Instagram User Posts**  
    **Name:** `get_instagram_user_posts`  
    **Description:** Get Instagram user posts.  
    **Parameters:**  
    - `user` (required): User ID, alias or URL.  
    - `count` (required): Max result count.  
    - `timeout` (optional, default: 300): Timeout in seconds (20-1500).

21. **Get Instagram Post Comments**
    **Name:** `get_instagram_post_comments`
    **Description:** Get Instagram post comments.
    **Parameters:**
    - `post` (required): Post ID.
    - `count` (required): Max result count.
    - `timeout` (optional, default: 300): Timeout in seconds (20-1500).

22. **Get LinkedIn Company Posts**
    **Name:** `get_linkedin_company_posts`
    **Description:** Get LinkedIn posts for a company by URN.
    **Parameters:**
    - `urn` (required): Company URN (example: company:11130470).
    - `count` (optional, default: 10): Max posts to return.
    - `timeout` (optional, default: 300): Timeout in seconds.

---

## Setup Guide

### Installing via Smithery

To install AnySite MCP Server for Claude Desktop automatically via [Smithery](https://smithery.ai/server/@anysite/mcp):

```bash
npx -y @smithery/cli install @anysite/mcp --client claude
```

### 1. Clone the Repository (macOS)

Open your terminal and run the following commands:

```bash
# Clone the repository
git clone https://github.com/anysite/anysite-mcp-server.git

# Change directory to the project folder
cd anysite-mcp-server

# Install dependencies
npm install
```
### 2. Obtain Your API Credentials

Register at [app.anysite.io](https://app.anysite.io) to get your API key and 100 free credits. You will receive your **ANYSITE_ACCESS_TOKEN** and **ANYSITE_ACCOUNT_ID**.

---

### 3. Configure the Environment

Create a `.env` file in the root of your project with the following content:

```env
ANYSITE_ACCESS_TOKEN=YOUR_ANYSITE_ACCESS_TOKEN
ANYSITE_ACCOUNT_ID=YOUR_ANYSITE_ACCOUNT_ID
```
### 4. Client Configuration

#### 4.1 Claude Desktop

Update your Claude configuration file (`claude_desktop_config.json`) with the following content:

```json
{
  "mcpServers": {
    "anysite": {
      "command": "npx",
      "args": ["-y","@anysite/mcp"],
      "env": {
        "ANYSITE_ACCESS_TOKEN": "YOUR_ANYSITE_ACCESS_TOKEN",
        "ANYSITE_ACCOUNT_ID": "YOUR_ANYSITE_ACCOUNT_ID"
      }
    }
  }
}
```
*Configuration file location:*

- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

---

#### 4.2 Cursor

**Easy way:**
Open Cursor Settings and add a new MCP server with the command:

```bash
env ANYSITE_ACCESS_TOKEN=your-access-token ANYSITE_ACCOUNT_ID=your-account-id node /path/to/your/build/index.js
```
**Safe way:**  
Copy the provided template `run.template.sh` to a new file (e.g. `run.sh`), update it with your credentials, and configure Cursor to run:

```bash
sh /path/to/your/run.sh
```
#### 4.3 Windsurf

Update your Windsurf configuration file (`mcp_config.json`) with the following content:

```json
{
  "mcpServers": {
    "anysite": {
      "command": "npx",
      "args": ["-y","@anysite/mcp"],
      "env": {
        "ANYSITE_ACCESS_TOKEN": "YOUR_ANYSITE_ACCESS_TOKEN",
        "ANYSITE_ACCOUNT_ID": "YOUR_ANYSITE_ACCOUNT_ID"
      }
    }
  }
}
```
**Note:** After configuration, you can disable official web tools to conserve your API credits.

---

### MCP Client Example Configuration

Below is an example configuration for an MCP client (e.g., a custom integration):

```json
{
  "mcpServers": {
    "anysite": {
      "command": "npx",
      "args": ["-y","@anysite/mcp"],
      "env": {
        "ANYSITE_ACCESS_TOKEN": "YOUR_ANYSITE_ACCESS_TOKEN",
        "ANYSITE_ACCOUNT_ID": "YOUR_ANYSITE_ACCOUNT_ID"
      }
    }
  }
}
```
Replace the paths and credentials with your own values.
## License

This project is licensed under the [MIT License](LICENSE.md).
