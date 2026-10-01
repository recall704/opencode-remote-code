/**
 * Enhanced E2E Test Suite for Remote Code
 *
 * Run with environment variables:
 *   REMOTE_SSH="ssh -oHostKeyAlgorithms=+ssh-rsa root@192.168.184.133" \
 *   REMOTE_WORKDIR=/tmp/opencode-remote-test \
 *   REMOTE_PASSWORD=123456 \
 *   REMOTE_SUDO_PASSWORD=123456 \
 *   npx tsx src/test-e2e.ts
 *
 * Features:
 * - Comprehensive timing for SSH connection init and every tool call
 * - Concurrent execution stress tests
 * - Large file I/O benchmarks
 * - Binary file detection
 * - Connection health verification
 * - Graceful failure handling (one test failing does not abort the suite)
 */
export {};
//# sourceMappingURL=test-e2e.d.ts.map