export interface RemoteConfig {
    /** Raw SSH command string, e.g. "ssh -oHostKeyAlgorithms=+ssh-rsa root@host" */
    sshCommand: string;
    /** Parsed SSH target host */
    host: string;
    /** Parsed SSH user */
    user: string;
    /** Parsed SSH port */
    port: number;
    /** Parsed identity file (optional) */
    identity?: string;
    /** Extra SSH -o options */
    extraOptions: string[];
    /** SSH login password (optional, uses sshpass) */
    password?: string;
    /** Sudo password for remote commands (optional) */
    sudoPassword?: string;
    /** Remote working directory (absolute path on remote) */
    remoteWorkdir: string;
    /** Local mirror root directory */
    mirrorRoot: string;
    /** Whether remote mode is active */
    active: boolean;
}
export declare function loadConfig(options?: Record<string, unknown>): RemoteConfig | null;
//# sourceMappingURL=config.d.ts.map