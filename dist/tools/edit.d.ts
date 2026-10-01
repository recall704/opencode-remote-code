import type { PathMapper } from "../path-mapper.js";
import type { SyncEngine } from "../sync-engine.js";
export declare function createEditTool(pathMapper: PathMapper, syncEngine: SyncEngine): import("@opencode-ai/plugin").ToolDefinition<{
    filePath: import("zod").ZodString;
    oldString: import("zod").ZodString;
    newString: import("zod").ZodString;
    replaceAll: import("zod").ZodOptional<import("zod").ZodBoolean>;
}>;
//# sourceMappingURL=edit.d.ts.map