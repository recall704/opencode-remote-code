// Generate the manifest published on the `release` branch.
//
// The branch is a build-artifact branch: it must be installable as a package
// (so `"github:owner/repo#release"` resolves) while carrying nothing that only
// matters for development. This script copies the runtime-relevant fields from
// the source manifest and drops the rest — no scripts, no devDependencies, no
// test/tooling metadata.
//
// Usage: node scripts/release-manifest.mjs <source package.json> <output path>

import { readFileSync, writeFileSync } from "node:fs";

const [, , sourcePath = "package.json", outPath = "package.json"] =
  process.argv;

const source = JSON.parse(readFileSync(sourcePath, "utf8"));
const sha = process.env.RELEASE_SOURCE_SHA ?? "unknown";
const sourceBranch = process.env.RELEASE_SOURCE_BRANCH ?? "main";
const repoUrl = process.env.RELEASE_REMOTE_URL ?? "";

const manifest = {
  "//": `GENERATED — build artifacts of ${source.name} from ${sourceBranch}@${sha}. Do not edit; rebuild with scripts/publish-release.sh.${repoUrl ? ` Sources: ${repoUrl.replace(/\.git$/, "")}` : ""}`,
  name: source.name,
  version: source.version,
  description: source.description,
  license: source.license,
  type: source.type,
  main: source.main,
  types: source.types,
  exports: source.exports,
  engines: { node: ">=20" },
  keywords: source.keywords,
  // Runtime requirements only: `dependencies` are installed by the consumer's
  // package manager; `peerDependencies` are provided by OpenCode itself.
  peerDependencies: source.peerDependencies,
  dependencies: source.dependencies,
};

writeFileSync(outPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`[release] wrote ${outPath}`);
