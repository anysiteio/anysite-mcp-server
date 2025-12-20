# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a comprehensive Model Context Protocol (MCP) server providing **71 tools** across multiple platforms through the Anysite API:

- **LinkedIn (35 tools):** User search, Sales Navigator, profiles, posts, reactions, comments, endorsers, certificates, email lookup, chat, connections, company data, management operations, education, experience, skills, honors, patents, languages, groups, search extensions (educations/locations/industries/jobs/companies)
- **Instagram (8 tools):** User profiles, posts, reels, likes, comments, followers/following, post search
- **Twitter/X (4 tools):** User profiles, user search, posts, advanced post search with 15+ filters
- **Reddit (5 tools):** Post search with filters, post details, comments, user posts, user comments
- **YouTube (3 tools):** Video search, video details, subtitles extraction
- **SEC (2 tools):** Company search in SEC EDGAR, document retrieval
- **Y Combinator (3 tools):** Company lookup, company search, founder search
- **DuckDuckGo (1 tool):** Web search
- **Web Parser (2 tools):** Webpage parsing with 14+ filter options, sitemap extraction
- **Other (2 tools):** ChatGPT Deep Research (search/fetch) tools

This server enables data retrieval, account management, content extraction, and web scraping capabilities across all major social platforms, video content, financial data (SEC), and startup ecosystems (Y Combinator).

## Build and Development Commands

- `npm run build` - Compile TypeScript to JavaScript and make executable
- `npm run prepare` - Runs build automatically (used by npm during install)
- `npm run watch` - Watch mode for development, recompiles on changes
- `npm run inspector` - Launch MCP inspector for debugging tools

## Code Architecture

### Entry Point (`src/index.ts`)
- Smithery TypeScript runtime adapter implementation
- Exports executable CLI tools: `anysite-mcp`, `anysite`, `mcp`
- Uses Model Context Protocol SDK for server functionality
- Implements 71 tools across LinkedIn, Instagram, Twitter/X, Reddit, YouTube, SEC, Y Combinator, DuckDuckGo, and Web Parser

### Type System (`src/types.ts`)
- Complete TypeScript definitions for all API endpoints
- Input validation functions for each tool (e.g., `isValidLinkedinSearchUsersArgs`)
- Complex nested interfaces for LinkedIn entities (posts, comments, reactions, users)
- Validation ensures data integrity and proper API parameter handling

### Key Components

#### Environment Configuration
- Requires `ANYSITE_ACCESS_TOKEN` for API authentication
- Optional `ANYSITE_ACCOUNT_ID` for management endpoints (chat, connections, posting)
- Supports `.env` file and `~/.anysite-mcp.env` for configuration

#### API Structure
- Base URL: `https://api.anysite.io`
- All endpoints use POST requests with JSON payloads
- Comprehensive error handling and logging
- Timeout support (20-1500 seconds) for long-running operations

#### Tool Categories
1. **LinkedIn Search & Lookup** (11 tools): User search, Sales Navigator search, profile lookup, email lookup (search & database), company search, education search, location search, industry search, job search
2. **LinkedIn Posts & Content** (7 tools): User posts, reactions, comments, post search, post comments/reactions/reposts, company posts
3. **LinkedIn User Data** (10 tools): Connections, conversations, endorsers, certificates, education, experience, skills, honors, patents, languages
4. **LinkedIn Management** (5 tools): Account profile, chat messages/attachments, connection requests, post creation/commenting, company mentions
5. **LinkedIn Company Data** (5 tools): Company lookup, employee search, employee stats, Google company search, company posts
6. **LinkedIn Groups** (1 tool): Group information
7. **Instagram** (8 tools): User profiles, posts, reels, likes, comments, followers/following, post search
8. **Twitter/X** (4 tools): User profiles, user search, posts, advanced post search
9. **Reddit** (5 tools): Post search, post details, comments, user posts, user comments
10. **YouTube** (3 tools): Video search, video details, subtitles
11. **SEC** (2 tools): Company search, document retrieval
12. **Y Combinator** (3 tools): Company information, company search, founder search
13. **DuckDuckGo** (1 tool): Web search
14. **Web Parser** (2 tools): Webpage parsing with flexible filtering, sitemap extraction
15. **Other** (2 tools): ChatGPT Deep Research tools

### URN Format Requirements
- User URNs must include `fsd_profile:` prefix (e.g., `fsd_profile:ACoAAEWn01Q...`)
- Post URNs use `activity:` prefix (e.g., `activity:7234173400267538433`)
- Company URNs use `company:` prefix
- System automatically normalizes URN formats when possible

### LinkedIn Sales Navigator Integration
- Advanced user search with 15+ filter categories
- Supports complex filtering: location, education, languages, job functions, company sizes
- Enum-based validation for predefined filter values

### Error Handling Pattern
- All API calls wrapped in try-catch with detailed logging
- Structured error responses with `isError: true` flag
- Timestamp-based logging for debugging
- Graceful handling of API rate limits and timeouts

## Development Notes

- TypeScript with strict mode enabled
- ES2022 target with Node16 module resolution  
- Output directory: `./build/`
- Uses dotenv for environment variable management
- Comprehensive input validation before API calls
- All tools return JSON responses formatted for MCP clients

## API Usage Patterns

When extending functionality:
1. Add interface to `types.ts` with validation function
2. Define tool schema in `index.ts` with proper input validation
3. Implement handler in the main switch statement
4. Follow existing error handling patterns
5. Add appropriate logging for debugging

## Environment Setup

Required environment variables:
- `ANYSITE_ACCESS_TOKEN` - API authentication token
- `ANYSITE_ACCOUNT_ID` - Account ID for management operations (optional for read-only)

The server will exit with error code 1 if `ANYSITE_ACCESS_TOKEN` is missing.