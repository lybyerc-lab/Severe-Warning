# GitHub Connector Playbook

Last updated: 2026-07-25
Repository: `lybyerc-lab/Severe-Warning`

This document records connector capabilities, safe workflows, limitations, and lessons learned while maintaining Severe Weather from a mobile-first workflow.

## Confirmed connector capabilities

The connected GitHub integration can:

- import and identify a repository using `repo:{owner/name} import`
- read repository metadata, branches, commits, files, blobs, pull requests, issues, comments, and status checks
- create branches from an exact commit SHA or existing ref
- create, update, and delete UTF-8 repository files through the Contents API
- create blobs, trees, commits, and move branch refs
- compare branches or commits and return the exact changed-path list
- fast-forward `main` to a reviewed feature-branch commit with `update_ref`
- create pull requests and manage PR metadata
- inspect commit-level status checks and limited workflow metadata

## High-efficiency direct repository workflow

Use this sequence for normal Severe Weather changes:

1. Read the GitHub skill and confirm the repository and target branch.
2. Fetch `main` and record its exact commit SHA.
3. Create `agent/<task-name>` from that SHA.
4. Fetch only the files needed for the change, using line ranges when possible.
5. Apply direct file writes on the feature branch.
6. Update project memory, `FILE_INVENTORY.txt`, and `SHA256SUMS.txt` in the same branch.
7. Compare the feature branch against `main` and inspect every changed path.
8. Verify expected version strings, deprecated API removals, and temporary-file cleanup by fetching the final files.
9. Fast-forward `main` only after the branch is complete and approved.
10. Compare `main` and the feature branch again. They must report `identical`.

## Newly learned connector behavior

### Repository import can change permissions

A connector session may initially expose repository metadata while blocking writes with `403 Resource not accessible by integration`. Importing the repository explicitly with:

```text
repo:{lybyerc-lab/Severe-Warning} import
```

can attach the correct repository installation context and unlock branch and file writes.

Do not assume a reported `push: true` permission proves the active installation token can write. Test with a harmless feature-branch operation.

### Branch creation accepts an exact SHA

Creating a branch directly from a known commit SHA is reliable and avoids ambiguity about the current default branch state.

### Contents API writes are sequential commits

`create_file`, `update_file`, and `delete_file` each create a commit immediately. They are useful for focused changes but can produce a noisy multi-commit branch. For larger patches, prefer the Git data path when possible:

1. create blobs
2. create one tree against the correct base tree SHA
3. create one commit
4. move the feature-branch ref

The connector requires a real tree SHA for `create_tree` and `create_commit`; a commit SHA is not interchangeable with a tree SHA.

### `update_ref` is an effective fast-forward merge

After review, `update_ref` can move `main` to the feature-branch head with `force: false`. This preserves fast-forward safety. Always verify afterward with `compare_commits`; the result should be `identical`, `ahead_by: 0`, and `behind_by: 0`.

### Compare results are the strongest branch audit

`compare_commits` reliably exposes:

- ahead and behind counts
- merge-base commit
- exact changed paths
- additions and deletions per path

Use it before and after merge. It catches temporary files, missing documentation, stale checksum files, and accidental scope drift.

### Workflow-run visibility is limited

`fetch_commit_workflow_runs` currently filters to pull-request-triggered runs. A workflow triggered by a normal branch push may not appear, even when the workflow file exists. An empty result does not prove the Action did not run.

For complete GitHub Actions diagnostics, use authenticated `gh` tooling or the Actions UI. Do not build critical repository mutation logic around connector-only workflow visibility.

### Self-modifying Actions are a poor patch transport

A temporary workflow that edits its own branch adds unnecessary uncertainty:

- workflow permission and trigger behavior become extra failure points
- connector workflow visibility is incomplete
- the branch can be left partially staged
- the workflow file itself becomes unwanted project content

Prefer direct connector writes or one atomic Git-data commit.

### File fetching should be narrow

Use `fetch_file` with `start_line` and `end_line` for targeted edits and verification. Full-file fetches can be large and truncated. Use `fetch_blob` only when the blob SHA is already known and full content is needed.

### Connector writes must be verified, not inferred

After every important write:

- fetch the changed file
- verify the expected content and blob SHA
- compare the branch against its base

A successful API response proves the write call completed, not that the entire intended multi-file change is complete.

## Known limitations

- The connector does not provide a complete local working tree.
- It cannot run Unity, `Tools/validate_project.py`, or `sha256sum` by itself.
- GitHub Actions run discovery is incomplete for push-triggered workflows.
- Large full-file responses can be truncated.
- Contents API changes create one commit per file operation.
- A commit SHA cannot be used where a tree SHA is required.
- Raw Unity Cloud logs must never be committed because they can contain temporary access tokens.

## Efficiency rules for Severe Weather

- Prefer connector-first work for repository reads, direct text edits, branch creation, comparison, and fast-forward merges.
- Use a feature branch for every code or memory change.
- Keep the build branch and documentation-experiment branches separate while Unity Cloud is compiling.
- Do not create temporary Actions merely to execute repository patches.
- Use exact commit SHAs whenever branch state matters.
- Fetch only relevant line ranges before editing.
- Batch related changes into one atomic Git-data commit when the connector exposes the required tree information.
- Otherwise accept sequential Contents API commits, but keep the changed-path set small and verify it explicitly.
- Never move `main` until inventory, checksums, validation notes, and branch comparison agree.
- After moving `main`, verify `main` and the feature branch are identical.

## Preferred decision tree

Use direct connector file writes when:

- the change touches a small number of text files
- exact file paths are known
- no local compilation is required before staging

Use the Git data API when:

- many files must land as one atomic commit
- the correct base tree SHA is available
- branch history cleanliness matters

Use local `git` and `gh` when:

- repository-wide scripts must run
- binary files are involved
- Actions logs must be inspected completely
- an authenticated local checkout is already available

Use Unity Cloud when:

- C# compilation, Unity import, Android packaging, shader preparation, or APK evidence is required

## Verification checklist

Before merging a connector-created branch:

- branch starts from the intended `main` SHA
- branch is not behind `main`
- changed paths exactly match approved scope
- no temporary workflow or probe file remains
- version and build labels are correct
- deprecated API calls identified in logs are removed
- repository memory reflects the code
- file inventory includes all tracked project files
- checksum manifest is refreshed
- validation limitations are stated honestly
- `update_ref` uses `force: false`
- post-merge comparison reports `identical`
