## User Data

User data can contain sensitive things like credit card numbers or PII.

To ensure this is protected, we encrypt the information on the client-side using an public key.

The private key is stored offline to ensure it cannot be leaked from our servers.

To generate a new certificate:
```bash
# Generate a new private certificate in the PEM format
ssh-keygen -m pem -f %THECOIN_SECRETS%/develop/DEVEL_ONLY_rsa_priv.pem
# This will generate two files, private & public.  However, the public key
# cannot be consumed by Crypto module directly.  Convert public key to PEM
ssh-keygen -f %THECOIN_SECRETS%/develop/DEVEL_ONLY_rsa_priv.pem.pub -e -m pem
# This outputs the public key in compatible format to the command line.
# Copy this for the next steps
```

Once we have private/public key, move the private key somewhere safe, and
paste the public key into the relevant `{env}.public.env`.  The public
key is published on the website so might as well be easily accessible.

### TODO
Currently our public keys are not password-protected.  Once we move
to a universal secrets manager the files should be pwd-protected,
and the password stored in the secrets for an additional layer of protection
