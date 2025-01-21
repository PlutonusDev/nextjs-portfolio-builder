const https = require('https');
const path = require('path');
const fs = require('fs');

async function fetchGitHubDirectory(owner, repo, branch, path) {
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;

    return new Promise((resolve, reject) => {
        https.get(url, {
            headers: {
                'User-Agent': 'Node.js',
                'Accept': 'application/vnd.github.v3+json'
            }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const contents = JSON.parse(data);
                    resolve(contents);
                } catch (error) {
                    reject(error);
                }
            });
        }).on('error', reject);
    });
}

async function fetchFileContent(url) {
    return new Promise((resolve, reject) => {
        https.get(url, {
            headers: {
                'User-Agent': 'Node.js',
                'Accept': 'application/vnd.github.v3.raw'
            }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

async function downloadTemplate(templateType, templateName, targetDir) {
    const owner = 'PlutonusDev';
    const repo = 'nextjs-portfolio-builder';
    const branch = 'templates';
    const basePath = templateType === 'example' ? 'examples' : 'packages';

    try {
        const contents = await fetchGitHubDirectory(owner, repo, branch, `${basePath}/${templateName}`);

        if (!Array.isArray(contents)) {
            throw new Error(`Template ${templateName} not found`);
        }

        fs.mkdirSync(targetDir, { recursive: true });

        for (const item of contents) {
            if (item.type === 'file') {
                const content = await fetchFileContent(item.download_url);
                const targetPath = path.join(targetDir, item.name);
                fs.writeFileSync(targetPath, content);
            } else if (item.type === 'dir') {
                const subDirPath = path.join(targetDir, item.name);
                const subDirContents = await fetchGitHubDirectory(owner, repo, branch, item.path);
                await downloadTemplate(templateType, `${templateName}/${item.name}`, subDirPath);
            }
        }

        return true;
    } catch (error) {
        if (error.message.includes('not found')) {
            return false;
        }
        throw error;
    }
}

async function fetchGitignore(path) {
    const url = `https://raw.githubusercontent.com/github/gitignore/main/${path}`;
    return new Promise((resolve, reject) => {
        https
            .get(url, (res) => {
                let data = '';
                res.on('data', (chunk) => (data += chunk));
                res.on('end', () => resolve(data));
            })
            .on('error', reject);
    });
}

async function fetchLicense(licenseName) {
    const url = `https://api.github.com/licenses/${licenseName}`;
    return new Promise((resolve, reject) => {
        https
            .get(url, { headers: { 'User-Agent': 'Node.js' } }, (res) => {
                let data = '';
                res.on('data', (chunk) => (data += chunk));
                res.on('end', () => {
                    try {
                        const licenseData = JSON.parse(data);
                        resolve(licenseData.body);
                    } catch (error) {
                        reject(error);
                    }
                });
            })
            .on('error', reject);
    });
}

module.exports = { downloadTemplate, fetchGitignore, fetchLicense };