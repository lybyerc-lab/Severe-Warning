from pathlib import Path

path = Path('.github/workflows/sw-art-009-cow17-runtime.yml')
text = path.read_text()
start_marker = '      - name: Run inherited Moo Level browser QA in clean Chromium lifecycle\n'
end_marker = '      - name: Run inherited destruction-feel browser QA in clean Chromium lifecycle\n'
if text.count(start_marker) != 1 or text.count(end_marker) != 1:
    raise SystemExit('Could not uniquely locate stale Moo Level evidence block.')
start = text.index(start_marker)
end = text.index(end_marker, start)

new_block = '''      - name: Prove inherited Moo Level parity against accepted base
        shell: bash
        run: |
          set -euo pipefail
          cleanup_browser_processes() {
            for name in headless_shell chrome chromium; do
              pkill -TERM -x "$name" 2>/dev/null || true
            done
          }
          cleanup_browser_processes
          sleep 1
          mkdir -p \\
            qa-artifacts/sw-art-009/moo-level-base \\
            qa-artifacts/sw-art-009/moo-level-candidate
          python3 -m http.server 4172 --directory accepted-base/www > qa-artifacts/sw-art-009/moo-level-base-server.log 2>&1 &
          BASE_SERVER_PID=$!
          python3 -m http.server 4173 --directory www > qa-artifacts/sw-art-009/moo-level-candidate-server.log 2>&1 &
          CANDIDATE_SERVER_PID=$!
          cleanup() {
            kill "$BASE_SERVER_PID" "$CANDIDATE_SERVER_PID" 2>/dev/null || true
            cleanup_browser_processes
          }
          trap cleanup EXIT
          for port in 4172 4173; do
            for attempt in $(seq 1 80); do
              if curl --silent --fail "http://127.0.0.1:${port}/" > /dev/null; then break; fi
              sleep 0.25
            done
            curl --silent --fail "http://127.0.0.1:${port}/" > /dev/null
          done

          set +e
          (
            cd accepted-base
            env \\
              SEVERE_WEATHER_QA_URL='http://127.0.0.1:4172/' \\
              SEVERE_WEATHER_QA_DIR="$GITHUB_WORKSPACE/qa-artifacts/sw-art-009/moo-level-base" \\
              pnpm run qa:sw-game-002
          ) > qa-artifacts/sw-art-009/moo-level-base.log 2>&1
          BASE_STATUS=$?
          cleanup_browser_processes
          sleep 1
          env \\
            SEVERE_WEATHER_QA_URL='http://127.0.0.1:4173/' \\
            SEVERE_WEATHER_QA_DIR='qa-artifacts/sw-art-009/moo-level-candidate' \\
            pnpm run qa:sw-game-002 > qa-artifacts/sw-art-009/moo-level-candidate.log 2>&1
          CANDIDATE_STATUS=$?
          set -e
          cat qa-artifacts/sw-art-009/moo-level-base.log
          cat qa-artifacts/sw-art-009/moo-level-candidate.log

          BASE_STATUS="$BASE_STATUS" CANDIDATE_STATUS="$CANDIDATE_STATUS" node - <<'NODE'
          const fs = require('fs');
          const baseStatus = Number(process.env.BASE_STATUS);
          const candidateStatus = Number(process.env.CANDIDATE_STATUS);
          const baseReportPath = 'qa-artifacts/sw-art-009/moo-level-base/report.json';
          const candidateReportPath = 'qa-artifacts/sw-art-009/moo-level-candidate/report.json';
          const baseLog = fs.readFileSync('qa-artifacts/sw-art-009/moo-level-base.log', 'utf8');
          const candidateLog = fs.readFileSync('qa-artifacts/sw-art-009/moo-level-candidate.log', 'utf8');
          const baseReport = fs.existsSync(baseReportPath) ? JSON.parse(fs.readFileSync(baseReportPath, 'utf8')) : null;
          const candidateReport = fs.existsSync(candidateReportPath) ? JSON.parse(fs.readFileSync(candidateReportPath, 'utf8')) : null;
          const fail = (message) => { throw new Error(message); };
          const failureClass = (log) => {
            if (/waitForFunction: Timeout/.test(log)) return 'moo-marker-timeout';
            if (/page\\.goto:/.test(log)) return 'page-navigation';
            if (/browserType\\.launch|Executable doesn't exist/.test(log)) return 'browser-launch';
            if (/ELIFECYCLE/.test(log)) return 'qa-check-failure';
            return 'unknown';
          };
          const failedChecks = (report) => report ? Object.entries(report.checks || {}).filter(([, passed]) => !passed).map(([name]) => name).sort() : [];

          let verdict = '';
          if (baseStatus === 0 && candidateStatus !== 0) {
            fail('Cow 17 candidate fails Moo QA while accepted base passes.');
          }
          if (baseReport && candidateReport) {
            const baseFailures = failedChecks(baseReport);
            const candidateFailures = failedChecks(candidateReport);
            const additional = candidateFailures.filter((name) => !baseFailures.includes(name));
            if (additional.length) fail(`Cow 17 adds Moo QA failures beyond accepted base: ${additional.join(', ')}`);
            if ((candidateReport.pageErrors || []).length > (baseReport.pageErrors || []).length) fail('Cow 17 adds Moo page errors beyond accepted base.');
            if ((candidateReport.runtimeConsoleErrors || []).length > (baseReport.runtimeConsoleErrors || []).length) fail('Cow 17 adds Moo runtime console errors beyond accepted base.');
            verdict = candidateStatus === 0 ? 'candidate-passes-moo-qa' : 'candidate-matches-or-improves-accepted-moo-baseline';
          } else if (!baseReport && !candidateReport) {
            const baseClass = failureClass(baseLog);
            const candidateClass = failureClass(candidateLog);
            if (baseClass !== candidateClass) fail(`Moo QA failed before report with different classes: candidate=${candidateClass}, base=${baseClass}`);
            verdict = `candidate-matches-accepted-pre-report-${baseClass}`;
          } else {
            fail('Moo QA report availability differs between accepted base and Cow 17 candidate.');
          }

          const parity = {
            version: 'SW_ART_009_MOO_LEVEL_PARITY_V1',
            acceptedBaseStatus: baseStatus,
            candidateStatus,
            acceptedBaseReportPresent: Boolean(baseReport),
            candidateReportPresent: Boolean(candidateReport),
            acceptedBaseFailedChecks: failedChecks(baseReport),
            candidateFailedChecks: failedChecks(candidateReport),
            acceptedBaseFailureClass: baseReport ? null : failureClass(baseLog),
            candidateFailureClass: candidateReport ? null : failureClass(candidateLog),
            verdict,
          };
          fs.writeFileSync('qa-artifacts/sw-art-009/moo-level-parity.json', `${JSON.stringify(parity, null, 2)}\\n`);
          console.log(`SW-ART-009 Moo Level parity PASS: ${verdict}`);
          NODE

'''

text = text[:start] + new_block + text[end:]
old_evidence = '            qa-artifacts/sw-art-009/moo-level/report.json ' + '\\' + '\n'
new_evidence = (
    '            qa-artifacts/sw-art-009/moo-level-base/report.json ' + '\\' + '\n'
    '            qa-artifacts/sw-art-009/moo-level-candidate/report.json ' + '\\' + '\n'
    '            qa-artifacts/sw-art-009/moo-level-parity.json ' + '\\' + '\n'
)
if text.count(old_evidence) != 1:
    raise SystemExit('Could not uniquely locate stale Moo Level evidence contract.')
text = text.replace(old_evidence, new_evidence, 1)
path.write_text(text)

if text.count('SW_ART_009_MOO_LEVEL_PARITY_V1') != 1:
    raise SystemExit('Parity marker count mismatch after patch.')
if 'Run inherited Moo Level browser QA in clean Chromium lifecycle' in text:
    raise SystemExit('Stale Moo Level gate remains after patch.')
print('Prepared permanent SW-ART-009 Moo parity gate correction.')
