from pathlib import Path
import json
import re
import subprocess
import sys

root = Path(__file__).resolve().parents[1]
errors = []

git_files = subprocess.run(
    ['git', 'ls-files', '--cached', '--others', '--exclude-standard'],
    cwd=root,
    capture_output=True,
    check=True,
    text=True,
    encoding='utf-8',
)
project_rel_paths = sorted(line for line in git_files.stdout.splitlines() if line)
project_files = [root / rel for rel in project_rel_paths]

required = [
    'Packages/manifest.json',
    'ProjectSettings/ProjectVersion.txt',
    'Assets/SevereWeather/Runtime/Core/BuildIdentity.cs',
    'Assets/SevereWeather/Runtime/Core/GameBootstrap.cs',
    'Assets/SevereWeather/Runtime/Presentation/StormActionVfx.cs',
    'Assets/SevereWeather/Runtime/Storms/TornadoController.cs',
    'Assets/SevereWeather/Runtime/Storms/SupercellController.cs',
    'Assets/SevereWeather/Editor/ProductionSliceBuilder.cs',
    'CURRENT_STATUS.md',
    'Docs/CORE_DIRECTION.md',
    'Docs/NO_DRIFT_POLICY.md',
    'Docs/DECISION_LOG.md',
    'Docs/DEVICE_TEST_LOG.md',
    'Docs/UNITY_CLOUD_BUILD_SETTINGS.md',
]

for rel in required:
    if not (root / rel).exists():
        errors.append(f'Missing required file: {rel}')

manifest_path = root / 'Packages/manifest.json'
if manifest_path.exists():
    manifest = json.loads(manifest_path.read_text(encoding='utf-8'))
    deps = manifest.get('dependencies', {})
    for package in ('com.unity.inputsystem', 'com.unity.render-pipelines.universal'):
        if package not in deps:
            errors.append(f'Missing package dependency: {package}')

for path in sorted(root.rglob('*.cs')):
    text = path.read_text(encoding='utf-8')
    balance = 0
    in_string = False
    escaped = False
    for char in text:
        if in_string:
            if escaped:
                escaped = False
            elif char == '\\':
                escaped = True
            elif char == '"':
                in_string = False
            continue
        if char == '"':
            in_string = True
        elif char == '{':
            balance += 1
        elif char == '}':
            balance -= 1
            if balance < 0:
                errors.append(f'Unbalanced braces in {path.relative_to(root)}')
                break
    if balance != 0:
        errors.append(f'Unbalanced braces in {path.relative_to(root)}: {balance}')
    if '\t' in text:
        errors.append(f'Tab character found in {path.relative_to(root)}')
    if 'namespace SevereWeather' not in text:
        errors.append(f'Missing SevereWeather namespace in {path.relative_to(root)}')

text_suffixes = {'.md', '.txt', '.cs', '.py', '.json', '.shader', '.gitignore', '.gitattributes'}
jwt_pattern = re.compile(r'eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}')
for path in project_files:
    if path.suffix.lower() not in text_suffixes and path.name not in {'.gitignore', '.gitattributes'}:
        continue
    try:
        text = path.read_text(encoding='utf-8')
    except UnicodeDecodeError:
        continue
    if jwt_pattern.search(text):
        errors.append(f'Possible access token committed in {path.relative_to(root)}')

inventory_path = root / 'FILE_INVENTORY.txt'
if '--fix' in sys.argv:
    inventory_path.write_text('\n'.join(project_rel_paths) + '\n', encoding='utf-8')
    print('Automatically synchronized FILE_INVENTORY.txt with tracked project files.')

if inventory_path.exists():
    try:
        listed = [line.strip() for line in inventory_path.read_text(encoding='utf-8-sig').splitlines() if line.strip()]
    except UnicodeDecodeError:
        listed = [line.strip() for line in inventory_path.read_text(encoding='utf-8', errors='replace').splitlines() if line.strip()]
    if listed != project_rel_paths:
        # Name the drift and the fix. This check fires on any commit that adds or
        # removes a tracked file without regenerating the inventory, which is easy
        # to do and was previously reported only as "does not match" -- true, but
        # it left the reader to work out both which files and what to run.
        listed_set, actual_set = set(listed), set(project_rel_paths)
        added = sorted(actual_set - listed_set)
        removed = sorted(listed_set - actual_set)
        detail = []
        for path in added[:10]:
            detail.append(f'    tracked but not listed: {path}')
        if len(added) > 10:
            detail.append(f'    ... and {len(added) - 10} more not listed')
        for path in removed[:10]:
            detail.append(f'    listed but not tracked: {path}')
        if len(removed) > 10:
            detail.append(f'    ... and {len(removed) - 10} more no longer tracked')
        if not added and not removed:
            detail.append('    same files, different order')
        detail.append('    fix: pnpm run inventory:update  OR  python3 Tools/validate_project.py --fix')
        errors.append('FILE_INVENTORY.txt does not match the tracked project file set\n' + '\n'.join(detail))

if errors:
    print('VALIDATION FAILED')
    for error in errors:
        print('-', error)
    sys.exit(1)

print('VALIDATION PASSED')
print('C# files:', len(list(root.rglob('*.cs'))))
print('Docs:', len(list((root / 'Docs').glob('*.md'))))
print('Project files:', len(project_files))
print('Mechanics lab:', (root / 'MechanicsLab/SevereWeather_MechanicsLab_v0.7.1.html').stat().st_size, 'bytes')
