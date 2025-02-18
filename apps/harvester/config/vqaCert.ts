import { readFileSync, existsSync } from 'node:fs';

export function getVqaCert() {
  const vqa_cert_file = process.env.VQA_SSL_CERTIFICATE_FILE;
  if (vqa_cert_file && existsSync(vqa_cert_file)) {
    return readFileSync(vqa_cert_file, 'ascii');
  }
}
