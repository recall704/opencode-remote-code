import type { PathMapper } from "../path-mapper.js";
import type { SSHPool } from "../ssh-pool.js";
import type { SyncEngine } from "../sync-engine.js";
export declare function createReadTool(pathMapper: PathMapper, syncEngine: SyncEngine, sshPool: SSHPool): import("@opencode-ai/plugin").ToolDefinition<{
    filePath: import("zod").ZodString;
    offset: import("zod").ZodOptional<import("zod").ZodNumber>;
    limit: import("zod").ZodOptional<import("zod").ZodNumber>;
}>;
//# sourceMappingURL=read.d.ts.map