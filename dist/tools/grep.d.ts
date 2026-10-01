import type { RemoteConfig } from "../config.js";
import type { SSHPool } from "../ssh-pool.js";
export declare function createGrepTool(config: RemoteConfig, sshPool: SSHPool): import("@opencode-ai/plugin").ToolDefinition<{
    pattern: import("zod").ZodString;
    path: import("zod").ZodOptional<import("zod").ZodString>;
    include: import("zod").ZodOptional<import("zod").ZodString>;
}>;
//# sourceMappingURL=grep.d.ts.map