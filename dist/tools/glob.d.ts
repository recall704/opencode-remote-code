import type { RemoteConfig } from "../config.js";
import type { SSHPool } from "../ssh-pool.js";
export declare function createGlobTool(config: RemoteConfig, sshPool: SSHPool): import("@opencode-ai/plugin").ToolDefinition<{
    pattern: import("zod").ZodString;
    path: import("zod").ZodOptional<import("zod").ZodString>;
}>;
//# sourceMappingURL=glob.d.ts.map