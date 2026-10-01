import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";
import { INLINE_PROMPTS } from "./inline.js";
function load(name) {
    // In the bundled single-file build the prompts are inlined; otherwise they
    // are read from the `*.txt` files sitting next to this module.
    const inlined = INLINE_PROMPTS[name];
    if (inlined !== undefined)
        return inlined;
    const dir = path.dirname(fileURLToPath(import.meta.url));
    return readFileSync(path.join(dir, `${name}.txt`), "utf-8");
}
const PROMPTS = {
    anthropic: load("anthropic"),
    beast: load("beast"),
    codex: load("codex"),
    default: load("default"),
    gemini: load("gemini"),
    gpt: load("gpt"),
    kimi: load("kimi"),
    trinity: load("trinity"),
};
export function getProviderPrompt(modelID) {
    const id = modelID.toLowerCase();
    if (id.includes("gpt-4") || id.includes("o1") || id.includes("o3"))
        return PROMPTS.beast;
    if (id.includes("gpt")) {
        if (id.includes("codex"))
            return PROMPTS.codex;
        return PROMPTS.gpt;
    }
    if (id.includes("gemini-"))
        return PROMPTS.gemini;
    if (id.includes("claude"))
        return PROMPTS.anthropic;
    if (id.includes("trinity"))
        return PROMPTS.trinity;
    if (id.includes("kimi"))
        return PROMPTS.kimi;
    return PROMPTS.default;
}
//# sourceMappingURL=index.js.map