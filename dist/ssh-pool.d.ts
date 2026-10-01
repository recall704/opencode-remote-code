import { type SFTPWrapper } from "ssh2";
import type { RemoteConfig } from "./config.js";
export interface SSHPool {
    exec(command: string, options?: {
        cwd?: string;
        timeout?: number;
    }): Promise<{
        stdout: string;
        stderr: string;
        exitCode: number;
    }>;
    withSftp<T>(fn: (sftp: SFTPWrapper) => Promise<T>): Promise<T>;
    getSudoAskpassPath(): string | undefined;
    close(): Promise<void>;
}
export declare function createSSHPool(config: RemoteConfig): Promise<SSHPool>;
//# sourceMappingURL=ssh-pool.d.ts.map