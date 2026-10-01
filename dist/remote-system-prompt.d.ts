import type { SSHPool } from "./ssh-pool.js";
export interface RemoteSystemPromptContext {
    modelID: string;
    remoteWorkdir: string;
    remotePlatform: string;
    isGitRepo: boolean;
    sshPool: SSHPool;
}
export declare function buildRemoteSystemPrompt(ctx: RemoteSystemPromptContext, originalSystem: string[]): Promise<string[]>;
//# sourceMappingURL=remote-system-prompt.d.ts.map