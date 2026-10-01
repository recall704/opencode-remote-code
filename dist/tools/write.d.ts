import type { PathMapper } from "../path-mapper.js";
import type { SyncEngine } from "../sync-engine.js";
export declare function createWriteTool(pathMapper: PathMapper, syncEngine: SyncEngine): import("@opencode-ai/plugin").ToolDefinition<{
    content: import("zod").ZodString;
    filePath: import("zod").ZodString;
}>;
//# sourceMappingURL=write.d.ts.map