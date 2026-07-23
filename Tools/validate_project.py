from pathlib import Path
import json
import re
import sys

root = Path(__file__).resolve().parents[1]
errors = []

required = [
    'Packages/manifest.json',
    'ProjectSettings/ProjectVersion.txt',
    'Assets/SevereWeather/Runtime/Core/GameBootstrap.cs',
    'Assets/SevereWeather/Runtime/Storms/TornadoController.cs',
    'Assets/SevereWeather/Runtime/Storms/SupercellController.cs',
    'Assets/SevereWeather/Editor/ProductionSliceBuilder.cs',
    'Docs/CORE_DIRECTION.md',
    'Docs/NO_DRIFT_POLICY.md',
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

if errors:
    print('VALIDATION FAILED')
    for error in errors:
        print('-', error)
    sys.exit(1)

print('VALIDATION PASSED')
print('C# files:', len(list(root.rglob('*.cs'))))
print('Docs:', len(list((root / 'Docs').glob('*.md'))))
print('Mechanics lab:', (root / 'MechanicsLab/SevereWeather_MechanicsLab_v0.7.1.html').stat().st_size, 'bytes')
