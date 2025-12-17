from enum import Enum
from bitwarden_sdk import BitwardenClient
from bitwarden_sdk import DeviceType
from bitwarden_sdk import client_settings_from_dict
import os
from logger import setup_logger
log = setup_logger(__name__)

# Create the BitwardenClient.  Requires THECOIN_SECRETS

class SecretName(Enum):
  VqaApiKey = "VqaApiKey"
  VqaSslCertPublic = "VqaSslCertPublic"
  VqaSslCertPrivate = "VqaSslCertPrivate"

def get_secret(secret_name: SecretName) -> str:
  return get_secrets()[secret_name.value]


_secrets = None
def get_secrets() -> dict[str, str]:
  global _secrets
  if _secrets is None:
    configName = os.getenv("CONFIG_NAME")

    # no secrets in dev mode
    if configName == "development" or configName == "devlive":
      _secrets = {
        SecretName.VqaApiKey.value: None,
        SecretName.VqaSslCertPublic.value: None,
        SecretName.VqaSslCertPrivate.value: None,
      }
      return _secrets

    envLocation = os.getenv("THECOIN_SECRETS", "/secrets")
    envLocation = os.path.join(envLocation, f"bitwarden.{configName}.env")

    with open(envLocation) as f:
      env = f.read()
      env = dict((k, v.strip('"')) for k, v in (line.split("=", 1) for line in env.splitlines() if "=" in line))
      client = BitwardenClient(
        client_settings_from_dict(
          {
            "apiUrl": "https://api.bitwarden.com",
            "deviceType": DeviceType.SDK,
            "identityUrl": "https://identity.bitwarden.com",
            "userAgent": "Python",
          }
        )
      )
      # Attempt to authenticate with the Secrets Manager Access Token
      client.auth().login_access_token(env["BWS_ACCESS_TOKEN"], env["BWS_STATE_FILE"])
      secrets = client.secrets().sync(env['BWS_ORGANIZATION_ID'], None).data.secrets
      _secrets = dict((s.key, s.value) for s in secrets)
  return _secrets
