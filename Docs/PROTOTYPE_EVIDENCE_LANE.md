# Prototype Evidence Lane

Status: `SW-QA-002` process lane. Evidence from this workflow is **PROTOTYPE ONLY - NOT PRODUCTION QA**.

## Purpose

Use this workflow to answer a bounded visual or game-feel question quickly from an exact source ref. It creates one Three.js web candidate, performs a mobile boot/control/render smoke, and uploads the preview plus deterministic screenshot evidence.

## Inputs

- `source_ref`: optional exact SHA or branch/ref; blank uses the manually selected workflow ref.
- `prototype_task_id`: required bounded experiment identifier.
- `screenshot_profile`: `mobile-default`, `mobile-landscape`, or `mobile-portrait`.

The artifact includes the exact resolved source commit and a manifest declaring `productionAuthority: false`, `qaPagesDispatched: false`, and `androidPackaged: false`.

## Boundaries

The lane does not build a reference, run the full browser/presentation suites, compare performance, package Android, package a publisher candidate, dispatch QA Pages, merge, or auto-promote.

Before integration, the workflow self-tests only when one of its own six lane files changes on `agent/sw-qa-002-rapid-prototype-lane`. That branch-only, path-limited trigger uses the fixed `SW-QA-002-preintegration` task identifier and `mobile-default` screenshot profile. It does not observe product-source changes or any other branch. Manual dispatch remains available after the workflow is present on the repository default branch.

Prototype evidence can guide a later production task, but it never replaces sealed QA, regression acceptance, owner approval, or physical-device acceptance.
