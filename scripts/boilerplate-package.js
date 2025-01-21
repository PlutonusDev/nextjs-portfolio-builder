const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { promisify } = require('util');
const https = require('https');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = promisify(rl.question).bind(rl);

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

const packageJson = (packageName) => ({
  name: `@portfolio/${packageName}`,
  version: '0.1.0',
  main: './dist/index.js',
  module: './dist/index.mjs',
  types: './dist/index.d.ts',
  license: 'MIT',
  files: ['dist/**'],
  scripts: {
    build: 'tsc',
    dev: 'tsc --watch',
    lint: 'eslint "src/**/*.{ts,tsx}" --cache --cache-location ../../.cache/.eslintcache',
    'lint:fix': 'eslint "src/**/*.{ts,tsx}" --fix',
    clean: 'rm -rf .turbo && rm -rf node_modules && rm -rf dist',
    format: 'prettier --write "src/**/*.{ts,tsx}"',
    typecheck: 'tsc --noEmit',
    test: 'jest',
  },
  peerDependencies: {
    react: '>=19.0.0',
    'react-dom': '>=19.0.0',
  },
  devDependencies: {
    '@testing-library/jest-dom': '^5.14.1',
    '@testing-library/react': '^14.0.0',
    '@types/jest': '^29.5.14',
    '@types/react': '^19.0.7',
    '@types/react-dom': '^19.0.3',
    '@types/testing-library__jest-dom': '^5.14.5',
    '@typescript-eslint/eslint-plugin': '^6.2.0',
    '@typescript-eslint/parser': '^6.2.0',
    eslint: '^9.18.0',
    'eslint-config-prettier': '^8.8.0',
    'eslint-plugin-react': '^7.32.2',
    'eslint-plugin-react-hooks': '^4.6.0',
    jest: '^29.7.0',
    'jest-environment-jsdom': '^29.3.1',
    prettier: '^2.8.8',
    react: '^19.0.0',
    typescript: '^5.7.3',
  },
  jest: {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    testMatch: ['<rootDir>/src/**/*.test.{ts,tsx}'],
    setupFilesAfterEnv: ['@testing-library/jest-dom/extend-expect'],
  },
});

const tsConfig = {
  extends: '../../tsconfig.json',
  include: ['src'],
  exclude: ['dist', 'build', 'node_modules'],
  compilerOptions: {
    declaration: true,
    declarationMap: true,
    outDir: 'dist',
    target: 'es6',
    module: 'commonjs',
    noEmit: false,
    jsx: 'react-jsx',
  },
};

const eslintRc = `module.exports = {
  extends: ["../../.eslintrc.js"],
  parserOptions: {
    project: ["../../tsconfig.json", "./tsconfig.json"], 
  },
};
`;

const indexFile = `export { default as Example } from './components/Example';
`;

const exampleComponent = `import React from 'react';

export interface ExampleProps {
  children?: React.ReactNode;
  className?: string;
}

const Example = React.forwardRef<HTMLDivElement, ExampleProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <div ref={ref} className={className} {...props}>
        {children}
      </div>
    );
  }
);

Example.displayName = 'Example';

export default Example;
`;

const exampleTest = `import React from 'react';
import { render, screen } from '@testing-library/react';
import Example from '../Example';

describe('Example', () => {
  it('renders children correctly', () => {
    render(<Example>Test Content</Example>);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<Example className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });
});
`;

async function createPackage() {
  try {
    const packageName = await question('Enter the package name (without "@portfolio/"): ');

    console.log('\nSetting up project...');

    const packageDir = path.join(__dirname, '..', 'packages', packageName);

    if (fs.existsSync(packageDir)) {
      console.error(`Error: Package ${packageName} already exists.`);
      process.exit(1);
    }

    const dirs = [
      packageDir,
      path.join(packageDir, 'src'),
      path.join(packageDir, 'src/components'),
      path.join(packageDir, 'src/components/__tests__'),
    ];

    dirs.forEach((dir) => fs.mkdirSync(dir, { recursive: true }));

    const gitignore = await fetchGitignore('Node.gitignore');
    const license = await fetchLicense('mit');

    const files = [
      ['package.json', JSON.stringify(packageJson(packageName), null, 2)],
      ['tsconfig.json', JSON.stringify(tsConfig, null, 2)],
      ['.eslintrc.js', eslintRc],
      ['.gitignore', gitignore],
      ['LICENSE.md', license],
      ['src/index.ts', indexFile],
      ['src/components/Example.tsx', exampleComponent],
      ['src/components/__tests__/Example.test.tsx', exampleTest],
    ];

    files.forEach(([filename, content]) => {
      fs.writeFileSync(path.join(packageDir, filename), content);
    });

    console.log('Installing dependencies...');
    execSync('yarn');

    console.log(`\n✨ Package @portfolio/${packageName} created successfully!\n`);
    console.log('Next steps:');
    console.log('1. Develop!');
    console.log('2. Run one of the examples: "yarn dev example-name"');
    console.log('The package will be built ✨ automatically ✨ if any files have changed.\n');
    console.log('To use in an example:');
    console.log(`import { Example } from '@portfolio/${packageName}';\n`);
  } catch (error) {
    console.error('Error creating package:', error);
    process.exit(1);
  } finally {
    rl.close();
  }
}

createPackage();
