# Repository Bootstrap

Repository: `lybyerc-lab/Severe-Warning`
Default branch: `main`
Bootstrap status: complete

The active checkout is already connected to:

`https://github.com/lybyerc-lab/Severe-Warning.git`

The project root contains `Assets/`, `Packages/`, `ProjectSettings/`, documentation, validation tools, and the frozen Mechanics Laboratory.

Do not commit Unity-generated folders such as `Library/`, `Temp/`, `Logs/`, `Build/`, `Builds/`, `Obj/`, or `UserSettings/`. They are excluded by `.gitignore`.

## Continuing workflow

1. Fetch `origin` and confirm the intended base branch.
2. Read `CURRENT_STATUS.md` and the canonical documents it names.
3. Confirm `ProjectSettings/ProjectVersion.txt` reports Unity `6000.3.0f1`.
4. Confirm `Packages/manifest.json` includes URP and the Input System.
5. Run `Tools/validate_project.py`.
6. Open the project in the exact Unity editor and allow package restoration.
7. Run `Tools > Severe Weather > Validate Production Starter`.
8. Run `Tools > Severe Weather > Create Production Slice Scene`.
9. Make scoped changes on feature branches and merge through reviewed pull requests.
10. Update status, decisions, device evidence, inventory, and checksums with the related change.

The successful Build #5.2 rollback baseline is commit `80f2f14`. Preserve its APK while later current-head changes are compiled and tested.
