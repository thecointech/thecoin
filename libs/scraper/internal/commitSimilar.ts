import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import type { ElementData } from '../src/types';
import { findMaximalCommonSubstrings } from '../src/findSubstrings.ts';

const PRIVATE_TESTING_PAGES = process.env.PRIVATE_TESTING_PAGES;
if (!PRIVATE_TESTING_PAGES) {
  throw new Error('PRIVATE_TESTING_PAGES environment variable is not set');
}
const LATEST_FOLDER = join(PRIVATE_TESTING_PAGES, 'latest');

type GitStatusFile = { filePath: string; oldPath?: string };
interface ChangeAnalysis {
  changed: GitStatusFile;
  isMinimal: boolean;
  reasons: string[];
}

// Text patterns that are expected to change (dates, currency, etc.)
const EXPECTED_CHANGE_PATTERNS = [
  /\"?\$[\d,]+\.\d{2}\"?/, // Currency amounts
  /\d{1,2}\/\d{1,2}\/\d{4}/, // Dates MM/DD/YYYY
  /\d{4}-\d{2}-\d{2}/, // Dates YYYY-MM-DD
  /\d{1,2}:\d{2}(:\d{2})?\s*(AM|PM)?/i, // Times
];

function getGitStatus(): GitStatusFile[] {
  try {
    // add all new files before processing
    execSync('git add .', {
      cwd: PRIVATE_TESTING_PAGES,
    });
    // Now get changes, including renames
    const output = execSync('git status --porcelain --find-renames', {
      cwd: PRIVATE_TESTING_PAGES,
      encoding: 'utf8'
    });

    const changedFiles: Array<GitStatusFile> = [];

    const lines = output.split('\n').filter(line => line.trim());

    for (const line of lines) {
      const status = line.substring(0, 2);
      const filePath = line.substring(3);

      // Check for renames (R status, possibly with modification)
      if (status.startsWith('R')) {
        // Format: "R100 old/path -> new/path" or "R100 old/path\tnew/path"
        const renameMatch = filePath.match(/^(.+?)\s*(?:->|\t)\s*(.+)$/);
        if (renameMatch) {
          const [, oldPath, newPath] = renameMatch;
          changedFiles.push({ filePath: newPath, oldPath });
        //   if (oldPath.startsWith('latest/') || newPath.startsWith('latest/')) {
        //     // For renames, we need to check if the content was also modified
        //     // by comparing the file contents or using git diff
        //     let isModified = false;
        //     try {
        //       // Check if there are any content differences in the renamed file
        //       const diffOutput = execSync(`git diff --staged -M -- "${oldPath}" "${newPath}"`, {
        //         cwd: PRIVATE_TESTING_PAGES,
        //         encoding: 'utf8'
        //       });
        //       isModified = diffOutput.trim().length > 0;
        //     } catch (error) {
        //       // If git diff fails, assume it's a pure rename
        //       isModified = false;
        //     }
        //     renamedFiles.push({ oldPath, newPath, isModified });
        //   }
        }
      } else {
        // Regular file changes
        if (filePath.startsWith('latest/')) {
          changedFiles.push({filePath});
        }
      }
    }

    return changedFiles;
  } catch (error) {
    console.error('Error getting git status:', error);
    return [];
  }
}

function isTextChangeExpected(oldText: string, newText: string): boolean {
  if (!oldText || !newText) return false;

  // If there is a number/etc buried within the text that changes, we consider that equal
  const maximalCommonSubstrings = findMaximalCommonSubstrings(oldText, newText);
  const longestCommonSubstring = maximalCommonSubstrings.reduce((a, b) => a.length > b.length ? a : b);
  // strip digits and $ from the changed text
  const oldChangedText = maximalCommonSubstrings.reduce((acc, substr) => acc.replace(substr, ''), oldText);
  const newChangedText = maximalCommonSubstrings.reduce((acc, substr) => acc.replace(substr, ''), newText);
  if (longestCommonSubstring.length > oldText.length * 0.5) {
    if (oldChangedText.replace(/\d|\.|,|\$/g, '') === newChangedText.replace(/\d|\.|,|\$/g, '')) {
      return true;
    }
  }

  // Check if the change matches expected patterns
  for (const pattern of EXPECTED_CHANGE_PATTERNS) {
    if (pattern.test(oldText) || pattern.test(newText)) {
      return true;
    }
  }

  return false;
}

interface DiffChange {
  field: string;
  oldValue: string;
  newValue: string;
  line: string;
}

function parseGitDiff(changed: GitStatusFile): DiffChange[] {
  try {
    const command = changed.oldPath
      ? `git diff --staged -M -- ${changed.oldPath} ${changed.filePath}`
      : `git diff --staged -- ${changed.filePath}`;
    const diffOutput = execSync(command, {
      cwd: PRIVATE_TESTING_PAGES,
      encoding: 'utf8'
    });

    const changes: DiffChange[] = [];
    const lines = diffOutput.split('\n');

    for (const line of lines) {
      // Look for removed lines (old values)
      const removedMatch = line.match(/^-\s*"([^"]+)":\s*(.+),?$/);
      if (removedMatch) {
        const [, field, oldValue] = removedMatch;

        // Find corresponding added line (new value)
        const addedLineIndex = lines.findIndex(l =>
          l.match(new RegExp(`^\\+\\s*"${field.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}":`))
        );

        if (addedLineIndex !== -1) {
          const addedMatch = lines[addedLineIndex].match(/^\+\s*"[^"]+"\s*:\s*(.+),?$/);
          if (addedMatch) {
            changes.push({
              field,
              oldValue: oldValue.replace(/,$/, ''),
              newValue: addedMatch[1].replace(/,$/, ''),
              line: line
            });
          }
        }
      }
    }

    return changes;
  } catch (error) {
    console.error(`Error getting diff for ${changed.filePath}:`, error);
    return [];
  }
}

function analyzeJsonChange(changed: GitStatusFile): ChangeAnalysis {
  const reasons: string[] = [];

  // Field categorization
  const significantFields = ['tagName', "role"];
  const minimalFields = ['selector', 'font', 'color', 'size', 'style', 'balance', 'neighbour_text', "placeholder_text"]; // These never matter
  const coordFields = ['top', 'left', 'centerY', 'height', 'width', 'position_x', 'position_y']; // Allowed some variation of value
  const textFields = ['text', 'content', 'nodeValue'];

  try {
    const changes = parseGitDiff(changed);

    if (changes.length === 0) {
      return { changed, isMinimal: true, reasons: ['No parseable changes found'] };
    }

    for (const change of changes) {
      const { field, oldValue, newValue } = change;

      // Check significant fields (always significant)
      if (significantFields.includes(field)) {
        reasons.push(`${field} changed: ${oldValue} → ${newValue}`);
        return { changed, isMinimal: false, reasons };
      }

      // Check minimal fields (always minimal)
      if (minimalFields.includes(field)) {
        reasons.push(`${field} changed: ${oldValue} → ${newValue}`);
        continue;
      }

      // Check coordinate changes
      if (coordFields.includes(field)) {
        const oldNum = parseFloat(oldValue);
        const newNum = parseFloat(newValue);

        if (!isNaN(oldNum) && !isNaN(newNum)) {
          const diff = Math.abs(newNum - oldNum);
          if (diff > 100) {
            reasons.push(`significant coordinate change in ${field}: ${diff.toFixed(1)}px (${oldValue} → ${newValue})`);
            return { changed, isMinimal: false, reasons };
          } else {
            reasons.push(`minimal coordinate change in ${field}: ${diff.toFixed(1)}px`);
          }
        }
        continue;
      }

      // Check text changes
      if (textFields.includes(field)) {
        if (!isTextChangeExpected(oldValue, newValue)) {
          reasons.push(`significant text (${field}) change: ${oldValue} → ${newValue}`);
          return { changed, isMinimal: false, reasons };
        } else {
          reasons.push(`expected text (${field}) change (date/currency): ${oldValue} → ${newValue}`);
        }
        continue;
      }

      // Unknown field changes - treat as maximal by default
      reasons.push(`field change in ${field}: ${oldValue} → ${newValue}`);
      return { changed, isMinimal: false, reasons };
    }

    // If we get here, all changes are minimal
    return { changed, isMinimal: true, reasons };

  } catch (error) {
    console.error(`Error analyzing ${changed.filePath}:`, error);
    return { changed, isMinimal: false, reasons: [`Error analyzing file: ${error}`] };
  }
}

function stageSimilarChanges(): void {
  console.log('🔍 Scanning for changes in private-testing-pages/latest...\n');

  const changedFiles = getGitStatus();

  if (changedFiles.length === 0) {
    console.log('✅ No changes found in latest folder.');
    return;
  }

  console.log(`Found ${changedFiles.length} changed files:\n`);

  // Handle renames first (always auto-commit)
  const minimalFiles: GitStatusFile[] = [];
  const significantChanges: ChangeAnalysis[] = [];

  for (const change of changedFiles) {
    console.log(`Analyzing: ${change.filePath}`);

    // Auto-commit all PNG files
    if (change.filePath.endsWith('.png')) {
      minimalFiles.push(change);
      console.log('  ✅ PNG file - will auto-commit\n');
      continue;
    }

    // Analyze JSON files
    if (change.filePath.endsWith('.json')) {
      const analysis = analyzeJsonChange(change);

      if (analysis.isMinimal) {
        minimalFiles.push(change);
        console.log('  ✅ Minimal changes - will auto-commit');
        console.log(`     Reasons: ${analysis.reasons.join(', ')}\n`);
      } else {
        significantChanges.push(analysis);
        console.log('  ❌ Significant changes - requires manual review');
        console.log(`     Reasons: ${analysis.reasons.join(', ')}\n`);
      }
    } else {
      // Other file types - treat as significant
      significantChanges.push({
        changed: change,
        isMinimal: false,
        reasons: ['Non-JSON, non-PNG file type']
      });
      console.log('  ❌ Non-JSON/PNG file - requires manual review\n');
    }
  }

  // Reset staging area and only add files we want to commit
  try {
    // Reset all staged files
    execSync('git reset', { cwd: PRIVATE_TESTING_PAGES });

    // Stage minimal changes
    if (minimalFiles.length > 0) {
      console.log(`\n🚀 Staging ${minimalFiles.length} files with minimal changes:`);
      minimalFiles.forEach(file => console.log(`   - ${file.filePath}`));

      // Stage only the files we want
      const filesToStage = minimalFiles
        .flatMap(f => [f.filePath, f.oldPath])
        .filter(f => !!f)
        .map(f => `"${f}"`)
        .join(' ');
      execSync(`git add ${filesToStage}`, { cwd: PRIVATE_TESTING_PAGES });

      console.log('✅ Successfully staged minimal changes!\n');
      console.log('💡 Run "git commit" to commit these changes when ready.\n');
    } else {
      console.log('\n📝 No minimal changes to stage.\n');
    }
  } catch (error) {
    console.error('❌ Error with git operations:', error);
  }

  // Report significant changes
  if (significantChanges.length > 0) {
    console.log(`\n⚠️  ${significantChanges.length} files with SIGNIFICANT changes require manual review:\n`);

    significantChanges.forEach(change => {
      console.log(`📄 ${change.changed.filePath}`);
      change.reasons.forEach(reason => {
        console.log(`   • ${reason}`);
      });
      console.log('');
    });

    console.log('Please review these changes manually before committing.\n');
  }

  // Summary
  console.log('📊 Summary:');
  console.log(`   • ${minimalFiles.length} files staged`);
  console.log(`   • ${significantChanges.length} files require manual review`);
}

// Run the script if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  stageSimilarChanges();
}

export { stageSimilarChanges };
