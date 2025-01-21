const { execSync } = require('child_process');

const args = process.argv.slice(2);

const scriptName = args[0];
const exampleName = args[1];

if (!exampleName || !scriptName) {
  console.error('Error: You must provide both an example name and a script name.');
  console.log('Usage: yarn <dev|build|start> <example-name>');
  process.exit(1);
}

const workspaceCommand = `yarn workspace ${exampleName} ${scriptName}`;

try {
  console.log(`Running "${workspaceCommand}"...`);
  execSync(workspaceCommand, { stdio: 'inherit' });
} catch (error) {
  console.error(`Error running command for ${exampleName}`, error);
  process.exit(1);
}
