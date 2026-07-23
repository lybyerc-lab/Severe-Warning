# Validation Report

## Completed in this environment

- Required project files present
- Unity package manifest parses as JSON
- URP and Input System dependencies declared
- 22 C# source files structurally scanned
- Namespace and brace-balance checks passed
- No tab characters in C# source
- Full project and Assets-only archives created
- SHA-256 inventory generated
- Frozen mechanics laboratory included

## Not available in this environment

Unity Editor is not installed here, so these gates remain open:

- Unity C# compilation
- URP package resolution inside the Editor
- scene generation through the Editor menu
- Play Mode execution
- Android build
- real-device performance, thermals, audio, and touch testing

## First editor gate

1. Open with Unity 6.3 LTS.
2. Allow packages to resolve.
3. Run `Tools > Severe Weather > Create Production Slice Scene`.
4. Enter Play Mode.
5. Run `Tools > Severe Weather > Validate Production Starter`.
6. Fix any editor-version API changes before asset production begins.

The starter is intentionally a production architecture and graybox. It is not presented as a compiled or production-ready game build.
