// src/index.ts - Smithery TypeScript runtime adapter
import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import https from "https";
import { Buffer } from "buffer";

/**
 * Configuration schema for AnySite MCP server
 */
export const configSchema = z.object({
  ANYSITE_ACCESS_TOKEN: z.string().describe("AnySite API access token"),
  ANYSITE_ACCOUNT_ID: z.string().describe("AnySite account ID (required for management operations)").optional(),
});

// API Configuration
let API_KEY: string;
let ACCOUNT_ID: string | undefined;

const API_CONFIG = {
  BASE_URL: "https://api.anysite.io",
  ENDPOINTS: {
    SEARCH_USERS: "/api/linkedin/search/users",
    USER_PROFILE: "/api/linkedin/user",
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
    POST_COMMENT: "/api/linkedin/management/post/comment",
    USER_CONNECTIONS: "/api/linkedin/management/user/connections",
    LINKEDIN_POST_REPOSTS: "/api/linkedin/post/reposts",
    LINKEDIN_POST_COMMENTS: "/api/linkedin/post/comments",
    LINKEDIN_POST_REACTIONS: "/api/linkedin/post/reactions",
    LINKEDIN_GOOGLE_COMPANY: "/api/linkedin/google/company",
    LINKEDIN_COMPANY: "/api/linkedin/company",
    LINKEDIN_COMPANY_EMPLOYEES: "/api/linkedin/company/employees",
    LINKEDIN_COMPANY_POSTS: "/api/linkedin/company/posts",
    LINKEDIN_POST: "/api/linkedin/management/post",
    LINKEDIN_SN_SEARCH_USERS: "/api/linkedin/sn_search/users",
    CONVERSATIONS: "/api/linkedin/management/conversations",
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
    // Web Parser endpoints
    WEBPARSER_PARSE: "/api/webparser/parse",
    WEBPARSER_SITEMAP: "/api/webparser/sitemap",
    // ===== NEW ENDPOINTS (v1.0.0 - API v17) =====
    // DuckDuckGo
    DUCKDUCKGO_SEARCH: "/api/duckduckgo/search",
    // YouTube
    YOUTUBE_SEARCH_VIDEOS: "/api/youtube/search/videos",
    YOUTUBE_VIDEO: "/api/youtube/video",
    YOUTUBE_VIDEO_SUBTITLES: "/api/youtube/video/subtitles",
    // SEC
    SEC_SEARCH_COMPANIES: "/api/sec/search/companies",
    SEC_DOCUMENT: "/api/sec/document",
    // Y Combinator
    YC_COMPANY: "/api/yc/company",
    YC_SEARCH_COMPANIES: "/api/yc/search/companies",
    YC_SEARCH_FOUNDERS: "/api/yc/search/founders",
    // Reddit User
    REDDIT_USER_POSTS: "/api/reddit/user/posts",
    REDDIT_USER_COMMENTS: "/api/reddit/user/comments",
    // LinkedIn User Details
    LINKEDIN_USER_EDUCATION: "/api/linkedin/user/education",
    LINKEDIN_USER_EXPERIENCE: "/api/linkedin/user/experience",
    LINKEDIN_USER_SKILLS: "/api/linkedin/user/skills",
    LINKEDIN_USER_HONORS: "/api/linkedin/user/honors",
    LINKEDIN_USER_PATENTS: "/api/linkedin/user/patents",
    LINKEDIN_USER_LANGUAGES: "/api/linkedin/user/languages",
    // LinkedIn Search Extensions
    LINKEDIN_SEARCH_EDUCATIONS: "/api/linkedin/search/educations",
    LINKEDIN_SEARCH_LOCATIONS: "/api/linkedin/search/locations",
    LINKEDIN_SEARCH_INDUSTRIES: "/api/linkedin/search/industries",
    LINKEDIN_SEARCH_JOBS: "/api/linkedin/search/jobs",
    LINKEDIN_SEARCH_COMPANIES: "/api/linkedin/search/companies",
    // LinkedIn Company & Management
    LINKEDIN_COMPANY_EMPLOYEE_STATS: "/api/linkedin/company/employee_stats",
    LINKEDIN_MANAGEMENT_COMPANY_MENTIONS: "/api/linkedin/management/company/mentions",
    LINKEDIN_MANAGEMENT_CHAT_ATTACHMENT_BASE64: "/api/linkedin/management/chat/attachment/base64",
    // LinkedIn Groups
    LINKEDIN_GROUP: "/api/linkedin/group"
  }
};

// Logging function
const log = (...args: any[]) => {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}]`, ...args);
};

const formatError = (error: any): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
};

// URN validation and normalization
const normalizeUserURN = (urn: string): string => {
  if (!urn.includes("fsd_profile:")) {
    return `fsd_profile:${urn}`;
  }
  return urn;
};

const isValidUserURN = (urn: string): boolean => {
  return urn.startsWith("fsd_profile:");
};

// HTTP Request function
const makeRequest = (endpoint: string, data: any, method: string = "POST"): Promise<any> => {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, API_CONFIG.BASE_URL);
    const postData = JSON.stringify(data);

    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: method,
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(postData),
        "access-token": API_KEY,
        ...(ACCOUNT_ID && { "x-account-id": ACCOUNT_ID })
      }
    };

    const req = https.request(options, (res) => {
      let responseData = "";
      res.on("data", (chunk) => {
        responseData += chunk;
      });

      res.on("end", () => {
        try {
          const parsed = JSON.parse(responseData);
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject(new Error(`API error ${res.statusCode}: ${JSON.stringify(parsed)}`));
          }
        } catch (e) {
          reject(new Error(`Failed to parse response: ${responseData}`));
        }
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
};

/**
 * Default export required by Smithery TypeScript runtime
 */
export default function createServer({ config }: { config: z.infer<typeof configSchema> }) {
  // Set environment variables and global API credentials
  if (config?.ANYSITE_ACCESS_TOKEN) {
    process.env.ANYSITE_ACCESS_TOKEN = config.ANYSITE_ACCESS_TOKEN;
    API_KEY = config.ANYSITE_ACCESS_TOKEN;
  }
  if (config?.ANYSITE_ACCOUNT_ID) {
    process.env.ANYSITE_ACCOUNT_ID = config.ANYSITE_ACCOUNT_ID;
    ACCOUNT_ID = config.ANYSITE_ACCOUNT_ID;
  }

  if (!API_KEY) {
    throw new Error("ANYSITE_ACCESS_TOKEN is required");
  }

  log("Initializing AnySite MCP Server with Smithery runtime");

  // Create MCP server
  const server = new McpServer({
    name: "anysite-mcp-server",
    version: "0.3.0"
  });

  // Register search_linkedin_users tool
  server.tool(
    "search_linkedin_users",
    "Search for LinkedIn users with various filters",
    {
      keywords: z.string().optional().describe("Search keywords"),
      first_name: z.string().optional().describe("First name"),
      last_name: z.string().optional().describe("Last name"),
      title: z.string().optional().describe("Job title"),
      company_keywords: z.string().optional().describe("Company keywords"),
      count: z.number().default(10).describe("Max results"),
      timeout: z.number().default(300).describe("Timeout in seconds")
    },
    async ({ keywords, first_name, last_name, title, company_keywords, count, timeout }) => {
      const requestData: any = { timeout, count };
      if (keywords) requestData.keywords = keywords;
      if (first_name) requestData.first_name = first_name;
      if (last_name) requestData.last_name = last_name;
      if (title) requestData.title = title;
      if (company_keywords) requestData.company_keywords = company_keywords;

      log("Starting LinkedIn users search with:", JSON.stringify(requestData));
      try {
        const response = await makeRequest(API_CONFIG.ENDPOINTS.SEARCH_USERS, requestData);
        log(`Search complete, found ${response.length} results`);
        return {
          content: [
            {
              type: "text",
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
              text: `LinkedIn search API error: ${formatError(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // Register get_linkedin_profile tool
  server.tool(
    "get_linkedin_profile",
    "Get detailed information about a LinkedIn user profile",
    {
      user: z.string().describe("User alias, URL, or URN"),
      with_experience: z.boolean().default(true).describe("Include experience info"),
      with_education: z.boolean().default(true).describe("Include education info"),
      with_skills: z.boolean().default(true).describe("Include skills info")
    },
    async ({ user, with_experience, with_education, with_skills }) => {
      const requestData = { timeout: 300, user, with_experience, with_education, with_skills };
      log("Starting LinkedIn profile lookup for:", user);
      try {
        const response = await makeRequest(API_CONFIG.ENDPOINTS.USER_PROFILE, requestData);
        return {
          content: [
            {
              type: "text",
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
              text: `LinkedIn API error: ${formatError(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // Register get_instagram_user tool
  server.tool(
    "get_instagram_user",
    "Get Instagram user information",
    {
      user: z.string().describe("User ID, alias or URL"),
      timeout: z.number().default(300).describe("Timeout in seconds")
    },
    async ({ user, timeout }) => {
      const requestData = { timeout, user };
      log("Starting Instagram user lookup for:", user);
      try {
        const response = await makeRequest(API_CONFIG.ENDPOINTS.INSTAGRAM_USER, requestData);
        return {
          content: [
            {
              type: "text",
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
              text: `Instagram user API error: ${formatError(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // LinkedIn user tools
  server.tool(
    "get_linkedin_email_user",
    "Get LinkedIn user details by email",
    {
      email: z.string().describe("Email address"),
      count: z.number().default(5).describe("Max results"),
      timeout: z.number().default(300).describe("Timeout in seconds")
    },
    async ({ email, count, timeout }) => {
      const requestData = { timeout, email, count };
      log("Starting LinkedIn email lookup for:", email);
      try {
        const response = await makeRequest(API_CONFIG.ENDPOINTS.LINKEDIN_EMAIL, requestData);
        return {
          content: [{ type: "text", text: JSON.stringify(response, null, 2) }]
        };
      } catch (error) {
        log("LinkedIn email lookup error:", error);
        return {
          content: [{ type: "text", text: `LinkedIn email API error: ${formatError(error)}` }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "get_linkedin_user_posts",
    "Get LinkedIn posts for a user by URN (must include prefix, example: fsd_profile:ACoAAEWn01Q...)",
    {
      urn: z.string().describe("User URN (must include prefix, example: fsd_profile:ACoAA...)"),
      count: z.number().default(10).describe("Max posts"),
      timeout: z.number().default(300).describe("Timeout in seconds")
    },
    async ({ urn, count, timeout }) => {
      const normalizedURN = normalizeUserURN(urn);
      if (!isValidUserURN(normalizedURN)) {
        return {
          content: [{ type: "text", text: "Invalid URN format. Must start with 'fsd_profile:'" }],
          isError: true
        };
      }
      log("Starting LinkedIn user posts lookup for urn:", normalizedURN);
      const requestData = { timeout, urn: normalizedURN, count };
      try {
        const response = await makeRequest(API_CONFIG.ENDPOINTS.LINKEDIN_USER_POSTS, requestData);
        return {
          content: [{ type: "text", text: JSON.stringify(response, null, 2) }]
        };
      } catch (error) {
        log("LinkedIn user posts lookup error:", error);
        return {
          content: [{ type: "text", text: `LinkedIn user posts API error: ${formatError(error)}` }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "get_linkedin_user_reactions",
    "Get LinkedIn reactions for a user by URN",
    {
      urn: z.string().describe("User URN (must include prefix, example: fsd_profile:ACoAA...)"),
      count: z.number().default(10).describe("Max reactions"),
      timeout: z.number().default(300).describe("Timeout in seconds")
    },
    async ({ urn, count, timeout }) => {
      const normalizedURN = normalizeUserURN(urn);
      if (!isValidUserURN(normalizedURN)) {
        return {
          content: [{ type: "text", text: "Invalid URN format. Must start with 'fsd_profile:'" }],
          isError: true
        };
      }
      log("Starting LinkedIn user reactions lookup for urn:", normalizedURN);
      const requestData = { timeout, urn: normalizedURN, count };
      try {
        const response = await makeRequest(API_CONFIG.ENDPOINTS.LINKEDIN_USER_REACTIONS, requestData);
        return {
          content: [{ type: "text", text: JSON.stringify(response, null, 2) }]
        };
      } catch (error) {
        log("LinkedIn user reactions lookup error:", error);
        return {
          content: [{ type: "text", text: `LinkedIn user reactions API error: ${formatError(error)}` }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "get_linkedin_user_comments",
    "Get LinkedIn comments for a user by URN",
    {
      urn: z.string().describe("User URN (must include prefix)"),
      count: z.number().default(10).describe("Max comments"),
      timeout: z.number().default(300).describe("Timeout in seconds"),
      commented_after: z.number().optional().describe("Filter comments after timestamp")
    },
    async ({ urn, count, timeout, commented_after }) => {
      const normalizedURN = normalizeUserURN(urn);
      if (!isValidUserURN(normalizedURN)) {
        return {
          content: [{ type: "text", text: "Invalid URN format. Must start with 'fsd_profile:'" }],
          isError: true
        };
      }
      log("Starting LinkedIn user comments lookup for urn:", normalizedURN);
      const requestData: any = { timeout, urn: normalizedURN, count };
      if (commented_after !== undefined) {
        requestData.commented_after = commented_after;
      }
      try {
        const response = await makeRequest(API_CONFIG.ENDPOINTS.LINKEDIN_USER_COMMENTS, requestData);
        return {
          content: [{ type: "text", text: JSON.stringify(response, null, 2) }]
        };
      } catch (error) {
        log("LinkedIn user comments lookup error:", error);
        return {
          content: [{ type: "text", text: `LinkedIn user comments API error: ${formatError(error)}` }],
          isError: true
        };
      }
    }
  );

  // LinkedIn post tools
  server.tool(
    "search_linkedin_posts",
    "Search LinkedIn posts with keywords and filters",
    {
      keywords: z.string().describe("Search keywords"),
      count: z.number().default(10).describe("Max results"),
      timeout: z.number().default(300).describe("Timeout in seconds"),
      sort: z.string().optional().describe("Sort order"),
      date_posted: z.string().optional().describe("Date filter")
    },
    async ({ keywords, count, timeout, sort, date_posted }) => {
      const requestData: any = { timeout, keywords, count };
      if (sort) requestData.sort = sort;
      if (date_posted) requestData.date_posted = date_posted;
      log("Starting LinkedIn posts search with:", JSON.stringify(requestData));
      try {
        const response = await makeRequest(API_CONFIG.ENDPOINTS.LINKEDIN_SEARCH_POSTS, requestData);
        log(`Search complete, found ${response.length} results`);
        return {
          content: [{ type: "text", text: JSON.stringify(response, null, 2) }]
        };
      } catch (error) {
        log("LinkedIn search posts error:", error);
        return {
          content: [{ type: "text", text: `LinkedIn search posts API error: ${formatError(error)}` }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "get_linkedin_post_comments",
    "Get LinkedIn post comments",
    {
      urn: z.string().describe("Post URN"),
      count: z.number().default(10).describe("Max comments"),
      timeout: z.number().default(300).describe("Timeout in seconds"),
      sort: z.string().default("relevance").describe("Sort order")
    },
    async ({ urn, count, timeout, sort }) => {
      const requestData = { timeout, urn, sort, count };
      log(`Starting LinkedIn post comments lookup for: ${urn}`);
      try {
        const response = await makeRequest(API_CONFIG.ENDPOINTS.LINKEDIN_POST_COMMENTS, requestData);
        return {
          content: [{ type: "text", text: JSON.stringify(response, null, 2) }]
        };
      } catch (error) {
        log("LinkedIn post comments lookup error:", error);
        return {
          content: [{ type: "text", text: `LinkedIn post comments API error: ${formatError(error)}` }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "get_linkedin_post_reactions",
    "Get LinkedIn post reactions",
    {
      urn: z.string().describe("Post URN"),
      count: z.number().default(50).describe("Max reactions"),
      timeout: z.number().default(300).describe("Timeout in seconds")
    },
    async ({ urn, count, timeout }) => {
      const requestData = { timeout, urn, count };
      log(`Starting LinkedIn post reactions lookup for: ${urn}`);
      try {
        const response = await makeRequest(API_CONFIG.ENDPOINTS.LINKEDIN_POST_REACTIONS, requestData);
        return {
          content: [{ type: "text", text: JSON.stringify(response, null, 2) }]
        };
      } catch (error) {
        log("LinkedIn post reactions lookup error:", error);
        return {
          content: [{ type: "text", text: `LinkedIn post reactions API error: ${formatError(error)}` }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "get_linkedin_post_reposts",
    "Get LinkedIn post reposts",
    {
      urn: z.string().describe("Post URN"),
      count: z.number().default(10).describe("Max reposts"),
      timeout: z.number().default(300).describe("Timeout in seconds")
    },
    async ({ urn, count, timeout }) => {
      const requestData = { timeout, urn, count };
      log(`Starting LinkedIn post reposts lookup for: ${urn}`);
      try {
        const response = await makeRequest(API_CONFIG.ENDPOINTS.LINKEDIN_POST_REPOSTS, requestData);
        return {
          content: [{ type: "text", text: JSON.stringify(response, null, 2) }]
        };
      } catch (error) {
        log("LinkedIn post reposts lookup error:", error);
        return {
          content: [{ type: "text", text: `LinkedIn post reposts API error: ${formatError(error)}` }],
          isError: true
        };
      }
    }
  );

  // LinkedIn company tools
  server.tool(
    "get_linkedin_company",
    "Get LinkedIn company information",
    {
      company: z.string().describe("Company alias, URL or URN"),
      timeout: z.number().default(300).describe("Timeout in seconds")
    },
    async ({ company, timeout }) => {
      const requestData = { timeout, company };
      log(`Starting LinkedIn company lookup for: ${company}`);
      try {
        const response = await makeRequest(API_CONFIG.ENDPOINTS.LINKEDIN_COMPANY, requestData);
        return {
          content: [{ type: "text", text: JSON.stringify(response, null, 2) }]
        };
      } catch (error) {
        log("LinkedIn company lookup error:", error);
        return {
          content: [{ type: "text", text: `LinkedIn company API error: ${formatError(error)}` }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "get_linkedin_company_employees",
    "Get LinkedIn company employees",
    {
      companies: z.array(z.string()).describe("Company URNs or aliases"),
      keywords: z.string().optional().describe("Search keywords"),
      first_name: z.string().optional().describe("First name filter"),
      last_name: z.string().optional().describe("Last name filter"),
      count: z.number().default(10).describe("Max employees"),
      timeout: z.number().default(300).describe("Timeout in seconds")
    },
    async ({ companies, keywords, first_name, last_name, count, timeout }) => {
      const requestData: any = { timeout, companies, count };
      if (keywords) requestData.keywords = keywords;
      if (first_name) requestData.first_name = first_name;
      if (last_name) requestData.last_name = last_name;
      log(`Starting LinkedIn company employees lookup for companies: ${companies.join(', ')}`);
      try {
        const response = await makeRequest(API_CONFIG.ENDPOINTS.LINKEDIN_COMPANY_EMPLOYEES, requestData);
        return {
          content: [{ type: "text", text: JSON.stringify(response, null, 2) }]
        };
      } catch (error) {
        log("LinkedIn company employees lookup error:", error);
        return {
          content: [{ type: "text", text: `LinkedIn company employees API error: ${formatError(error)}` }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "get_linkedin_company_posts",
    "Get LinkedIn company posts",
    {
      urn: z.string().describe("Company URN (example: company:11130470)"),
      count: z.number().default(10).describe("Max posts"),
      timeout: z.number().default(300).describe("Timeout in seconds")
    },
    async ({ urn, count, timeout }) => {
      const requestData = { timeout, urn, count };
      log(`Starting LinkedIn company posts lookup for: ${urn}`);
      try {
        const response = await makeRequest(API_CONFIG.ENDPOINTS.LINKEDIN_COMPANY_POSTS, requestData);
        log(`Company posts lookup complete, found ${response.length} results`);
        return {
          content: [{ type: "text", text: JSON.stringify(response, null, 2) }]
        };
      } catch (error) {
        log("LinkedIn company posts lookup error:", error);
        return {
          content: [{ type: "text", text: `LinkedIn company posts API error: ${formatError(error)}` }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "get_linkedin_google_company",
    "Search company via Google",
    {
      keywords: z.array(z.string()).describe("Company search keywords"),
      with_urn: z.boolean().default(false).describe("Include LinkedIn URN"),
      count_per_keyword: z.number().default(1).describe("Results per keyword"),
      timeout: z.number().default(300).describe("Timeout in seconds")
    },
    async ({ keywords, with_urn, count_per_keyword, timeout }) => {
      const requestData = { timeout, keywords, with_urn, count_per_keyword };
      log(`Starting LinkedIn Google company search for keywords: ${keywords.join(', ')}`);
      try {
        const response = await makeRequest(API_CONFIG.ENDPOINTS.LINKEDIN_GOOGLE_COMPANY, requestData);
        return {
          content: [{ type: "text", text: JSON.stringify(response, null, 2) }]
        };
      } catch (error) {
        log("LinkedIn Google company search error:", error);
        return {
          content: [{ type: "text", text: `LinkedIn Google company search API error: ${formatError(error)}` }],
          isError: true
        };
      }
    }
  );

  // Instagram tools
  server.tool(
    "get_instagram_user_posts",
    "Get Instagram user posts",
    {
      user: z.string().describe("User ID, alias or URL"),
      count: z.number().describe("Max posts"),
      timeout: z.number().default(300).describe("Timeout in seconds")
    },
    async ({ user, count, timeout }) => {
      const requestData = { timeout, user, count };
      log(`Starting Instagram user posts lookup for: ${user}`);
      try {
        const response = await makeRequest(API_CONFIG.ENDPOINTS.INSTAGRAM_USER_POSTS, requestData);
        log(`Posts lookup complete, found ${response.length} results`);
        return {
          content: [{ type: "text", text: JSON.stringify(response, null, 2) }]
        };
      } catch (error) {
        log("Instagram user posts lookup error:", error);
        return {
          content: [{ type: "text", text: `Instagram user posts API error: ${formatError(error)}` }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "get_instagram_post_comments",
    "Get Instagram post comments",
    {
      post: z.string().describe("Post ID"),
      count: z.number().describe("Max comments"),
      timeout: z.number().default(300).describe("Timeout in seconds")
    },
    async ({ post, count, timeout }) => {
      const requestData = { timeout, post, count };
      log(`Starting Instagram post comments lookup for: ${post}`);
      try {
        const response = await makeRequest(API_CONFIG.ENDPOINTS.INSTAGRAM_POST_COMMENTS, requestData);
        log(`Comments lookup complete, found ${response.length} results`);
        return {
          content: [{ type: "text", text: JSON.stringify(response, null, 2) }]
        };
      } catch (error) {
        log("Instagram post comments lookup error:", error);
        return {
          content: [{ type: "text", text: `Instagram post comments API error: ${formatError(error)}` }],
          isError: true
        };
      }
    }
  );

  // Reddit search
  server.tool(
    "search_reddit_posts",
    "Search Reddit posts",
    {
      query: z.string().describe("Search query"),
      count: z.number().default(10).describe("Max results"),
      timeout: z.number().default(300).describe("Timeout in seconds"),
      sort: z.string().default("relevance").describe("Sort order"),
      time_filter: z.string().default("all").describe("Time filter")
    },
    async ({ query, count, timeout, sort, time_filter }) => {
      const requestData = { timeout, query, sort, time_filter, count };
      log("Starting Reddit posts search with:", JSON.stringify(requestData));
      try {
        const response = await makeRequest(API_CONFIG.ENDPOINTS.REDDIT_SEARCH_POSTS, requestData);
        log(`Search complete, found ${response.length} results`);
        return {
          content: [{ type: "text", text: JSON.stringify(response, null, 2) }]
        };
      } catch (error) {
        log("Reddit search posts error:", error);
        return {
          content: [{ type: "text", text: `Reddit search posts API error: ${formatError(error)}` }],
          isError: true
        };
      }
    }
  );

  // Reddit posts by URL
  server.tool(
    "get_reddit_posts",
    "Get Reddit post details by post URL",
    {
      post_url: z.string().describe("Reddit post URL (e.g., '/r/DogAdvice/comments/1o2g2pq/i_think_i_need_to_rehome_my_dog/')"),
      timeout: z.number().default(300).describe("Timeout in seconds")
    },
    async ({ post_url, timeout }) => {
      const requestData = { timeout, post_url };
      log(`Starting Reddit post lookup for: ${post_url}`);
      try {
        const response = await makeRequest(API_CONFIG.ENDPOINTS.REDDIT_POSTS, requestData);
        return {
          content: [{ type: "text", text: JSON.stringify(response, null, 2) }]
        };
      } catch (error) {
        log("Reddit posts lookup error:", error);
        return {
          content: [{ type: "text", text: `Reddit posts API error: ${formatError(error)}` }],
          isError: true
        };
      }
    }
  );

  // Reddit post comments
  server.tool(
    "get_reddit_post_comments",
    "Get comments for a Reddit post by post URL",
    {
      post_url: z.string().describe("Reddit post URL (e.g., '/r/DogAdvice/comments/1o2g2pq/i_think_i_need_to_rehome_my_dog/')"),
      timeout: z.number().default(300).describe("Timeout in seconds")
    },
    async ({ post_url, timeout }) => {
      const requestData = { timeout, post_url };
      log(`Starting Reddit post comments lookup for: ${post_url}`);
      try {
        const response = await makeRequest(API_CONFIG.ENDPOINTS.REDDIT_POST_COMMENTS, requestData);
        return {
          content: [{ type: "text", text: JSON.stringify(response, null, 2) }]
        };
      } catch (error) {
        log("Reddit post comments lookup error:", error);
        return {
          content: [{ type: "text", text: `Reddit post comments API error: ${formatError(error)}` }],
          isError: true
        };
      }
    }
  );

  // LinkedIn management tools (require ACCOUNT_ID)
  server.tool(
    "get_linkedin_chat_messages",
    "Get LinkedIn chat messages (requires ACCOUNT_ID)",
    {
      user: z.string().describe("User URN (must include prefix)"),
      company: z.string().optional().describe("Company URN"),
      count: z.number().default(20).describe("Max messages"),
      timeout: z.number().default(300).describe("Timeout in seconds")
    },
    async ({ user, company, count, timeout }) => {
      const normalizedUser = normalizeUserURN(user);
      if (!isValidUserURN(normalizedUser)) {
        return {
          content: [{ type: "text", text: "Invalid URN format. Must start with 'fsd_profile:'" }],
          isError: true
        };
      }
      const requestData: any = { timeout, user: normalizedUser, count, account_id: ACCOUNT_ID };
      if (company) requestData.company = company;
      log("Starting LinkedIn chat messages lookup for user:", normalizedUser);
      try {
        const response = await makeRequest(API_CONFIG.ENDPOINTS.CHAT_MESSAGES, requestData);
        return {
          content: [{ type: "text", text: JSON.stringify(response, null, 2) }]
        };
      } catch (error) {
        log("LinkedIn chat messages lookup error:", error);
        return {
          content: [{ type: "text", text: `LinkedIn chat messages API error: ${formatError(error)}` }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "send_linkedin_chat_message",
    "Send LinkedIn chat message (requires ACCOUNT_ID)",
    {
      user: z.string().describe("Recipient user URN (must include prefix)"),
      company: z.string().optional().describe("Company URN"),
      text: z.string().describe("Message text"),
      timeout: z.number().default(300).describe("Timeout in seconds")
    },
    async ({ user, company, text, timeout }) => {
      const normalizedUser = normalizeUserURN(user);
      if (!isValidUserURN(normalizedUser)) {
        return {
          content: [{ type: "text", text: "Invalid URN format. Must start with 'fsd_profile:'" }],
          isError: true
        };
      }
      const requestData: any = { timeout, user: normalizedUser, text, account_id: ACCOUNT_ID };
      if (company) requestData.company = company;
      log("Starting LinkedIn send chat message for user:", normalizedUser);
      try {
        const response = await makeRequest(API_CONFIG.ENDPOINTS.CHAT_MESSAGE, requestData);
        return {
          content: [{ type: "text", text: JSON.stringify(response, null, 2) }]
        };
      } catch (error) {
        log("LinkedIn send chat message error:", error);
        return {
          content: [{ type: "text", text: `LinkedIn send chat message API error: ${formatError(error)}` }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "send_linkedin_connection_request",
    "Send LinkedIn connection request (requires ACCOUNT_ID)",
    {
      user: z.string().describe("User URN (must include prefix)"),
      text: z.string().optional().describe("Optional message"),
      timeout: z.number().default(300).describe("Timeout in seconds")
    },
    async ({ user, text, timeout }) => {
      const normalizedUser = normalizeUserURN(user);
      if (!isValidUserURN(normalizedUser)) {
        return {
          content: [{ type: "text", text: "Invalid URN format. Must start with 'fsd_profile:'" }],
          isError: true
        };
      }
      const requestData: any = { timeout, user: normalizedUser, account_id: ACCOUNT_ID };
      if (text) requestData.text = text;
      log("Sending LinkedIn connection request to user:", normalizedUser);
      try {
        const response = await makeRequest(API_CONFIG.ENDPOINTS.USER_CONNECTION, requestData);
        return {
          content: [{ type: "text", text: JSON.stringify(response, null, 2) }]
        };
      } catch (error) {
        log("LinkedIn connection request error:", error);
        return {
          content: [{ type: "text", text: `LinkedIn connection request API error: ${formatError(error)}` }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "send_linkedin_post_comment",
    "Comment on LinkedIn post (requires ACCOUNT_ID)",
    {
      post: z.string().describe("Post URN (activity: or comment:)"),
      text: z.string().describe("Comment text"),
      timeout: z.number().default(300).describe("Timeout in seconds")
    },
    async ({ post, text, timeout }) => {
      const isActivityOrComment = post.includes("activity:") || post.includes("comment:");
      if (!isActivityOrComment) {
        return {
          content: [{ type: "text", text: "URN must be for an activity or comment" }],
          isError: true
        };
      }
      let urnObj;
      if (post.startsWith("activity:")) {
        urnObj = { type: "activity", value: post.replace("activity:", "") };
      } else if (post.startsWith("comment:")) {
        urnObj = { type: "comment", value: post.replace("comment:", "") };
      } else {
        urnObj = post;
      }
      const requestData = { timeout, text, urn: urnObj, account_id: ACCOUNT_ID };
      log(`Creating LinkedIn comment on ${post}`);
      try {
        const response = await makeRequest(API_CONFIG.ENDPOINTS.POST_COMMENT, requestData);
        return {
          content: [{ type: "text", text: JSON.stringify(response, null, 2) }]
        };
      } catch (error) {
        log("LinkedIn comment creation error:", error);
        return {
          content: [{ type: "text", text: `LinkedIn comment API error: ${formatError(error)}` }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "send_linkedin_post",
    "Create LinkedIn post (requires ACCOUNT_ID)",
    {
      text: z.string().describe("Post text"),
      visibility: z.string().default("ANYONE").describe("Post visibility"),
      comment_scope: z.string().default("ALL").describe("Comment scope"),
      timeout: z.number().default(300).describe("Timeout in seconds")
    },
    async ({ text, visibility, comment_scope, timeout }) => {
      const requestData = { text, visibility, comment_scope, timeout, account_id: ACCOUNT_ID };
      log("Creating LinkedIn post with text:", text.substring(0, 50) + (text.length > 50 ? "..." : ""));
      try {
        const response = await makeRequest(API_CONFIG.ENDPOINTS.LINKEDIN_POST, requestData);
        return {
          content: [{ type: "text", text: JSON.stringify(response, null, 2) }]
        };
      } catch (error) {
        log("LinkedIn post creation error:", error);
        return {
          content: [{ type: "text", text: `LinkedIn post creation API error: ${formatError(error)}` }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "get_linkedin_user_connections",
    "Get user's LinkedIn connections (requires ACCOUNT_ID)",
    {
      connected_after: z.number().optional().describe("Filter connections after timestamp"),
      count: z.number().default(20).describe("Max connections"),
      timeout: z.number().default(300).describe("Timeout in seconds")
    },
    async ({ connected_after, count, timeout }) => {
      const requestData: any = { timeout, account_id: ACCOUNT_ID, count };
      if (connected_after != null) {
        requestData.connected_after = connected_after;
      }
      log("Starting LinkedIn user connections lookup");
      try {
        const response = await makeRequest(API_CONFIG.ENDPOINTS.USER_CONNECTIONS, requestData);
        return {
          content: [{ type: "text", text: JSON.stringify(response, null, 2) }]
        };
      } catch (error) {
        log("LinkedIn user connections lookup error:", error);
        return {
          content: [{ type: "text", text: `LinkedIn user connections API error: ${formatError(error)}` }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "get_linkedin_conversations",
    "Get LinkedIn conversations (requires ACCOUNT_ID)",
    {
      company: z.string().optional().describe("Company URN"),
      connected_after: z.number().optional().describe("Filter after timestamp"),
      count: z.number().default(20).describe("Max conversations"),
      timeout: z.number().default(300).describe("Timeout in seconds")
    },
    async ({ company, connected_after, count, timeout }) => {
      const requestData: any = { timeout, account_id: ACCOUNT_ID, count };
      if (company) requestData.company = company;
      if (connected_after != null) {
        requestData.connected_after = connected_after;
      }
      log("Starting LinkedIn conversations lookup");
      try {
        const response = await makeRequest(API_CONFIG.ENDPOINTS.CONVERSATIONS, requestData);
        return {
          content: [{ type: "text", text: JSON.stringify(response, null, 2) }]
        };
      } catch (error) {
        log("LinkedIn conversations lookup error:", error);
        return {
          content: [{ type: "text", text: `LinkedIn conversations API error: ${formatError(error)}` }],
          isError: true
        };
      }
    }
  );

  // LinkedIn Sales Navigator
  server.tool(
    "linkedin_sales_navigator_search_users",
    "Advanced LinkedIn Sales Navigator user search",
    {
      keywords: z.string().optional().describe("Search keywords"),
      count: z.number().default(10).describe("Max results"),
      timeout: z.number().default(300).describe("Timeout in seconds"),
      first_names: z.array(z.string()).optional().describe("First names"),
      last_names: z.array(z.string()).optional().describe("Last names"),
      current_titles: z.array(z.string()).optional().describe("Current job titles")
    },
    async ({ keywords, count, timeout, first_names, last_names, current_titles }) => {
      const requestData: any = { count, timeout };
      if (keywords) requestData.keywords = keywords;
      if (first_names) requestData.first_names = first_names;
      if (last_names) requestData.last_names = last_names;
      if (current_titles) requestData.current_titles = current_titles;
      log("Starting LinkedIn Sales Navigator users search with filters");
      try {
        const response = await makeRequest(API_CONFIG.ENDPOINTS.LINKEDIN_SN_SEARCH_USERS, requestData);
        log(`Search complete, found ${response.length} results`);
        return {
          content: [{ type: "text", text: JSON.stringify(response, null, 2) }]
        };
      } catch (error) {
        log("LinkedIn Sales Navigator search error:", error);
        return {
          content: [{ type: "text", text: `LinkedIn Sales Navigator search API error: ${formatError(error)}` }],
          isError: true
        };
      }
    }
  );

  // ===== NEW LINKEDIN TOOLS =====

  server.tool(
    "get_linkedin_user_endorsers",
    "Get LinkedIn user endorsers by URN",
    {
      urn: z.string().describe("User URN (with fsd_profile: prefix)"),
      count: z.number().default(10).describe("Max endorsers to return"),
      timeout: z.number().default(300).describe("Timeout in seconds (20-1500)")
    },
    async ({ urn, count, timeout }) => {
      const normalizedUrn = normalizeUserURN(urn);
      const requestData = { timeout, urn: normalizedUrn, count };
      log(`Starting LinkedIn user endorsers lookup for: ${normalizedUrn}`);
      try {
        const response = await makeRequest(API_CONFIG.ENDPOINTS.LINKEDIN_USER_ENDORSERS, requestData);
        log(`User endorsers lookup complete`);
        return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
      } catch (error) {
        log("LinkedIn user endorsers lookup error:", error);
        return { content: [{ type: "text", text: `LinkedIn user endorsers API error: ${formatError(error)}` }], isError: true };
      }
    }
  );

  server.tool(
    "get_linkedin_user_certificates",
    "Get LinkedIn user certificates by URN",
    {
      urn: z.string().describe("User URN (with fsd_profile: prefix)"),
      timeout: z.number().default(300).describe("Timeout in seconds (20-1500)")
    },
    async ({ urn, timeout }) => {
      const normalizedUrn = normalizeUserURN(urn);
      const requestData = { timeout, urn: normalizedUrn };
      log(`Starting LinkedIn user certificates lookup for: ${normalizedUrn}`);
      try {
        const response = await makeRequest(API_CONFIG.ENDPOINTS.LINKEDIN_USER_CERTIFICATES, requestData);
        log(`User certificates lookup complete`);
        return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
      } catch (error) {
        log("LinkedIn user certificates lookup error:", error);
        return { content: [{ type: "text", text: `LinkedIn user certificates API error: ${formatError(error)}` }], isError: true };
      }
    }
  );

  server.tool(
    "get_linkedin_user_email_db",
    "Get LinkedIn user email from internal database (max 10 profiles)",
    {
      profile: z.string().describe("LinkedIn internal_id, profile URL, alias, or set of them (max 10)"),
      timeout: z.number().default(300).describe("Timeout in seconds (20-1500)")
    },
    async ({ profile, timeout }) => {
      const requestData = { timeout, profile };
      log(`Starting LinkedIn user email DB lookup for: ${profile}`);
      try {
        const response = await makeRequest(API_CONFIG.ENDPOINTS.LINKEDIN_USER_EMAIL_DB, requestData);
        log(`User email DB lookup complete`);
        return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
      } catch (error) {
        log("LinkedIn user email DB lookup error:", error);
        return { content: [{ type: "text", text: `LinkedIn user email DB API error: ${formatError(error)}` }], isError: true };
      }
    }
  );

  server.tool(
    "get_linkedin_management_me",
    "Get own LinkedIn profile information (requires ACCOUNT_ID)",
    {
      timeout: z.number().default(300).describe("Timeout in seconds (20-1500)")
    },
    async ({ timeout }) => {
      const requestData: any = { timeout };
      if (ACCOUNT_ID) requestData.account_id = ACCOUNT_ID;
      log(`Starting LinkedIn management me lookup`);
      try {
        const response = await makeRequest(API_CONFIG.ENDPOINTS.LINKEDIN_MANAGEMENT_ME, requestData);
        log(`Management me lookup complete`);
        return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
      } catch (error) {
        log("LinkedIn management me lookup error:", error);
        return { content: [{ type: "text", text: `LinkedIn management me API error: ${formatError(error)}` }], isError: true };
      }
    }
  );

  // ===== NEW INSTAGRAM TOOLS =====

  server.tool(
    "get_instagram_post",
    "Get Instagram post by ID",
    {
      post: z.string().describe("Post ID"),
      timeout: z.number().default(300).describe("Timeout in seconds (20-1500)")
    },
    async ({ post, timeout }) => {
      const requestData = { timeout, post };
      log(`Starting Instagram post lookup for: ${post}`);
      try {
        const response = await makeRequest(API_CONFIG.ENDPOINTS.INSTAGRAM_POST, requestData);
        log(`Instagram post lookup complete`);
        return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
      } catch (error) {
        log("Instagram post lookup error:", error);
        return { content: [{ type: "text", text: `Instagram post API error: ${formatError(error)}` }], isError: true };
      }
    }
  );

  server.tool(
    "get_instagram_post_likes",
    "Get likes from an Instagram post",
    {
      post: z.string().describe("Post ID"),
      count: z.number().describe("Max likes to return"),
      timeout: z.number().default(300).describe("Timeout in seconds (20-1500)")
    },
    async ({ post, count, timeout }) => {
      const requestData = { timeout, post, count };
      log(`Starting Instagram post likes lookup for: ${post}`);
      try {
        const response = await makeRequest(API_CONFIG.ENDPOINTS.INSTAGRAM_POST_LIKES, requestData);
        log(`Instagram post likes lookup complete`);
        return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
      } catch (error) {
        log("Instagram post likes lookup error:", error);
        return { content: [{ type: "text", text: `Instagram post likes API error: ${formatError(error)}` }], isError: true };
      }
    }
  );

  server.tool(
    "get_instagram_user_friendships",
    "Get followers or following list from Instagram user",
    {
      user: z.string().describe("User ID, alias or URL"),
      count: z.number().describe("Max results to return"),
      type: z.enum(["followers", "following"]).describe("Type of relationships to fetch"),
      timeout: z.number().default(300).describe("Timeout in seconds (20-1500)")
    },
    async ({ user, count, type, timeout }) => {
      const requestData = { timeout, user, count, type };
      log(`Starting Instagram user friendships lookup for: ${user} (${type})`);
      try {
        const response = await makeRequest(API_CONFIG.ENDPOINTS.INSTAGRAM_USER_FRIENDSHIPS, requestData);
        log(`Instagram user friendships lookup complete`);
        return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
      } catch (error) {
        log("Instagram user friendships lookup error:", error);
        return { content: [{ type: "text", text: `Instagram user friendships API error: ${formatError(error)}` }], isError: true };
      }
    }
  );

  server.tool(
    "search_instagram_posts",
    "Search Instagram posts by query",
    {
      query: z.string().describe("Search query"),
      count: z.number().describe("Max results to return"),
      timeout: z.number().default(300).describe("Timeout in seconds (20-1500)")
    },
    async ({ query, count, timeout }) => {
      const requestData = { timeout, query, count };
      log(`Starting Instagram posts search for: ${query}`);
      try {
        const response = await makeRequest(API_CONFIG.ENDPOINTS.INSTAGRAM_SEARCH_POSTS, requestData);
        log(`Instagram posts search complete`);
        return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
      } catch (error) {
        log("Instagram posts search error:", error);
        return { content: [{ type: "text", text: `Instagram posts search API error: ${formatError(error)}` }], isError: true };
      }
    }
  );

  server.tool(
    "get_instagram_user_reels",
    "Get reels from an Instagram user profile",
    {
      user: z.string().describe("User ID, alias or URL"),
      count: z.number().describe("Max reels to return"),
      timeout: z.number().default(300).describe("Timeout in seconds (20-1500)")
    },
    async ({ user, count, timeout }) => {
      const requestData = { timeout, user, count };
      log(`Starting Instagram user reels lookup for: ${user}`);
      try {
        const response = await makeRequest(API_CONFIG.ENDPOINTS.INSTAGRAM_USER_REELS, requestData);
        log(`Instagram user reels lookup complete`);
        return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
      } catch (error) {
        log("Instagram user reels lookup error:", error);
        return { content: [{ type: "text", text: `Instagram user reels API error: ${formatError(error)}` }], isError: true };
      }
    }
  );

  // ===== TWITTER/X TOOLS =====

  server.tool(
    "get_twitter_user",
    "Get Twitter/X user profile information",
    {
      user: z.string().describe("User Alias or URL"),
      timeout: z.number().default(300).describe("Timeout in seconds (20-1500)")
    },
    async ({ user, timeout }) => {
      const requestData = { timeout, user };
      log(`Starting Twitter user lookup for: ${user}`);
      try {
        const response = await makeRequest(API_CONFIG.ENDPOINTS.TWITTER_USER, requestData);
        log(`Twitter user lookup complete`);
        return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
      } catch (error) {
        log("Twitter user lookup error:", error);
        return { content: [{ type: "text", text: `Twitter user API error: ${formatError(error)}` }], isError: true };
      }
    }
  );

  server.tool(
    "search_twitter_users",
    "Search Twitter/X users",
    {
      count: z.number().describe("Max results to return"),
      query: z.string().optional().describe("Main search users query"),
      timeout: z.number().default(300).describe("Timeout in seconds (20-1500)")
    },
    async ({ count, query, timeout }) => {
      const requestData: any = { timeout, count };
      if (query) requestData.query = query;
      log(`Starting Twitter users search`);
      try {
        const response = await makeRequest(API_CONFIG.ENDPOINTS.TWITTER_SEARCH_USERS, requestData);
        log(`Twitter users search complete`);
        return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
      } catch (error) {
        log("Twitter users search error:", error);
        return { content: [{ type: "text", text: `Twitter users search API error: ${formatError(error)}` }], isError: true };
      }
    }
  );

  server.tool(
    "get_twitter_user_posts",
    "Get posts from a Twitter/X user",
    {
      user: z.string().describe("User ID, alias or URL"),
      count: z.number().describe("Max posts to return"),
      timeout: z.number().default(300).describe("Timeout in seconds (20-1500)")
    },
    async ({ user, count, timeout }) => {
      const requestData = { timeout, user, count };
      log(`Starting Twitter user posts lookup for: ${user}`);
      try {
        const response = await makeRequest(API_CONFIG.ENDPOINTS.TWITTER_USER_POSTS, requestData);
        log(`Twitter user posts lookup complete`);
        return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
      } catch (error) {
        log("Twitter user posts lookup error:", error);
        return { content: [{ type: "text", text: `Twitter user posts API error: ${formatError(error)}` }], isError: true };
      }
    }
  );

  server.tool(
    "search_twitter_posts",
    "Search Twitter/X posts with advanced filtering",
    {
      count: z.number().describe("Max results to return"),
      query: z.string().optional().describe("Main search query"),
      exact_phrase: z.string().optional().describe("Exact phrase (in quotes)"),
      any_of_these_words: z.string().optional().describe("Any of these words (OR condition)"),
      none_of_these_words: z.string().optional().describe("None of these words (NOT condition)"),
      these_hashtags: z.string().optional().describe("These hashtags"),
      language: z.string().optional().describe("Language of tweets"),
      from_these_accounts: z.string().optional().describe("From these accounts"),
      to_these_accounts: z.string().optional().describe("To these accounts"),
      mentioning_these_accounts: z.string().optional().describe("Mentioning these accounts (username with @)"),
      min_replies: z.string().optional().describe("Minimum number of replies"),
      min_likes: z.string().optional().describe("Minimum number of likes"),
      min_retweets: z.string().optional().describe("Minimum number of retweets"),
      from_date: z.string().optional().describe("Starting date for tweets search (timestamp)"),
      to_date: z.string().optional().describe("Ending date for tweets search (timestamp)"),
      search_type: z.enum(["Top", "Latest", "People", "Photos", "Videos"]).default("Top").describe("Type of search results"),
      timeout: z.number().default(300).describe("Timeout in seconds (20-1500)")
    },
    async ({ count, timeout, ...optionalParams }) => {
      const requestData: any = { timeout, count };
      Object.keys(optionalParams).forEach(key => {
        if (optionalParams[key as keyof typeof optionalParams] !== undefined) {
          requestData[key] = optionalParams[key as keyof typeof optionalParams];
        }
      });
      log(`Starting Twitter posts search`);
      try {
        const response = await makeRequest(API_CONFIG.ENDPOINTS.TWITTER_SEARCH_POSTS, requestData);
        log(`Twitter posts search complete`);
        return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
      } catch (error) {
        log("Twitter posts search error:", error);
        return { content: [{ type: "text", text: `Twitter posts search API error: ${formatError(error)}` }], isError: true };
      }
    }
  );

  // ===== WEB PARSER TOOLS =====

  server.tool(
    "parse_webpage",
    "Parse and extract content from any webpage with flexible filtering options",
    {
      url: z.string().describe("URL of the page to parse"),
      include_tags: z.array(z.string()).optional().describe("CSS selectors of elements to include"),
      exclude_tags: z.array(z.string()).optional().describe("CSS selectors or wildcard masks of elements to exclude"),
      only_main_content: z.boolean().default(false).describe("Extract only main content of the page"),
      remove_comments: z.boolean().default(true).describe("Remove HTML comments"),
      resolve_srcset: z.boolean().default(true).describe("Convert image srcset to src"),
      return_full_html: z.boolean().default(false).describe("Return full HTML document or only body content"),
      min_text_block: z.number().default(200).describe("Minimum text block size for main content detection"),
      remove_base64_images: z.boolean().default(true).describe("Remove base64-encoded images"),
      strip_all_tags: z.boolean().default(false).describe("Remove all HTML tags and return plain text only"),
      extract_contacts: z.boolean().default(false).describe("Extract links, emails, and phone numbers"),
      same_origin_links: z.boolean().default(false).describe("Only extract links from the same domain"),
      social_links_only: z.boolean().default(false).describe("Only extract social media links"),
      timeout: z.number().default(300).describe("Timeout in seconds (20-1500)")
    },
    async ({ url, timeout, ...optionalParams }) => {
      const requestData: any = { timeout, url };
      Object.keys(optionalParams).forEach(key => {
        if (optionalParams[key as keyof typeof optionalParams] !== undefined) {
          requestData[key] = optionalParams[key as keyof typeof optionalParams];
        }
      });
      log(`Starting webpage parse for: ${url}`);
      try {
        const response = await makeRequest(API_CONFIG.ENDPOINTS.WEBPARSER_PARSE, requestData);
        log(`Webpage parse complete`);
        return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
      } catch (error) {
        log("Webpage parse error:", error);
        return { content: [{ type: "text", text: `Webpage parse API error: ${formatError(error)}` }], isError: true };
      }
    }
  );

  server.tool(
    "get_sitemap",
    "Fetch URLs from website sitemap",
    {
      url: z.string().describe("Website URL to fetch sitemap from"),
      timeout: z.number().default(300).describe("Timeout in seconds (20-1500)")
    },
    async ({ url, timeout }) => {
      const requestData = { timeout, url };
      log(`Starting sitemap fetch for: ${url}`);
      try {
        const response = await makeRequest(API_CONFIG.ENDPOINTS.WEBPARSER_SITEMAP, requestData);
        log(`Sitemap fetch complete`);
        return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
      } catch (error) {
        log("Sitemap fetch error:", error);
        return { content: [{ type: "text", text: `Sitemap fetch API error: ${formatError(error)}` }], isError: true };
      }
    }
  );

  // ===== CHATGPT DEEP RESEARCH TOOLS =====

  server.tool(
    "search",
    "Search tool optimized for ChatGPT Deep Research mode",
    {
      query: z.string().describe("Search query"),
      count: z.number().default(10).describe("Max results to return"),
      timeout: z.number().default(300).describe("Timeout in seconds (20-1500)")
    },
    async ({ query, count, timeout }) => {
      const requestData = { timeout, query, count };
      log(`Starting ChatGPT Deep Research search for: ${query}`);
      try {
        const response = await makeRequest(API_CONFIG.ENDPOINTS.SEARCH_USERS, requestData);
        log(`Search complete`);
        return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
      } catch (error) {
        log("Search error:", error);
        return { content: [{ type: "text", text: `Search API error: ${formatError(error)}` }], isError: true };
      }
    }
  );

  server.tool(
    "fetch",
    "Fetch tool optimized for ChatGPT Deep Research mode - retrieves complete LinkedIn profile information",
    {
      id: z.string().describe("LinkedIn profile URL or username to fetch"),
      timeout: z.number().default(300).describe("Timeout in seconds (20-1500)")
    },
    async ({ id, timeout }) => {
      const requestData = { timeout, user: id, with_experience: true, with_education: true, with_skills: true };
      log(`Starting ChatGPT Deep Research fetch for: ${id}`);
      try {
        const response = await makeRequest(API_CONFIG.ENDPOINTS.USER_PROFILE, requestData);
        log(`Fetch complete`);
        return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
      } catch (error) {
        log("Fetch error:", error);
        return { content: [{ type: "text", text: `Fetch API error: ${formatError(error)}` }], isError: true };
      }
    }
  );

  // ========================================
  // NEW TOOLS (v1.0.0 - API v17)
  // ========================================

  // ===== DUCKDUCKGO TOOLS =====

  server.tool(
    "duckduckgo_search",
    "Search DuckDuckGo for web results",
    {
      query: z.string().describe("Search query"),
      count: z.number().default(10).describe("Max results (1-20)"),
      timeout: z.number().default(300).describe("Timeout in seconds (20-1500)")
    },
    async ({ query, count, timeout }) => {
      const requestData = { timeout, query, count: Math.min(Math.max(1, count), 20) };
      log(`Starting DuckDuckGo search for: ${query}`);
      try {
        const response = await makeRequest(API_CONFIG.ENDPOINTS.DUCKDUCKGO_SEARCH, requestData);
        log(`DuckDuckGo search complete`);
        return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
      } catch (error) {
        log("DuckDuckGo search error:", error);
        return { content: [{ type: "text", text: `DuckDuckGo search API error: ${formatError(error)}` }], isError: true };
      }
    }
  );

  // ===== YOUTUBE TOOLS =====

  server.tool(
    "search_youtube_videos",
    "Search YouTube videos by query",
    {
      query: z.string().describe("Search query"),
      count: z.number().default(10).describe("Max results"),
      timeout: z.number().default(300).describe("Timeout in seconds (20-1500)")
    },
    async ({ query, count, timeout }) => {
      const requestData = { timeout, query, count };
      log(`Starting YouTube videos search for: ${query}`);
      try {
        const response = await makeRequest(API_CONFIG.ENDPOINTS.YOUTUBE_SEARCH_VIDEOS, requestData);
        log(`YouTube videos search complete, found ${response.length || 0} results`);
        return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
      } catch (error) {
        log("YouTube videos search error:", error);
        return { content: [{ type: "text", text: `YouTube videos search API error: ${formatError(error)}` }], isError: true };
      }
    }
  );

  server.tool(
    "get_youtube_video",
    "Get detailed YouTube video information by ID or URL",
    {
      video: z.string().describe("Video ID or URL (e.g., 'dQw4w9WgXcQ' or full YouTube URL)"),
      timeout: z.number().default(300).describe("Timeout in seconds (20-1500)")
    },
    async ({ video, timeout }) => {
      const requestData = { timeout, video };
      log(`Starting YouTube video lookup for: ${video}`);
      try {
        const response = await makeRequest(API_CONFIG.ENDPOINTS.YOUTUBE_VIDEO, requestData);
        log(`YouTube video lookup complete`);
        return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
      } catch (error) {
        log("YouTube video lookup error:", error);
        return { content: [{ type: "text", text: `YouTube video API error: ${formatError(error)}` }], isError: true };
      }
    }
  );

  server.tool(
    "get_youtube_video_subtitles",
    "Extract YouTube video subtitles/captions with timestamps",
    {
      video: z.string().describe("Video ID or URL"),
      language: z.string().optional().describe("Language code (e.g., 'en', 'ru'). Auto-detect if not specified"),
      timeout: z.number().default(300).describe("Timeout in seconds (20-1500)")
    },
    async ({ video, language, timeout }) => {
      const requestData: any = { timeout, video };
      if (language) requestData.language = language;
      log(`Starting YouTube video subtitles extraction for: ${video}`);
      try {
        const response = await makeRequest(API_CONFIG.ENDPOINTS.YOUTUBE_VIDEO_SUBTITLES, requestData);
        log(`YouTube video subtitles extraction complete`);
        return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
      } catch (error) {
        log("YouTube video subtitles extraction error:", error);
        return { content: [{ type: "text", text: `YouTube video subtitles API error: ${formatError(error)}` }], isError: true };
      }
    }
  );

  // ===== SEC TOOLS =====

  server.tool(
    "search_sec_companies",
    "Search SEC EDGAR database for company filings with advanced filters",
    {
      entity_name: z.string().optional().describe("Company name or ticker (e.g., 'apple', 'AAPL')"),
      forms: z.array(z.string()).optional().describe("Form types filter (e.g., ['10-K', '10-Q'] or exclusions ['-3', '-4'])"),
      location_codes: z.array(z.string()).optional().describe("State codes (e.g., ['CA', 'NY'])"),
      date_from: z.string().optional().describe("Start date (YYYY-MM-DD format)"),
      date_to: z.string().optional().describe("End date (YYYY-MM-DD format)"),
      count: z.number().describe("Max results (max 100)"),
      timeout: z.number().default(300).describe("Timeout in seconds (20-1500)")
    },
    async ({ entity_name, forms, location_codes, date_from, date_to, count, timeout }) => {
      const requestData: any = { timeout, count };
      if (entity_name) requestData.entity_name = entity_name;
      if (forms) requestData.forms = forms;
      if (location_codes) requestData.location_codes = location_codes;
      if (date_from) requestData.date_from = date_from;
      if (date_to) requestData.date_to = date_to;
      log(`Starting SEC companies search with filters`);
      try {
        const response = await makeRequest(API_CONFIG.ENDPOINTS.SEC_SEARCH_COMPANIES, requestData);
        log(`SEC companies search complete, found ${response.length || 0} results`);
        return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
      } catch (error) {
        log("SEC companies search error:", error);
        return { content: [{ type: "text", text: `SEC companies search API error: ${formatError(error)}` }], isError: true };
      }
    }
  );

  server.tool(
    "get_sec_document",
    "Retrieve full SEC document content by URL",
    {
      document_url: z.string().describe("SEC EDGAR document URL (e.g., 'https://www.sec.gov/Archives/edgar/data/...')"),
      timeout: z.number().default(300).describe("Timeout in seconds (20-1500)")
    },
    async ({ document_url, timeout }) => {
      const requestData = { timeout, document_url };
      log(`Starting SEC document retrieval for: ${document_url}`);
      try {
        const response = await makeRequest(API_CONFIG.ENDPOINTS.SEC_DOCUMENT, requestData);
        log(`SEC document retrieval complete`);
        return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
      } catch (error) {
        log("SEC document retrieval error:", error);
        return { content: [{ type: "text", text: `SEC document API error: ${formatError(error)}` }], isError: true };
      }
    }
  );

  // ===== Y COMBINATOR TOOLS =====

  server.tool(
    "get_yc_company",
    "Get comprehensive Y Combinator company information by slug",
    {
      company: z.string().describe("YC company slug (e.g., 'airbnb', 'stripe', 'openai')"),
      timeout: z.number().default(300).describe("Timeout in seconds (20-1500)")
    },
    async ({ company, timeout }) => {
      const requestData = { timeout, company };
      log(`Starting YC company lookup for: ${company}`);
      try {
        const response = await makeRequest(API_CONFIG.ENDPOINTS.YC_COMPANY, requestData);
        log(`YC company lookup complete`);
        return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
      } catch (error) {
        log("YC company lookup error:", error);
        return { content: [{ type: "text", text: `YC company API error: ${formatError(error)}` }], isError: true };
      }
    }
  );

  server.tool(
    "search_yc_companies",
    "Search Y Combinator companies with advanced filters",
    {
      query: z.string().optional().describe("Search query for company name"),
      industries: z.array(z.string()).optional().describe("Filter by industries (e.g., ['Healthcare', 'B2B'])"),
      regions: z.array(z.string()).optional().describe("Filter by regions (e.g., ['Latin America', 'Europe'])"),
      batches: z.array(z.string()).optional().describe("Filter by batches (e.g., ['Winter 2026', 'Summer 2025'])"),
      is_hiring: z.boolean().optional().describe("Filter by hiring status"),
      nonprofit: z.boolean().optional().describe("Filter by nonprofit status"),
      top_company: z.boolean().optional().describe("Filter by top company status"),
      team_size_min: z.number().optional().describe("Minimum team size"),
      team_size_max: z.number().optional().describe("Maximum team size (max 10000)"),
      count: z.number().describe("Max results"),
      sort_by: z.enum(["relevance", "launch_date"]).default("relevance").describe("Sort order"),
      timeout: z.number().default(300).describe("Timeout in seconds (20-1500)")
    },
    async ({ query, industries, regions, batches, is_hiring, nonprofit, top_company, team_size_min, team_size_max, count, sort_by, timeout }) => {
      const requestData: any = { timeout, count, sort_by };
      if (query) requestData.query = query;
      if (industries) requestData.industries = industries;
      if (regions) requestData.regions = regions;
      if (batches) requestData.batches = batches;
      if (is_hiring !== undefined) requestData.is_hiring = is_hiring;
      if (nonprofit !== undefined) requestData.nonprofit = nonprofit;
      if (top_company !== undefined) requestData.top_company = top_company;
      if (team_size_min !== undefined) requestData.team_size_min = team_size_min;
      if (team_size_max !== undefined) requestData.team_size_max = team_size_max;
      log(`Starting YC companies search with filters`);
      try {
        const response = await makeRequest(API_CONFIG.ENDPOINTS.YC_SEARCH_COMPANIES, requestData);
        log(`YC companies search complete, found ${response.length || 0} results`);
        return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
      } catch (error) {
        log("YC companies search error:", error);
        return { content: [{ type: "text", text: `YC companies search API error: ${formatError(error)}` }], isError: true };
      }
    }
  );

  server.tool(
    "search_yc_founders",
    "Search Y Combinator founders with filters",
    {
      query: z.string().optional().describe("Search query for founder name or company"),
      industries: z.array(z.string()).optional().describe("Filter by industries (e.g., ['Education', 'Fintech'])"),
      titles: z.array(z.string()).optional().describe("Filter by titles (e.g., ['CEO', 'Founder', 'CTO'])"),
      batches: z.array(z.string()).optional().describe("Filter by YC batches (e.g., ['W25', 'S25', 'F25'])"),
      top_company: z.boolean().optional().describe("Filter by top company status"),
      count: z.number().describe("Max results"),
      timeout: z.number().default(300).describe("Timeout in seconds (20-1500)")
    },
    async ({ query, industries, titles, batches, top_company, count, timeout }) => {
      const requestData: any = { timeout, count };
      if (query) requestData.query = query;
      if (industries) requestData.industries = industries;
      if (titles) requestData.titles = titles;
      if (batches) requestData.batches = batches;
      if (top_company !== undefined) requestData.top_company = top_company;
      log(`Starting YC founders search with filters`);
      try {
        const response = await makeRequest(API_CONFIG.ENDPOINTS.YC_SEARCH_FOUNDERS, requestData);
        log(`YC founders search complete, found ${response.length || 0} results`);
        return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
      } catch (error) {
        log("YC founders search error:", error);
        return { content: [{ type: "text", text: `YC founders search API error: ${formatError(error)}` }], isError: true };
      }
    }
  );

  // ===== REDDIT USER TOOLS =====

  server.tool(
    "get_reddit_user_posts",
    "Get posts from a Reddit user",
    {
      username: z.string().describe("Reddit username (without u/ prefix, e.g., 'Confident_Rough_2846')"),
      count: z.number().default(25).describe("Max posts to return"),
      timeout: z.number().default(300).describe("Timeout in seconds (20-1500)")
    },
    async ({ username, count, timeout }) => {
      const requestData = { timeout, username, count };
      log(`Starting Reddit user posts lookup for: u/${username}`);
      try {
        const response = await makeRequest(API_CONFIG.ENDPOINTS.REDDIT_USER_POSTS, requestData);
        log(`Reddit user posts lookup complete, found ${response.length || 0} results`);
        return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
      } catch (error) {
        log("Reddit user posts lookup error:", error);
        return { content: [{ type: "text", text: `Reddit user posts API error: ${formatError(error)}` }], isError: true };
      }
    }
  );

  server.tool(
    "get_reddit_user_comments",
    "Get comments from a Reddit user",
    {
      username: z.string().describe("Reddit username (without u/ prefix, e.g., 'Confident_Rough_2846')"),
      count: z.number().default(25).describe("Max comments to return"),
      timeout: z.number().default(300).describe("Timeout in seconds (20-1500)")
    },
    async ({ username, count, timeout }) => {
      const requestData = { timeout, username, count };
      log(`Starting Reddit user comments lookup for: u/${username}`);
      try {
        const response = await makeRequest(API_CONFIG.ENDPOINTS.REDDIT_USER_COMMENTS, requestData);
        log(`Reddit user comments lookup complete, found ${response.length || 0} results`);
        return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
      } catch (error) {
        log("Reddit user comments lookup error:", error);
        return { content: [{ type: "text", text: `Reddit user comments API error: ${formatError(error)}` }], isError: true };
      }
    }
  );

  // ===== LINKEDIN USER DETAILS TOOLS =====

  server.tool(
    "get_linkedin_user_education",
    "Get LinkedIn user education history by URN",
    {
      urn: z.string().describe("User URN (must include prefix, example: fsd_profile:ACoAA...)"),
      timeout: z.number().default(300).describe("Timeout in seconds (20-1500)")
    },
    async ({ urn, timeout }) => {
      const normalizedURN = normalizeUserURN(urn);
      if (!isValidUserURN(normalizedURN)) {
        return { content: [{ type: "text", text: "Invalid URN format. Must start with 'fsd_profile:'" }], isError: true };
      }
      const requestData = { timeout, urn: normalizedURN };
      log(`Starting LinkedIn user education lookup for: ${normalizedURN}`);
      try {
        const response = await makeRequest(API_CONFIG.ENDPOINTS.LINKEDIN_USER_EDUCATION, requestData);
        log(`LinkedIn user education lookup complete`);
        return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
      } catch (error) {
        log("LinkedIn user education lookup error:", error);
        return { content: [{ type: "text", text: `LinkedIn user education API error: ${formatError(error)}` }], isError: true };
      }
    }
  );

  server.tool(
    "get_linkedin_user_experience",
    "Get LinkedIn user work experience by URN",
    {
      urn: z.string().describe("User URN (must include prefix, example: fsd_profile:ACoAA...)"),
      timeout: z.number().default(300).describe("Timeout in seconds (20-1500)")
    },
    async ({ urn, timeout }) => {
      const normalizedURN = normalizeUserURN(urn);
      if (!isValidUserURN(normalizedURN)) {
        return { content: [{ type: "text", text: "Invalid URN format. Must start with 'fsd_profile:'" }], isError: true };
      }
      const requestData = { timeout, urn: normalizedURN };
      log(`Starting LinkedIn user experience lookup for: ${normalizedURN}`);
      try {
        const response = await makeRequest(API_CONFIG.ENDPOINTS.LINKEDIN_USER_EXPERIENCE, requestData);
        log(`LinkedIn user experience lookup complete`);
        return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
      } catch (error) {
        log("LinkedIn user experience lookup error:", error);
        return { content: [{ type: "text", text: `LinkedIn user experience API error: ${formatError(error)}` }], isError: true };
      }
    }
  );

  server.tool(
    "get_linkedin_user_skills",
    "Get LinkedIn user skills by URN",
    {
      urn: z.string().describe("User URN (must include prefix, example: fsd_profile:ACoAA...)"),
      timeout: z.number().default(300).describe("Timeout in seconds (20-1500)")
    },
    async ({ urn, timeout }) => {
      const normalizedURN = normalizeUserURN(urn);
      if (!isValidUserURN(normalizedURN)) {
        return { content: [{ type: "text", text: "Invalid URN format. Must start with 'fsd_profile:'" }], isError: true };
      }
      const requestData = { timeout, urn: normalizedURN };
      log(`Starting LinkedIn user skills lookup for: ${normalizedURN}`);
      try {
        const response = await makeRequest(API_CONFIG.ENDPOINTS.LINKEDIN_USER_SKILLS, requestData);
        log(`LinkedIn user skills lookup complete`);
        return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
      } catch (error) {
        log("LinkedIn user skills lookup error:", error);
        return { content: [{ type: "text", text: `LinkedIn user skills API error: ${formatError(error)}` }], isError: true };
      }
    }
  );

  server.tool(
    "get_linkedin_user_honors",
    "Get LinkedIn user honors and awards by URN",
    {
      urn: z.string().describe("User URN (must include prefix, example: fsd_profile:ACoAA...)"),
      timeout: z.number().default(300).describe("Timeout in seconds (20-1500)")
    },
    async ({ urn, timeout }) => {
      const normalizedURN = normalizeUserURN(urn);
      if (!isValidUserURN(normalizedURN)) {
        return { content: [{ type: "text", text: "Invalid URN format. Must start with 'fsd_profile:'" }], isError: true };
      }
      const requestData = { timeout, urn: normalizedURN };
      log(`Starting LinkedIn user honors lookup for: ${normalizedURN}`);
      try {
        const response = await makeRequest(API_CONFIG.ENDPOINTS.LINKEDIN_USER_HONORS, requestData);
        log(`LinkedIn user honors lookup complete`);
        return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
      } catch (error) {
        log("LinkedIn user honors lookup error:", error);
        return { content: [{ type: "text", text: `LinkedIn user honors API error: ${formatError(error)}` }], isError: true };
      }
    }
  );

  server.tool(
    "get_linkedin_user_patents",
    "Get LinkedIn user patents by URN",
    {
      urn: z.string().describe("User URN (must include prefix, example: fsd_profile:ACoAA...)"),
      timeout: z.number().default(300).describe("Timeout in seconds (20-1500)")
    },
    async ({ urn, timeout }) => {
      const normalizedURN = normalizeUserURN(urn);
      if (!isValidUserURN(normalizedURN)) {
        return { content: [{ type: "text", text: "Invalid URN format. Must start with 'fsd_profile:'" }], isError: true };
      }
      const requestData = { timeout, urn: normalizedURN };
      log(`Starting LinkedIn user patents lookup for: ${normalizedURN}`);
      try {
        const response = await makeRequest(API_CONFIG.ENDPOINTS.LINKEDIN_USER_PATENTS, requestData);
        log(`LinkedIn user patents lookup complete`);
        return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
      } catch (error) {
        log("LinkedIn user patents lookup error:", error);
        return { content: [{ type: "text", text: `LinkedIn user patents API error: ${formatError(error)}` }], isError: true };
      }
    }
  );

  server.tool(
    "get_linkedin_user_languages",
    "Get LinkedIn user language proficiencies by URN",
    {
      urn: z.string().describe("User URN (must include prefix, example: fsd_profile:ACoAA...)"),
      timeout: z.number().default(300).describe("Timeout in seconds (20-1500)")
    },
    async ({ urn, timeout }) => {
      const normalizedURN = normalizeUserURN(urn);
      if (!isValidUserURN(normalizedURN)) {
        return { content: [{ type: "text", text: "Invalid URN format. Must start with 'fsd_profile:'" }], isError: true };
      }
      const requestData = { timeout, urn: normalizedURN };
      log(`Starting LinkedIn user languages lookup for: ${normalizedURN}`);
      try {
        const response = await makeRequest(API_CONFIG.ENDPOINTS.LINKEDIN_USER_LANGUAGES, requestData);
        log(`LinkedIn user languages lookup complete`);
        return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
      } catch (error) {
        log("LinkedIn user languages lookup error:", error);
        return { content: [{ type: "text", text: `LinkedIn user languages API error: ${formatError(error)}` }], isError: true };
      }
    }
  );

  // ===== LINKEDIN SEARCH EXTENSIONS =====

  server.tool(
    "search_linkedin_educations",
    "Search educational institutions for LinkedIn filtering",
    {
      query: z.string().describe("Search query for educational institutions (e.g., 'Harvard', 'MIT')"),
      count: z.number().default(10).describe("Max results"),
      timeout: z.number().default(300).describe("Timeout in seconds (20-1500)")
    },
    async ({ query, count, timeout }) => {
      const requestData = { timeout, query, count };
      log(`Starting LinkedIn educations search for: ${query}`);
      try {
        const response = await makeRequest(API_CONFIG.ENDPOINTS.LINKEDIN_SEARCH_EDUCATIONS, requestData);
        log(`LinkedIn educations search complete, found ${response.length || 0} results`);
        return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
      } catch (error) {
        log("LinkedIn educations search error:", error);
        return { content: [{ type: "text", text: `LinkedIn educations search API error: ${formatError(error)}` }], isError: true };
      }
    }
  );

  server.tool(
    "search_linkedin_locations",
    "Search locations for LinkedIn filtering",
    {
      query: z.string().describe("Search query for location (e.g., 'Tokyo', 'San Francisco')"),
      count: z.number().default(10).describe("Max results"),
      timeout: z.number().default(300).describe("Timeout in seconds (20-1500)")
    },
    async ({ query, count, timeout }) => {
      const requestData = { timeout, query, count };
      log(`Starting LinkedIn locations search for: ${query}`);
      try {
        const response = await makeRequest(API_CONFIG.ENDPOINTS.LINKEDIN_SEARCH_LOCATIONS, requestData);
        log(`LinkedIn locations search complete, found ${response.length || 0} results`);
        return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
      } catch (error) {
        log("LinkedIn locations search error:", error);
        return { content: [{ type: "text", text: `LinkedIn locations search API error: ${formatError(error)}` }], isError: true };
      }
    }
  );

  server.tool(
    "search_linkedin_industries",
    "Search industries for LinkedIn filtering",
    {
      query: z.string().describe("Search query for industry (e.g., 'IT', 'Healthcare')"),
      count: z.number().default(10).describe("Max results"),
      timeout: z.number().default(300).describe("Timeout in seconds (20-1500)")
    },
    async ({ query, count, timeout }) => {
      const requestData = { timeout, query, count };
      log(`Starting LinkedIn industries search for: ${query}`);
      try {
        const response = await makeRequest(API_CONFIG.ENDPOINTS.LINKEDIN_SEARCH_INDUSTRIES, requestData);
        log(`LinkedIn industries search complete, found ${response.length || 0} results`);
        return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
      } catch (error) {
        log("LinkedIn industries search error:", error);
        return { content: [{ type: "text", text: `LinkedIn industries search API error: ${formatError(error)}` }], isError: true };
      }
    }
  );

  server.tool(
    "search_linkedin_jobs",
    "Search LinkedIn job postings with advanced filters",
    {
      keywords: z.string().optional().describe("Job search keywords"),
      location: z.string().optional().describe("Job location (default: 'worldwide')"),
      sort: z.enum(["recent", "relevant"]).optional().describe("Sort order"),
      experience_level: z.array(z.string()).optional().describe("Experience levels: internship, entry_level, associate, mid_senior, director, executive"),
      job_types: z.array(z.string()).optional().describe("Job types: full_time, part_time, contract, temporary, internship, other"),
      work_types: z.array(z.string()).optional().describe("Work types: hybrid, remote, on_site"),
      industry: z.union([z.string(), z.array(z.string())]).optional().describe("Industry URN or keyword"),
      company: z.array(z.string()).optional().describe("Company URNs"),
      count: z.number().describe("Max results (max 1000)"),
      timeout: z.number().default(300).describe("Timeout in seconds (20-1500)")
    },
    async ({ keywords, location, sort, experience_level, job_types, work_types, industry, company, count, timeout }) => {
      const requestData: any = { timeout, count };
      if (keywords) requestData.keywords = keywords;
      if (location) requestData.location = location;
      if (sort) requestData.sort = sort;
      if (experience_level) requestData.experience_level = experience_level;
      if (job_types) requestData.job_types = job_types;
      if (work_types) requestData.work_types = work_types;
      if (industry) requestData.industry = industry;
      if (company) requestData.company = company;
      log(`Starting LinkedIn jobs search with filters`);
      try {
        const response = await makeRequest(API_CONFIG.ENDPOINTS.LINKEDIN_SEARCH_JOBS, requestData);
        log(`LinkedIn jobs search complete, found ${response.length || 0} results`);
        return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
      } catch (error) {
        log("LinkedIn jobs search error:", error);
        return { content: [{ type: "text", text: `LinkedIn jobs search API error: ${formatError(error)}` }], isError: true };
      }
    }
  );

  server.tool(
    "search_linkedin_companies",
    "Search LinkedIn companies by keywords",
    {
      keywords: z.string().optional().describe("Company search keywords"),
      count: z.number().describe("Max results"),
      timeout: z.number().default(300).describe("Timeout in seconds (20-1500)")
    },
    async ({ keywords, count, timeout }) => {
      const requestData: any = { timeout, count };
      if (keywords) requestData.keywords = keywords;
      log(`Starting LinkedIn companies search`);
      try {
        const response = await makeRequest(API_CONFIG.ENDPOINTS.LINKEDIN_SEARCH_COMPANIES, requestData);
        log(`LinkedIn companies search complete, found ${response.length || 0} results`);
        return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
      } catch (error) {
        log("LinkedIn companies search error:", error);
        return { content: [{ type: "text", text: `LinkedIn companies search API error: ${formatError(error)}` }], isError: true };
      }
    }
  );

  // ===== LINKEDIN COMPANY & MANAGEMENT EXTENSIONS =====

  server.tool(
    "get_linkedin_company_employee_stats",
    "Get LinkedIn company employee statistics",
    {
      company: z.string().describe("Company URN or URL"),
      timeout: z.number().default(300).describe("Timeout in seconds (20-1500)")
    },
    async ({ company, timeout }) => {
      const requestData = { timeout, company };
      log(`Starting LinkedIn company employee stats lookup for: ${company}`);
      try {
        const response = await makeRequest(API_CONFIG.ENDPOINTS.LINKEDIN_COMPANY_EMPLOYEE_STATS, requestData);
        log(`LinkedIn company employee stats lookup complete`);
        return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
      } catch (error) {
        log("LinkedIn company employee stats lookup error:", error);
        return { content: [{ type: "text", text: `LinkedIn company employee stats API error: ${formatError(error)}` }], isError: true };
      }
    }
  );

  server.tool(
    "get_linkedin_management_company_mentions",
    "Track company mentions on LinkedIn (requires ACCOUNT_ID)",
    {
      company: z.string().describe("Company URN or alias"),
      count: z.number().default(10).describe("Max mentions to return"),
      timeout: z.number().default(300).describe("Timeout in seconds (20-1500)")
    },
    async ({ company, count, timeout }) => {
      const requestData: any = { timeout, company, count, account_id: ACCOUNT_ID };
      log(`Starting LinkedIn company mentions lookup for: ${company}`);
      try {
        const response = await makeRequest(API_CONFIG.ENDPOINTS.LINKEDIN_MANAGEMENT_COMPANY_MENTIONS, requestData);
        log(`LinkedIn company mentions lookup complete`);
        return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
      } catch (error) {
        log("LinkedIn company mentions lookup error:", error);
        return { content: [{ type: "text", text: `LinkedIn company mentions API error: ${formatError(error)}` }], isError: true };
      }
    }
  );

  server.tool(
    "get_linkedin_chat_attachment_base64",
    "Download LinkedIn chat attachment as base64 (requires ACCOUNT_ID)",
    {
      attachment_url: z.string().describe("Attachment URL from chat messages"),
      timeout: z.number().default(300).describe("Timeout in seconds (20-1500)")
    },
    async ({ attachment_url, timeout }) => {
      const requestData: any = { timeout, attachment_url, account_id: ACCOUNT_ID };
      log(`Starting LinkedIn chat attachment download for: ${attachment_url}`);
      try {
        const response = await makeRequest(API_CONFIG.ENDPOINTS.LINKEDIN_MANAGEMENT_CHAT_ATTACHMENT_BASE64, requestData);
        log(`LinkedIn chat attachment download complete`);
        return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
      } catch (error) {
        log("LinkedIn chat attachment download error:", error);
        return { content: [{ type: "text", text: `LinkedIn chat attachment API error: ${formatError(error)}` }], isError: true };
      }
    }
  );

  // ===== LINKEDIN GROUP TOOLS =====

  server.tool(
    "get_linkedin_group",
    "Get LinkedIn group information",
    {
      group: z.string().describe("Group URL or URN (e.g., '3990648')"),
      timeout: z.number().default(300).describe("Timeout in seconds (20-1500)")
    },
    async ({ group, timeout }) => {
      const requestData = { timeout, group };
      log(`Starting LinkedIn group lookup for: ${group}`);
      try {
        const response = await makeRequest(API_CONFIG.ENDPOINTS.LINKEDIN_GROUP, requestData);
        log(`LinkedIn group lookup complete`);
        return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
      } catch (error) {
        log("LinkedIn group lookup error:", error);
        return { content: [{ type: "text", text: `LinkedIn group API error: ${formatError(error)}` }], isError: true };
      }
    }
  );

  log("AnySite MCP Server initialized with 71 tools");
  log("Management tools (chat, connections, posting, company mentions, attachments) require ACCOUNT_ID");

  return server;
}
