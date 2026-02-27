#!/usr/bin/env python3
"""
Generates a new self-signed SSL certificate for the VQA service
and updates the corresponding secrets in Bitwarden Secrets Manager.

Usage:
  # From vqa-service directory, using the project venv:
  .venv/bin/python tools/renew-ssl-cert.py

  # With custom hostname or validity:
  .venv/bin/python tools/renew-ssl-cert.py --hostname my.vqa.host --days 3650

The script will:
  1. Generate a self-signed SSL certificate (key + cert)
  2. Prompt for a Bitwarden Secrets Manager access token (with write permissions)
  3. Find existing VqaSslCertPublic and VqaSslCertPrivate secrets
  4. Update them with the new certificate values

If no access token is provided, the script will print the PEM contents
for manual entry into the Bitwarden Secrets Manager web vault.
"""

import argparse
import getpass
import subprocess
import sys
import tempfile
import os


def generate_cert(hostname: str, days: int) -> tuple[str, str]:
    """Generate a self-signed certificate. Returns (cert_pem, key_pem)."""
    with tempfile.TemporaryDirectory() as tmpdir:
        key_path = os.path.join(tmpdir, "key.pem")
        cert_path = os.path.join(tmpdir, "cert.pem")

        result = subprocess.run([
            "openssl", "req", "-x509",
            "-newkey", "rsa:2048",
            "-keyout", key_path,
            "-out", cert_path,
            "-days", str(days),
            "-nodes",
            "-subj", f"/CN={hostname}",
        ], capture_output=True, text=True)

        if result.returncode != 0:
            print(f"Error generating certificate:\n{result.stderr}", file=sys.stderr)
            sys.exit(1)

        with open(cert_path) as f:
            cert_pem = f.read()
        with open(key_path) as f:
            key_pem = f.read()

    return cert_pem, key_pem


def update_bitwarden(access_token: str, cert_pem: str, key_pem: str):
    """Update VqaSslCertPublic and VqaSslCertPrivate in Bitwarden Secrets Manager."""
    from bitwarden_sdk import BitwardenClient, DeviceType, client_settings_from_dict

    client = BitwardenClient(client_settings_from_dict({
        "apiUrl": "https://api.bitwarden.com",
        "deviceType": DeviceType.SDK,
        "identityUrl": "https://identity.bitwarden.com",
        "userAgent": "Python",
    }))

    client.auth().login_access_token(access_token)

    # List all secrets to find the ones we need
    secrets_list = client.secrets().list(organization_id="")
    if not secrets_list.success:
        print(f"Failed to list secrets: {secrets_list.error_message}", file=sys.stderr)
        sys.exit(1)

    # Build a lookup by key name
    lookup = {s.key: s for s in secrets_list.data.data}

    updates = {
        "VqaSslCertPublic": cert_pem,
        "VqaSslCertPrivate": key_pem,
    }

    for key_name, new_value in updates.items():
        secret_ref = lookup.get(key_name)
        if not secret_ref:
            print(f"Secret '{key_name}' not found in Bitwarden Secrets Manager.", file=sys.stderr)
            print("Available secrets:", [s.key for s in secrets_list.data.data], file=sys.stderr)
            sys.exit(1)

        # Get the full secret to preserve existing fields
        full_secret = client.secrets().get(str(secret_ref.id))
        if not full_secret.success:
            print(f"Failed to get secret '{key_name}': {full_secret.error_message}", file=sys.stderr)
            sys.exit(1)

        secret_data = full_secret.data

        result = client.secrets().update(
            organization_id=str(secret_ref.organization_id),
            id=str(secret_ref.id),
            key=secret_data.key,
            value=new_value,
            note=secret_data.note,
        )

        if not result.success:
            print(f"Failed to update '{key_name}': {result.error_message}", file=sys.stderr)
            sys.exit(1)

        print(f"Updated '{key_name}' successfully.")


def main():
    parser = argparse.ArgumentParser(description="Renew VQA service SSL certificate")
    parser.add_argument("--hostname", default="test.vqa.thecoin.io",
                        help="Certificate CN hostname (default: test.vqa.thecoin.io)")
    parser.add_argument("--days", type=int, default=3650,
                        help="Certificate validity in days (default: 3650)")
    args = parser.parse_args()

    print(f"Generating self-signed certificate for '{args.hostname}' valid for {args.days} days...")
    cert_pem, key_pem = generate_cert(args.hostname, args.days)
    print("Certificate generated successfully.\n")

    # Prompt for access token
    print("To update Bitwarden Secrets Manager, enter an access token with write permissions.")
    print("(Leave blank to skip and print the PEM contents for manual entry.)\n")
    access_token = getpass.getpass("BWS Access Token: ").strip()

    if access_token:
        update_bitwarden(access_token, cert_pem, key_pem)
        print("\nSecrets updated. Restart the VQA service to use the new certificate.")
    else:
        print("\nNo access token provided. Copy the following into Bitwarden manually.\n")
        print("=" * 60)
        print("VqaSslCertPublic:")
        print("=" * 60)
        print(cert_pem)
        print("=" * 60)
        print("VqaSslCertPrivate:")
        print("=" * 60)
        print(key_pem)
        print("\nAfter updating secrets, restart the VQA service.")


if __name__ == "__main__":
    main()
