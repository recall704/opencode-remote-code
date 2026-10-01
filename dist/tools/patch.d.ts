import type { RemoteConfig } from "../config.js";
import type { PathMapper } from "../path-mapper.js";
import type { SyncEngine } from "../sync-engine.js";
import type { SSHPool } from "../ssh-pool.js";
export type Hunk = {
    type: "add";
    path: string;
    contents: string;
} | {
    type: "delete";
    path: string;
} | {
    type: "update";
    path: string;
    move_path?: string;
    chunks: UpdateFileChunk[];
};
export interface UpdateFileChunk {
    old_lines: string[];
    new_lines: string[];
    change_context?: string;
    is_end_of_file?: boolean;
}
export declare function parsePatch(patchText: string): {
    hunks: Hunk[];
};
export declare function createPatchTool(config: RemoteConfig, pathMapper: PathMapper, syncEngine: SyncEngine, sshPool: SSHPool): import("@opencode-ai/plugin").ToolDefinition<{
    patchText: import("zod").ZodString;
}>;
//# sourceMappingURL=patch.d.ts.map