// types.ts
export interface LinkedinSearchUsersArgs {
  keywords?: string;
  first_name?: string;
  last_name?: string;
  title?: string;
  company_keywords?: string;
  school_keywords?: string;
  current_company?: string;
  past_company?: string;
  location?: string;
  industry?: string;
  education?: string;
  count?: number;
  timeout?: number;
}

export interface LinkedinUserProfileArgs {
  user: string;
  with_experience?: boolean;
  with_education?: boolean;
  with_skills?: boolean;
}

export interface LinkedinEmailUserArgs {
  email: string;
  count?: number;
  timeout?: number;
}

export interface LinkedinUserPostsArgs {
  urn: string;
  count?: number;
  timeout?: number;
}

export interface LinkedinUserReactionsArgs {
  urn: string;
  count?: number;
  timeout?: number;
}

export interface LinkedinUserCommentsArgs {
  urn: string;
  count?: number;
  timeout?: number;
  commented_after?: number;
}

export interface LinkedinChatMessagesArgs {
  user: string;
  company?: string;
  count?: number;
  timeout?: number;
}

export interface SendLinkedinChatMessageArgs {
  user: string;
  company?: string;
  text: string;
  timeout?: number;
}

export interface SendLinkedinConnectionArgs {
  user: string;
  timeout?: number;
}

export interface SendLinkedinPostCommentArgs {
  text: string;
  urn: string;
  timeout?: number;
}

export interface GetLinkedinUserConnectionsArgs {
  connected_after?: number;
  count?: number;
  timeout?: number;
}

export interface GetLinkedinPostRepostsArgs {
  urn: string;
  count?: number;
  timeout?: number;
}

export interface GetLinkedinPostCommentsArgs {
  urn: string;
  sort?: "relevance" | "recent";
  count?: number;
  timeout?: number;
}

export interface GetLinkedinPostReactionsArgs {
  urn: string;
  count?: number;
  timeout?: number;
}

export interface GetLinkedinGoogleCompanyArgs {
  keywords: string[];
  with_urn?: boolean;
  count_per_keyword?: number;
  timeout?: number;
}

export interface GetLinkedinCompanyArgs {
  company: string;
  timeout?: number;
}

export interface GetLinkedinCompanyEmployeesArgs {
  companies: string[];
  keywords?: string;
  first_name?: string;
  last_name?: string;
  count?: number;
  timeout?: number;
}

export interface SendLinkedinPostArgs {
  text: string;
  visibility?: "ANYONE" | "CONNECTIONS_ONLY";
  comment_scope?: "ALL" | "CONNECTIONS_ONLY" | "NONE";
  timeout?: number;
}

export interface LinkedinSalesNavigatorSearchUsersArgs {
  keywords?: string;
  first_names?: string[];
  last_names?: string[];
  current_titles?: string[];
  location?: string | string[];
  education?: string | string[];
  languages?: string[];
  past_titles?: string[];
  functions?: string[];
  levels?: string[];
  years_in_the_current_company?: string[];
  years_in_the_current_position?: string[];
  company_sizes?: string[];
  company_types?: string[];
  company_locations?: string | string[];
  current_companies?: string | string[];
  past_companies?: string | string[];
  industry?: string | string[];
  count: number;
  timeout?: number;
}

export interface LinkedinManagementConversationsPayload {
  connected_after?: number;
  count?: number;
  timeout?: number;
}

export interface LinkedinSearchPostsArgs {
  timeout?: number;
  keywords?: string;
  sort?: "relevance";
  date_posted?: "past-month" | "past-week" | "past-24h";
  content_type?: "videos" | "photos" | "jobs" | "live_videos" | "documents" | null;
  mentioned?: string[] | null;
  authors?: string[] | null;
  author_industries?: string[] | string | null;
  author_title?: string | null;
  count: number;
}

export interface RedditSearchPostsArgs {
  timeout?: number;
  query: string;
  sort?: "relevance" | "hot" | "top" | "new" | "comments";
  time_filter?: "all" | "year" | "month" | "week" | "day" | "hour";
  count: number;
}

export interface RedditPostsArgs {
  timeout?: number;
  post_url: string;
}

export interface RedditPostCommentsArgs {
  timeout?: number;
  post_url: string;
}

// Instagram types
export interface InstagramUserArgs {
  timeout?: number;
  user: string;
}

export interface InstagramUserPostsArgs {
  timeout?: number;
  user: string;
  count: number;
}

export interface InstagramPostCommentsArgs {
  timeout?: number;
  post: string;
  count: number;
}

export interface LinkedinCompanyPostsArgs {
  urn: string;
  count?: number;
  timeout?: number;
}

export interface InstagramUserLocation {
  "@type": "InstagramUserLocation";
  street: string;
  city: string;
  city_id: number;
  zip: string;
  latitude: number;
  longitude: number;
}

export interface InstagramUser {
  "@type": "InstagramUser";
  id: string;
  alias: string;
  name: string;
  url: string;
  image: string;
  follower_count: number;
  following_count: number;
  description: string;
  media_count: number;
  is_private: boolean;
  is_verified: boolean;
  is_business: boolean;
  category: string;
  external_url: string;
  email: string;
  whatsapp_number: string;
  phone: string;
  location: InstagramUserLocation;
  links: string[];
  mentions: string[];
  hashtags: string[];
  pinned_channels: string[];
}

export interface InstagramUserPreview {
  "@type": "InstagramUserPreview";
  id: string;
  name: string;
  alias: string;
  url: string;
  image: string;
  is_verified: boolean;
  is_private: boolean;
}

export interface InstagramPost {
  "@type": "InstagramPost";
  id: string;
  code: string;
  url: string;
  image: string;
  text: string;
  created_at: number;
  like_count: number;
  comment_count: number;
  reshare_count: number;
  user: InstagramUserPreview;
  type: string;
  media: string[];
  carousel_media_count: number;
  is_paid_partnership: boolean;
}

export interface InstagramComment {
  "@type": "InstagramComment";
  id: string;
  comment_index: number;
  created_at: number;
  text: string;
  like_count: number;
  reply_count: number;
  parent_id: string;
  user: InstagramUserPreview;
}

export interface RedditSubreddit {
  "@type": "RedditSubreddit";
  id: string;
  alias: string;
  url: string;
  icon_url: string;
  banner_url: string;
  description: string;
  member_count: number;
  online_count: number;
  nsfw: boolean;
  quarantined: boolean;
}

export interface RedditPost {
  "@type": "RedditPost";
  id: string;
  title: string;
  url: string;
  created_at: number;
  subreddit: RedditSubreddit;
  vote_count: number;
  comment_count: number;
  thumbnail_url: string;
  nsfw: boolean;
  spoiler: boolean;
}

// LinkedIn User Comments types
export interface LinkedinURN {
  type: string;
  value: string;
}

export interface LinkedinReaction {
  "@type": "LinkedinReaction";
  type: "like" | "love" | "insightful" | "curious" | "celebrate" | "support";
  count: number;
}

export interface LinkedinUserCommentUser {
  "@type": "LinkedinUserCommentUser";
  internal_id: LinkedinURN;
  urn: LinkedinURN;
  name: string;
  alias: string;
  url: string;
  image: string;
  headline: string;
}

export interface LinkedinUserPostUser {
  "@type": "LinkedinUserPostUser";
  internal_id: LinkedinURN;
  urn: LinkedinURN;
  name: string;
  alias: string;
  url: string;
  headline: string;
  image: string;
}

export interface LinkedinUserPostEvent {
  "@type": "LinkedinUserPostEvent";
  url: string;
  image: string;
  title: string;
  date: string;
  participant_count: number;
}

export interface LinkedinUserPostArticle {
  "@type": "LinkedinUserPostArticle";
  url: string;
  urn: LinkedinURN;
  image: string;
  title: string;
  subtitle: string;
  description: string;
}

export interface LinkedinUserPostDocument {
  "@type": "LinkedinUserPostDocument";
  urn: LinkedinURN;
  url: string;
  title: string;
  cover_images: string[];
  images: string[];
  total_images_count: number;
}

export interface LinkedinUserPost {
  "@type": "LinkedinUserPost";
  urn: LinkedinURN;
  url: string;
  author: LinkedinUserPostUser;
  created_at: number;
  share_urn: LinkedinURN;
  is_empty_repost: boolean;
  repost: any; // Can be complex nested structure
  images: string[];
  video_url?: string;
  text: string;
  comment_count: number;
  share_count: number;
  reactions: LinkedinReaction[];
  event?: LinkedinUserPostEvent;
  article?: LinkedinUserPostArticle;
  document?: LinkedinUserPostDocument;
}

export interface LinkedinUserComment {
  "@type": "LinkedinUserComment";
  urn: LinkedinURN;
  url: string;
  text: string;
  author: LinkedinUserCommentUser;
  created_at: number;
  is_commenter_post_author: boolean;
  comment_count: number;
  reactions: LinkedinReaction[];
  parent?: LinkedinURN;
  post: LinkedinUserPost;
}

export function isValidLinkedinSearchUsersArgs(
  args: unknown
): args is LinkedinSearchUsersArgs {
  if (typeof args !== "object" || args === null) return false;
  const obj = args as Record<string, unknown>;

  if (obj.count !== undefined && typeof obj.count !== "number") {
    return false;
  }

  if (obj.timeout !== undefined && typeof obj.timeout !== "number") {
    return false;
  }

  const hasAnySearchField =
    obj.keywords ||
    obj.first_name ||
    obj.last_name ||
    obj.title ||
    obj.company_keywords ||
    obj.school_keywords ||
    obj.current_company ||
    obj.past_company ||
    obj.location ||
    obj.industry ||
    obj.education;

  if (!hasAnySearchField) return false;

  return true;
}

export function isValidLinkedinUserProfileArgs(
  args: unknown
): args is LinkedinUserProfileArgs {
  if (typeof args !== "object" || args === null) return false;
  const obj = args as Record<string, unknown>;
  if (typeof obj.user !== "string" || !obj.user.trim()) return false;

  return true;
}

export function isValidLinkedinEmailUserArgs(
  args: unknown
): args is LinkedinEmailUserArgs {
  if (typeof args !== "object" || args === null) return false;
  const obj = args as Record<string, unknown>;
  if (typeof obj.email !== "string" || !obj.email.trim()) return false;
  if (obj.count !== undefined && typeof obj.count !== "number") return false;
  if (obj.timeout !== undefined && typeof obj.timeout !== "number") return false;
  return true;
}

export function isValidLinkedinUserPostsArgs(
  args: unknown
): args is LinkedinUserPostsArgs {
  if (typeof args !== "object" || args === null) return false;
  const obj = args as Record<string, unknown>;
  if (typeof obj.urn !== "string" || !obj.urn.trim()) return false;
  if (obj.count !== undefined && typeof obj.count !== "number") return false;
  if (obj.timeout !== undefined && typeof obj.timeout !== "number") return false;
  return true;
}

export function isValidLinkedinUserReactionsArgs(
  args: unknown
): args is LinkedinUserReactionsArgs {
  if (typeof args !== "object" || args === null) return false;
  const obj = args as Record<string, unknown>;
  if (typeof obj.urn !== "string" || !obj.urn.trim()) return false;
  if (obj.count !== undefined && typeof obj.count !== "number") return false;
  if (obj.timeout !== undefined && typeof obj.timeout !== "number") return false;
  return true;
}

export function isValidLinkedinUserCommentsArgs(
  args: unknown
): args is LinkedinUserCommentsArgs {
  if (typeof args !== "object" || args === null) return false;
  const obj = args as Record<string, unknown>;
  if (typeof obj.urn !== "string" || !obj.urn.trim()) return false;
  if (obj.count !== undefined && typeof obj.count !== "number") return false;
  if (obj.timeout !== undefined && typeof obj.timeout !== "number") return false;
  if (obj.commented_after !== undefined && typeof obj.commented_after !== "number") return false;
  return true;
}

export function isValidLinkedinChatMessagesArgs(
  args: unknown
): args is LinkedinChatMessagesArgs {
  if (typeof args !== "object" || args === null) return false;
  const obj = args as Record<string, unknown>;
  if (typeof obj.user !== "string" || !obj.user.trim()) return false;
  if (obj.company !== undefined && typeof obj.company !== "string") return false;
  if (obj.count !== undefined && typeof obj.count !== "number") return false;
  if (obj.timeout !== undefined && typeof obj.timeout !== "number") return false;
  return true;
}

export function isValidSendLinkedinChatMessageArgs(
  args: unknown
): args is SendLinkedinChatMessageArgs {
  if (typeof args !== "object" || args === null) return false;
  const obj = args as Record<string, unknown>;
  if (typeof obj.user !== "string" || !obj.user.trim()) return false;
  if (obj.company !== undefined && typeof obj.company !== "string") return false;
  if (typeof obj.text !== "string" || !obj.text.trim()) return false;
  if (obj.timeout !== undefined && typeof obj.timeout !== "number") return false;
  return true;
}

export function isValidSendLinkedinConnectionArgs(
  args: unknown
): args is SendLinkedinConnectionArgs {
  if (typeof args !== "object" || args === null) return false;
  const obj = args as Record<string, unknown>;
  if (typeof obj.user !== "string" || !obj.user.trim()) return false;
  if (obj.timeout !== undefined && typeof obj.timeout !== "number") return false;
  return true;
}

export function isValidSendLinkedinPostCommentArgs(
  args: unknown
): args is SendLinkedinPostCommentArgs {
  if (typeof args !== "object" || args === null) return false;
  const obj = args as Record<string, unknown>;
  if (typeof obj.text !== "string" || !obj.text.trim()) return false;
  if (typeof obj.urn !== "string" || !obj.urn.trim()) return false;
  if (obj.timeout !== undefined && typeof obj.timeout !== "number") return false;
  return true;
}

export function isValidGetLinkedinUserConnectionsArgs(
  args: unknown
): args is GetLinkedinUserConnectionsArgs {
  if (typeof args !== "object" || args === null) return false;
  const obj = args as Record<string, unknown>;
  if (obj.connected_after !== undefined && typeof obj.connected_after !== "number") return false;
  if (obj.count !== undefined && typeof obj.count !== "number") return false;
  if (obj.timeout !== undefined && typeof obj.timeout !== "number") return false;
  return true;
}

export function isValidGetLinkedinPostRepostsArgs(
  args: unknown
): args is GetLinkedinPostRepostsArgs {
  if (typeof args !== "object" || args === null) return false;
  const obj = args as Record<string, unknown>;
  if (typeof obj.urn !== "string" || !obj.urn.includes("activity:")) return false;
  if (obj.count !== undefined && typeof obj.count !== "number") return false;
  if (obj.timeout !== undefined && typeof obj.timeout !== "number") return false;
  return true;
}

export function isValidGetLinkedinPostCommentsArgs(
  args: unknown
): args is GetLinkedinPostCommentsArgs {
  if (typeof args !== "object" || args === null) return false;
  const obj = args as Record<string, unknown>;
  if (typeof obj.urn !== "string" || !obj.urn.includes("activity:")) return false;
  if (obj.sort !== undefined && obj.sort !== "relevance" && obj.sort !== "recent") return false;
  if (obj.count !== undefined && typeof obj.count !== "number") return false;
  if (obj.timeout !== undefined && typeof obj.timeout !== "number") return false;
  return true;
}

export function isValidGetLinkedinPostReactionsArgs(
  args: unknown
): args is GetLinkedinPostReactionsArgs {
  if (typeof args !== "object" || args === null) return false;
  const obj = args as Record<string, unknown>;
  if (typeof obj.urn !== "string" || !obj.urn.includes("activity:")) return false;
  if (obj.count !== undefined && typeof obj.count !== "number") return false;
  if (obj.timeout !== undefined && typeof obj.timeout !== "number") return false;
  return true;
}

export function isValidGetLinkedinGoogleCompanyArgs(
  args: unknown
): args is GetLinkedinGoogleCompanyArgs {
  if (typeof args !== "object" || args === null) return false;
  const obj = args as Record<string, unknown>;
  if (!Array.isArray(obj.keywords) || obj.keywords.length === 0) return false;
  if (obj.with_urn !== undefined && typeof obj.with_urn !== "boolean") return false;
  if (
    obj.count_per_keyword !== undefined &&
    (typeof obj.count_per_keyword !== "number" ||
      obj.count_per_keyword < 1 ||
      obj.count_per_keyword > 10)
  ) {
    return false;
  }
  if (obj.timeout !== undefined && typeof obj.timeout !== "number") return false;
  return true;
}

export function isValidGetLinkedinCompanyArgs(
  args: unknown
): args is GetLinkedinCompanyArgs {
  if (typeof args !== "object" || args === null) return false;
  const obj = args as Record<string, unknown>;
  if (typeof obj.company !== "string" || !obj.company.trim()) return false;
  if (obj.timeout !== undefined && typeof obj.timeout !== "number") return false;
  return true;
}

export function isValidGetLinkedinCompanyEmployeesArgs(
  args: unknown
): args is GetLinkedinCompanyEmployeesArgs {
  if (typeof args !== "object" || args === null) return false;
  const obj = args as Record<string, unknown>;

  // companies (обязательный массив строк)
  if (!Array.isArray(obj.companies) || obj.companies.length === 0) return false;
  for (const c of obj.companies) {
    if (typeof c !== "string") return false;
  }

  if (obj.keywords !== undefined && typeof obj.keywords !== "string") return false;
  if (obj.first_name !== undefined && typeof obj.first_name !== "string") return false;
  if (obj.last_name !== undefined && typeof obj.last_name !== "string") return false;
  if (obj.count !== undefined && typeof obj.count !== "number") return false;
  if (obj.timeout !== undefined && typeof obj.timeout !== "number") return false;

  return true;
}

export function isValidSendLinkedinPostArgs(
  args: unknown
): args is SendLinkedinPostArgs {
  if (typeof args !== "object" || args === null) return false;
  const obj = args as Record<string, unknown>;

  if (typeof obj.text !== "string" || !obj.text.trim()) return false;

  if (obj.visibility !== undefined &&
      obj.visibility !== "ANYONE" &&
      obj.visibility !== "CONNECTIONS_ONLY") return false;

  if (obj.comment_scope !== undefined &&
      obj.comment_scope !== "ALL" &&
      obj.comment_scope !== "CONNECTIONS_ONLY" &&
      obj.comment_scope !== "NONE") return false;

  if (obj.timeout !== undefined && typeof obj.timeout !== "number") return false;

  return true;
}

export function isValidLinkedinSalesNavigatorSearchUsersArgs(
  args: unknown
): args is LinkedinSalesNavigatorSearchUsersArgs {
  if (typeof args !== "object" || args === null) return false;
  const obj = args as Record<string, unknown>;

  if (typeof obj.count !== "number" || obj.count <= 0 || obj.count > 2500) return false;

  if (obj.keywords !== undefined && typeof obj.keywords !== "string") return false;

  if (obj.first_names !== undefined) {
    if (!Array.isArray(obj.first_names)) return false;
    for (const name of obj.first_names) {
      if (typeof name !== "string") return false;
    }
  }

  if (obj.last_names !== undefined) {
    if (!Array.isArray(obj.last_names)) return false;
    for (const name of obj.last_names) {
      if (typeof name !== "string") return false;
    }
  }

  if (obj.current_titles !== undefined) {
    if (!Array.isArray(obj.current_titles)) return false;
    for (const title of obj.current_titles) {
      if (typeof title !== "string") return false;
    }
  }

  if (obj.location !== undefined) {
    if (typeof obj.location !== "string" && !Array.isArray(obj.location)) return false;
    if (Array.isArray(obj.location)) {
      for (const loc of obj.location) {
        if (typeof loc !== "string") return false;
      }
    }
  }

  if (obj.education !== undefined) {
    if (typeof obj.education !== "string" && !Array.isArray(obj.education)) return false;
    if (Array.isArray(obj.education)) {
      for (const edu of obj.education) {
        if (typeof edu !== "string") return false;
      }
    }
  }

  if (obj.languages !== undefined) {
    if (!Array.isArray(obj.languages)) return false;
    for (const lang of obj.languages) {
      if (typeof lang !== "string") return false;
    }
  }

  if (obj.past_titles !== undefined) {
    if (!Array.isArray(obj.past_titles)) return false;
    for (const title of obj.past_titles) {
      if (typeof title !== "string") return false;
    }
  }

  if (obj.functions !== undefined) {
    if (!Array.isArray(obj.functions)) return false;
    for (const func of obj.functions) {
      if (typeof func !== "string") return false;
    }
  }

  if (obj.levels !== undefined) {
    if (!Array.isArray(obj.levels)) return false;
    for (const level of obj.levels) {
      if (typeof level !== "string") return false;
    }
  }

  if (obj.years_in_the_current_company !== undefined) {
    if (!Array.isArray(obj.years_in_the_current_company)) return false;
    for (const years of obj.years_in_the_current_company) {
      if (typeof years !== "string") return false;
    }
  }

  if (obj.years_in_the_current_position !== undefined) {
    if (!Array.isArray(obj.years_in_the_current_position)) return false;
    for (const years of obj.years_in_the_current_position) {
      if (typeof years !== "string") return false;
    }
  }

  if (obj.company_sizes !== undefined) {
    if (!Array.isArray(obj.company_sizes)) return false;
    for (const size of obj.company_sizes) {
      if (typeof size !== "string") return false;
    }
  }

  if (obj.company_types !== undefined) {
    if (!Array.isArray(obj.company_types)) return false;
    for (const type of obj.company_types) {
      if (typeof type !== "string") return false;
    }
  }

  if (obj.company_locations !== undefined) {
    if (typeof obj.company_locations !== "string" && !Array.isArray(obj.company_locations)) return false;
    if (Array.isArray(obj.company_locations)) {
      for (const loc of obj.company_locations) {
        if (typeof loc !== "string") return false;
      }
    }
  }

  if (obj.current_companies !== undefined) {
    if (typeof obj.current_companies !== "string" && !Array.isArray(obj.current_companies)) return false;
    if (Array.isArray(obj.current_companies)) {
      for (const company of obj.current_companies) {
        if (typeof company !== "string") return false;
      }
    }
  }

  if (obj.past_companies !== undefined) {
    if (typeof obj.past_companies !== "string" && !Array.isArray(obj.past_companies)) return false;
    if (Array.isArray(obj.past_companies)) {
      for (const company of obj.past_companies) {
        if (typeof company !== "string") return false;
      }
    }
  }

  if (obj.industry !== undefined) {
    if (typeof obj.industry !== "string" && !Array.isArray(obj.industry)) return false;
    if (Array.isArray(obj.industry)) {
      for (const ind of obj.industry) {
        if (typeof ind !== "string") return false;
      }
    }
  }

  if (obj.timeout !== undefined && typeof obj.timeout !== "number") return false;

  return true;
}

export function isValidLinkedinManagementConversationsArgs(
  args: unknown
): args is LinkedinManagementConversationsPayload {
  if (typeof args !== "object" || args === null) return false;
  const obj = args as Record<string, unknown>;
  if (obj.connected_after !== undefined && typeof obj.connected_after !== "number") return false;
  if (obj.count !== undefined && typeof obj.count !== "number") return false;
  if (obj.timeout !== undefined && typeof obj.timeout !== "number") return false;
  return true;
}

export function isValidLinkedinSearchPostsArgs(
  args: unknown
): args is LinkedinSearchPostsArgs {
  if (typeof args !== "object" || args === null) return false;
  const obj = args as Record<string, unknown>;

  if (typeof obj.count !== "number" || obj.count <= 0) return false;
  if (obj.timeout !== undefined && (typeof obj.timeout !== "number" || obj.timeout < 20 || obj.timeout > 1500)) return false;
  if (obj.keywords !== undefined && typeof obj.keywords !== "string") return false;
  
  if (obj.sort !== undefined && obj.sort !== "relevance") return false;
  
  if (obj.date_posted !== undefined && 
      obj.date_posted !== "past-month" && 
      obj.date_posted !== "past-week" && 
      obj.date_posted !== "past-24h") return false;
  
  if (obj.content_type !== undefined && obj.content_type !== null &&
      obj.content_type !== "videos" && 
      obj.content_type !== "photos" && 
      obj.content_type !== "jobs" && 
      obj.content_type !== "live_videos" && 
      obj.content_type !== "documents") return false;

  if (obj.mentioned !== undefined && obj.mentioned !== null && !Array.isArray(obj.mentioned)) return false;
  if (obj.authors !== undefined && obj.authors !== null && !Array.isArray(obj.authors)) return false;
  
  if (obj.author_industries !== undefined && obj.author_industries !== null) {
    if (typeof obj.author_industries !== "string" && !Array.isArray(obj.author_industries)) return false;
  }
  
  if (obj.author_title !== undefined && obj.author_title !== null && typeof obj.author_title !== "string") return false;

  return true;
}

export function isValidRedditSearchPostsArgs(
  args: unknown
): args is RedditSearchPostsArgs {
  if (typeof args !== "object" || args === null) return false;
  const obj = args as Record<string, unknown>;

  if (typeof obj.query !== "string" || !obj.query.trim()) return false;
  if (typeof obj.count !== "number" || obj.count <= 0) return false;
  if (obj.timeout !== undefined && (typeof obj.timeout !== "number" || obj.timeout < 20 || obj.timeout > 1500)) return false;
  
  if (obj.sort !== undefined && 
      obj.sort !== "relevance" && 
      obj.sort !== "hot" && 
      obj.sort !== "top" && 
      obj.sort !== "new" && 
      obj.sort !== "comments") return false;
  
  if (obj.time_filter !== undefined && 
      obj.time_filter !== "all" && 
      obj.time_filter !== "year" && 
      obj.time_filter !== "month" && 
      obj.time_filter !== "week" && 
      obj.time_filter !== "day" && 
      obj.time_filter !== "hour") return false;

  return true;
}

export function isValidRedditPostsArgs(
  args: unknown
): args is RedditPostsArgs {
  if (typeof args !== "object" || args === null) return false;
  const obj = args as Record<string, unknown>;

  if (typeof obj.post_url !== "string" || !obj.post_url.trim()) return false;
  if (obj.timeout !== undefined && (typeof obj.timeout !== "number" || obj.timeout < 20 || obj.timeout > 1500)) return false;

  return true;
}

export function isValidRedditPostCommentsArgs(
  args: unknown
): args is RedditPostCommentsArgs {
  if (typeof args !== "object" || args === null) return false;
  const obj = args as Record<string, unknown>;

  if (typeof obj.post_url !== "string" || !obj.post_url.trim()) return false;
  if (obj.timeout !== undefined && (typeof obj.timeout !== "number" || obj.timeout < 20 || obj.timeout > 1500)) return false;

  return true;
}

// Instagram validation functions
export function isValidInstagramUserArgs(
  args: unknown
): args is InstagramUserArgs {
  if (typeof args !== "object" || args === null) return false;
  const obj = args as Record<string, unknown>;

  if (typeof obj.user !== "string" || !obj.user.trim()) return false;
  if (obj.timeout !== undefined && (typeof obj.timeout !== "number" || obj.timeout < 20 || obj.timeout > 1500)) return false;

  return true;
}

export function isValidInstagramUserPostsArgs(
  args: unknown
): args is InstagramUserPostsArgs {
  if (typeof args !== "object" || args === null) return false;
  const obj = args as Record<string, unknown>;

  if (typeof obj.user !== "string" || !obj.user.trim()) return false;
  if (typeof obj.count !== "number" || obj.count <= 0) return false;
  if (obj.timeout !== undefined && (typeof obj.timeout !== "number" || obj.timeout < 20 || obj.timeout > 1500)) return false;

  return true;
}

export function isValidInstagramPostCommentsArgs(
  args: unknown
): args is InstagramPostCommentsArgs {
  if (typeof args !== "object" || args === null) return false;
  const obj = args as Record<string, unknown>;

  if (typeof obj.post !== "string" || !obj.post.trim()) return false;
  if (typeof obj.count !== "number" || obj.count <= 0) return false;
  if (obj.timeout !== undefined && (typeof obj.timeout !== "number" || obj.timeout < 20 || obj.timeout > 1500)) return false;

  return true;
}

export function isValidLinkedinCompanyPostsArgs(
  args: unknown
): args is LinkedinCompanyPostsArgs {
  if (typeof args !== "object" || args === null) return false;
  const obj = args as Record<string, unknown>;

  if (typeof obj.urn !== "string" || !obj.urn.trim()) return false;
  if (!obj.urn.includes("company:")) return false;
  if (obj.count !== undefined && typeof obj.count !== "number") return false;
  if (obj.timeout !== undefined && typeof obj.timeout !== "number") return false;

  return true;
}

// ===== NEW MISSING TYPES =====

// LinkedIn additional types
export interface LinkedinUserEndorsersArgs {
  urn: string;
  count?: number;
  timeout?: number;
}

export interface LinkedinUserCertificatesArgs {
  urn: string;
  timeout?: number;
}

export interface LinkedinUserEmailDbArgs {
  profile: string; // LinkedIn internal_id, profile URL, alias, or set of them (max 10)
  timeout?: number;
}

export interface LinkedinManagementMeArgs {
  timeout?: number;
}

// Instagram additional types
export interface InstagramPostArgs {
  post: string; // Post ID
  timeout?: number;
}

export interface InstagramPostLikesArgs {
  post: string; // Post ID
  count: number;
  timeout?: number;
}

export interface InstagramUserFriendshipsArgs {
  user: string; // User ID, alias or URL
  count: number;
  type: "followers" | "following"; // Type of relationships to fetch
  timeout?: number;
}

export interface InstagramSearchPostsArgs {
  query: string;
  count: number;
  timeout?: number;
}

export interface InstagramUserReelsArgs {
  user: string; // User ID, alias or URL
  count: number;
  timeout?: number;
}

// Twitter/X types
export interface TwitterUserArgs {
  user: string; // User Alias or URL
  timeout?: number;
}

export interface TwitterSearchUsersArgs {
  count: number;
  query?: string; // Main search users query
  timeout?: number;
}

export interface TwitterUserPostsArgs {
  user: string; // User ID, alias or URL
  count: number;
  timeout?: number;
}

export interface TwitterSearchPostsArgs {
  count: number;
  query?: string; // Main search query
  exact_phrase?: string; // Exact phrase (in quotes)
  any_of_these_words?: string; // Any of these words (OR condition)
  none_of_these_words?: string; // None of these words (NOT condition)
  these_hashtags?: string; // These hashtags
  language?: string; // Language of tweets
  from_these_accounts?: string; // From these accounts
  to_these_accounts?: string; // To these accounts
  mentioning_these_accounts?: string; // Mentioning these accounts (username with @)
  min_replies?: string; // Minimum number of replies
  min_likes?: string; // Minimum number of likes
  min_retweets?: string; // Minimum number of retweets
  from_date?: string; // Starting date for tweets search (timestamp)
  to_date?: string; // Ending date for tweets search (timestamp)
  search_type?: "Top" | "Latest" | "People" | "Photos" | "Videos"; // Type of search results
  timeout?: number;
}

// Web Parser types
export interface WebParserParseArgs {
  url: string; // URL of the page to parse
  include_tags?: string[]; // CSS selectors of elements to include
  exclude_tags?: string[]; // CSS selectors or wildcard masks of elements to exclude
  only_main_content?: boolean; // Extract only main content of the page
  remove_comments?: boolean; // Remove HTML comments
  resolve_srcset?: boolean; // Convert image srcset to src
  return_full_html?: boolean; // Return full HTML document (True) or only body content (False)
  min_text_block?: number; // Minimum text block size for main content detection
  remove_base64_images?: boolean; // Remove base64-encoded images
  strip_all_tags?: boolean; // Remove all HTML tags and return plain text only
  extract_contacts?: boolean; // Extract links, emails, and phone numbers
  same_origin_links?: boolean; // Only extract links from the same domain
  social_links_only?: boolean; // Only extract social media links
  timeout?: number;
}

export interface WebParserSitemapArgs {
  url: string; // Website URL to fetch sitemap from
  timeout?: number;
}

// ChatGPT Deep Research types (optional, for ChatGPT clients only)
export interface ChatGPTSearchArgs {
  query: string;
  count?: number;
  timeout?: number;
}

export interface ChatGPTFetchArgs {
  id: string; // LinkedIn profile URL or username to fetch
  timeout?: number;
}

// ===== VALIDATION FUNCTIONS FOR NEW TYPES =====

// LinkedIn validations
export function isValidLinkedinUserEndorsersArgs(
  args: unknown
): args is LinkedinUserEndorsersArgs {
  if (typeof args !== "object" || args === null) return false;
  const obj = args as Record<string, unknown>;
  if (typeof obj.urn !== "string" || !obj.urn.trim()) return false;
  if (obj.count !== undefined && typeof obj.count !== "number") return false;
  if (obj.timeout !== undefined && (typeof obj.timeout !== "number" || obj.timeout < 20 || obj.timeout > 1500)) return false;
  return true;
}

export function isValidLinkedinUserCertificatesArgs(
  args: unknown
): args is LinkedinUserCertificatesArgs {
  if (typeof args !== "object" || args === null) return false;
  const obj = args as Record<string, unknown>;
  if (typeof obj.urn !== "string" || !obj.urn.trim()) return false;
  if (obj.timeout !== undefined && (typeof obj.timeout !== "number" || obj.timeout < 20 || obj.timeout > 1500)) return false;
  return true;
}

export function isValidLinkedinUserEmailDbArgs(
  args: unknown
): args is LinkedinUserEmailDbArgs {
  if (typeof args !== "object" || args === null) return false;
  const obj = args as Record<string, unknown>;
  if (typeof obj.profile !== "string" || !obj.profile.trim()) return false;
  if (obj.timeout !== undefined && (typeof obj.timeout !== "number" || obj.timeout < 20 || obj.timeout > 1500)) return false;
  return true;
}

export function isValidLinkedinManagementMeArgs(
  args: unknown
): args is LinkedinManagementMeArgs {
  if (typeof args !== "object" || args === null) return false;
  const obj = args as Record<string, unknown>;
  if (obj.timeout !== undefined && (typeof obj.timeout !== "number" || obj.timeout < 20 || obj.timeout > 1500)) return false;
  return true;
}

// Instagram validations
export function isValidInstagramPostArgs(
  args: unknown
): args is InstagramPostArgs {
  if (typeof args !== "object" || args === null) return false;
  const obj = args as Record<string, unknown>;
  if (typeof obj.post !== "string" || !obj.post.trim()) return false;
  if (obj.timeout !== undefined && (typeof obj.timeout !== "number" || obj.timeout < 20 || obj.timeout > 1500)) return false;
  return true;
}

export function isValidInstagramPostLikesArgs(
  args: unknown
): args is InstagramPostLikesArgs {
  if (typeof args !== "object" || args === null) return false;
  const obj = args as Record<string, unknown>;
  if (typeof obj.post !== "string" || !obj.post.trim()) return false;
  if (typeof obj.count !== "number" || obj.count <= 0) return false;
  if (obj.timeout !== undefined && (typeof obj.timeout !== "number" || obj.timeout < 20 || obj.timeout > 1500)) return false;
  return true;
}

export function isValidInstagramUserFriendshipsArgs(
  args: unknown
): args is InstagramUserFriendshipsArgs {
  if (typeof args !== "object" || args === null) return false;
  const obj = args as Record<string, unknown>;
  if (typeof obj.user !== "string" || !obj.user.trim()) return false;
  if (typeof obj.count !== "number" || obj.count <= 0) return false;
  if (typeof obj.type !== "string" || !["followers", "following"].includes(obj.type)) return false;
  if (obj.timeout !== undefined && (typeof obj.timeout !== "number" || obj.timeout < 20 || obj.timeout > 1500)) return false;
  return true;
}

export function isValidInstagramSearchPostsArgs(
  args: unknown
): args is InstagramSearchPostsArgs {
  if (typeof args !== "object" || args === null) return false;
  const obj = args as Record<string, unknown>;
  if (typeof obj.query !== "string" || !obj.query.trim()) return false;
  if (typeof obj.count !== "number" || obj.count <= 0) return false;
  if (obj.timeout !== undefined && (typeof obj.timeout !== "number" || obj.timeout < 20 || obj.timeout > 1500)) return false;
  return true;
}

export function isValidInstagramUserReelsArgs(
  args: unknown
): args is InstagramUserReelsArgs {
  if (typeof args !== "object" || args === null) return false;
  const obj = args as Record<string, unknown>;
  if (typeof obj.user !== "string" || !obj.user.trim()) return false;
  if (typeof obj.count !== "number" || obj.count <= 0) return false;
  if (obj.timeout !== undefined && (typeof obj.timeout !== "number" || obj.timeout < 20 || obj.timeout > 1500)) return false;
  return true;
}

// Twitter/X validations
export function isValidTwitterUserArgs(
  args: unknown
): args is TwitterUserArgs {
  if (typeof args !== "object" || args === null) return false;
  const obj = args as Record<string, unknown>;
  if (typeof obj.user !== "string" || !obj.user.trim()) return false;
  if (obj.timeout !== undefined && (typeof obj.timeout !== "number" || obj.timeout < 20 || obj.timeout > 1500)) return false;
  return true;
}

export function isValidTwitterSearchUsersArgs(
  args: unknown
): args is TwitterSearchUsersArgs {
  if (typeof args !== "object" || args === null) return false;
  const obj = args as Record<string, unknown>;
  if (typeof obj.count !== "number" || obj.count <= 0) return false;
  if (obj.query !== undefined && typeof obj.query !== "string") return false;
  if (obj.timeout !== undefined && (typeof obj.timeout !== "number" || obj.timeout < 20 || obj.timeout > 1500)) return false;
  return true;
}

export function isValidTwitterUserPostsArgs(
  args: unknown
): args is TwitterUserPostsArgs {
  if (typeof args !== "object" || args === null) return false;
  const obj = args as Record<string, unknown>;
  if (typeof obj.user !== "string" || !obj.user.trim()) return false;
  if (typeof obj.count !== "number" || obj.count <= 0) return false;
  if (obj.timeout !== undefined && (typeof obj.timeout !== "number" || obj.timeout < 20 || obj.timeout > 1500)) return false;
  return true;
}

export function isValidTwitterSearchPostsArgs(
  args: unknown
): args is TwitterSearchPostsArgs {
  if (typeof args !== "object" || args === null) return false;
  const obj = args as Record<string, unknown>;
  if (typeof obj.count !== "number" || obj.count <= 0) return false;
  if (obj.query !== undefined && typeof obj.query !== "string") return false;
  if (obj.timeout !== undefined && (typeof obj.timeout !== "number" || obj.timeout < 20 || obj.timeout > 1500)) return false;
  return true;
}

// Web Parser validations
export function isValidWebParserParseArgs(
  args: unknown
): args is WebParserParseArgs {
  if (typeof args !== "object" || args === null) return false;
  const obj = args as Record<string, unknown>;
  if (typeof obj.url !== "string" || !obj.url.trim()) return false;
  if (obj.include_tags !== undefined && !Array.isArray(obj.include_tags)) return false;
  if (obj.exclude_tags !== undefined && !Array.isArray(obj.exclude_tags)) return false;
  if (obj.only_main_content !== undefined && typeof obj.only_main_content !== "boolean") return false;
  if (obj.remove_comments !== undefined && typeof obj.remove_comments !== "boolean") return false;
  if (obj.resolve_srcset !== undefined && typeof obj.resolve_srcset !== "boolean") return false;
  if (obj.return_full_html !== undefined && typeof obj.return_full_html !== "boolean") return false;
  if (obj.min_text_block !== undefined && typeof obj.min_text_block !== "number") return false;
  if (obj.remove_base64_images !== undefined && typeof obj.remove_base64_images !== "boolean") return false;
  if (obj.strip_all_tags !== undefined && typeof obj.strip_all_tags !== "boolean") return false;
  if (obj.extract_contacts !== undefined && typeof obj.extract_contacts !== "boolean") return false;
  if (obj.same_origin_links !== undefined && typeof obj.same_origin_links !== "boolean") return false;
  if (obj.social_links_only !== undefined && typeof obj.social_links_only !== "boolean") return false;
  if (obj.timeout !== undefined && (typeof obj.timeout !== "number" || obj.timeout < 20 || obj.timeout > 1500)) return false;
  return true;
}

export function isValidWebParserSitemapArgs(
  args: unknown
): args is WebParserSitemapArgs {
  if (typeof args !== "object" || args === null) return false;
  const obj = args as Record<string, unknown>;
  if (typeof obj.url !== "string" || !obj.url.trim()) return false;
  if (obj.timeout !== undefined && (typeof obj.timeout !== "number" || obj.timeout < 20 || obj.timeout > 1500)) return false;
  return true;
}

// ChatGPT Deep Research validations (optional)
export function isValidChatGPTSearchArgs(
  args: unknown
): args is ChatGPTSearchArgs {
  if (typeof args !== "object" || args === null) return false;
  const obj = args as Record<string, unknown>;
  if (typeof obj.query !== "string" || !obj.query.trim()) return false;
  if (obj.count !== undefined && typeof obj.count !== "number") return false;
  if (obj.timeout !== undefined && (typeof obj.timeout !== "number" || obj.timeout < 20 || obj.timeout > 1500)) return false;
  return true;
}

export function isValidChatGPTFetchArgs(
  args: unknown
): args is ChatGPTFetchArgs {
  if (typeof args !== "object" || args === null) return false;
  const obj = args as Record<string, unknown>;
  if (typeof obj.id !== "string" || !obj.id.trim()) return false;
  if (obj.timeout !== undefined && (typeof obj.timeout !== "number" || obj.timeout < 20 || obj.timeout > 1500)) return false;
  return true;
}

// ========================================
// NEW ENDPOINTS (v1.0.0 - API v17)
// ========================================

// ===== DUCKDUCKGO TYPES =====
export interface DuckDuckGoSearchArgs {
  query: string;
  count?: number; // 1-20
  timeout?: number; // 20-1500
}

// ===== YOUTUBE TYPES =====
export interface YoutubeSearchVideosArgs {
  query: string;
  count: number;
  timeout?: number; // 20-1500
}

export interface YoutubeVideoArgs {
  video: string; // Video ID or URL
  timeout?: number; // 20-1500
}

export interface YoutubeVideoSubtitlesArgs {
  video: string; // Video ID or URL
  language?: string; // Language code (e.g., "en", "ru")
  timeout?: number; // 20-1500
}

// ===== SEC TYPES =====
export interface SecSearchCompaniesArgs {
  entity_name?: string; // Company name or ticker
  forms?: string[]; // Form types (e.g., ["10-K", "10-Q"] or exclusions ["-3", "-4"])
  location_codes?: string[]; // State codes (e.g., ["CA", "NY"])
  date_from?: string; // YYYY-MM-DD
  date_to?: string; // YYYY-MM-DD
  count: number;
  timeout?: number; // 20-1500
}

export interface SecDocumentArgs {
  document_url: string; // SEC EDGAR document URL
  timeout?: number; // 20-1500
}

// ===== Y COMBINATOR TYPES =====
export interface YcCompanyArgs {
  company: string; // Company slug (e.g., "airbnb", "stripe")
  timeout?: number; // 20-1500
}

export interface YcSearchCompaniesArgs {
  query?: string;
  industries?: string[]; // e.g., ["Healthcare", "B2B"]
  regions?: string[]; // e.g., ["Latin America", "Europe"]
  batches?: string[]; // e.g., ["Winter 2026", "Summer 2025"]
  is_hiring?: boolean;
  nonprofit?: boolean;
  top_company?: boolean;
  team_size_min?: number;
  team_size_max?: number; // max 10000
  count: number;
  sort_by?: "relevance" | "launch_date"; // default: "relevance"
  timeout?: number; // 20-1500
}

export interface YcSearchFoundersArgs {
  query?: string; // Founder name
  industries?: string[]; // e.g., ["Education", "Fintech"]
  titles?: string[]; // e.g., ["CEO", "Founder", "CTO"]
  batches?: string[]; // e.g., ["W25", "S25", "F25"]
  top_company?: boolean;
  count: number;
  timeout?: number; // 20-1500
}

// ===== REDDIT USER TYPES =====
export interface RedditUserPostsArgs {
  username: string; // Reddit username (without u/)
  count?: number; // default: 25
  timeout?: number; // 20-1500
}

export interface RedditUserCommentsArgs {
  username: string; // Reddit username (without u/)
  count?: number; // default: 25
  timeout?: number; // 20-1500
}

// ===== LINKEDIN USER DETAILS TYPES =====
export interface LinkedinUserEducationArgs {
  urn: string; // User URN with fsd_profile: prefix
  timeout?: number; // 20-1500
}

export interface LinkedinUserExperienceArgs {
  urn: string; // User URN with fsd_profile: prefix
  timeout?: number; // 20-1500
}

export interface LinkedinUserSkillsArgs {
  urn: string; // User URN with fsd_profile: prefix
  timeout?: number; // 20-1500
}

export interface LinkedinUserHonorsArgs {
  urn: string; // User URN with fsd_profile: prefix
  timeout?: number; // 20-1500
}

export interface LinkedinUserPatentsArgs {
  urn: string; // User URN with fsd_profile: prefix
  timeout?: number; // 20-1500
}

export interface LinkedinUserLanguagesArgs {
  urn: string; // User URN with fsd_profile: prefix
  timeout?: number; // 20-1500
}

// ===== LINKEDIN SEARCH EXTENSIONS TYPES =====
export interface LinkedinSearchEducationsArgs {
  query: string; // Educational institution name
  count?: number;
  timeout?: number; // 20-1500
}

export interface LinkedinSearchLocationsArgs {
  query: string; // Location name
  count?: number;
  timeout?: number; // 20-1500
}

export interface LinkedinSearchIndustriesArgs {
  query: string; // Industry name
  count?: number;
  timeout?: number; // 20-1500
}

export interface LinkedinSearchJobsArgs {
  keywords?: string;
  location?: string; // default: "worldwide"
  sort?: "recent" | "relevant";
  experience_level?: string[]; // internship, entry_level, associate, mid_senior, director, executive
  job_types?: string[]; // full_time, part_time, contract, temporary, internship, other
  work_types?: string[]; // hybrid, remote, on_site
  industry?: string | string[]; // Industry URN or keyword
  company?: string[]; // Company URN
  count: number; // max 1000
  timeout?: number; // 20-1500
}

export interface LinkedinSearchCompaniesArgs {
  keywords?: string;
  count: number;
  timeout?: number; // 20-1500
}

// ===== LINKEDIN COMPANY & MANAGEMENT TYPES =====
export interface LinkedinCompanyEmployeeStatsArgs {
  company: string; // Company URN or URL
  timeout?: number; // 20-1500
}

export interface LinkedinManagementCompanyMentionsArgs {
  company: string; // Company URN or alias
  count?: number;
  timeout?: number; // 20-1500
}

export interface LinkedinManagementChatAttachmentBase64Args {
  attachment_url: string; // Attachment URL from chat messages
  timeout?: number; // 20-1500
}

// ===== LINKEDIN GROUP TYPES =====
export interface LinkedinGroupArgs {
  group: string; // Group URL or URN
  timeout?: number; // 20-1500
}

// ========================================
// VALIDATION FUNCTIONS (v1.0.0 - API v17)
// ========================================

// ===== DUCKDUCKGO VALIDATIONS =====
export function isValidDuckDuckGoSearchArgs(
  args: unknown
): args is DuckDuckGoSearchArgs {
  if (typeof args !== "object" || args === null) return false;
  const obj = args as Record<string, unknown>;
  if (typeof obj.query !== "string" || !obj.query.trim()) return false;
  if (obj.count !== undefined && (typeof obj.count !== "number" || obj.count < 1 || obj.count > 20)) return false;
  if (obj.timeout !== undefined && (typeof obj.timeout !== "number" || obj.timeout < 20 || obj.timeout > 1500)) return false;
  return true;
}

// ===== YOUTUBE VALIDATIONS =====
export function isValidYoutubeSearchVideosArgs(
  args: unknown
): args is YoutubeSearchVideosArgs {
  if (typeof args !== "object" || args === null) return false;
  const obj = args as Record<string, unknown>;
  if (typeof obj.query !== "string" || !obj.query.trim()) return false;
  if (typeof obj.count !== "number" || obj.count <= 0) return false;
  if (obj.timeout !== undefined && (typeof obj.timeout !== "number" || obj.timeout < 20 || obj.timeout > 1500)) return false;
  return true;
}

export function isValidYoutubeVideoArgs(
  args: unknown
): args is YoutubeVideoArgs {
  if (typeof args !== "object" || args === null) return false;
  const obj = args as Record<string, unknown>;
  if (typeof obj.video !== "string" || !obj.video.trim()) return false;
  if (obj.timeout !== undefined && (typeof obj.timeout !== "number" || obj.timeout < 20 || obj.timeout > 1500)) return false;
  return true;
}

export function isValidYoutubeVideoSubtitlesArgs(
  args: unknown
): args is YoutubeVideoSubtitlesArgs {
  if (typeof args !== "object" || args === null) return false;
  const obj = args as Record<string, unknown>;
  if (typeof obj.video !== "string" || !obj.video.trim()) return false;
  if (obj.language !== undefined && typeof obj.language !== "string") return false;
  if (obj.timeout !== undefined && (typeof obj.timeout !== "number" || obj.timeout < 20 || obj.timeout > 1500)) return false;
  return true;
}

// ===== SEC VALIDATIONS =====
export function isValidSecSearchCompaniesArgs(
  args: unknown
): args is SecSearchCompaniesArgs {
  if (typeof args !== "object" || args === null) return false;
  const obj = args as Record<string, unknown>;
  if (typeof obj.count !== "number" || obj.count <= 0) return false;
  if (obj.entity_name !== undefined && typeof obj.entity_name !== "string") return false;
  if (obj.forms !== undefined && !Array.isArray(obj.forms)) return false;
  if (obj.location_codes !== undefined && !Array.isArray(obj.location_codes)) return false;
  if (obj.date_from !== undefined && typeof obj.date_from !== "string") return false;
  if (obj.date_to !== undefined && typeof obj.date_to !== "string") return false;
  if (obj.timeout !== undefined && (typeof obj.timeout !== "number" || obj.timeout < 20 || obj.timeout > 1500)) return false;
  return true;
}

export function isValidSecDocumentArgs(
  args: unknown
): args is SecDocumentArgs {
  if (typeof args !== "object" || args === null) return false;
  const obj = args as Record<string, unknown>;
  if (typeof obj.document_url !== "string" || !obj.document_url.trim()) return false;
  if (obj.timeout !== undefined && (typeof obj.timeout !== "number" || obj.timeout < 20 || obj.timeout > 1500)) return false;
  return true;
}

// ===== Y COMBINATOR VALIDATIONS =====
export function isValidYcCompanyArgs(
  args: unknown
): args is YcCompanyArgs {
  if (typeof args !== "object" || args === null) return false;
  const obj = args as Record<string, unknown>;
  if (typeof obj.company !== "string" || !obj.company.trim()) return false;
  if (obj.timeout !== undefined && (typeof obj.timeout !== "number" || obj.timeout < 20 || obj.timeout > 1500)) return false;
  return true;
}

export function isValidYcSearchCompaniesArgs(
  args: unknown
): args is YcSearchCompaniesArgs {
  if (typeof args !== "object" || args === null) return false;
  const obj = args as Record<string, unknown>;
  if (typeof obj.count !== "number" || obj.count <= 0) return false;
  if (obj.query !== undefined && typeof obj.query !== "string") return false;
  if (obj.industries !== undefined && !Array.isArray(obj.industries)) return false;
  if (obj.regions !== undefined && !Array.isArray(obj.regions)) return false;
  if (obj.batches !== undefined && !Array.isArray(obj.batches)) return false;
  if (obj.is_hiring !== undefined && typeof obj.is_hiring !== "boolean") return false;
  if (obj.nonprofit !== undefined && typeof obj.nonprofit !== "boolean") return false;
  if (obj.top_company !== undefined && typeof obj.top_company !== "boolean") return false;
  if (obj.team_size_min !== undefined && typeof obj.team_size_min !== "number") return false;
  if (obj.team_size_max !== undefined && (typeof obj.team_size_max !== "number" || obj.team_size_max > 10000)) return false;
  if (obj.sort_by !== undefined && obj.sort_by !== "relevance" && obj.sort_by !== "launch_date") return false;
  if (obj.timeout !== undefined && (typeof obj.timeout !== "number" || obj.timeout < 20 || obj.timeout > 1500)) return false;
  return true;
}

export function isValidYcSearchFoundersArgs(
  args: unknown
): args is YcSearchFoundersArgs {
  if (typeof args !== "object" || args === null) return false;
  const obj = args as Record<string, unknown>;
  if (typeof obj.count !== "number" || obj.count <= 0) return false;
  if (obj.query !== undefined && typeof obj.query !== "string") return false;
  if (obj.industries !== undefined && !Array.isArray(obj.industries)) return false;
  if (obj.titles !== undefined && !Array.isArray(obj.titles)) return false;
  if (obj.batches !== undefined && !Array.isArray(obj.batches)) return false;
  if (obj.top_company !== undefined && typeof obj.top_company !== "boolean") return false;
  if (obj.timeout !== undefined && (typeof obj.timeout !== "number" || obj.timeout < 20 || obj.timeout > 1500)) return false;
  return true;
}

// ===== REDDIT USER VALIDATIONS =====
export function isValidRedditUserPostsArgs(
  args: unknown
): args is RedditUserPostsArgs {
  if (typeof args !== "object" || args === null) return false;
  const obj = args as Record<string, unknown>;
  if (typeof obj.username !== "string" || !obj.username.trim()) return false;
  if (obj.count !== undefined && typeof obj.count !== "number") return false;
  if (obj.timeout !== undefined && (typeof obj.timeout !== "number" || obj.timeout < 20 || obj.timeout > 1500)) return false;
  return true;
}

export function isValidRedditUserCommentsArgs(
  args: unknown
): args is RedditUserCommentsArgs {
  if (typeof args !== "object" || args === null) return false;
  const obj = args as Record<string, unknown>;
  if (typeof obj.username !== "string" || !obj.username.trim()) return false;
  if (obj.count !== undefined && typeof obj.count !== "number") return false;
  if (obj.timeout !== undefined && (typeof obj.timeout !== "number" || obj.timeout < 20 || obj.timeout > 1500)) return false;
  return true;
}

// ===== LINKEDIN USER DETAILS VALIDATIONS =====
export function isValidLinkedinUserEducationArgs(
  args: unknown
): args is LinkedinUserEducationArgs {
  if (typeof args !== "object" || args === null) return false;
  const obj = args as Record<string, unknown>;
  if (typeof obj.urn !== "string" || !obj.urn.trim()) return false;
  if (obj.timeout !== undefined && (typeof obj.timeout !== "number" || obj.timeout < 20 || obj.timeout > 1500)) return false;
  return true;
}

export function isValidLinkedinUserExperienceArgs(
  args: unknown
): args is LinkedinUserExperienceArgs {
  if (typeof args !== "object" || args === null) return false;
  const obj = args as Record<string, unknown>;
  if (typeof obj.urn !== "string" || !obj.urn.trim()) return false;
  if (obj.timeout !== undefined && (typeof obj.timeout !== "number" || obj.timeout < 20 || obj.timeout > 1500)) return false;
  return true;
}

export function isValidLinkedinUserSkillsArgs(
  args: unknown
): args is LinkedinUserSkillsArgs {
  if (typeof args !== "object" || args === null) return false;
  const obj = args as Record<string, unknown>;
  if (typeof obj.urn !== "string" || !obj.urn.trim()) return false;
  if (obj.timeout !== undefined && (typeof obj.timeout !== "number" || obj.timeout < 20 || obj.timeout > 1500)) return false;
  return true;
}

export function isValidLinkedinUserHonorsArgs(
  args: unknown
): args is LinkedinUserHonorsArgs {
  if (typeof args !== "object" || args === null) return false;
  const obj = args as Record<string, unknown>;
  if (typeof obj.urn !== "string" || !obj.urn.trim()) return false;
  if (obj.timeout !== undefined && (typeof obj.timeout !== "number" || obj.timeout < 20 || obj.timeout > 1500)) return false;
  return true;
}

export function isValidLinkedinUserPatentsArgs(
  args: unknown
): args is LinkedinUserPatentsArgs {
  if (typeof args !== "object" || args === null) return false;
  const obj = args as Record<string, unknown>;
  if (typeof obj.urn !== "string" || !obj.urn.trim()) return false;
  if (obj.timeout !== undefined && (typeof obj.timeout !== "number" || obj.timeout < 20 || obj.timeout > 1500)) return false;
  return true;
}

export function isValidLinkedinUserLanguagesArgs(
  args: unknown
): args is LinkedinUserLanguagesArgs {
  if (typeof args !== "object" || args === null) return false;
  const obj = args as Record<string, unknown>;
  if (typeof obj.urn !== "string" || !obj.urn.trim()) return false;
  if (obj.timeout !== undefined && (typeof obj.timeout !== "number" || obj.timeout < 20 || obj.timeout > 1500)) return false;
  return true;
}

// ===== LINKEDIN SEARCH EXTENSIONS VALIDATIONS =====
export function isValidLinkedinSearchEducationsArgs(
  args: unknown
): args is LinkedinSearchEducationsArgs {
  if (typeof args !== "object" || args === null) return false;
  const obj = args as Record<string, unknown>;
  if (typeof obj.query !== "string" || !obj.query.trim()) return false;
  if (obj.count !== undefined && typeof obj.count !== "number") return false;
  if (obj.timeout !== undefined && (typeof obj.timeout !== "number" || obj.timeout < 20 || obj.timeout > 1500)) return false;
  return true;
}

export function isValidLinkedinSearchLocationsArgs(
  args: unknown
): args is LinkedinSearchLocationsArgs {
  if (typeof args !== "object" || args === null) return false;
  const obj = args as Record<string, unknown>;
  if (typeof obj.query !== "string" || !obj.query.trim()) return false;
  if (obj.count !== undefined && typeof obj.count !== "number") return false;
  if (obj.timeout !== undefined && (typeof obj.timeout !== "number" || obj.timeout < 20 || obj.timeout > 1500)) return false;
  return true;
}

export function isValidLinkedinSearchIndustriesArgs(
  args: unknown
): args is LinkedinSearchIndustriesArgs {
  if (typeof args !== "object" || args === null) return false;
  const obj = args as Record<string, unknown>;
  if (typeof obj.query !== "string" || !obj.query.trim()) return false;
  if (obj.count !== undefined && typeof obj.count !== "number") return false;
  if (obj.timeout !== undefined && (typeof obj.timeout !== "number" || obj.timeout < 20 || obj.timeout > 1500)) return false;
  return true;
}

export function isValidLinkedinSearchJobsArgs(
  args: unknown
): args is LinkedinSearchJobsArgs {
  if (typeof args !== "object" || args === null) return false;
  const obj = args as Record<string, unknown>;
  if (typeof obj.count !== "number" || obj.count <= 0 || obj.count > 1000) return false;
  if (obj.keywords !== undefined && typeof obj.keywords !== "string") return false;
  if (obj.location !== undefined && typeof obj.location !== "string") return false;
  if (obj.sort !== undefined && obj.sort !== "recent" && obj.sort !== "relevant") return false;
  if (obj.experience_level !== undefined && !Array.isArray(obj.experience_level)) return false;
  if (obj.job_types !== undefined && !Array.isArray(obj.job_types)) return false;
  if (obj.work_types !== undefined && !Array.isArray(obj.work_types)) return false;
  if (obj.industry !== undefined && typeof obj.industry !== "string" && !Array.isArray(obj.industry)) return false;
  if (obj.company !== undefined && !Array.isArray(obj.company)) return false;
  if (obj.timeout !== undefined && (typeof obj.timeout !== "number" || obj.timeout < 20 || obj.timeout > 1500)) return false;
  return true;
}

export function isValidLinkedinSearchCompaniesArgs(
  args: unknown
): args is LinkedinSearchCompaniesArgs {
  if (typeof args !== "object" || args === null) return false;
  const obj = args as Record<string, unknown>;
  if (typeof obj.count !== "number" || obj.count <= 0) return false;
  if (obj.keywords !== undefined && typeof obj.keywords !== "string") return false;
  if (obj.timeout !== undefined && (typeof obj.timeout !== "number" || obj.timeout < 20 || obj.timeout > 1500)) return false;
  return true;
}

// ===== LINKEDIN COMPANY & MANAGEMENT VALIDATIONS =====
export function isValidLinkedinCompanyEmployeeStatsArgs(
  args: unknown
): args is LinkedinCompanyEmployeeStatsArgs {
  if (typeof args !== "object" || args === null) return false;
  const obj = args as Record<string, unknown>;
  if (typeof obj.company !== "string" || !obj.company.trim()) return false;
  if (obj.timeout !== undefined && (typeof obj.timeout !== "number" || obj.timeout < 20 || obj.timeout > 1500)) return false;
  return true;
}

export function isValidLinkedinManagementCompanyMentionsArgs(
  args: unknown
): args is LinkedinManagementCompanyMentionsArgs {
  if (typeof args !== "object" || args === null) return false;
  const obj = args as Record<string, unknown>;
  if (typeof obj.company !== "string" || !obj.company.trim()) return false;
  if (obj.count !== undefined && typeof obj.count !== "number") return false;
  if (obj.timeout !== undefined && (typeof obj.timeout !== "number" || obj.timeout < 20 || obj.timeout > 1500)) return false;
  return true;
}

export function isValidLinkedinManagementChatAttachmentBase64Args(
  args: unknown
): args is LinkedinManagementChatAttachmentBase64Args {
  if (typeof args !== "object" || args === null) return false;
  const obj = args as Record<string, unknown>;
  if (typeof obj.attachment_url !== "string" || !obj.attachment_url.trim()) return false;
  if (obj.timeout !== undefined && (typeof obj.timeout !== "number" || obj.timeout < 20 || obj.timeout > 1500)) return false;
  return true;
}

// ===== LINKEDIN GROUP VALIDATIONS =====
export function isValidLinkedinGroupArgs(
  args: unknown
): args is LinkedinGroupArgs {
  if (typeof args !== "object" || args === null) return false;
  const obj = args as Record<string, unknown>;
  if (typeof obj.group !== "string" || !obj.group.trim()) return false;
  if (obj.timeout !== undefined && (typeof obj.timeout !== "number" || obj.timeout < 20 || obj.timeout > 1500)) return false;
  return true;
}