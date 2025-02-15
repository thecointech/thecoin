import { spawnSync } from 'child_process';

// Build arguments array
const buildArgs = ['build', '-t', 'vqa-service'];

// Check if SSL certificates are configured
const useSSL = process.env.VQA_SSL_CERTIFICATE_FILE && process.env.VQA_SSL_KEY_FILE;

if (useSSL) {
    buildArgs.push(
        '--build-arg', 'USE_SSL=true',
        '--build-arg', `SSL_CERT_FILE=${process.env.VQA_SSL_CERTIFICATE_FILE}`,
        '--build-arg', `SSL_KEY_FILE=${process.env.VQA_SSL_KEY_FILE}`
    );
}

// Add the build context
buildArgs.push('.');

// Run docker build
const result = spawnSync('docker', buildArgs, { stdio: 'inherit' });
process.exit(result.status || 0);
