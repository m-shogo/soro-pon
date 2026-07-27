#!/bin/zsh
set -euo pipefail

repo_root=${0:A:h:h:h}
cd "$repo_root"

cycles=${B13_SAFARI_CYCLES:-24}
portrait_seconds=${B13_SAFARI_PORTRAIT_SECONDS:-10}
landscape_seconds=${B13_SAFARI_LANDSCAPE_SECONDS:-30}
settle_seconds=${B13_SAFARI_SETTLE_SECONDS:-10}
evidence_file=${B13_SAFARI_ROTATION_LOG:-docs/qa/evidence/batch-13/safari-mac/rotation-soak.tsv}
ax_script=scripts/qa/batch13-safari-ui.applescript

mkdir -p "${evidence_file:h}"

original_geometry=$(
  osascript \
    -e 'tell application "System Events" to tell process "Safari"' \
    -e 'set p to position of front window' \
    -e 'set s to size of front window' \
    -e 'return (item 1 of p as text) & "," & (item 2 of p as text) & "," & (item 1 of s as text) & "," & (item 2 of s as text)' \
    -e 'end tell'
)
IFS=',' read -r original_x original_y original_width original_height <<< "$original_geometry"

restore_window() {
  osascript \
    -e 'tell application "System Events" to tell process "Safari"' \
    -e "set position of front window to {$original_x, $original_y}" \
    -e "set size of front window to {$original_width, $original_height}" \
    -e 'end tell' >/dev/null 2>&1 || true
}
trap restore_window EXIT INT TERM

started_at=$(date -u +%Y-%m-%dT%H:%M:%SZ)
started_epoch=$(date +%s)
printf 'cycle\tobservedAtUtc\tportraitState\tlandscapeState\thttpStatus\tsafariProcess\tplayAction\n' > "$evidence_file"

for cycle in $(seq 1 "$cycles"); do
  osascript \
    -e 'tell application "System Events" to tell process "Safari"' \
    -e 'set position of front window to {60, 60}' \
    -e 'set size of front window to {620, 900}' \
    -e 'end tell' >/dev/null
  sleep "$portrait_seconds"
  portrait_state=$(osascript "$ax_script" status)

  osascript \
    -e 'tell application "System Events" to tell process "Safari"' \
    -e 'set position of front window to {60, 60}' \
    -e 'set size of front window to {1200, 760}' \
    -e 'end tell' >/dev/null
  sleep "$landscape_seconds"
  landscape_state=$(osascript "$ax_script" status)
  play_action=none
  if [[ "$landscape_state" == game ]]; then
    play_action=$(osascript "$ax_script" play-step)
  elif [[ "$landscape_state" == result ]]; then
    play_action=$(osascript "$ax_script" click-prefix 'もう一局')
  fi

  http_status=$(curl -sS -o /dev/null -w '%{http_code}' http://127.0.0.1:4174/)
  safari_process=absent
  if pgrep -q -f '/Safari.app/Contents/MacOS/Safari'; then
    safari_process=present
  fi
  observed_at=$(date -u +%Y-%m-%dT%H:%M:%SZ)
  printf '%s\t%s\t%s\t%s\t%s\t%s\t%s\n' \
    "$cycle" "$observed_at" "$portrait_state" "$landscape_state" \
    "$http_status" "$safari_process" "$play_action" | tee -a "$evidence_file"
  sleep "$settle_seconds"
done

ended_at=$(date -u +%Y-%m-%dT%H:%M:%SZ)
ended_epoch=$(date +%s)
duration_seconds=$((ended_epoch - started_epoch))
printf '# startedAtUtc=%s endedAtUtc=%s durationSeconds=%s cycles=%s\n' \
  "$started_at" "$ended_at" "$duration_seconds" "$cycles" | tee -a "$evidence_file"
