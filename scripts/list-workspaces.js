const fs = require('fs');
const path = require('path');
const glob = require('glob'); // Make sure you have glob installed: yarn add glob

const rootDir = path.resolve(__dirname, '..'); // Assumes the script is in a 'scripts' directory
const rootPackageJsonPath = path.join(rootDir, 'package.json');

function getWorkspacesFromPackageJson(packageJsonPath) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  const workspaces = packageJson.workspaces || [];
  const workspaceInfo = {};

  for (const workspace of workspaces) {
    const paths = glob.sync(workspace, { cwd: rootDir });

    for (const workspacePath of paths) {
      const fullPath = path.join(rootDir, workspacePath);
      const packageJsonPath = path.join(fullPath, 'package.json');

      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
        const name = packageJson.name;
        if (!workspaceInfo[workspace]) {
          workspaceInfo[workspace] = [];
        }
        workspaceInfo[workspace].push({
          name,
          path: path.relative(rootDir, fullPath),
        });
      }
    }
  }

  return workspaceInfo;
}

const workspaces = getWorkspacesFromPackageJson(rootPackageJsonPath);

for (const category in workspaces) {
  console.log(`[${category}]`);
  workspaces[category].forEach((workspace) => {
    console.log(`- ${workspace.name} (${workspace.path})`);
  });
  console.log('');
}
