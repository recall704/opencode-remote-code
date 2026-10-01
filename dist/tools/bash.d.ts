import type { SSHPool } from "../ssh-pool.js";
export declare function createBashTool(sshPool: SSHPool, defaultWorkdir: string): import("@opencode-ai/plugin").ToolDefinition<{
    command: import("zod").ZodString;
    description: import("zod").ZodString;
    timeout: import("zod").ZodOptional<import("zod").ZodNumber>;
    workdir: import("zod").ZodOptional<import("zod").ZodString>;
}>;
//# sourceMappingURL=bash.d.ts.map