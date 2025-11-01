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
    WEBPARSER_SITEMAP: "/api/webparser/sitemap"
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

  // Register google_search tool
  server.tool(
    "google_search",
    "Perform Google search",
    {
      query: z.string().describe("Search query"),
      count: z.number().default(10).describe("Max results (1-20)"),
      timeout: z.number().default(300).describe("Timeout in seconds")
    },
    async ({ query, count, timeout }) => {
      const requestData = {
        timeout,
        query,
        count: Math.min(Math.max(1, count), 20)
      };
      log(`Starting Google search for: ${query}`);
      try {
        const response = await makeRequest(API_CONFIG.ENDPOINTS.GOOGLE_SEARCH, requestData);
        return {
          content: [
            {
              type: "text",
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
              text: `Google search API error: ${formatError(error)}`
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

  server.tool(
    "get_twitter_post",
    "Get Twitter/X post details",
    {
      post_url: z.string().describe("Twitter post URL"),
      timeout: z.number().default(300).describe("Timeout in seconds (20-1500)")
    },
    async ({ post_url, timeout }) => {
      const requestData = { timeout, post_url };
      log(`Starting Twitter post lookup for: ${post_url}`);
      try {
        const response = await makeRequest(API_CONFIG.ENDPOINTS.TWITTER_POST, requestData);
        log(`Twitter post lookup complete`);
        return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
      } catch (error) {
        log("Twitter post lookup error:", error);
        return { content: [{ type: "text", text: `Twitter post API error: ${formatError(error)}` }], isError: true };
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

  log("AnySite MCP Server initialized with 57 tools");
  log("Management tools (chat, connections, posting) require ACCOUNT_ID");

  return server;
}
