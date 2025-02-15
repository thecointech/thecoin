import { spawnSync } from 'child_process';

const result = spawnSync('docker',
  ['build',
    '--build-arg', `SSL_CERT_FILE=${process.env.VQA_SSL_CERTIFICATE_FILE}`,
    '--build-arg', `SSL_KEY_FILE=${process.env.VQA_SSL_KEY_FILE}`,
    '-t',
    'vqa-service',
    '.'
  ], { stdio: 'inherit' });

process.exit(result.status ?? 0);

