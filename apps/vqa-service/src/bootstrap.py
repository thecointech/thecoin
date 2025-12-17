import os
import tempfile
import subprocess
from vqa_secrets import get_secret, SecretName

def write_temp_cert(cert_data, prefix):
    fd, path = tempfile.mkstemp(prefix=prefix, suffix='.pem')
    with os.fdopen(fd, 'w') as tmp:
        tmp.write(cert_data)
    return path

# Fetch certificates from secrets manager
ssl_cert = get_secret(SecretName.VqaSslCertPublic)
ssl_key = get_secret(SecretName.VqaSslCertPrivate)

if ssl_cert and ssl_key:
    # Write to temporary files
    cert_path = write_temp_cert(ssl_cert, 'cert')
    key_path = write_temp_cert(ssl_key, 'key')

    try:
        # Launch uvicorn with SSL
        subprocess.run([
            "uvicorn", "main:app",
            "--host", "0.0.0.0",
            "--port", "7004",
            "--ssl-keyfile", key_path,
            "--ssl-certfile", cert_path
        ])
    finally:
        # Clean up temporary files
        os.unlink(cert_path)
        os.unlink(key_path)
else:
    # Launch without SSL
    subprocess.run([
        "uvicorn", "main:app",
        "--host", "0.0.0.0",
        "--port", "7004"
    ])