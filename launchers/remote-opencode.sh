#!/usr/bin/env bash
# Launcher for OpenCode with the Remote Code plugin.
#
# Anchors OpenCode to a stable local session directory derived from the remote
# target, so a session survives being started from any working directory.
#
# Fail-fast: OpenCode, the plugin, the remote host and the remote workdir are
# all checked before OpenCode starts. Any failure prints the reason and exits
# non-zero — it never falls through into a local (non-remote) OpenCode session.
#
# Usage:
#   1. Edit the "User Configuration" block below (or export the variables).
#   2. chmod +x remote-opencode
#   3. remote-opencode [opencode args...]
#
# Escape hatch: REMOTE_SKIP_PREFLIGHT=1 remote-opencode ...

set -euo pipefail

# ==========================
# === User Configuration ===
# ==========================
# Every value below can be overridden from the environment, e.g.
#   REMOTE_SSH="ssh -i /root/.ssh/id_ed25519 root@10.0.0.5" remote-opencode
REMOTE_SSH="${REMOTE_SSH:-ssh -oHostKeyAlgorithms=+ssh-rsa root@192.168.184.133}"
REMOTE_WORKDIR="${REMOTE_WORKDIR:-/home/work/TM018/TSMC018}"
REMOTE_PASSWORD="${REMOTE_PASSWORD:-123456}"
REMOTE_SUDO_PASSWORD="${REMOTE_SUDO_PASSWORD:-123456}"
# ==========================

# Preflight tuning
REMOTE_PREFLIGHT_TIMEOUT="${REMOTE_PREFLIGHT_TIMEOUT:-10}"
# REMOTE_SKIP_PREFLIGHT=1

# SSH connection pool tuning (uncomment to override defaults)
# REMOTE_POOL_COMMAND_SIZE=3
# REMOTE_POOL_FILE_SIZE=2
# REMOTE_POOL_STAGGER_MS=0

# ==========================
# === Helpers ===
# ==========================
die() {
  local message="$1"
  shift
  printf '\n[remote-opencode] ERROR: %s\n' "$message" >&2
  local line
  for line in "$@"; do
    printf '    %s\n' "$line" >&2
  done
  printf '\n' >&2
  exit "${REMOTE_EXIT_CODE:-1}"
}

note() {
  printf '[remote-opencode] %s\n' "$*" >&2
}

# Run a command with a timeout when one is available (macOS lacks `timeout`).
with_timeout() {
  local secs="$1"
  shift
  if command -v timeout >/dev/null 2>&1; then
    timeout "$secs" "$@"
  elif command -v gtimeout >/dev/null 2>&1; then
    gtimeout "$secs" "$@"
  else
    "$@"
  fi
}

# Quote a value for a remote POSIX shell.
remote_quote() {
  printf "'%s'" "$(printf '%s' "$1" | sed "s/'/'\\\\''/g")"
}

# ==========================
# === Resolve target ===
# ==========================
HOST=$(printf '%s\n' "$REMOTE_SSH" | grep -oE '[A-Za-z0-9._-]+@[A-Za-z0-9._-]+' | head -n1 || true)
[ -n "$HOST" ] || die "REMOTE_SSH has no user@host target." "REMOTE_SSH=$REMOTE_SSH"

HOST_ONLY=${HOST#*@}
PORT=$(printf '%s\n' "$REMOTE_SSH" | grep -oE '(^|[[:space:]])-p[[:space:]]*[0-9]+' | grep -oE '[0-9]+$' | head -n1 || true)
PORT=${PORT:-22}

# Stable local session directory: ~/.opencode/remote-sessions/<host>_<dir_slug>
DIR_SLUG=$(printf '%s' "$REMOTE_WORKDIR" | sed 's/^\///;s/\//_/g')
SESSION_DIR="$HOME/.opencode/remote-sessions/${HOST_ONLY}_${DIR_SLUG}"

# ==========================
# === Preflight ===
# ==========================
skip_preflight() {
  [ "${REMOTE_SKIP_PREFLIGHT:-0}" = "1" ] && return 0
  local arg
  for arg in "$@"; do
    # These only ask OpenCode about itself, no remote work happens.
    case "$arg" in
      --version | --help | -h) return 0 ;;
    esac
  done
  return 1
}

if ! skip_preflight "$@"; then
  # 1. OpenCode itself.
  if ! command -v opencode >/dev/null 2>&1; then
    die "opencode was not found in PATH." \
      "Install OpenCode, or re-run with REMOTE_SKIP_PREFLIGHT=1 to bypass."
  fi

  # 2. The plugin must be installed, otherwise OpenCode would silently start a
  #    local session instead of a remote one.
  plugin_at=""
  for candidate in \
    "$HOME/.config/opencode/plugins/remote-code.js" \
    "$HOME/.config/opencode/plugins/remote-code.ts" \
    "$HOME/.config/opencode/plugins/remote-code/package.json" \
    "$HOME/.config/opencode/plugin/remote-code.js"
  do
    if [ -e "$candidate" ]; then
      plugin_at="$candidate"
      break
    fi
  done
  if [ -z "$plugin_at" ]; then
    cfg="$HOME/.config/opencode/opencode.jsonc"
    [ -f "$cfg" ] || cfg="$HOME/.config/opencode/opencode.json"
    if [ -f "$cfg" ] && grep -q 'remote-code' "$cfg"; then
      plugin_at="$cfg (plugin entry)"
    fi
  fi
  [ -n "$plugin_at" ] || die "the Remote Code plugin is not installed — OpenCode would start a local session." \
    "Looked for:" \
    "  ~/.config/opencode/plugins/remote-code.js" \
    "  ~/.config/opencode/plugins/remote-code/package.json" \
    "  a \"remote-code\" entry in ~/.config/opencode/opencode.json(c)" \
    "" \
    "Install with:" \
    "  bun run build && cp dist/plugins/remote-code.js ~/.config/opencode/plugins/"

  # 3. The plugin authenticates with the ssh2 library, which ignores
  #    ~/.ssh/config and the default key files. Without an explicit key or a
  #    password it fails at load time with "All configured authentication
  #    methods failed" while OpenCode keeps running locally.
  if [ -z "$REMOTE_PASSWORD" ]; then
    if ! printf '%s\n' "$REMOTE_SSH" | grep -qE '(^|[[:space:]])-i([[:space:]]|=|/)'; then
      die "no credential for the plugin: REMOTE_SSH has no \"-i <key>\" and REMOTE_PASSWORD is empty." \
        "The plugin uses ssh2, which does not read ~/.ssh/config or default keys." \
        "Fix: add -i /path/to/key to REMOTE_SSH, or set REMOTE_PASSWORD."
    fi
    IDENTITY=$(printf '%s\n' "$REMOTE_SSH" \
      | grep -oE '(^|[[:space:]])-i[[:space:]]*=?[^[:space:]]+' \
      | head -n1 \
      | sed -E 's/^[[:space:]]*-i[[:space:]]*=?//' || true)
    if [ -n "$IDENTITY" ] && [ ! -f "$IDENTITY" ]; then
      die "the identity file in REMOTE_SSH does not exist: $IDENTITY" \
        "REMOTE_SSH=$REMOTE_SSH"
    fi
  fi

  # 4. TCP reachability (no credentials needed, so this also covers
  #    password-auth setups).
  if ! with_timeout "$REMOTE_PREFLIGHT_TIMEOUT" bash -c 'exec 3<>"/dev/tcp/$1/$2"' _ "$HOST_ONLY" "$PORT" 2>/dev/null; then
    die "cannot reach $HOST_ONLY:$PORT (TCP connect failed)." \
      "Check the address, port, VPN or firewall." \
      "REMOTE_SSH=$REMOTE_SSH"
  fi

  # 5. SSH auth + remote workdir. Skipped for password auth because the system
  #    ssh client would prompt interactively (the plugin authenticates via ssh2).
  if [ -z "$REMOTE_PASSWORD" ]; then
    read -r -a ssh_args <<<"$REMOTE_SSH"
    remote_cmd="if cd $(remote_quote "$REMOTE_WORKDIR") 2>/dev/null; then echo REMOTE_WORKDIR_OK; else echo REMOTE_WORKDIR_MISSING; fi"

    set +e
    ssh_out=$(with_timeout "$REMOTE_PREFLIGHT_TIMEOUT" "${ssh_args[@]}" \
      -oBatchMode=yes -oConnectTimeout="$REMOTE_PREFLIGHT_TIMEOUT" \
      "$remote_cmd" 2>&1)
    ssh_rc=$?
    set -e

    if [ "$ssh_rc" -ne 0 ]; then
      die "SSH preflight failed for $HOST (exit $ssh_rc)." \
        "$ssh_out" \
        "REMOTE_SSH=$REMOTE_SSH"
    fi
    case "$ssh_out" in
      *REMOTE_WORKDIR_OK*) ;;
      *) die "the remote workdir is not usable: $REMOTE_WORKDIR" \
        "The SSH connection itself succeeded (auth and host are fine)." \
        "$ssh_out" ;;
    esac
  else
    note "REMOTE_PASSWORD is set — skipping the SSH auth/workdir check (ssh2 authenticates with the password)."
  fi
fi

# ==========================
# === Launch ===
# ==========================
mkdir -p "$SESSION_DIR"
cd "$SESSION_DIR"

export REMOTE_SSH
export REMOTE_WORKDIR
export REMOTE_PASSWORD
export REMOTE_SUDO_PASSWORD
# export REMOTE_POOL_COMMAND_SIZE
# export REMOTE_POOL_FILE_SIZE
# export REMOTE_POOL_STAGGER_MS

exec opencode "$@"
