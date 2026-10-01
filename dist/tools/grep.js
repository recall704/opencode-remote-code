import { tool } from "../types/plugin-shim.js";
export function createGrepTool(config, sshPool) {
    return tool({
        description: `Search file contents using grep/ripgrep on the remote machine.`,
        args: {
            pattern: tool.schema.string().describe("The regex pattern to search for in file contents"),
            path: tool.schema.string().optional().describe("The directory to search in. Defaults to the current working directory."),
            include: tool.schema.string().optional().describe("File pattern to include in the search (e.g. '*.js', '*.{ts,tsx}')"),
        },
        async execute(args, ctx) {
            const searchDir = args.path || config.remoteWorkdir;
            const limit = 100;
            // Try ripgrep with JSON output and reverse-time sorting first
            let cmd;
            const escapedPattern = args.pattern.replace(/'/g, "'\"'\"'");
            if (args.include) {
                const glob = args.include.replace(/'/g, "'\"'\"'");
                cmd = `cd ${quoteShell(searchDir)} && rg --json --sortr=modified --glob '${glob}' -n -- '${escapedPattern}' 2>/dev/null`;
            }
            else {
                cmd = `cd ${quoteShell(searchDir)} && rg --json --sortr=modified -n -- '${escapedPattern}' 2>/dev/null`;
            }
            let result = await sshPool.exec(cmd, { timeout: 30_000 });
            // Fallback to grep if rg not available or produced no output
            if (!result.stdout.trim()) {
                if (args.include) {
                    const glob = args.include.replace(/'/g, "'\"'\"'");
                    cmd = `cd ${quoteShell(searchDir)} && grep -Ern --include='${glob}' -- '${escapedPattern}' . 2>/dev/null`;
                }
                else {
                    cmd = `cd ${quoteShell(searchDir)} && grep -Ern -- '${escapedPattern}' . 2>/dev/null`;
                }
                result = await sshPool.exec(cmd, { timeout: 30_000 });
                return parseGrepOutput(result.stdout, searchDir, args.pattern, limit);
            }
            return parseRgJsonOutput(result.stdout, searchDir, args.pattern, limit);
        },
    });
}
function parseRgJsonOutput(stdout, searchDir, pattern, limit) {
    const lines = stdout.split("\n").filter(Boolean);
    const matches = [];
    for (const line of lines) {
        try {
            const msg = JSON.parse(line);
            if (msg.type === "match") {
                const m = msg;
                const rawPath = m.data.path.text;
                const fullPath = rawPath.startsWith("/") ? rawPath : searchDir + "/" + rawPath;
                matches.push({
                    path: fullPath,
                    line: m.data.line_number,
                    text: m.data.lines.text,
                });
            }
        }
        catch {
            // ignore malformed JSON lines
        }
    }
    return formatGrepResult(matches, pattern, limit);
}
function parseGrepOutput(stdout, searchDir, pattern, limit) {
    const lines = stdout.split("\n").filter(Boolean);
    const matches = [];
    for (const line of lines) {
        const firstColon = line.indexOf(":");
        if (firstColon === -1)
            continue;
        const secondColon = line.indexOf(":", firstColon + 1);
        if (secondColon === -1)
            continue;
        let rawPath = line.slice(0, firstColon);
        const lineNum = parseInt(line.slice(firstColon + 1, secondColon), 10);
        const text = line.slice(secondColon + 1);
        if (isNaN(lineNum))
            continue;
        if (rawPath.startsWith("./"))
            rawPath = rawPath.slice(2);
        const fullPath = rawPath.startsWith("/") ? rawPath : searchDir + "/" + rawPath;
        matches.push({ path: fullPath, line: lineNum, text });
    }
    return formatGrepResult(matches, pattern, limit);
}
function formatGrepResult(matches, pattern, limit) {
    if (matches.length === 0) {
        return {
            title: pattern,
            output: "No files found",
            metadata: { matches: 0, truncated: false },
        };
    }
    const total = matches.length;
    const truncated = total > limit;
    const display = truncated ? matches.slice(0, limit) : matches;
    const output = [];
    output.push(`Found ${total} matches${truncated ? ` (showing first ${limit})` : ""}`);
    let current = "";
    for (const m of display) {
        if (current !== m.path) {
            if (current !== "")
                output.push("");
            current = m.path;
            output.push(`${m.path}:`);
        }
        const text = m.text.length > 2000 ? m.text.substring(0, 2000) + "..." : m.text;
        output.push(`  Line ${m.line}: ${text}`);
    }
    if (truncated) {
        output.push("");
        output.push(`(Results truncated: showing ${limit} of ${total} matches (${total - limit} hidden). Consider using a more specific pattern.)`);
    }
    return {
        title: pattern,
        output: output.join("\n"),
        metadata: { matches: total, truncated },
    };
}
import { quoteShell } from "../shell-quote.js";
//# sourceMappingURL=grep.js.map