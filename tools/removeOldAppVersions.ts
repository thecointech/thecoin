const { promisify } = require('util');
const exec = promisify(require('child_process').exec);

//
// Remove old versions of the currently selected service
// Will leave 2 versions in prodtest, and 4 in prod
(async () => {
  const { stdout } = await exec(`gcloud app versions list --format="value(version.id)" --sort-by="~version.createTime"`);
  // How many versions do we want to keep?
  const numToKeep = process.env.CONFIG_NAME == "prodtest"
    ? 2
    : 4;
  const versions = stdout
    .split('\n')
    .filter(v => v.length);

  const numVersions = versions.length;
  if (numVersions > numToKeep) {
    const versionArg = versions.slice(numToKeep).join(' ');
    console.log(`Deleting ${numVersions} versions: ${versionArg}`);
    await exec(`gcloud app versions delete ${versionArg} --quiet`)
  }
  else {
    console.log(`Not deleting old versions: only ${numVersions} of ${numToKeep} available`);
  }
})()
