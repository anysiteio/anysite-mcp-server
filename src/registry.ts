import type { CategoryDef, EndpointDef, SourceDef } from "./types.js";

export class Registry {
  constructor(public sources: SourceDef[]) {}

  getSource(name: string): SourceDef | undefined {
    return this.sources.find((s) => s.name === name);
  }

  getCategory(source: string, category: string): CategoryDef | undefined {
    return this.getSource(source)?.categories.find((c) => c.name === category);
  }

  getEndpoint(source: string, category: string, endpoint: string): EndpointDef | undefined {
    return this.getCategory(source, category)?.endpoints.find((e) => e.name === endpoint);
  }

  replace(sources: SourceDef[]): void {
    this.sources = sources;
  }
}
