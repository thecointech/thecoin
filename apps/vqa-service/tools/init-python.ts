import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const venvPath = '.venv';
const requirementsPath = 'requirements.txt';
const requiredPythonVersion = "3.11"; // TODO, could probably read this from somewhere smarter

console.log("Bootstrapping Python")

try {
  // Check Python version
  const pythonVersion = execSync('python --version').toString().trim();
  console.log(`Found Python version: ${pythonVersion}`);
  if (!pythonVersion.startsWith(`Python ${requiredPythonVersion}`)) {
    console.error(`Python version ${pythonVersion} found, but requires ${requiredPythonVersion}`)
    process.exit(1);
  }
} catch (error) {
  console.error('Python 3 not found. Please install Python 3.');
  process.exit(1);
}

try {
  // Check if virtual environment exists
  if (!fs.existsSync(venvPath)) {
    console.log('Creating virtual environment...');
    execSync(`python -m venv ${venvPath}`);
    console.log('Virtual environment created.');
  } else {
    console.log('Virtual environment already exists.');
  }
} catch (error) {
  console.error('Failed to create virtual environment:', error);
  process.exit(1);
}

try {
  // Install requirements
  if (fs.existsSync(requirementsPath)) {
    console.log('Installing requirements...');
    const pipPath = path.join(venvPath, 'bin', 'pip');
    execSync(`${pipPath} install -r ${requirementsPath}`);
    console.log('Requirements installed.');
  } else {
    console.log('requirements.txt not found. Skipping installation.');
  }
} catch (error) {
  console.error('Failed to install requirements:', error);
  process.exit(1);
}

console.log('Python bootstrap completed.');