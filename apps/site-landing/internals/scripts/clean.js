const shell = require('shelljs');
const addCheckMark = require('./helpers/checkmark.js');

if (!shell.which('git')) {
  shell.echo('Sorry, this script requires git');
  shell.exit(1);
}

if (!shell.test('-e', 'internals/templates')) {
  shell.echo('The example is deleted already.');
  shell.exit(1);
}

process.stdout.write('Cleanup started...');

// Reuse existing LanguageProvider and i18n tests
shell.mv(
  'src/containers/LanguageProvider/tests',
  'internals/templates/containers/LanguageProvider',
);
shell.cp('src/tests/i18n.test.js', 'internals/templates/tests/i18n.test.js');

// Cleanup components/
shell.rm('-rf', 'src/components/*');

// Handle containers/
shell.rm('-rf', 'src/containers');
shell.mv('internals/templates/containers', 'app');

// Handle tests/
shell.mv('internals/templates/tests', 'app');

// Handle translations/
shell.rm('-rf', 'src/translations');
shell.mv('internals/templates/translations', 'app');

// Handle utils/
shell.rm('-rf', 'src/utils');
shell.mv('internals/templates/utils', 'app');

// Replace the files in the root src/ folder
shell.cp('internals/templates/app.tsx', 'src/app.tsx');
shell.cp('internals/templates/global-styles.ts', 'src/global-styles.ts');
shell.cp('internals/templates/i18n.ts', 'src/i18n.ts');
shell.cp('internals/templates/index.html', 'src/index.html');
shell.cp('internals/templates/reducers.ts', 'src/reducers.ts');
shell.cp('internals/templates/configureStore.ts', 'src/configureStore.ts');

shell.cp('internals/templates/types/index.d.ts', 'src/types/index.d.ts');

// Remove the templates folder
shell.rm('-rf', 'internals/templates');

addCheckMark();

//FIXME: uncomment
// Commit the changes
// if (
//   shell.exec('git add . --all && git commit -qm "Remove default example"')
//     .code !== 0
// ) {
//   shell.echo('\nError: Git commit failed');
//   shell.exit(1);
// }

shell.echo('\nCleanup done. Happy Coding!!!');
