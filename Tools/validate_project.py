from pathlib import Path
import json
import re
import sys

root = Path(__file__).resolve().parents[1]
errors = []

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
for path in sorted(root.rglob('*')):
    if not path.is_file() or '.git' in path.parts:
        continue
    if path.suffix.lower() not in text_suffixes and path.name not in {'.gitignore', '.gitattributes'}:
        continue
    try:
        text = path.read_text(encoding='utf-8')
    except UnicodeDecodeError:
        continue
    if jwt_pattern.search(text):
        errors.append(f'Possible access token committed in {path.relative_to(root)}')

inventory_path = root / 'FILE_INVENTORY.txt'
if inventory_path.exists():
    listed = [line.strip() for line in inventory_path.read_text(encoding='utf-8').splitlines() if line.strip()]
    actual = sorted(
        str(path.relative_to(root)).replace('\\', '/')
        for path in root.rglob('*')
        if path.is_file() and '.git' not in path.parts
    )
    if listed != actual:
        errors.append('FILE_INVENTORY.txt does not match the tracked project file set')

if errors:
    print('VALIDATION FAILED')
    for error in errors:
        print('-', error)
    sys.exit(1)

print('VALIDATION PASSED')
print('C# files:', len(list(root.rglob('*.cs'))))
print('Docs:', len(list((root / 'Docs').glob('*.md'))))
print('Project files:', len([
    path for path in root.rglob('*')
    if path.is_file() and '.git' not in path.parts
]))
print('Mechanics lab:', (root / 'MechanicsLab/SevereWeather_MechanicsLab_v0.7.1.html').stat().st_size, 'bytes')
