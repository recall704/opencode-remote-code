/**
 * Extended Verification Test Suite for Remote Code
 *
 * This suite targets the blind spots of test-e2e.ts:
 * - BOM preservation across read/write/edit/patch
 * - Unified diff preview format verification
 * - Strict content matching (not just includes())
 * - edit oldString="" create-file path
 * - Patch move operations
 * - isWithinWorkspace boundary security regression
 * - quoteShell injection safety
 * - Read offset/limit pagination
 * - Glob brace expansion fallback
 *
 * Run:
 *   REMOTE_SSH="ssh -oHostKeyAlgorithms=+ssh-rsa root@192.168.184.133" \
 *   REMOTE_PASSWORD=123456 \
 *   npx tsx src/test-extended.ts
 */
export {};
//# sourceMappingURL=test-extended.d.ts.map