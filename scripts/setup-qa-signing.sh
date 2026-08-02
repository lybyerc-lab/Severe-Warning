#!/usr/bin/env bash
set -euo pipefail

repo="${1:-lybyerc-lab/Severe-Warning}"
output_dir="${SEVERE_WEATHER_QA_KEY_DIR:-$HOME/.severe-weather/qa-signing}"
keystore_path="$output_dir/severe-weather-qa.jks"
alias_name="${SEVERE_WEATHER_QA_KEY_ALIAS:-severe-weather-qa}"

for command_name in keytool base64 gh; do
  if ! command -v "$command_name" >/dev/null 2>&1; then
    echo "Required command not found: $command_name" >&2
    exit 1
  fi
done

if ! gh auth status >/dev/null 2>&1; then
  echo "GitHub CLI is not authenticated. Run: gh auth login" >&2
  exit 1
fi

mkdir -p "$output_dir"
chmod 700 "$output_dir"

if [[ -e "$keystore_path" ]]; then
  echo "Refusing to overwrite existing keystore: $keystore_path" >&2
  exit 1
fi

read -r -s -p "QA keystore password: " store_password
echo
read -r -s -p "Confirm QA keystore password: " store_password_confirm
echo
if [[ "$store_password" != "$store_password_confirm" || -z "$store_password" ]]; then
  echo "Keystore passwords did not match or were empty." >&2
  exit 1
fi

read -r -s -p "QA key password (press Enter to reuse keystore password): " key_password
echo
if [[ -z "$key_password" ]]; then
  key_password="$store_password"
fi

keytool -genkeypair \
  -keystore "$keystore_path" \
  -storetype JKS \
  -storepass "$store_password" \
  -alias "$alias_name" \
  -keypass "$key_password" \
  -keyalg RSA \
  -keysize 4096 \
  -validity 10000 \
  -dname "CN=Severe Weather QA, OU=QA, O=Lybyerc Lab, L=Texarkana, ST=Texas, C=US"

chmod 600 "$keystore_path"

keystore_base64="$(base64 < "$keystore_path" | tr -d '\n')"
printf '%s' "$keystore_base64" | gh secret set SEVERE_WEATHER_QA_KEYSTORE_BASE64 --repo "$repo"
printf '%s' "$store_password" | gh secret set SEVERE_WEATHER_QA_KEYSTORE_PASSWORD --repo "$repo"
printf '%s' "$alias_name" | gh secret set SEVERE_WEATHER_QA_KEY_ALIAS --repo "$repo"
printf '%s' "$key_password" | gh secret set SEVERE_WEATHER_QA_KEY_PASSWORD --repo "$repo"

unset keystore_base64 store_password store_password_confirm key_password

echo "Persistent QA signing secrets were stored for $repo."
echo "Keystore retained locally at: $keystore_path"
echo "Back up this file and its passwords in a secure password manager or encrypted vault."
