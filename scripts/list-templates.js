const { fetchGitHubDirectory, fetchFileContent } = require("./git-utils");

const owner = 'PlutonusDev';
const repo = 'nextjs-portfolio-builder';
const branch = 'templates';
const validFolders = ["examples", "packages"];

async function getPackageJson(templatePath) {
    try {
        const contents = await fetchGitHubDirectory(owner, repo, branch, templatePath);
        const packageJson = contents.find(file => file.name === 'package.json');

        if (packageJson) {
            const packageData = await fetchFileContent(packageJson.download_url);
            return JSON.parse(packageData);
        }
        return null;
    } catch (error) {
        return null;
    }
}

async function listTemplates() {
    const targetFolder = process.argv[2];

    if (!targetFolder) {
        console.error(`Please specify a folder: ${validFolders.join(', ')}`);
        console.error('Usage: yarn list:templates <folder>');
        process.exit(1);
    }

    if (!validFolders.includes(targetFolder)) {
        console.error(`Invalid folder. Please choose one of: ${validFolders.join(', ')}`);
        process.exit(1);
    }

    try {
        const contents = await fetchGitHubDirectory(owner, repo, branch, targetFolder);

        console.log(`\n${targetFolder} templates:\n`);
        for (const item of contents) {
            if (item.type === 'dir') {
                const templatePath = `${targetFolder}/${item.name}`;
                const packageJson = await getPackageJson(templatePath);

                if (packageJson) {
                    const author = typeof packageJson.author === 'object'
                        ? packageJson.author.name
                        : packageJson.author || 'Unknown';

                    console.log(`- "${item.name}" - by ${author}: ${packageJson.description || 'No description provided'}\n`);
                } else {
                    console.log(`- ${item.name} - No package.json found.`);
                }
            }
        }
        console.log("");

    } catch (error) {
        console.error('Error fetching templates:', error.message);
        process.exit(1);
    }
}

listTemplates();