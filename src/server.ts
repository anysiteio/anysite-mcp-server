#!/usr/bin/env node

// Debug logging to stderr (won't interfere with STDIO transport)
const debugLog = (...args: any[]) => {
  console.error(`[DEBUG ${new Date().toISOString()}]`, ...args);
};

debugLog("Server script starting...");
debugLog("Environment variables present:", {
  ANYSITE_ACCESS_TOKEN: !!process.env.ANYSITE_ACCESS_TOKEN,
  ANYSITE_ACCOUNT_ID: !!process.env.ANYSITE_ACCOUNT_ID,
  HOME: process.env.HOME,
  NODE_ENV: process.env.NODE_ENV
});

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListToolsRequestSchema,
  CallToolRequestSchema,
  ErrorCode,
  McpError,
  Tool
} from "@modelcontextprotocol/sdk/types.js";
import dotenv from "dotenv";
import https from "https";
import { Buffer } from "buffer";
import {
  LinkedinSearchUsersArgs,
  LinkedinUserProfileArgs,
  LinkedinEmailUserArgs,
  LinkedinUserPostsArgs,
  LinkedinUserReactionsArgs,
  LinkedinUserCommentsArgs,
  LinkedinChatMessagesArgs,
  SendLinkedinChatMessageArgs,
  SendLinkedinConnectionArgs,
  SendLinkedinPostCommentArgs,
  GetLinkedinUserConnectionsArgs,
  GetLinkedinPostRepostsArgs,
  GetLinkedinPostCommentsArgs,
  GetLinkedinPostReactionsArgs,
  GetLinkedinGoogleCompanyArgs,
  GetLinkedinCompanyArgs,
  GetLinkedinCompanyEmployeesArgs,
  SendLinkedinPostArgs,
  LinkedinSalesNavigatorSearchUsersArgs,
  LinkedinManagementConversationsPayload,
  GoogleSearchPayload,
  LinkedinSearchPostsArgs,
  RedditSearchPostsArgs,
  RedditPostsArgs,
  RedditPostCommentsArgs,
  InstagramUserArgs,
  InstagramUserPostsArgs,
  InstagramPostCommentsArgs,
  LinkedinCompanyPostsArgs,
  LinkedinUserEndorsersArgs,
  LinkedinUserCertificatesArgs,
  LinkedinUserEmailDbArgs,
  LinkedinManagementMeArgs,
  InstagramPostArgs,
  InstagramPostLikesArgs,
  InstagramUserFriendshipsArgs,
  InstagramSearchPostsArgs,
  InstagramUserReelsArgs,
  TwitterUserArgs,
  TwitterSearchUsersArgs,
  TwitterUserPostsArgs,
  TwitterSearchPostsArgs,
  TwitterPostArgs,
  WebParserParseArgs,
  WebParserSitemapArgs,
  ChatGPTSearchArgs,
  ChatGPTFetchArgs,
  isValidLinkedinSearchUsersArgs,
  isValidLinkedinUserProfileArgs,
  isValidLinkedinEmailUserArgs,
  isValidLinkedinUserPostsArgs,
  isValidLinkedinUserReactionsArgs,
  isValidLinkedinUserCommentsArgs,
  isValidLinkedinChatMessagesArgs,
  isValidSendLinkedinChatMessageArgs,
  isValidSendLinkedinConnectionArgs,
  isValidSendLinkedinPostCommentArgs,
  isValidGetLinkedinUserConnectionsArgs,
  isValidGetLinkedinPostRepostsArgs,
  isValidGetLinkedinPostCommentsArgs,
  isValidGetLinkedinPostReactionsArgs,
  isValidGetLinkedinGoogleCompanyArgs,
  isValidGetLinkedinCompanyArgs,
  isValidGetLinkedinCompanyEmployeesArgs,
  isValidSendLinkedinPostArgs,
  isValidLinkedinSalesNavigatorSearchUsersArgs,
  isValidLinkedinManagementConversationsArgs,
  isValidGoogleSearchPayload,
  isValidLinkedinSearchPostsArgs,
  isValidRedditSearchPostsArgs,
  isValidRedditPostsArgs,
  isValidRedditPostCommentsArgs,
  isValidInstagramUserArgs,
  isValidInstagramUserPostsArgs,
  isValidInstagramPostCommentsArgs,
  isValidLinkedinCompanyPostsArgs,
  isValidLinkedinUserEndorsersArgs,
  isValidLinkedinUserCertificatesArgs,
  isValidLinkedinUserEmailDbArgs,
  isValidLinkedinManagementMeArgs,
  isValidInstagramPostArgs,
  isValidInstagramPostLikesArgs,
  isValidInstagramUserFriendshipsArgs,
  isValidInstagramSearchPostsArgs,
  isValidInstagramUserReelsArgs,
  isValidTwitterUserArgs,
  isValidTwitterSearchUsersArgs,
  isValidTwitterUserPostsArgs,
  isValidTwitterSearchPostsArgs,
  isValidTwitterPostArgs,
  isValidWebParserParseArgs,
  isValidWebParserSitemapArgs,
  isValidChatGPTSearchArgs,
  isValidChatGPTFetchArgs
} from "./types.js";

debugLog("Loading dotenv...");
try {
  dotenv.config();
  if (process.env.HOME) {
    dotenv.config({ path: `${process.env.HOME}/.anysite-mcp.env` });
  }
} catch (error) {
  debugLog("Error loading .env file:", error);
}

debugLog("After dotenv, environment variables:", {
  ANYSITE_ACCESS_TOKEN: !!process.env.ANYSITE_ACCESS_TOKEN,
  ANYSITE_ACCOUNT_ID: !!process.env.ANYSITE_ACCOUNT_ID
});

// Lazy getters for API credentials - only check when actually needed
function getApiKey(): string {
  const apiKey = process.env.ANYSITE_ACCESS_TOKEN;
  if (!apiKey) {
    throw new Error("ANYSITE_ACCESS_TOKEN environment variable is required");
  }
  return apiKey;
}

function getAccountId(): string | undefined {
  return process.env.ANYSITE_ACCOUNT_ID;
}

const API_KEY = getApiKey;
const ACCOUNT_ID = getAccountId;

debugLog("Environment configuration successful");

const API_CONFIG = {
  BASE_URL: "https://api.anysite.io",
  DEFAULT_QUERY: "software engineer",
  ENDPOINTS: {
    SEARCH_USERS: "/api/linkedin/search/users",
    USER_PROFILE: "/api/linkedin/user",
    USER_EXPERIENCE: "/api/linkedin/user/experience",
    USER_EDUCATION: "/api/linkedin/user/education",
    USER_SKILLS: "/api/linkedin/user/skills",
    LINKEDIN_EMAIL: "/api/linkedin/email/user",
    LINKEDIN_USER_POSTS: "/api/linkedin/user/posts",
    LINKEDIN_USER_REACTIONS: "/api/linkedin/user/reactions",
    LINKEDIN_USER_COMMENTS: "/api/linkedin/user/comments",
    LINKEDIN_SEARCH_POSTS: "/api/linkedin/search/posts",
    REDDIT_SEARCH_POSTS: "/api/reddit/search/posts",
    REDDIT_POSTS: "/api/reddit/posts",
    REDDIT_POST_COMMENTS: "/api/reddit/posts/comments",
    CHAT_MESSAGES: "/api/linkedin/management/chat/messages",
    CHAT_MESSAGE: "/api/linkedin/management/chat/message",
    USER_CONNECTION: "/api/linkedin/management/user/connection",
    USER_CONNECTIONS: "/api/linkedin/management/user/connections",
    POST_COMMENT: "/api/linkedin/management/post/comment",
    LINKEDIN_POST: "/api/linkedin/management/post",
    LINKEDIN_POST_REPOSTS: "/api/linkedin/post/reposts",
    LINKEDIN_POST_COMMENTS: "/api/linkedin/post/comments",
    LINKEDIN_POST_REACTIONS: "/api/linkedin/post/reactions",
    LINKEDIN_GOOGLE_COMPANY: "/api/linkedin/google/company",
    LINKEDIN_COMPANY: "/api/linkedin/company",
    LINKEDIN_COMPANY_EMPLOYEES: "/api/linkedin/company/employees",
    LINKEDIN_COMPANY_POSTS: "/api/linkedin/company/posts",
    LINKEDIN_SN_SEARCH_USERS: "/api/linkedin/sn_search/users",
    CONVERSATIONS: "/api/linkedin/management/conversations",
    GOOGLE_SEARCH: "/api/google/search",
    INSTAGRAM_USER: "/api/instagram/user",
    INSTAGRAM_USER_POSTS: "/api/instagram/user/posts",
    INSTAGRAM_POST_COMMENTS: "/api/instagram/post/comments",
    // New LinkedIn endpoints
    LINKEDIN_USER_ENDORSERS: "/api/linkedin/user/endorsers",
    LINKEDIN_USER_CERTIFICATES: "/api/linkedin/user/certificates",
    LINKEDIN_USER_EMAIL_DB: "/api/linkedin/user/email",
    LINKEDIN_MANAGEMENT_ME: "/api/linkedin/management/me",
    // New Instagram endpoints
    INSTAGRAM_POST: "/api/instagram/post",
    INSTAGRAM_POST_LIKES: "/api/instagram/post/likes",
    INSTAGRAM_USER_FRIENDSHIPS: "/api/instagram/user/friendships",
    INSTAGRAM_SEARCH_POSTS: "/api/instagram/search/posts",
    INSTAGRAM_USER_REELS: "/api/instagram/user/reels",
    // Twitter/X endpoints
    TWITTER_USER: "/api/twitter/user",
    TWITTER_SEARCH_USERS: "/api/twitter/search/users",
    TWITTER_USER_POSTS: "/api/twitter/user/posts",
    TWITTER_SEARCH_POSTS: "/api/twitter/search/posts",
    TWITTER_POST: "/api/twitter/post",
    // Web Parser endpoints
    WEBPARSER_PARSE: "/api/webparser/parse",
    WEBPARSER_SITEMAP: "/api/webparser/sitemap",
  }
} as const;

function formatError(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

function log(message: string, ...args: any[]) {
  console.error(`[${new Date().toISOString()}] ${message}`, ...args);
}


async function makeRequest(endpoint: string, data: any, method: string = "POST"): Promise<any> {
  const baseUrl = API_CONFIG.BASE_URL.replace(/\/+$/, "");
  const url = baseUrl + (endpoint.startsWith("/") ? endpoint : `/${endpoint}`);
  const headers = new Headers();
  headers.append("Content-Type", "application/json");
  headers.append("access-token", API_KEY());
  const options: RequestInit = {
    method,
    headers,
    body: JSON.stringify(data)
  };
  log(`Making ${method} request to ${endpoint} with data: ${JSON.stringify(data)}`);
  const startTime = Date.now();
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`API error: ${response.status} ${errorData.message || response.statusText}`);
    }
    const result = await response.json();
    log(`API request to ${endpoint} completed in ${Date.now() - startTime}ms`);
    return result;
  } catch (error) {
    log(`API request to ${endpoint} failed after ${Date.now() - startTime}ms:`, error);
    throw error;
  }
}

function normalizeUserURN(urn: string): string {
  if (!urn.includes(":")) {
    log(`Warning: URN format might be missing a prefix. Adding "fsd_profile:" to: ${urn}`);
    return `fsd_profile:${urn}`;
  }
  return urn;
}

function isValidUserURN(urn: string): boolean {
  return urn.startsWith("fsd_profile:");
}

const SEARCH_LINKEDIN_USERS_TOOL: Tool = {
  name: "search_linkedin_users",
  description: "Search for LinkedIn users with various filters like keywords, name, title, company, location etc.",
  inputSchema: {
    type: "object",
    properties: {
      keywords: { type: "string", description: "Any keyword for searching in the user page." },
      first_name: { type: "string", description: "Exact first name" },
      last_name: { type: "string", description: "Exact last name" },
      title: { type: "string", description: "Exact word in the title" },
      company_keywords: { type: "string", description: "Exact word in the company name" },
      school_keywords: { type: "string", description: "Exact word in the school name" },
      current_company: { type: "string", description: "Company URN or name" },
      past_company: { type: "string", description: "Past company URN or name" },
      location: { type: "string", description: "Location name or URN" },
      industry: { type: "string", description: "Industry URN or name" },
      education: { type: "string", description: "Education URN or name" },
      count: { type: "number", description: "Maximum number of results (max 1000)", default: 10 },
      timeout: { type: "number", description: "Timeout in seconds (20-1500)", default: 300 }
    },
    required: ["count"]
  }
};

const GET_LINKEDIN_PROFILE_TOOL: Tool = {
  name: "get_linkedin_profile",
  description: "Get detailed information about a LinkedIn user profile",
  inputSchema: {
    type: "object",
    properties: {
      user: { type: "string", description: "User alias, URL, or URN" },
      with_experience: { type: "boolean", description: "Include experience info", default: true },
      with_education: { type: "boolean", description: "Include education info", default: true },
      with_skills: { type: "boolean", description: "Include skills info", default: true }
    },
    required: ["user"]
  }
};

const GET_LINKEDIN_EMAIL_TOOL: Tool = {
  name: "get_linkedin_email_user",
  description: "Get LinkedIn user details by email",
  inputSchema: {
    type: "object",
    properties: {
      email: { type: "string", description: "Email address" },
      count: { type: "number", description: "Max results", default: 5 },
      timeout: { type: "number", description: "Timeout in seconds", default: 300 }
    },
    required: ["email"]
  }
};

const GET_LINKEDIN_USER_POSTS_TOOL: Tool = {
  name: "get_linkedin_user_posts",
  description: "Get LinkedIn posts for a user by URN (must include prefix, example: fsd_profile:ACoAAEWn01QBWENVMWqyM3BHfa1A-xsvxjdaXsY)",
  inputSchema: {
    type: "object",
    properties: {
      urn: { type: "string", description: "User URN (must include prefix, example: fsd_profile:ACoAA...)" },
      count: { type: "number", description: "Max posts", default: 10 },
      timeout: { type: "number", description: "Timeout in seconds", default: 300 }
    },
    required: ["urn"]
  }
};

const GET_LINKEDIN_USER_REACTIONS_TOOL: Tool = {
  name: "get_linkedin_user_reactions",
  description: "Get LinkedIn reactions for a user by URN (must include prefix, example: fsd_profile:ACoAA...)",
  inputSchema: {
    type: "object",
    properties: {
      urn: { type: "string", description: "User URN (must include prefix, example: fsd_profile:ACoAA...)" },
      count: { type: "number", description: "Max reactions", default: 10 },
      timeout: { type: "number", description: "Timeout in seconds", default: 300 }
    },
    required: ["urn"]
  }
};

const GET_LINKEDIN_USER_COMMENTS_TOOL: Tool = {
  name: "get_linkedin_user_comments",
  description: "Get LinkedIn comments for a user by URN (must include prefix, example: fsd_profile:ACoAA...)",
  inputSchema: {
    type: "object",
    properties: {
      urn: { type: "string", description: "User URN (must include prefix, example: fsd_profile:ACoAA...)" },
      count: { type: "number", description: "Max comments", default: 10 },
      timeout: { type: "number", description: "Timeout in seconds", default: 300 },
      commented_after: { type: "number", description: "Filter comments that created after the specified date. Accepts timestamp" }
    },
    required: ["urn"]
  }
};

const GET_CHAT_MESSAGES_TOOL: Tool = {
  name: "get_linkedin_chat_messages",
  description: "Get top chat messages from LinkedIn management API. Account ID is taken from environment.",
  inputSchema: {
    type: "object",
    properties: {
      user: { type: "string", description: "User URN for filtering messages (must include prefix, e.g. fsd_profile:ACoAA...)" },
      company: { type: "string", description: "Company URN where the account is admin (format: company:123456)", default: undefined },
      count: { type: "number", description: "Max messages to return", default: 20 },
      timeout: { type: "number", description: "Timeout in seconds", default: 300 }
    },
    required: ["user"]
  }
};

const SEND_CHAT_MESSAGE_TOOL: Tool = {
  name: "send_linkedin_chat_message",
  description: "Send a chat message via LinkedIn management API. Account ID is taken from environment.",
  inputSchema: {
    type: "object",
    properties: {
      user: { type: "string", description: "Recipient user URN (must include prefix, e.g. fsd_profile:ACoAA...)" },
      company: { type: "string", description: "Company URN where the account is admin (format: company:123456)", default: undefined },
      text: { type: "string", description: "Message text" },
      timeout: { type: "number", description: "Timeout in seconds", default: 300 }
    },
    required: ["user", "text"]
  }
};

const SEND_CONNECTION_REQUEST_TOOL: Tool = {
  name: "send_linkedin_connection",
  description: "Send a connection invitation to LinkedIn user. Account ID is taken from environment.",
  inputSchema: {
    type: "object",
    properties: {
      user: { type: "string", description: "Recipient user URN (must include prefix, e.g. fsd_profile:ACoAA...)" },
      timeout: { type: "number", description: "Timeout in seconds", default: 300 }
    },
    required: ["user"]
  }
};

const POST_COMMENT_TOOL: Tool = {
  name: "send_linkedin_post_comment",
  description: "Create a comment on a LinkedIn post or on another comment. Account ID is taken from environment.",
  inputSchema: {
    type: "object",
    properties: {
      text: { type: "string", description: "Comment text" },
      urn: {
        type: "string",
        description: "URN of the activity or comment to comment on (e.g., 'activity:123' or 'comment:(activity:123,456)')"
      },
      timeout: { type: "number", description: "Timeout in seconds", default: 300 }
    },
    required: ["text", "urn"]
  }
};

const SEND_LINKEDIN_POST_TOOL: Tool = {
  name: "send_linkedin_post",
  description: "Create a post on LinkedIn. Account ID is taken from environment.",
  inputSchema: {
    type: "object",
    properties: {
      text: { type: "string", description: "Post text content" },
      visibility: {
        type: "string",
        description: "Post visibility",
        enum: ["ANYONE", "CONNECTIONS_ONLY"],
        default: "ANYONE"
      },
      comment_scope: {
        type: "string",
        description: "Who can comment on the post",
        enum: ["ALL", "CONNECTIONS_ONLY", "NONE"],
        default: "ALL"
      },
      timeout: { type: "number", description: "Timeout in seconds", default: 300 }
    },
    required: ["text"]
  }
};

const GET_USER_CONNECTIONS_TOOL: Tool = {
  name: "get_linkedin_user_connections",
  description: "Get list of LinkedIn user connections. Account ID is taken from environment.",
  inputSchema: {
    type: "object",
    properties: {
      connected_after: { type: "number", description: "Filter users that added after the specified date (timestamp)" },
      count: { type: "number", description: "Max connections to return", default: 20 },
      timeout: { type: "number", description: "Timeout in seconds", default: 300 }
    },
    required: []
  }
};

const GET_LINKEDIN_POST_REPOSTS_TOOL: Tool = {
  name: "get_linkedin_post_reposts",
  description: "Get LinkedIn reposts for a post by URN",
  inputSchema: {
    type: "object",
    properties: {
      urn: { type: "string", description: "Post URN, only activity urn type is allowed (example: activity:7234173400267538433)" },
      count: { type: "number", description: "Max reposts to return", default: 50 },
      timeout: { type: "number", description: "Timeout in seconds", default: 300 }
    },
    required: ["urn", "count"]
  }
};

const GET_LINKEDIN_POST_COMMENTS_TOOL: Tool = {
  name: "get_linkedin_post_comments",
  description: "Get LinkedIn comments for a post by URN",
  inputSchema: {
    type: "object",
    properties: {
      urn: { type: "string", description: "Post URN, only activity urn type is allowed (example: activity:7234173400267538433)" },
      sort: { type: "string", description: "Sort type (relevance or recent)", enum: ["relevance", "recent"], default: "relevance" },
      count: { type: "number", description: "Max comments to return", default: 10 },
      timeout: { type: "number", description: "Timeout in seconds", default: 300 }
    },
    required: ["urn", "count"]
  }
};

const GET_LINKEDIN_POST_REACTIONS_TOOL: Tool = {
  name: "get_linkedin_post_reactions",
  description: "Get LinkedIn reactions for a post by URN",
  inputSchema: {
    type: "object",
    properties: {
      urn: { type: "string", description: "Post URN, only activity urn type is allowed (example: activity:7234173400267538433)" },
      count: { type: "number", description: "Max reactions to return", default: 50 },
      timeout: { type: "number", description: "Timeout in seconds", default: 300 }
    },
    required: ["urn", "count"]
  }
};

const GET_LINKEDIN_GOOGLE_COMPANY_TOOL: Tool = {
  name: "get_linkedin_google_company",
  description: "Search for LinkedIn companies using Google search. First result is usually the best match.",
  inputSchema: {
    type: "object",
    properties: {
      keywords: {
        type: "array",
        items: { type: "string" },
        description: "Company keywords for search. For example, company name or company website",
        examples: [["Software as a Service (SaaS)"], ["google.com"]]
      },
      with_urn: { type: "boolean", description: "Include URNs in response (increases execution time)", default: false },
      count_per_keyword: { type: "number", description: "Max results per keyword", default: 1, minimum: 1, maximum: 10 },
      timeout: { type: "number", description: "Timeout in seconds", default: 300 }
    },
    required: ["keywords"]
  }
};

const GET_LINKEDIN_COMPANY_TOOL: Tool = {
  name: "get_linkedin_company",
  description: "Get detailed information about a LinkedIn company",
  inputSchema: {
    type: "object",
    properties: {
      company: { type: "string", description: "Company Alias or URL or URN (example: 'openai' or 'company:1441')" },
      timeout: { type: "number", description: "Timeout in seconds", default: 300 }
    },
    required: ["company"]
  }
};

const GET_LINKEDIN_COMPANY_EMPLOYEES_TOOL: Tool = {
  name: "get_linkedin_company_employees",
  description: "Get employees of a LinkedIn company",
  inputSchema: {
    type: "object",
    properties: {
      companies: {
        type: "array",
        items: { type: "string" },
        description: "Company URNs (example: ['company:14064608'])"
      },
      keywords: { type: "string", description: "Any keyword for searching employees", examples: ["Alex"] },
      first_name: { type: "string", description: "Search for exact first name", examples: ["Bill"] },
      last_name: { type: "string", description: "Search for exact last name", examples: ["Gates"] },
      count: { type: "number", description: "Maximum number of results", default: 10 },
      timeout: { type: "number", description: "Timeout in seconds", default: 300 }
    },
    required: ["companies", "count"]
  }
};

const LINKEDIN_SN_SEARCH_USERS_TOOL: Tool = {
  name: "linkedin_sn_search_users",
  description: "Advanced search for LinkedIn users using Sales Navigator filters",
  inputSchema: {
    type: "object",
    properties: {
      keywords: {
        type: "string",
        description: "Any keyword for searching in the user profile. Using this may reduce result count."
      },
      first_names: {
        type: "array",
        items: { type: "string" },
        description: "Exact first names to search for"
      },
      last_names: {
        type: "array",
        items: { type: "string" },
        description: "Exact last names to search for"
      },
      current_titles: {
        type: "array",
        items: { type: "string" },
        description: "Exact words to search in current titles"
      },
      location: {
        type: ["string", "array"],
        items: { type: "string" },
        description: "Location URN (geo:*) or name, or array of them"
      },
      education: {
        type: ["string", "array"],
        items: { type: "string" },
        description: "Education URN (company:*) or name, or array of them"
      },
      languages: {
        type: "array",
        items: {
          type: "string",
          enum: [
            "Arabic", "English", "Spanish", "Portuguese", "Chinese",
            "French", "Italian", "Russian", "German", "Dutch",
            "Turkish", "Tagalog", "Polish", "Korean", "Japanese",
            "Malay", "Norwegian", "Danish", "Romanian", "Swedish",
            "Bahasa Indonesia", "Czech"
          ]
        },
        description: "Profile languages"
      },
      past_titles: {
        type: "array",
        items: { type: "string" },
        description: "Exact words to search in past titles"
      },
      functions: {
        type: "array",
        items: {
          type: "string",
          enum: [
            "Accounting", "Administrative", "Arts and Design", "Business", "Development",
            "Community and Social Services", "Consulting", "Education", "Engineering",
            "Entrepreneurship", "Finance", "Healthcare Services", "Human Resources",
            "Information Technology", "Legal", "Marketing", "Media and Communication",
            "Military and Protective Services", "Operations", "Product Management",
            "Program and Project Management", "Purchasing", "Quality Assurance",
            "Research", "Real Estate", "Sales", "Customer Success and Support"
          ]
        },
        description: "Job functions"
      },
      levels: {
        type: "array",
        items: {
          type: "string",
          enum: [
            "Entry", "Director", "Owner", "CXO", "Vice President",
            "Experienced Manager", "Entry Manager", "Strategic", "Senior", "Trainy"
          ]
        },
        description: "Job seniority levels"
      },
      years_in_the_current_company: {
        type: "array",
        items: {
          type: "string",
          enum: ["0-1", "1-2", "3-5", "6-10", "10+"]
        },
        description: "Years in current company ranges"
      },
      years_in_the_current_position: {
        type: "array",
        items: {
          type: "string",
          enum: ["0-1", "1-2", "3-5", "6-10", "10+"]
        },
        description: "Years in current position ranges"
      },
      company_sizes: {
        type: "array",
        items: {
          type: "string",
          enum: [
            "Self-employed", "1-10", "11-50", "51-200", "201-500",
            "501-1,000", "1,001-5,000", "5,001-10,000", "10,001+"
          ]
        },
        description: "Company size ranges"
      },
      company_types: {
        type: "array",
        items: {
          type: "string",
          enum: [
            "Public Company", "Privately Held", "Non Profit",
            "Educational Institution", "Partnership", "Self Employed",
            "Self Owned", "Government Agency"
          ]
        },
        description: "Company types"
      },
      company_locations: {
        type: ["string", "array"],
        items: { type: "string" },
        description: "Company location URN (geo:*) or name, or array of them"
      },
      current_companies: {
        type: ["string", "array"],
        items: { type: "string" },
        description: "Current company URN (company:*) or name, or array of them"
      },
      past_companies: {
        type: ["string", "array"],
        items: { type: "string" },
        description: "Past company URN (company:*) or name, or array of them"
      },
      industry: {
        type: ["string", "array"],
        items: { type: "string" },
        description: "Industry URN (industry:*) or name, or array of them"
      },
      count: {
        type: "number",
        description: "Maximum number of results (max 2500)",
        default: 10,
        minimum: 1,
        maximum: 2500
      },
      timeout: {
        type: "number",
        description: "Timeout in seconds (20-1500)",
        default: 300,
        minimum: 20,
        maximum: 1500
      }
    },
    required: ["count"]
  }
};

const GET_LINKEDIN_CONVERSATIONS_TOOL: Tool = {
  name: "get_linkedin_conversations",
  description: "Get list of LinkedIn conversations from the messaging interface. Account ID is taken from environment.",
  inputSchema: {
    type: "object",
    properties: {
      connected_after: { type: "number", description: "Filter conversations created after the specified date (timestamp)" },
      count: { type: "number", description: "Max conversations to return", default: 20 },
      timeout: { type: "number", description: "Timeout in seconds", default: 300 }
    },
    required: []
  }
};

const GOOGLE_SEARCH_TOOL: Tool = {
  name: "google_search",
  description: "Search for information using Google search API",
  inputSchema: {
    type: "object",
    properties: {
      query: { type: "string", description: "Search query. For example: 'python fastapi'" },
      count: { type: "number", description: "Maximum number of results (from 1 to 20)", default: 10 },
      timeout: { type: "number", description: "Timeout in seconds (20-1500)", default: 300 }
    },
    required: ["query"]
  }
};

const LINKEDIN_SEARCH_POSTS_TOOL: Tool = {
  name: "search_linkedin_posts",
  description: "Search for LinkedIn posts with various filters like keywords, content type, authors, etc.",
  inputSchema: {
    type: "object",
    properties: {
      keywords: { type: "string", description: "Any keyword for searching in the post. For exact search put desired keywords into brackets", default: "" },
      sort: { type: "string", description: "Sort type", enum: ["relevance"], default: "relevance" },
      date_posted: { type: "string", description: "Date posted", enum: ["past-month", "past-week", "past-24h"], default: "past-month" },
      content_type: { type: "string", description: "Desired content type", enum: ["videos", "photos", "jobs", "live_videos", "documents"] },
      mentioned: { type: "array", items: { type: "string" }, description: "Mentioned users URN in posts" },
      authors: { type: "array", items: { type: "string" }, description: "Authors URN of posts" },
      author_industries: { 
        oneOf: [
          { type: "array", items: { type: "string" } },
          { type: "string" }
        ], 
        description: "Industry URN, can be obtained in /linkedin/search/industries. Or industry name." 
      },
      author_title: { type: "string", description: "Author job title." },
      count: { type: "number", description: "Max result count" },
      timeout: { type: "number", description: "Max scrapping execution timeout (in seconds)", default: 300, minimum: 20, maximum: 1500 }
    },
    required: ["count"]
  }
};

const REDDIT_SEARCH_POSTS_TOOL: Tool = {
  name: "search_reddit_posts",
  description: "Search for Reddit posts with various filters",
  inputSchema: {
    type: "object",
    properties: {
      query: { type: "string", description: "Main search query" },
      sort: { type: "string", description: "Type of search results sorting", enum: ["relevance", "hot", "top", "new", "comments"], default: "relevance" },
      time_filter: { type: "string", description: "Time filter for search results", enum: ["all", "year", "month", "week", "day", "hour"], default: "all" },
      count: { type: "number", description: "Max result count" },
      timeout: { type: "number", description: "Max scrapping execution timeout (in seconds)", default: 300, minimum: 20, maximum: 1500 }
    },
    required: ["query", "count"]
  }
};

const REDDIT_POSTS_TOOL: Tool = {
  name: "get_reddit_posts",
  description: "Get detailed information about Reddit posts by post URL",
  inputSchema: {
    type: "object",
    properties: {
      post_url: { type: "string", description: "Reddit post URL (e.g., '/r/DogAdvice/comments/1o2g2pq/i_think_i_need_to_rehome_my_dog/')" },
      timeout: { type: "number", description: "Max scrapping execution timeout (in seconds)", default: 300, minimum: 20, maximum: 1500 }
    },
    required: ["post_url"]
  }
};

const REDDIT_POST_COMMENTS_TOOL: Tool = {
  name: "get_reddit_post_comments",
  description: "Get comments for a Reddit post by post URL",
  inputSchema: {
    type: "object",
    properties: {
      post_url: { type: "string", description: "Reddit post URL (e.g., '/r/DogAdvice/comments/1o2g2pq/i_think_i_need_to_rehome_my_dog/')" },
      timeout: { type: "number", description: "Max scrapping execution timeout (in seconds)", default: 300, minimum: 20, maximum: 1500 }
    },
    required: ["post_url"]
  }
};

const INSTAGRAM_USER_TOOL: Tool = {
  name: "get_instagram_user",
  description: "Get Instagram user information by URL, alias or ID",
  inputSchema: {
    type: "object",
    properties: {
      user: { type: "string", description: "User ID, alias or URL" },
      timeout: { type: "number", description: "Max scrapping execution timeout (in seconds)", default: 300, minimum: 20, maximum: 1500 }
    },
    required: ["user"]
  }
};

const INSTAGRAM_USER_POSTS_TOOL: Tool = {
  name: "get_instagram_user_posts",
  description: "Get Instagram user posts",
  inputSchema: {
    type: "object",
    properties: {
      user: { type: "string", description: "User ID, alias or URL" },
      count: { type: "number", description: "Max result count", minimum: 1 },
      timeout: { type: "number", description: "Max scrapping execution timeout (in seconds)", default: 300, minimum: 20, maximum: 1500 }
    },
    required: ["user", "count"]
  }
};

const INSTAGRAM_POST_COMMENTS_TOOL: Tool = {
  name: "get_instagram_post_comments",
  description: "Get Instagram post comments",
  inputSchema: {
    type: "object",
    properties: {
      post: { type: "string", description: "Post ID" },
      count: { type: "number", description: "Max result count", minimum: 1 },
      timeout: { type: "number", description: "Max scrapping execution timeout (in seconds)", default: 300, minimum: 20, maximum: 1500 }
    },
    required: ["post", "count"]
  }
};

const GET_LINKEDIN_COMPANY_POSTS_TOOL: Tool = {
  name: "get_linkedin_company_posts",
  description: "Get LinkedIn posts for a company by URN",
  inputSchema: {
    type: "object",
    properties: {
      urn: { type: "string", description: "Company URN (example: company:11130470)" },
      count: { type: "number", description: "Max posts to return", default: 10 },
      timeout: { type: "number", description: "Timeout in seconds", default: 300 }
    },
    required: ["urn"]
  }
};

// ===== NEW LINKEDIN TOOLS =====

const GET_LINKEDIN_USER_ENDORSERS_TOOL: Tool = {
  name: "get_linkedin_user_endorsers",
  description: "Get LinkedIn user endorsers by URN",
  inputSchema: {
    type: "object",
    properties: {
      urn: { type: "string", description: "User URN (with fsd_profile: prefix)" },
      count: { type: "number", description: "Max endorsers to return", default: 10 },
      timeout: { type: "number", description: "Timeout in seconds (20-1500)", default: 300 }
    },
    required: ["urn"]
  }
};

const GET_LINKEDIN_USER_CERTIFICATES_TOOL: Tool = {
  name: "get_linkedin_user_certificates",
  description: "Get LinkedIn user certificates by URN",
  inputSchema: {
    type: "object",
    properties: {
      urn: { type: "string", description: "User URN (with fsd_profile: prefix)" },
      timeout: { type: "number", description: "Timeout in seconds (20-1500)", default: 300 }
    },
    required: ["urn"]
  }
};

const GET_LINKEDIN_USER_EMAIL_DB_TOOL: Tool = {
  name: "get_linkedin_user_email_db",
  description: "Get LinkedIn user email from internal database by internal_id, profile URL, alias, or set of them (max 10)",
  inputSchema: {
    type: "object",
    properties: {
      profile: { type: "string", description: "LinkedIn internal_id, profile URL, alias, or set of them (max 10)" },
      timeout: { type: "number", description: "Timeout in seconds (20-1500)", default: 300 }
    },
    required: ["profile"]
  }
};

const GET_LINKEDIN_MANAGEMENT_ME_TOOL: Tool = {
  name: "get_linkedin_management_me",
  description: "Get own LinkedIn profile information (requires ACCOUNT_ID)",
  inputSchema: {
    type: "object",
    properties: {
      timeout: { type: "number", description: "Timeout in seconds (20-1500)", default: 300 }
    },
    required: []
  }
};

// ===== NEW INSTAGRAM TOOLS =====

const GET_INSTAGRAM_POST_TOOL: Tool = {
  name: "get_instagram_post",
  description: "Get Instagram post by ID",
  inputSchema: {
    type: "object",
    properties: {
      post: { type: "string", description: "Post ID" },
      timeout: { type: "number", description: "Timeout in seconds (20-1500)", default: 300 }
    },
    required: ["post"]
  }
};

const GET_INSTAGRAM_POST_LIKES_TOOL: Tool = {
  name: "get_instagram_post_likes",
  description: "Get likes from an Instagram post",
  inputSchema: {
    type: "object",
    properties: {
      post: { type: "string", description: "Post ID" },
      count: { type: "number", description: "Max likes to return" },
      timeout: { type: "number", description: "Timeout in seconds (20-1500)", default: 300 }
    },
    required: ["post", "count"]
  }
};

const GET_INSTAGRAM_USER_FRIENDSHIPS_TOOL: Tool = {
  name: "get_instagram_user_friendships",
  description: "Get followers or following list from Instagram user",
  inputSchema: {
    type: "object",
    properties: {
      user: { type: "string", description: "User ID, alias or URL" },
      count: { type: "number", description: "Max results to return" },
      type: { type: "string", enum: ["followers", "following"], description: "Type of relationships to fetch" },
      timeout: { type: "number", description: "Timeout in seconds (20-1500)", default: 300 }
    },
    required: ["user", "count", "type"]
  }
};

const SEARCH_INSTAGRAM_POSTS_TOOL: Tool = {
  name: "search_instagram_posts",
  description: "Search Instagram posts by query",
  inputSchema: {
    type: "object",
    properties: {
      query: { type: "string", description: "Search query" },
      count: { type: "number", description: "Max results to return" },
      timeout: { type: "number", description: "Timeout in seconds (20-1500)", default: 300 }
    },
    required: ["query", "count"]
  }
};

const GET_INSTAGRAM_USER_REELS_TOOL: Tool = {
  name: "get_instagram_user_reels",
  description: "Get reels from an Instagram user profile",
  inputSchema: {
    type: "object",
    properties: {
      user: { type: "string", description: "User ID, alias or URL" },
      count: { type: "number", description: "Max reels to return" },
      timeout: { type: "number", description: "Timeout in seconds (20-1500)", default: 300 }
    },
    required: ["user", "count"]
  }
};

// ===== TWITTER/X TOOLS =====

const GET_TWITTER_USER_TOOL: Tool = {
  name: "get_twitter_user",
  description: "Get Twitter/X user profile information",
  inputSchema: {
    type: "object",
    properties: {
      user: { type: "string", description: "User Alias or URL" },
      timeout: { type: "number", description: "Timeout in seconds (20-1500)", default: 300 }
    },
    required: ["user"]
  }
};

const SEARCH_TWITTER_USERS_TOOL: Tool = {
  name: "search_twitter_users",
  description: "Search Twitter/X users",
  inputSchema: {
    type: "object",
    properties: {
      count: { type: "number", description: "Max results to return" },
      query: { type: "string", description: "Main search users query" },
      timeout: { type: "number", description: "Timeout in seconds (20-1500)", default: 300 }
    },
    required: ["count"]
  }
};

const GET_TWITTER_USER_POSTS_TOOL: Tool = {
  name: "get_twitter_user_posts",
  description: "Get posts from a Twitter/X user",
  inputSchema: {
    type: "object",
    properties: {
      user: { type: "string", description: "User ID, alias or URL" },
      count: { type: "number", description: "Max posts to return" },
      timeout: { type: "number", description: "Timeout in seconds (20-1500)", default: 300 }
    },
    required: ["user", "count"]
  }
};

const SEARCH_TWITTER_POSTS_TOOL: Tool = {
  name: "search_twitter_posts",
  description: "Search Twitter/X posts with advanced filtering",
  inputSchema: {
    type: "object",
    properties: {
      count: { type: "number", description: "Max results to return" },
      query: { type: "string", description: "Main search query" },
      exact_phrase: { type: "string", description: "Exact phrase (in quotes)" },
      any_of_these_words: { type: "string", description: "Any of these words (OR condition)" },
      none_of_these_words: { type: "string", description: "None of these words (NOT condition)" },
      these_hashtags: { type: "string", description: "These hashtags" },
      language: { type: "string", description: "Language of tweets" },
      from_these_accounts: { type: "string", description: "From these accounts" },
      to_these_accounts: { type: "string", description: "To these accounts" },
      mentioning_these_accounts: { type: "string", description: "Mentioning these accounts (username with @)" },
      min_replies: { type: "string", description: "Minimum number of replies" },
      min_likes: { type: "string", description: "Minimum number of likes" },
      min_retweets: { type: "string", description: "Minimum number of retweets" },
      from_date: { type: "string", description: "Starting date for tweets search (timestamp)" },
      to_date: { type: "string", description: "Ending date for tweets search (timestamp)" },
      search_type: { type: "string", enum: ["Top", "Latest", "People", "Photos", "Videos"], description: "Type of search results", default: "Top" },
      timeout: { type: "number", description: "Timeout in seconds (20-1500)", default: 300 }
    },
    required: ["count"]
  }
};

const GET_TWITTER_POST_TOOL: Tool = {
  name: "get_twitter_post",
  description: "Get Twitter/X post details",
  inputSchema: {
    type: "object",
    properties: {
      post_url: { type: "string", description: "Twitter post URL" },
      timeout: { type: "number", description: "Timeout in seconds (20-1500)", default: 300 }
    },
    required: ["post_url"]
  }
};

// ===== WEB PARSER TOOLS =====

const PARSE_WEBPAGE_TOOL: Tool = {
  name: "parse_webpage",
  description: "Parse and extract content from any webpage with flexible filtering options",
  inputSchema: {
    type: "object",
    properties: {
      url: { type: "string", description: "URL of the page to parse" },
      include_tags: { type: "array", items: { type: "string" }, description: "CSS selectors of elements to include" },
      exclude_tags: { type: "array", items: { type: "string" }, description: "CSS selectors or wildcard masks of elements to exclude" },
      only_main_content: { type: "boolean", description: "Extract only main content of the page", default: false },
      remove_comments: { type: "boolean", description: "Remove HTML comments", default: true },
      resolve_srcset: { type: "boolean", description: "Convert image srcset to src", default: true },
      return_full_html: { type: "boolean", description: "Return full HTML document or only body content", default: false },
      min_text_block: { type: "number", description: "Minimum text block size for main content detection", default: 200 },
      remove_base64_images: { type: "boolean", description: "Remove base64-encoded images", default: true },
      strip_all_tags: { type: "boolean", description: "Remove all HTML tags and return plain text only", default: false },
      extract_contacts: { type: "boolean", description: "Extract links, emails, and phone numbers", default: false },
      same_origin_links: { type: "boolean", description: "Only extract links from the same domain", default: false },
      social_links_only: { type: "boolean", description: "Only extract social media links", default: false },
      timeout: { type: "number", description: "Timeout in seconds (20-1500)", default: 300 }
    },
    required: ["url"]
  }
};

const GET_SITEMAP_TOOL: Tool = {
  name: "get_sitemap",
  description: "Fetch URLs from website sitemap",
  inputSchema: {
    type: "object",
    properties: {
      url: { type: "string", description: "Website URL to fetch sitemap from" },
      timeout: { type: "number", description: "Timeout in seconds (20-1500)", default: 300 }
    },
    required: ["url"]
  }
};

// ===== CHATGPT DEEP RESEARCH TOOLS =====

const CHATGPT_SEARCH_TOOL: Tool = {
  name: "search",
  description: "Search tool optimized for ChatGPT Deep Research mode",
  inputSchema: {
    type: "object",
    properties: {
      query: { type: "string", description: "Search query" },
      count: { type: "number", description: "Max results to return", default: 10 },
      timeout: { type: "number", description: "Timeout in seconds (20-1500)", default: 300 }
    },
    required: ["query"]
  }
};

const CHATGPT_FETCH_TOOL: Tool = {
  name: "fetch",
  description: "Fetch tool optimized for ChatGPT Deep Research mode - retrieves complete LinkedIn profile information",
  inputSchema: {
    type: "object",
    properties: {
      id: { type: "string", description: "LinkedIn profile URL or username to fetch" },
      timeout: { type: "number", description: "Timeout in seconds (20-1500)", default: 300 }
    },
    required: ["id"]
  }
};

const server = new Server(
  { name: "anysite-mcp", version: "0.1.0" },
  {
    capabilities: {
      resources: { supportedTypes: ["application/json", "text/plain"] },
      tools: { linkedin: { description: "LinkedIn data access functionality" } }
    }
  }
);

server.onerror = (error) => {
  log("MCP Server Error:", error);
};

server.onclose = () => {
  log("MCP Server Connection Closed");
};

server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: [
    {
      uri: `linkedin://users/${encodeURIComponent(API_CONFIG.DEFAULT_QUERY)}`,
      name: `LinkedIn users for "${API_CONFIG.DEFAULT_QUERY}"`,
      mimeType: "application/json",
      description: "LinkedIn user search results including name, headline, and location"
    }
  ]
}));


server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    SEARCH_LINKEDIN_USERS_TOOL,
    GET_LINKEDIN_PROFILE_TOOL,
    GET_LINKEDIN_EMAIL_TOOL,
    GET_LINKEDIN_USER_POSTS_TOOL,
    GET_LINKEDIN_USER_REACTIONS_TOOL,
    GET_LINKEDIN_USER_COMMENTS_TOOL,
    LINKEDIN_SEARCH_POSTS_TOOL,
    REDDIT_SEARCH_POSTS_TOOL,
    REDDIT_POSTS_TOOL,
    REDDIT_POST_COMMENTS_TOOL,
    GET_CHAT_MESSAGES_TOOL,
    SEND_CHAT_MESSAGE_TOOL,
    SEND_CONNECTION_REQUEST_TOOL,
    POST_COMMENT_TOOL,
    GET_USER_CONNECTIONS_TOOL,
    GET_LINKEDIN_POST_REPOSTS_TOOL,
    GET_LINKEDIN_POST_COMMENTS_TOOL,
    GET_LINKEDIN_POST_REACTIONS_TOOL,
    GET_LINKEDIN_GOOGLE_COMPANY_TOOL,
    GET_LINKEDIN_COMPANY_TOOL,
    GET_LINKEDIN_COMPANY_EMPLOYEES_TOOL,
    SEND_LINKEDIN_POST_TOOL,
    LINKEDIN_SN_SEARCH_USERS_TOOL,
    GET_LINKEDIN_CONVERSATIONS_TOOL,
    GOOGLE_SEARCH_TOOL,
    INSTAGRAM_USER_TOOL,
    INSTAGRAM_USER_POSTS_TOOL,
    INSTAGRAM_POST_COMMENTS_TOOL,
    GET_LINKEDIN_COMPANY_POSTS_TOOL,
    // New LinkedIn tools
    GET_LINKEDIN_USER_ENDORSERS_TOOL,
    GET_LINKEDIN_USER_CERTIFICATES_TOOL,
    GET_LINKEDIN_USER_EMAIL_DB_TOOL,
    GET_LINKEDIN_MANAGEMENT_ME_TOOL,
    // New Instagram tools
    GET_INSTAGRAM_POST_TOOL,
    GET_INSTAGRAM_POST_LIKES_TOOL,
    GET_INSTAGRAM_USER_FRIENDSHIPS_TOOL,
    SEARCH_INSTAGRAM_POSTS_TOOL,
    GET_INSTAGRAM_USER_REELS_TOOL,
    // Twitter/X tools
    GET_TWITTER_USER_TOOL,
    SEARCH_TWITTER_USERS_TOOL,
    GET_TWITTER_USER_POSTS_TOOL,
    SEARCH_TWITTER_POSTS_TOOL,
    GET_TWITTER_POST_TOOL,
    // Web Parser tools
    PARSE_WEBPAGE_TOOL,
    GET_SITEMAP_TOOL,
    // ChatGPT Deep Research tools
    CHATGPT_SEARCH_TOOL,
    CHATGPT_FETCH_TOOL
  ]
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;
    if (!args) throw new Error("No arguments provided");

    switch (name) {
      case "search_linkedin_users": {
        if (!isValidLinkedinSearchUsersArgs(args)) {
          throw new McpError(ErrorCode.InvalidParams, "Invalid LinkedIn search arguments");
        }
        const {
          keywords, first_name, last_name, title, company_keywords,
          school_keywords, current_company, past_company, location,
          industry, education, count = 10, timeout = 300
        } = args as LinkedinSearchUsersArgs;
        const requestData: any = { timeout, count };
        if (keywords) requestData.keywords = keywords;
        if (first_name) requestData.first_name = first_name;
        if (last_name) requestData.last_name = last_name;
        if (title) requestData.title = title;
        if (company_keywords) requestData.company_keywords = company_keywords;
        if (school_keywords) requestData.school_keywords = school_keywords;
        if (current_company) {
          requestData.current_company =
            typeof current_company === "string" && current_company.includes("company:")
              ? [{ type: "company", value: current_company.replace("company:", "") }]
              : current_company;
        }
        if (past_company) {
          requestData.past_company =
            typeof past_company === "string" && past_company.includes("company:")
              ? [{ type: "company", value: past_company.replace("company:", "") }]
              : past_company;
        }
        if (location) {
          requestData.location =
            typeof location === "string" && location.includes("geo:")
              ? [{ type: "geo", value: location.replace("geo:", "") }]
              : location;
        }
        if (industry) {
          requestData.industry =
            typeof industry === "string" && industry.includes("industry:")
              ? [{ type: "industry", value: industry.replace("industry:", "") }]
              : industry;
        }
        if (education) {
          requestData.education =
            typeof education === "string" && education.includes("fsd_company:")
              ? [{ type: "fsd_company", value: education.replace("fsd_company:", "") }]
              : education;
        }
        log("Starting LinkedIn users search with:", JSON.stringify(requestData));
        try {
          const response = await makeRequest(API_CONFIG.ENDPOINTS.SEARCH_USERS, requestData);
          log(`Search complete, found ${response.length} results`);
          return {
            content: [
              {
                type: "text",
                mimeType: "application/json",
                text: JSON.stringify(response, null, 2)
              }
            ]
          };
        } catch (error) {
          log("LinkedIn search error:", error);
          return {
            content: [
              {
                type: "text",
                mimeType: "text/plain",
                text: `LinkedIn search API error: ${formatError(error)}`
              }
            ],
            isError: true
          };
        }
      }

      case "get_linkedin_profile": {
        if (!isValidLinkedinUserProfileArgs(args)) {
          throw new McpError(ErrorCode.InvalidParams, "Invalid LinkedIn profile arguments");
        }
        const { user, with_experience = true, with_education = true, with_skills = true } = args as LinkedinUserProfileArgs;
        const requestData = { timeout: 300, user, with_experience, with_education, with_skills };
        log("Starting LinkedIn profile lookup for:", user);
        try {
          const response = await makeRequest(API_CONFIG.ENDPOINTS.USER_PROFILE, requestData);
          return {
            content: [
              {
                type: "text",
                mimeType: "application/json",
                text: JSON.stringify(response, null, 2)
              }
            ]
          };
        } catch (error) {
          log("LinkedIn profile lookup error:", error);
          return {
            content: [
              {
                type: "text",
                mimeType: "text/plain",
                text: `LinkedIn API error: ${formatError(error)}`
              }
            ],
            isError: true
          };
        }
      }

      case "get_linkedin_email_user": {
        if (!isValidLinkedinEmailUserArgs(args)) {
          throw new McpError(ErrorCode.InvalidParams, "Invalid email parameter");
        }
        const { email, count = 5, timeout = 300 } = args as LinkedinEmailUserArgs;
        const requestData = { timeout, email, count };
        log("Starting LinkedIn email lookup for:", email);
        try {
          const response = await makeRequest(API_CONFIG.ENDPOINTS.LINKEDIN_EMAIL, requestData);
          return {
            content: [
              {
                type: "text",
                mimeType: "application/json",
                text: JSON.stringify(response, null, 2)
              }
            ]
          };
        } catch (error) {
          log("LinkedIn email lookup error:", error);
          return {
            content: [
              {
                type: "text",
                mimeType: "text/plain",
                text: `LinkedIn email API error: ${formatError(error)}`
              }
            ],
            isError: true
          };
        }
      }

      case "get_linkedin_user_posts": {
        if (!isValidLinkedinUserPostsArgs(args)) {
          throw new McpError(ErrorCode.InvalidParams, "Invalid user posts arguments");
        }
        const { urn, count = 10, timeout = 300 } = args as LinkedinUserPostsArgs;
        const normalizedURN = normalizeUserURN(urn);
        if (!isValidUserURN(normalizedURN)) {
          throw new McpError(ErrorCode.InvalidParams, "Invalid URN format. Must start with 'fsd_profile:'");
        }
        log("Starting LinkedIn user posts lookup for urn:", normalizedURN);
        const requestData = { timeout, urn: normalizedURN, count };
        try {
          const response = await makeRequest(API_CONFIG.ENDPOINTS.LINKEDIN_USER_POSTS, requestData);
          return {
            content: [
              {
                type: "text",
                mimeType: "application/json",
                text: JSON.stringify(response, null, 2)
              }
            ]
          };
        } catch (error) {
          log("LinkedIn user posts lookup error:", error);
          return {
            content: [
              {
                type: "text",
                mimeType: "text/plain",
                text: `LinkedIn user posts API error: ${formatError(error)}`
              }
            ],
            isError: true
          };
        }
      }

      case "get_linkedin_user_reactions": {
        if (!isValidLinkedinUserReactionsArgs(args)) {
          throw new McpError(ErrorCode.InvalidParams, "Invalid user reactions arguments");
        }
        const { urn, count = 10, timeout = 300 } = args as LinkedinUserReactionsArgs;
        const normalizedURN = normalizeUserURN(urn);
        if (!isValidUserURN(normalizedURN)) {
          throw new McpError(ErrorCode.InvalidParams, "Invalid URN format. Must start with 'fsd_profile:'");
        }
        log("Starting LinkedIn user reactions lookup for urn:", normalizedURN);
        const requestData = { timeout, urn: normalizedURN, count };
        try {
          const response = await makeRequest(API_CONFIG.ENDPOINTS.LINKEDIN_USER_REACTIONS, requestData);
          return {
            content: [
              {
                type: "text",
                mimeType: "application/json",
                text: JSON.stringify(response, null, 2)
              }
            ]
          };
        } catch (error) {
          log("LinkedIn user reactions lookup error:", error);
          return {
            content: [
              {
                type: "text",
                mimeType: "text/plain",
                text: `LinkedIn user reactions API error: ${formatError(error)}`
              }
            ],
            isError: true
          };
        }
      }

      case "get_linkedin_user_comments": {
        if (!isValidLinkedinUserCommentsArgs(args)) {
          throw new McpError(ErrorCode.InvalidParams, "Invalid user comments arguments");
        }
        const { urn, count = 10, timeout = 300, commented_after } = args as LinkedinUserCommentsArgs;
        const normalizedURN = normalizeUserURN(urn);
        if (!isValidUserURN(normalizedURN)) {
          throw new McpError(ErrorCode.InvalidParams, "Invalid URN format. Must start with 'fsd_profile:'");
        }
        log("Starting LinkedIn user comments lookup for urn:", normalizedURN);
        const requestData: any = { timeout, urn: normalizedURN, count };
        if (commented_after !== undefined) {
          requestData.commented_after = commented_after;
        }
        try {
          const response = await makeRequest(API_CONFIG.ENDPOINTS.LINKEDIN_USER_COMMENTS, requestData);
          return {
            content: [
              {
                type: "text",
                mimeType: "application/json",
                text: JSON.stringify(response, null, 2)
              }
            ]
          };
        } catch (error) {
          log("LinkedIn user comments lookup error:", error);
          return {
            content: [
              {
                type: "text",
                mimeType: "text/plain",
                text: `LinkedIn user comments API error: ${formatError(error)}`
              }
            ],
            isError: true
          };
        }
      }

      case "get_linkedin_chat_messages": {
        if (!isValidLinkedinChatMessagesArgs(args)) {
          throw new McpError(ErrorCode.InvalidParams, "Invalid chat messages arguments");
        }
        const { user, company, count = 20, timeout = 300 } = args as LinkedinChatMessagesArgs;
        const normalizedUser = normalizeUserURN(user);
        if (!isValidUserURN(normalizedUser)) {
          throw new McpError(ErrorCode.InvalidParams, "Invalid URN format. Must start with 'fsd_profile:'");
        }
        const requestData: any = { timeout, user: normalizedUser, count, account_id: ACCOUNT_ID() };
        if (company) requestData.company = company;
        log("Starting LinkedIn chat messages lookup for user:", normalizedUser);
        try {
          // Changed from GET to using default POST
          const response = await makeRequest(API_CONFIG.ENDPOINTS.CHAT_MESSAGES, requestData);
          return {
            content: [
              {
                type: "text",
                mimeType: "application/json",
                text: JSON.stringify(response, null, 2)
              }
            ]
          };
        } catch (error) {
          log("LinkedIn chat messages lookup error:", error);
          return {
            content: [
              {
                type: "text",
                mimeType: "text/plain",
                text: `LinkedIn chat messages API error: ${formatError(error)}`
              }
            ],
            isError: true
          };
        }
      }

      case "send_linkedin_chat_message": {
        if (!isValidSendLinkedinChatMessageArgs(args)) {
          throw new McpError(ErrorCode.InvalidParams, "Invalid parameters for sending chat message");
        }
        const { user, company, text, timeout = 300 } = args as SendLinkedinChatMessageArgs;
        const normalizedUser = normalizeUserURN(user);
        if (!isValidUserURN(normalizedUser)) {
          throw new McpError(ErrorCode.InvalidParams, "Invalid URN format. Must start with 'fsd_profile:'");
        }
        const requestData: any = { timeout, user: normalizedUser, text, account_id: ACCOUNT_ID() };
        if (company) requestData.company = company;
        log("Starting LinkedIn send chat message for user:", normalizedUser);
        try {
          const response = await makeRequest(API_CONFIG.ENDPOINTS.CHAT_MESSAGE, requestData, "POST");
          return {
            content: [
              {
                type: "text",
                mimeType: "application/json",
                text: JSON.stringify(response, null, 2)
              }
            ]
          };
        } catch (error) {
          log("LinkedIn send chat message error:", error);
          return {
            content: [
              {
                type: "text",
                mimeType: "text/plain",
                text: `LinkedIn send chat message API error: ${formatError(error)}`
              }
            ],
            isError: true
          };
        }
      }

      case "send_linkedin_connection": {
        if (!isValidSendLinkedinConnectionArgs(args)) {
          throw new McpError(ErrorCode.InvalidParams, "Invalid parameters for connection request");
        }
        const { user, timeout = 300 } = args as SendLinkedinConnectionArgs;
        const normalizedUser = normalizeUserURN(user);
        if (!isValidUserURN(normalizedUser)) {
          throw new McpError(ErrorCode.InvalidParams, "Invalid URN format. Must start with 'fsd_profile:'");
        }
        const requestData = { timeout, user: normalizedUser, account_id: ACCOUNT_ID() };
        log("Sending LinkedIn connection request to user:", normalizedUser);
        try {
          const response = await makeRequest(API_CONFIG.ENDPOINTS.USER_CONNECTION, requestData, "POST");
          return {
            content: [
              {
                type: "text",
                mimeType: "application/json",
                text: JSON.stringify(response, null, 2)
              }
            ]
          };
        } catch (error) {
          log("LinkedIn connection request error:", error);
          return {
            content: [
              {
                type: "text",
                mimeType: "text/plain",
                text: `LinkedIn connection request API error: ${formatError(error)}`
              }
            ],
            isError: true
          };
        }
      }

      case "send_linkedin_post_comment": {
        if (!isValidSendLinkedinPostCommentArgs(args)) {
          throw new McpError(ErrorCode.InvalidParams, "Invalid parameters for commenting on a post");
        }
        const { text, urn, timeout = 300 } = args as SendLinkedinPostCommentArgs;
        const isActivityOrComment = urn.includes("activity:") || urn.includes("comment:");
        if (!isActivityOrComment) {
          throw new McpError(ErrorCode.InvalidParams, "URN must be for an activity or comment");
        }
        let urnObj;
        if (urn.startsWith("activity:")) {
          urnObj = { type: "activity", value: urn.replace("activity:", "") };
        } else if (urn.startsWith("comment:")) {
          urnObj = { type: "comment", value: urn.replace("comment:", "") };
        } else {
          urnObj = urn;
        }
        const requestData = {
          timeout,
          text,
          urn: urnObj,
          account_id: ACCOUNT_ID()
        };
        log(`Creating LinkedIn comment on ${urn}`);
        try {
          const response = await makeRequest(API_CONFIG.ENDPOINTS.POST_COMMENT, requestData, "POST");
          return {
            content: [
              {
                type: "text",
                mimeType: "application/json",
                text: JSON.stringify(response, null, 2)
              }
            ]
          };
        } catch (error) {
          log("LinkedIn comment creation error:", error);
          return {
            content: [
              {
                type: "text",
                mimeType: "text/plain",
                text: `LinkedIn comment API error: ${formatError(error)}`
              }
            ],
            isError: true
          };
        }
      }

      case "send_linkedin_post": {
        if (!isValidSendLinkedinPostArgs(args)) {
          throw new McpError(ErrorCode.InvalidParams, "Invalid parameters for creating a LinkedIn post");
        }
        const {
          text,
          visibility = "ANYONE",
          comment_scope = "ALL",
          timeout = 300
        } = args as SendLinkedinPostArgs;

        const requestData = {
          text,
          visibility,
          comment_scope,
          timeout,
          account_id: ACCOUNT_ID()
        };

        log("Creating LinkedIn post with text:", text.substring(0, 50) + (text.length > 50 ? "..." : ""));
        try {
          const response = await makeRequest(API_CONFIG.ENDPOINTS.LINKEDIN_POST, requestData, "POST");
          return {
            content: [
              {
                type: "text",
                mimeType: "application/json",
                text: JSON.stringify(response, null, 2)
              }
            ]
          };
        } catch (error) {
          log("LinkedIn post creation error:", error);
          return {
            content: [
              {
                type: "text",
                mimeType: "text/plain",
                text: `LinkedIn post creation API error: ${formatError(error)}`
              }
            ],
            isError: true
          };
        }
      }

      case "get_linkedin_user_connections": {
        if (!isValidGetLinkedinUserConnectionsArgs(args)) {
          throw new McpError(ErrorCode.InvalidParams, "Invalid user connections arguments");
        }
        const { connected_after, count = 20, timeout = 300 } = args as GetLinkedinUserConnectionsArgs;
        const requestData: {
          timeout: number;
          account_id?: string;
          connected_after?: number;
          count?: number;
        } = {
          timeout: Number(timeout),
          account_id: ACCOUNT_ID()
        };
        if (connected_after != null) {
          requestData.connected_after = Number(connected_after);
        }
        if (count != null) {
          requestData.count = Number(count);
        }
        log("Starting LinkedIn user connections lookup");
        try {
          // Changed from GET to using default POST
          const response = await makeRequest(API_CONFIG.ENDPOINTS.USER_CONNECTIONS, requestData);
          return {
            content: [
              {
                type: "text",
                mimeType: "application/json",
                text: JSON.stringify(response, null, 2)
              }
            ]
          };
        } catch (error) {
          log("LinkedIn user connections lookup error:", error);
          return {
            content: [
              {
                type: "text",
                mimeType: "text/plain",
                text: `LinkedIn user connections API error: ${formatError(error)}`
              }
            ],
            isError: true
          };
        }
      }

      case "get_linkedin_post_reposts": {
        if (!isValidGetLinkedinPostRepostsArgs(args)) {
          throw new McpError(ErrorCode.InvalidParams, "Invalid post reposts arguments");
        }
        const { urn, count = 10, timeout = 300 } = args as GetLinkedinPostRepostsArgs;
        const requestData = {
          timeout: Number(timeout),
          urn,
          count: Number(count)
        };
        log(`Starting LinkedIn post reposts lookup for: ${urn}`);
        try {
          const response = await makeRequest(API_CONFIG.ENDPOINTS.LINKEDIN_POST_REPOSTS, requestData);
          return {
            content: [
              {
                type: "text",
                mimeType: "application/json",
                text: JSON.stringify(response, null, 2)
              }
            ]
          };
        } catch (error) {
          log("LinkedIn post reposts lookup error:", error);
          return {
            content: [
              {
                type: "text",
                mimeType: "text/plain",
                text: `LinkedIn post reposts API error: ${formatError(error)}`
              }
            ],
            isError: true
          };
        }
      }

      case "get_linkedin_post_comments": {
        if (!isValidGetLinkedinPostCommentsArgs(args)) {
          throw new McpError(ErrorCode.InvalidParams, "Invalid post comments arguments");
        }
        const { urn, sort = "relevance", count = 10, timeout = 300 } = args as GetLinkedinPostCommentsArgs;
        const requestData = {
          timeout: Number(timeout),
          urn,
          sort,
          count: Number(count)
        };
        log(`Starting LinkedIn post comments lookup for: ${urn}`);
        try {
          const response = await makeRequest(API_CONFIG.ENDPOINTS.LINKEDIN_POST_COMMENTS, requestData);
          return {
            content: [
              {
                type: "text",
                mimeType: "application/json",
                text: JSON.stringify(response, null, 2)
              }
            ]
          };
        } catch (error) {
          log("LinkedIn post comments lookup error:", error);
          return {
            content: [
              {
                type: "text",
                mimeType: "text/plain",
                text: `LinkedIn post comments API error: ${formatError(error)}`
              }
            ],
            isError: true
          };
        }
      }

      case "get_linkedin_post_reactions": {
        if (!isValidGetLinkedinPostReactionsArgs(args)) {
          throw new McpError(ErrorCode.InvalidParams, "Invalid post reactions arguments");
        }
        const { urn, count = 50, timeout = 300 } = args as GetLinkedinPostReactionsArgs;
        const requestData = {
          timeout: Number(timeout),
          urn,
          count: Number(count)
        };
        log(`Starting LinkedIn post reactions lookup for: ${urn}`);
        try {
          const response = await makeRequest(API_CONFIG.ENDPOINTS.LINKEDIN_POST_REACTIONS, requestData);
          return {
            content: [
              {
                type: "text",
                mimeType: "application/json",
                text: JSON.stringify(response, null, 2)
              }
            ]
          };
        } catch (error) {
          log("LinkedIn post reactions lookup error:", error);
          return {
            content: [
              {
                type: "text",
                mimeType: "text/plain",
                text: `LinkedIn post reactions API error: ${formatError(error)}`
              }
            ],
            isError: true
          };
        }
      }

      case "get_linkedin_google_company": {
        if (!isValidGetLinkedinGoogleCompanyArgs(args)) {
          throw new McpError(ErrorCode.InvalidParams, "Invalid Google company search arguments");
        }
        const { keywords, with_urn = false, count_per_keyword = 1, timeout = 300 } = args as GetLinkedinGoogleCompanyArgs;
        const requestData = {
          timeout: Number(timeout),
          keywords,
          with_urn: Boolean(with_urn),
          count_per_keyword: Number(count_per_keyword)
        };
        log(`Starting LinkedIn Google company search for keywords: ${keywords.join(', ')}`);
        try {
          const response = await makeRequest(API_CONFIG.ENDPOINTS.LINKEDIN_GOOGLE_COMPANY, requestData);
          return {
            content: [
              {
                type: "text",
                mimeType: "application/json",
                text: JSON.stringify(response, null, 2)
              }
            ]
          };
        } catch (error) {
          log("LinkedIn Google company search error:", error);
          return {
            content: [
              {
                type: "text",
                mimeType: "text/plain",
                text: `LinkedIn Google company search API error: ${formatError(error)}`
              }
            ],
            isError: true
          };
        }
      }

      case "get_linkedin_company": {
        if (!isValidGetLinkedinCompanyArgs(args)) {
          throw new McpError(ErrorCode.InvalidParams, "Invalid company arguments");
        }
        const { company, timeout = 300 } = args as GetLinkedinCompanyArgs;
        const requestData = {
          timeout: Number(timeout),
          company
        };
        log(`Starting LinkedIn company lookup for: ${company}`);
        try {
          const response = await makeRequest(API_CONFIG.ENDPOINTS.LINKEDIN_COMPANY, requestData);
          return {
            content: [
              {
                type: "text",
                mimeType: "application/json",
                text: JSON.stringify(response, null, 2)
              }
            ]
          };
        } catch (error) {
          log("LinkedIn company lookup error:", error);
          return {
            content: [
              {
                type: "text",
                mimeType: "text/plain",
                text: `LinkedIn company API error: ${formatError(error)}`
              }
            ],
            isError: true
          };
        }
      }

      case "get_linkedin_company_employees": {
        if (!isValidGetLinkedinCompanyEmployeesArgs(args)) {
          throw new McpError(ErrorCode.InvalidParams, "Invalid company employees arguments");
        }
        const { companies, keywords, first_name, last_name, count = 10, timeout = 300 } = args as GetLinkedinCompanyEmployeesArgs;
        const requestData: {
          timeout: number;
          companies: string[];
          keywords?: string;
          first_name?: string;
          last_name?: string;
          count: number;
        } = {
          timeout: Number(timeout),
          companies,
          count: Number(count)
        };
        if (keywords != null && typeof keywords === 'string') {
          requestData.keywords = keywords;
        }
        if (first_name != null && typeof first_name === 'string') {
          requestData.first_name = first_name;
        }
        if (last_name != null && typeof last_name === 'string') {
          requestData.last_name = last_name;
        }
        log(`Starting LinkedIn company employees lookup for companies: ${companies.join(', ')}`);
        try {
          const response = await makeRequest(API_CONFIG.ENDPOINTS.LINKEDIN_COMPANY_EMPLOYEES, requestData);
          return {
            content: [
              {
                type: "text",
                mimeType: "application/json",
                text: JSON.stringify(response, null, 2)
              }
            ]
          };
        } catch (error) {
          log("LinkedIn company employees lookup error:", error);
          return {
            content: [
              {
                type: "text",
                mimeType: "text/plain",
                text: `LinkedIn company employees API error: ${formatError(error)}`
              }
            ],
            isError: true
          };
        }
      }

      case "linkedin_sn_search_users": {
        if (!isValidLinkedinSalesNavigatorSearchUsersArgs(args)) {
          throw new McpError(ErrorCode.InvalidParams, "Invalid LinkedIn Sales Navigator search arguments");
        }

        const {
          keywords,
          first_names,
          last_names,
          current_titles,
          location,
          education,
          languages,
          past_titles,
          functions,
          levels,
          years_in_the_current_company,
          years_in_the_current_position,
          company_sizes,
          company_types,
          company_locations,
          current_companies,
          past_companies,
          industry,
          count,
          timeout = 300
        } = args as LinkedinSalesNavigatorSearchUsersArgs;

        const requestData: Record<string, any> = {
          count,
          timeout
        };

        if (keywords) requestData.keywords = keywords;
        if (first_names) requestData.first_names = first_names;
        if (last_names) requestData.last_names = last_names;
        if (current_titles) requestData.current_titles = current_titles;

        if (location) {
          requestData.location = typeof location === "string" && location.includes("geo:")
            ? [{ type: "geo", value: location.replace("geo:", "") }]
            : location;
        }

        if (education) {
          requestData.education = typeof education === "string" && education.includes("company:")
            ? [{ type: "company", value: education.replace("company:", "") }]
            : education;
        }

        if (languages) requestData.languages = languages;
        if (past_titles) requestData.past_titles = past_titles;
        if (functions) requestData.functions = functions;
        if (levels) requestData.levels = levels;
        if (years_in_the_current_company) requestData.years_in_the_current_company = years_in_the_current_company;
        if (years_in_the_current_position) requestData.years_in_the_current_position = years_in_the_current_position;
        if (company_sizes) requestData.company_sizes = company_sizes;
        if (company_types) requestData.company_types = company_types;

        if (company_locations) {
          requestData.company_locations = typeof company_locations === "string" && company_locations.includes("geo:")
            ? [{ type: "geo", value: company_locations.replace("geo:", "") }]
            : company_locations;
        }

        if (current_companies) {
          requestData.current_companies = typeof current_companies === "string" && current_companies.includes("company:")
            ? [{ type: "company", value: current_companies.replace("company:", "") }]
            : current_companies;
        }

        if (past_companies) {
          requestData.past_companies = typeof past_companies === "string" && past_companies.includes("company:")
            ? [{ type: "company", value: past_companies.replace("company:", "") }]
            : past_companies;
        }

        if (industry) {
          requestData.industry = typeof industry === "string" && industry.includes("industry:")
            ? [{ type: "industry", value: industry.replace("industry:", "") }]
            : industry;
        }

        log("Starting LinkedIn Sales Navigator users search with filters");
        try {
          const response = await makeRequest(API_CONFIG.ENDPOINTS.LINKEDIN_SN_SEARCH_USERS, requestData);
          log(`Search complete, found ${response.length} results`);
          return {
            content: [
              {
                type: "text",
                mimeType: "application/json",
                text: JSON.stringify(response, null, 2)
              }
            ]
          };
        } catch (error) {
          log("LinkedIn Sales Navigator search error:", error);
          return {
            content: [
              {
                type: "text",
                mimeType: "text/plain",
                text: `LinkedIn Sales Navigator search API error: ${formatError(error)}`
              }
            ],
            isError: true
          };
        }
      }

      case "get_linkedin_conversations": {
        if (!isValidLinkedinManagementConversationsArgs(args)) {
          throw new McpError(ErrorCode.InvalidParams, "Invalid conversations arguments");
        }
        const { connected_after, count = 20, timeout = 300 } = args as LinkedinManagementConversationsPayload;
        const requestData: {
          timeout: number;
          account_id?: string;
          connected_after?: number;
          count?: number;
        } = {
          timeout: Number(timeout),
          account_id: ACCOUNT_ID()
        };
        if (connected_after != null) {
          requestData.connected_after = Number(connected_after);
        }
        if (count != null) {
          requestData.count = Number(count);
        }
        log("Starting LinkedIn conversations lookup");
        try {
          // Changed from GET to using default POST
          const response = await makeRequest(API_CONFIG.ENDPOINTS.CONVERSATIONS, requestData);
          return {
            content: [
              {
                type: "text",
                mimeType: "application/json",
                text: JSON.stringify(response, null, 2)
              }
            ]
          };
        } catch (error) {
          log("LinkedIn conversations lookup error:", error);
          return {
            content: [
              {
                type: "text",
                mimeType: "text/plain",
                text: `LinkedIn conversations API error: ${formatError(error)}`
              }
            ],
            isError: true
          };
        }
      }

      case "google_search": {
        if (!isValidGoogleSearchPayload(args)) {
          throw new McpError(ErrorCode.InvalidParams, "Invalid Google search arguments");
        }
        const { query, count = 10, timeout = 300 } = args as GoogleSearchPayload;
        const requestData = {
          timeout,
          query,
          count: Math.min(Math.max(1, count), 20) // Ensure count is between 1 and 20
        };
        log(`Starting Google search for: ${query}`);
        try {
          const response = await makeRequest(API_CONFIG.ENDPOINTS.GOOGLE_SEARCH, requestData);
          return {
            content: [
              {
                type: "text",
                mimeType: "application/json",
                text: JSON.stringify(response, null, 2)
              }
            ]
          };
        } catch (error) {
          log("Google search error:", error);
          return {
            content: [
              {
                type: "text",
                mimeType: "text/plain",
                text: `Google search API error: ${formatError(error)}`
              }
            ],
            isError: true
          };
        }
      }

      case "search_linkedin_posts": {
        if (!isValidLinkedinSearchPostsArgs(args)) {
          throw new McpError(ErrorCode.InvalidParams, "Invalid LinkedIn search posts arguments");
        }
        const {
          timeout = 300,
          keywords = "",
          sort = "relevance",
          date_posted = "past-month",
          content_type,
          mentioned,
          authors,
          author_industries,
          author_title,
          count
        } = args as LinkedinSearchPostsArgs;
        
        const requestData: any = { timeout, count };
        if (keywords) requestData.keywords = keywords;
        if (sort) requestData.sort = sort;
        if (date_posted) requestData.date_posted = date_posted;
        if (content_type) requestData.content_type = content_type;
        if (mentioned) requestData.mentioned = mentioned;
        if (authors) requestData.authors = authors;
        if (author_industries) requestData.author_industries = author_industries;
        if (author_title) requestData.author_title = author_title;
        
        log("Starting LinkedIn posts search with:", JSON.stringify(requestData));
        try {
          const response = await makeRequest(API_CONFIG.ENDPOINTS.LINKEDIN_SEARCH_POSTS, requestData);
          log(`Search complete, found ${response.length} results`);
          return {
            content: [
              {
                type: "text",
                mimeType: "application/json",
                text: JSON.stringify(response, null, 2)
              }
            ]
          };
        } catch (error) {
          log("LinkedIn search posts error:", error);
          return {
            content: [
              {
                type: "text",
                mimeType: "text/plain",
                text: `LinkedIn search posts API error: ${formatError(error)}`
              }
            ],
            isError: true
          };
        }
      }

      case "search_reddit_posts": {
        if (!isValidRedditSearchPostsArgs(args)) {
          throw new McpError(ErrorCode.InvalidParams, "Invalid Reddit search posts arguments");
        }
        const {
          timeout = 300,
          query,
          sort = "relevance",
          time_filter = "all",
          count
        } = args as RedditSearchPostsArgs;

        const requestData = {
          timeout,
          query,
          sort,
          time_filter,
          count
        };

        log("Starting Reddit posts search with:", JSON.stringify(requestData));
        try {
          const response = await makeRequest(API_CONFIG.ENDPOINTS.REDDIT_SEARCH_POSTS, requestData);
          log(`Search complete, found ${response.length} results`);
          return {
            content: [
              {
                type: "text",
                mimeType: "application/json",
                text: JSON.stringify(response, null, 2)
              }
            ]
          };
        } catch (error) {
          log("Reddit search posts error:", error);
          return {
            content: [
              {
                type: "text",
                mimeType: "text/plain",
                text: `Reddit search posts API error: ${formatError(error)}`
              }
            ],
            isError: true
          };
        }
      }

      case "get_reddit_posts": {
        if (!isValidRedditPostsArgs(args)) {
          throw new McpError(ErrorCode.InvalidParams, "Invalid Reddit posts arguments");
        }
        const { timeout = 300, post_url } = args as RedditPostsArgs;

        const requestData = {
          timeout,
          post_url
        };

        log(`Starting Reddit post lookup for: ${post_url}`);
        try {
          const response = await makeRequest(API_CONFIG.ENDPOINTS.REDDIT_POSTS, requestData);
          return {
            content: [
              {
                type: "text",
                mimeType: "application/json",
                text: JSON.stringify(response, null, 2)
              }
            ]
          };
        } catch (error) {
          log("Reddit posts lookup error:", error);
          return {
            content: [
              {
                type: "text",
                mimeType: "text/plain",
                text: `Reddit posts API error: ${formatError(error)}`
              }
            ],
            isError: true
          };
        }
      }

      case "get_reddit_post_comments": {
        if (!isValidRedditPostCommentsArgs(args)) {
          throw new McpError(ErrorCode.InvalidParams, "Invalid Reddit post comments arguments");
        }
        const { timeout = 300, post_url } = args as RedditPostCommentsArgs;

        const requestData = {
          timeout,
          post_url
        };

        log(`Starting Reddit post comments lookup for: ${post_url}`);
        try {
          const response = await makeRequest(API_CONFIG.ENDPOINTS.REDDIT_POST_COMMENTS, requestData);
          return {
            content: [
              {
                type: "text",
                mimeType: "application/json",
                text: JSON.stringify(response, null, 2)
              }
            ]
          };
        } catch (error) {
          log("Reddit post comments lookup error:", error);
          return {
            content: [
              {
                type: "text",
                mimeType: "text/plain",
                text: `Reddit post comments API error: ${formatError(error)}`
              }
            ],
            isError: true
          };
        }
      }

      case "get_instagram_user": {
        if (!isValidInstagramUserArgs(args)) {
          throw new McpError(ErrorCode.InvalidParams, "Invalid Instagram user arguments");
        }
        const { timeout = 300, user } = args as InstagramUserArgs;
        
        const requestData = {
          timeout,
          user
        };
        
        log("Starting Instagram user lookup for:", user);
        try {
          const response = await makeRequest(API_CONFIG.ENDPOINTS.INSTAGRAM_USER, requestData);
          return {
            content: [
              {
                type: "text",
                mimeType: "application/json",
                text: JSON.stringify(response, null, 2)
              }
            ]
          };
        } catch (error) {
          log("Instagram user lookup error:", error);
          return {
            content: [
              {
                type: "text",
                mimeType: "text/plain",
                text: `Instagram user API error: ${formatError(error)}`
              }
            ],
            isError: true
          };
        }
      }

      case "get_instagram_user_posts": {
        if (!isValidInstagramUserPostsArgs(args)) {
          throw new McpError(ErrorCode.InvalidParams, "Invalid Instagram user posts arguments");
        }
        const { timeout = 300, user, count } = args as InstagramUserPostsArgs;
        
        const requestData = {
          timeout,
          user,
          count
        };
        
        log(`Starting Instagram user posts lookup for: ${user}`);
        try {
          const response = await makeRequest(API_CONFIG.ENDPOINTS.INSTAGRAM_USER_POSTS, requestData);
          log(`Posts lookup complete, found ${response.length} results`);
          return {
            content: [
              {
                type: "text",
                mimeType: "application/json",
                text: JSON.stringify(response, null, 2)
              }
            ]
          };
        } catch (error) {
          log("Instagram user posts lookup error:", error);
          return {
            content: [
              {
                type: "text",
                mimeType: "text/plain",
                text: `Instagram user posts API error: ${formatError(error)}`
              }
            ],
            isError: true
          };
        }
      }

      case "get_instagram_post_comments": {
        if (!isValidInstagramPostCommentsArgs(args)) {
          throw new McpError(ErrorCode.InvalidParams, "Invalid Instagram post comments arguments");
        }
        const { timeout = 300, post, count } = args as InstagramPostCommentsArgs;

        const requestData = {
          timeout,
          post,
          count
        };

        log(`Starting Instagram post comments lookup for: ${post}`);
        try {
          const response = await makeRequest(API_CONFIG.ENDPOINTS.INSTAGRAM_POST_COMMENTS, requestData);
          log(`Comments lookup complete, found ${response.length} results`);
          return {
            content: [
              {
                type: "text",
                mimeType: "application/json",
                text: JSON.stringify(response, null, 2)
              }
            ]
          };
        } catch (error) {
          log("Instagram post comments lookup error:", error);
          return {
            content: [
              {
                type: "text",
                mimeType: "text/plain",
                text: `Instagram post comments API error: ${formatError(error)}`
              }
            ],
            isError: true
          };
        }
      }

      case "get_linkedin_company_posts": {
        if (!isValidLinkedinCompanyPostsArgs(args)) {
          throw new McpError(ErrorCode.InvalidParams, "Invalid LinkedIn company posts arguments");
        }
        const { urn, count = 10, timeout = 300 } = args as LinkedinCompanyPostsArgs;

        const requestData = {
          timeout,
          urn,
          count
        };

        log(`Starting LinkedIn company posts lookup for: ${urn}`);
        try {
          const response = await makeRequest(API_CONFIG.ENDPOINTS.LINKEDIN_COMPANY_POSTS, requestData);
          log(`Company posts lookup complete, found ${response.length} results`);
          return {
            content: [
              {
                type: "text",
                mimeType: "application/json",
                text: JSON.stringify(response, null, 2)
              }
            ]
          };
        } catch (error) {
          log("LinkedIn company posts lookup error:", error);
          return {
            content: [
              {
                type: "text",
                mimeType: "text/plain",
                text: `LinkedIn company posts API error: ${formatError(error)}`
              }
            ],
            isError: true
          };
        }
      }

      // ===== NEW LINKEDIN TOOLS =====

      case "get_linkedin_user_endorsers": {
        if (!isValidLinkedinUserEndorsersArgs(args)) {
          throw new McpError(ErrorCode.InvalidParams, "Invalid LinkedIn user endorsers arguments");
        }
        const { urn, count = 10, timeout = 300 } = args as LinkedinUserEndorsersArgs;
        const normalizedUrn = normalizeUserURN(urn);
        const requestData = { timeout, urn: normalizedUrn, count };

        log(`Starting LinkedIn user endorsers lookup for: ${normalizedUrn}`);
        try {
          const response = await makeRequest(API_CONFIG.ENDPOINTS.LINKEDIN_USER_ENDORSERS, requestData);
          log(`User endorsers lookup complete`);
          return {
            content: [{ type: "text", mimeType: "application/json", text: JSON.stringify(response, null, 2) }]
          };
        } catch (error) {
          log("LinkedIn user endorsers lookup error:", error);
          return {
            content: [{ type: "text", mimeType: "text/plain", text: `LinkedIn user endorsers API error: ${formatError(error)}` }],
            isError: true
          };
        }
      }

      case "get_linkedin_user_certificates": {
        if (!isValidLinkedinUserCertificatesArgs(args)) {
          throw new McpError(ErrorCode.InvalidParams, "Invalid LinkedIn user certificates arguments");
        }
        const { urn, timeout = 300 } = args as LinkedinUserCertificatesArgs;
        const normalizedUrn = normalizeUserURN(urn);
        const requestData = { timeout, urn: normalizedUrn };

        log(`Starting LinkedIn user certificates lookup for: ${normalizedUrn}`);
        try {
          const response = await makeRequest(API_CONFIG.ENDPOINTS.LINKEDIN_USER_CERTIFICATES, requestData);
          log(`User certificates lookup complete`);
          return {
            content: [{ type: "text", mimeType: "application/json", text: JSON.stringify(response, null, 2) }]
          };
        } catch (error) {
          log("LinkedIn user certificates lookup error:", error);
          return {
            content: [{ type: "text", mimeType: "text/plain", text: `LinkedIn user certificates API error: ${formatError(error)}` }],
            isError: true
          };
        }
      }

      case "get_linkedin_user_email_db": {
        if (!isValidLinkedinUserEmailDbArgs(args)) {
          throw new McpError(ErrorCode.InvalidParams, "Invalid LinkedIn user email DB arguments");
        }
        const { profile, timeout = 300 } = args as LinkedinUserEmailDbArgs;
        const requestData = { timeout, profile };

        log(`Starting LinkedIn user email DB lookup for: ${profile}`);
        try {
          const response = await makeRequest(API_CONFIG.ENDPOINTS.LINKEDIN_USER_EMAIL_DB, requestData);
          log(`User email DB lookup complete`);
          return {
            content: [{ type: "text", mimeType: "application/json", text: JSON.stringify(response, null, 2) }]
          };
        } catch (error) {
          log("LinkedIn user email DB lookup error:", error);
          return {
            content: [{ type: "text", mimeType: "text/plain", text: `LinkedIn user email DB API error: ${formatError(error)}` }],
            isError: true
          };
        }
      }

      case "get_linkedin_management_me": {
        if (!isValidLinkedinManagementMeArgs(args)) {
          throw new McpError(ErrorCode.InvalidParams, "Invalid LinkedIn management me arguments");
        }
        const { timeout = 300 } = args as LinkedinManagementMeArgs;
        const requestData: any = { timeout };
        if (ACCOUNT_ID()) requestData.account_id = ACCOUNT_ID();

        log(`Starting LinkedIn management me lookup`);
        try {
          const response = await makeRequest(API_CONFIG.ENDPOINTS.LINKEDIN_MANAGEMENT_ME, requestData);
          log(`Management me lookup complete`);
          return {
            content: [{ type: "text", mimeType: "application/json", text: JSON.stringify(response, null, 2) }]
          };
        } catch (error) {
          log("LinkedIn management me lookup error:", error);
          return {
            content: [{ type: "text", mimeType: "text/plain", text: `LinkedIn management me API error: ${formatError(error)}` }],
            isError: true
          };
        }
      }

      // ===== NEW INSTAGRAM TOOLS =====

      case "get_instagram_post": {
        if (!isValidInstagramPostArgs(args)) {
          throw new McpError(ErrorCode.InvalidParams, "Invalid Instagram post arguments");
        }
        const { post, timeout = 300 } = args as InstagramPostArgs;
        const requestData = { timeout, post };

        log(`Starting Instagram post lookup for: ${post}`);
        try {
          const response = await makeRequest(API_CONFIG.ENDPOINTS.INSTAGRAM_POST, requestData);
          log(`Instagram post lookup complete`);
          return {
            content: [{ type: "text", mimeType: "application/json", text: JSON.stringify(response, null, 2) }]
          };
        } catch (error) {
          log("Instagram post lookup error:", error);
          return {
            content: [{ type: "text", mimeType: "text/plain", text: `Instagram post API error: ${formatError(error)}` }],
            isError: true
          };
        }
      }

      case "get_instagram_post_likes": {
        if (!isValidInstagramPostLikesArgs(args)) {
          throw new McpError(ErrorCode.InvalidParams, "Invalid Instagram post likes arguments");
        }
        const { post, count, timeout = 300 } = args as InstagramPostLikesArgs;
        const requestData = { timeout, post, count };

        log(`Starting Instagram post likes lookup for: ${post}`);
        try {
          const response = await makeRequest(API_CONFIG.ENDPOINTS.INSTAGRAM_POST_LIKES, requestData);
          log(`Instagram post likes lookup complete`);
          return {
            content: [{ type: "text", mimeType: "application/json", text: JSON.stringify(response, null, 2) }]
          };
        } catch (error) {
          log("Instagram post likes lookup error:", error);
          return {
            content: [{ type: "text", mimeType: "text/plain", text: `Instagram post likes API error: ${formatError(error)}` }],
            isError: true
          };
        }
      }

      case "get_instagram_user_friendships": {
        if (!isValidInstagramUserFriendshipsArgs(args)) {
          throw new McpError(ErrorCode.InvalidParams, "Invalid Instagram user friendships arguments");
        }
        const { user, count, type, timeout = 300 } = args as InstagramUserFriendshipsArgs;
        const requestData = { timeout, user, count, type };

        log(`Starting Instagram user friendships lookup for: ${user} (${type})`);
        try {
          const response = await makeRequest(API_CONFIG.ENDPOINTS.INSTAGRAM_USER_FRIENDSHIPS, requestData);
          log(`Instagram user friendships lookup complete`);
          return {
            content: [{ type: "text", mimeType: "application/json", text: JSON.stringify(response, null, 2) }]
          };
        } catch (error) {
          log("Instagram user friendships lookup error:", error);
          return {
            content: [{ type: "text", mimeType: "text/plain", text: `Instagram user friendships API error: ${formatError(error)}` }],
            isError: true
          };
        }
      }

      case "search_instagram_posts": {
        if (!isValidInstagramSearchPostsArgs(args)) {
          throw new McpError(ErrorCode.InvalidParams, "Invalid Instagram search posts arguments");
        }
        const { query, count, timeout = 300 } = args as InstagramSearchPostsArgs;
        const requestData = { timeout, query, count };

        log(`Starting Instagram posts search for: ${query}`);
        try {
          const response = await makeRequest(API_CONFIG.ENDPOINTS.INSTAGRAM_SEARCH_POSTS, requestData);
          log(`Instagram posts search complete`);
          return {
            content: [{ type: "text", mimeType: "application/json", text: JSON.stringify(response, null, 2) }]
          };
        } catch (error) {
          log("Instagram posts search error:", error);
          return {
            content: [{ type: "text", mimeType: "text/plain", text: `Instagram posts search API error: ${formatError(error)}` }],
            isError: true
          };
        }
      }

      case "get_instagram_user_reels": {
        if (!isValidInstagramUserReelsArgs(args)) {
          throw new McpError(ErrorCode.InvalidParams, "Invalid Instagram user reels arguments");
        }
        const { user, count, timeout = 300 } = args as InstagramUserReelsArgs;
        const requestData = { timeout, user, count };

        log(`Starting Instagram user reels lookup for: ${user}`);
        try {
          const response = await makeRequest(API_CONFIG.ENDPOINTS.INSTAGRAM_USER_REELS, requestData);
          log(`Instagram user reels lookup complete`);
          return {
            content: [{ type: "text", mimeType: "application/json", text: JSON.stringify(response, null, 2) }]
          };
        } catch (error) {
          log("Instagram user reels lookup error:", error);
          return {
            content: [{ type: "text", mimeType: "text/plain", text: `Instagram user reels API error: ${formatError(error)}` }],
            isError: true
          };
        }
      }

      // ===== TWITTER/X TOOLS =====

      case "get_twitter_user": {
        if (!isValidTwitterUserArgs(args)) {
          throw new McpError(ErrorCode.InvalidParams, "Invalid Twitter user arguments");
        }
        const { user, timeout = 300 } = args as TwitterUserArgs;
        const requestData = { timeout, user };

        log(`Starting Twitter user lookup for: ${user}`);
        try {
          const response = await makeRequest(API_CONFIG.ENDPOINTS.TWITTER_USER, requestData);
          log(`Twitter user lookup complete`);
          return {
            content: [{ type: "text", mimeType: "application/json", text: JSON.stringify(response, null, 2) }]
          };
        } catch (error) {
          log("Twitter user lookup error:", error);
          return {
            content: [{ type: "text", mimeType: "text/plain", text: `Twitter user API error: ${formatError(error)}` }],
            isError: true
          };
        }
      }

      case "search_twitter_users": {
        if (!isValidTwitterSearchUsersArgs(args)) {
          throw new McpError(ErrorCode.InvalidParams, "Invalid Twitter search users arguments");
        }
        const { count, query, timeout = 300 } = args as TwitterSearchUsersArgs;
        const requestData: any = { timeout, count };
        if (query) requestData.query = query;

        log(`Starting Twitter users search`);
        try {
          const response = await makeRequest(API_CONFIG.ENDPOINTS.TWITTER_SEARCH_USERS, requestData);
          log(`Twitter users search complete`);
          return {
            content: [{ type: "text", mimeType: "application/json", text: JSON.stringify(response, null, 2) }]
          };
        } catch (error) {
          log("Twitter users search error:", error);
          return {
            content: [{ type: "text", mimeType: "text/plain", text: `Twitter users search API error: ${formatError(error)}` }],
            isError: true
          };
        }
      }

      case "get_twitter_user_posts": {
        if (!isValidTwitterUserPostsArgs(args)) {
          throw new McpError(ErrorCode.InvalidParams, "Invalid Twitter user posts arguments");
        }
        const { user, count, timeout = 300 } = args as TwitterUserPostsArgs;
        const requestData = { timeout, user, count };

        log(`Starting Twitter user posts lookup for: ${user}`);
        try {
          const response = await makeRequest(API_CONFIG.ENDPOINTS.TWITTER_USER_POSTS, requestData);
          log(`Twitter user posts lookup complete`);
          return {
            content: [{ type: "text", mimeType: "application/json", text: JSON.stringify(response, null, 2) }]
          };
        } catch (error) {
          log("Twitter user posts lookup error:", error);
          return {
            content: [{ type: "text", mimeType: "text/plain", text: `Twitter user posts API error: ${formatError(error)}` }],
            isError: true
          };
        }
      }

      case "search_twitter_posts": {
        if (!isValidTwitterSearchPostsArgs(args)) {
          throw new McpError(ErrorCode.InvalidParams, "Invalid Twitter search posts arguments");
        }
        const typedArgs = args as TwitterSearchPostsArgs;
        const { count, timeout = 300, ...optionalParams } = typedArgs;
        const requestData: any = { timeout, count };

        // Add all optional search parameters
        Object.keys(optionalParams).forEach(key => {
          if (optionalParams[key as keyof typeof optionalParams] !== undefined) {
            requestData[key] = optionalParams[key as keyof typeof optionalParams];
          }
        });

        log(`Starting Twitter posts search`);
        try {
          const response = await makeRequest(API_CONFIG.ENDPOINTS.TWITTER_SEARCH_POSTS, requestData);
          log(`Twitter posts search complete`);
          return {
            content: [{ type: "text", mimeType: "application/json", text: JSON.stringify(response, null, 2) }]
          };
        } catch (error) {
          log("Twitter posts search error:", error);
          return {
            content: [{ type: "text", mimeType: "text/plain", text: `Twitter posts search API error: ${formatError(error)}` }],
            isError: true
          };
        }
      }

      case "get_twitter_post": {
        if (!isValidTwitterPostArgs(args)) {
          throw new McpError(ErrorCode.InvalidParams, "Invalid Twitter post arguments");
        }
        const { post_url, timeout = 300 } = args as TwitterPostArgs;
        const requestData = { timeout, post_url };

        log(`Starting Twitter post lookup for: ${post_url}`);
        try {
          const response = await makeRequest(API_CONFIG.ENDPOINTS.TWITTER_POST, requestData);
          log(`Twitter post lookup complete`);
          return {
            content: [{ type: "text", mimeType: "application/json", text: JSON.stringify(response, null, 2) }]
          };
        } catch (error) {
          log("Twitter post lookup error:", error);
          return {
            content: [{ type: "text", mimeType: "text/plain", text: `Twitter post API error: ${formatError(error)}` }],
            isError: true
          };
        }
      }

      // ===== WEB PARSER TOOLS =====

      case "parse_webpage": {
        if (!isValidWebParserParseArgs(args)) {
          throw new McpError(ErrorCode.InvalidParams, "Invalid web parser parse arguments");
        }
        const typedArgs = args as WebParserParseArgs;
        const { url, timeout = 300, ...optionalParams } = typedArgs;
        const requestData: any = { timeout, url };

        // Add all optional parameters
        Object.keys(optionalParams).forEach(key => {
          if (optionalParams[key as keyof typeof optionalParams] !== undefined) {
            requestData[key] = optionalParams[key as keyof typeof optionalParams];
          }
        });

        log(`Starting webpage parse for: ${url}`);
        try {
          const response = await makeRequest(API_CONFIG.ENDPOINTS.WEBPARSER_PARSE, requestData);
          log(`Webpage parse complete`);
          return {
            content: [{ type: "text", mimeType: "application/json", text: JSON.stringify(response, null, 2) }]
          };
        } catch (error) {
          log("Webpage parse error:", error);
          return {
            content: [{ type: "text", mimeType: "text/plain", text: `Webpage parse API error: ${formatError(error)}` }],
            isError: true
          };
        }
      }

      case "get_sitemap": {
        if (!isValidWebParserSitemapArgs(args)) {
          throw new McpError(ErrorCode.InvalidParams, "Invalid sitemap arguments");
        }
        const { url, timeout = 300 } = args as WebParserSitemapArgs;
        const requestData = { timeout, url };

        log(`Starting sitemap fetch for: ${url}`);
        try {
          const response = await makeRequest(API_CONFIG.ENDPOINTS.WEBPARSER_SITEMAP, requestData);
          log(`Sitemap fetch complete`);
          return {
            content: [{ type: "text", mimeType: "application/json", text: JSON.stringify(response, null, 2) }]
          };
        } catch (error) {
          log("Sitemap fetch error:", error);
          return {
            content: [{ type: "text", mimeType: "text/plain", text: `Sitemap fetch API error: ${formatError(error)}` }],
            isError: true
          };
        }
      }

      // ===== CHATGPT DEEP RESEARCH TOOLS =====

      case "search": {
        if (!isValidChatGPTSearchArgs(args)) {
          throw new McpError(ErrorCode.InvalidParams, "Invalid search arguments");
        }
        const { query, count = 10, timeout = 300 } = args as ChatGPTSearchArgs;
        const requestData = { timeout, query, count };

        log(`Starting ChatGPT Deep Research search for: ${query}`);
        try {
          const response = await makeRequest(API_CONFIG.ENDPOINTS.SEARCH_USERS, requestData);
          log(`Search complete`);
          return {
            content: [{ type: "text", mimeType: "application/json", text: JSON.stringify(response, null, 2) }]
          };
        } catch (error) {
          log("Search error:", error);
          return {
            content: [{ type: "text", mimeType: "text/plain", text: `Search API error: ${formatError(error)}` }],
            isError: true
          };
        }
      }

      case "fetch": {
        if (!isValidChatGPTFetchArgs(args)) {
          throw new McpError(ErrorCode.InvalidParams, "Invalid fetch arguments");
        }
        const { id, timeout = 300 } = args as ChatGPTFetchArgs;
        const requestData = { timeout, user: id, with_experience: true, with_education: true, with_skills: true };

        log(`Starting ChatGPT Deep Research fetch for: ${id}`);
        try {
          const response = await makeRequest(API_CONFIG.ENDPOINTS.USER_PROFILE, requestData);
          log(`Fetch complete`);
          return {
            content: [{ type: "text", mimeType: "application/json", text: JSON.stringify(response, null, 2) }]
          };
        } catch (error) {
          log("Fetch error:", error);
          return {
            content: [{ type: "text", mimeType: "text/plain", text: `Fetch API error: ${formatError(error)}` }],
            isError: true
          };
        }
      }

      default:
        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
    }
  } catch (error) {
    log("Tool error:", error);
    return {
      content: [
        {
          type: "text",
          mimeType: "text/plain",
          text: `API error: ${formatError(error)}`
        }
      ],
      isError: true
    };
  }
});

async function runServer() {
  debugLog("runServer() called");
  const transport = new StdioServerTransport();
  log("Starting AnySite MCP Server...");

  process.on("uncaughtException", (error) => {
    debugLog("Uncaught Exception:", error);
    log("Uncaught Exception:", error);
  });
  process.on("unhandledRejection", (reason, promise) => {
    debugLog("Unhandled Rejection at:", promise, "reason:", reason);
    log("Unhandled Rejection at:", promise, "reason:", reason);
  });

  debugLog("Connecting to transport...");
  await server.connect(transport);
  debugLog("Transport connected successfully");
  log("AnySite MCP Server running on stdio");
}

debugLog("About to call runServer()");
runServer().catch((error) => {
  debugLog("Fatal error in runServer():", error);
  log("Fatal error running server:", error);
  process.exit(1);
});