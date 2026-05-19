export interface EndpointDef {
  name: string;
  description: string;
  paramsSchema: Record<string, unknown>;
  apiPath: string;
  apiMethod: string;
  responseModel: string;
  responseFields: string[];
  llmHint: string;
  llmRequires: string[];
  llmInputMapping: Record<string, string>;
  llmErrors: Record<string, string>;
}

export interface CategoryDef {
  name: string;
  description: string;
  endpoints: EndpointDef[];
  llmOverview: string;
  llmCommonFlows: string[];
  llmGlossary: Record<string, unknown>;
}

export interface SourceDef {
  name: string;
  description: string;
  categories: CategoryDef[];
}

export interface CacheEntry {
  items: Record<string, unknown>[];
  createdAt: number;
}

export interface ApiErrorPayload {
  error: string;
  status_code?: number;
  data?: unknown;
}

export class ApiError extends Error {
  public readonly status?: number;
  public readonly data?: unknown;

  constructor(payload: ApiErrorPayload) {
    super(payload.error);
    this.name = "ApiError";
    this.status = payload.status_code;
    this.data = payload.data;
  }
}
