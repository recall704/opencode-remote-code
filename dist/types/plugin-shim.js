// Minimal type shim for @opencode-ai/plugin to allow local development
// In production, OpenCode installs the real package automatically.
import { z } from "zod";
export function tool(input) {
    return input;
}
tool.schema = z;
//# sourceMappingURL=plugin-shim.js.map