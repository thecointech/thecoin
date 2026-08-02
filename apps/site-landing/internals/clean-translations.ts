#!/usr/bin/env node
/**
 * Clean up unused translations from fr.json by comparing against en.json
 * Removes any translation keys that exist in fr.json but not in en.json
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LANG_DIR = path.join(__dirname, '../lang');
const EN_FILE = path.join(LANG_DIR, 'en.json');
const FR_FILE = path.join(LANG_DIR, 'fr.json');

interface Translation {
  defaultMessage: string;
  description?: string;
}

interface TranslationFile {
  [key: string]: Translation;
}

function loadTranslations(filePath: string): TranslationFile {
  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content);
}

function saveTranslations(filePath: string, translations: TranslationFile): void {
  // Sort keys alphabetically to preserve order
  const sortedTranslations: TranslationFile = {};
  const sortedKeys = Object.keys(translations).sort();

  for (const key of sortedKeys) {
    sortedTranslations[key] = translations[key];
  }

  const content = JSON.stringify(sortedTranslations, null, 2) + '\n';
  fs.writeFileSync(filePath, content, 'utf-8');
}

function cleanTranslations(): void {
  console.log('Loading translation files...');

  const enTranslations = loadTranslations(EN_FILE);
  const frTranslations = loadTranslations(FR_FILE);

  const enKeys = new Set(Object.keys(enTranslations));
  const frKeys = Object.keys(frTranslations);

  console.log(`English translations: ${enKeys.size} keys`);
  console.log(`French translations: ${frKeys.length} keys`);

  const keysToRemove: string[] = [];
  const cleanedTranslations: TranslationFile = {};

  // Iterate through French translations
  for (const key of frKeys) {
    if (enKeys.has(key)) {
      // Keep this translation - it exists in English
      cleanedTranslations[key] = frTranslations[key];
    } else {
      // Mark for removal - doesn't exist in English
      keysToRemove.push(key);
    }
  }

  if (keysToRemove.length === 0) {
    console.log('\n✓ No unused translations found. French file is clean!');
    return;
  }

  console.log(`\n✗ Found ${keysToRemove.length} unused translation(s) to remove:`);
  keysToRemove.forEach(key => {
    const translation = frTranslations[key];
    console.log(`  - ${key}: "${translation.defaultMessage}"`);
  });

  // Create backup
  const backupFile = FR_FILE + '.backup';
  fs.copyFileSync(FR_FILE, backupFile);
  console.log(`\nBackup created: ${backupFile}`);

  // Save cleaned translations
  saveTranslations(FR_FILE, cleanedTranslations);
  console.log(`\n✓ Cleaned French translations saved to ${FR_FILE}`);
  console.log(`  Removed: ${keysToRemove.length} keys`);
  console.log(`  Remaining: ${Object.keys(cleanedTranslations).length} keys`);
}

// Run the script
try {
  cleanTranslations();
} catch (error) {
  console.error('Error cleaning translations:', error);
  process.exit(1);
}
