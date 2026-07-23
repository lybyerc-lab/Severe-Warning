# Repository Bootstrap

Repository: `lybyerc-lab/Severe-Warning`
Default branch: `main`

This archive is arranged at repository root. Commit `Assets/`, `Packages/`, `ProjectSettings/`, documentation, tools, and the frozen mechanics laboratory.

Do not commit Unity-generated folders such as `Library/`, `Temp/`, `Logs/`, `Build/`, `Builds/`, `Obj/`, or `UserSettings/`. They are excluded by `.gitignore`.

Recommended first commit message:

`Initialize Severe Weather Unity production starter`

After the initial commit:

1. Verify `ProjectSettings/ProjectVersion.txt` reports Unity `6000.3.0f1`.
2. Confirm `Packages/manifest.json` includes URP and the Input System.
3. Open the project in Unity and allow package restoration.
4. Run `Tools > Severe Weather > Validate Production Starter`.
5. Run `Tools > Severe Weather > Create Production Slice Scene`.
6. Make future changes on feature branches and merge through reviewed pull requests.
