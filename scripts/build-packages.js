const { execSync } = require('child_process');
const fs = require('fs-extra');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const packagesDir = path.join(rootDir, 'packages');
const cacheDir = path.join(rootDir, '.buildcache');

fs.ensureDirSync(cacheDir);

function getPackageHash(packagePath) {
  const srcDir = path.join(packagePath, 'src');
  const files = fs
    .readdirSync(srcDir, { recursive: true, withFileTypes: true })
    .filter(
      (dirent) => dirent.isFile() && (dirent.name.endsWith('.ts') || dirent.name.endsWith('.tsx'))
    )
    .map((dirent) => path.join(dirent.path, dirent.name));

  const contentHash = files.reduce((hash, file) => {
    const fileContent = fs.readFileSync(file);
    return hash + require('crypto').createHash('sha256').update(fileContent).digest('hex');
  }, '');

  return require('crypto').createHash('sha256').update(contentHash).digest('hex');
}

function shouldBuildPackage(packagePath) {
  const packageJsonPath = path.join(packagePath, 'package.json');
  const packageJson = fs.readJsonSync(packageJsonPath);
  const packageName = packageJson.name;

  const packageHash = getPackageHash(packagePath);
  const cacheFile = path.join(cacheDir, `${packageName.replace('/', '-')}.hash`);

  if (!fs.existsSync(cacheFile)) {
    return true;
  }

  const cachedHash = fs.readFileSync(cacheFile, 'utf-8');
  return packageHash !== cachedHash;
}

function updatePackageHash(packagePath) {
  const packageJsonPath = path.join(packagePath, 'package.json');
  const packageJson = fs.readJsonSync(packageJsonPath);
  const packageName = packageJson.name;

  const packageHash = getPackageHash(packagePath);
  const cacheFile = path.join(cacheDir, `${packageName.replace('/', '-')}.hash`);
  fs.writeFileSync(cacheFile, packageHash);
}

const packages = fs
  .readdirSync(packagesDir)
  .map((packageName) => path.join(packagesDir, packageName))
  .filter((packagePath) => fs.statSync(packagePath).isDirectory());

packages.forEach((packagePath) => {
  const packageJsonPath = path.join(packagePath, 'package.json');
  const packageJson = fs.readJsonSync(packageJsonPath);
  const packageName = packageJson.name;

  if (shouldBuildPackage(packagePath)) {
    console.log(`Building package: ${packageName}`);
    try {
      execSync(`yarn workspace ${packageName} run build`, { stdio: 'inherit' });
      updatePackageHash(packagePath);
    } catch (error) {
      console.error(`Error building package ${packageName}`, error);
      process.exit(1);
    }
  } else {
    console.log(`Skipping unchanged package: ${packageName}`);
  }
});
