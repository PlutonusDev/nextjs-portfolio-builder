const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { promisify } = require('util');
const readline = require('readline');
const { downloadTemplate, fetchGitignore, fetchLicense } = require('./git-utils');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = promisify(rl.question).bind(rl);

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
    '@testing-library/jest-dom': '^6.6.3',
    '@testing-library/react': '^14.0.0',
    '@types/jest': '^29.5.14',
    '@types/react': '^19.0.7',
    '@types/react-dom': '^19.0.3',
    '@types/testing-library__jest-dom': '^5.14.5',
    '@typescript-eslint/eslint-plugin': '^8.21.0',
    '@typescript-eslint/parser': '^8.21.0',
    eslint: '^9.18.0',
    'eslint-config-prettier': '^10.0.1',
    'eslint-plugin-react': '^7.37.4',
    'eslint-plugin-react-hooks': '^5.1.0',
    jest: '^29.7.0',
    'jest-environment-jsdom': '^29.7.0',
    prettier: '^3.4.2',
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

const indexFile = `export { default as Button } from './components/Button';
`;

const exampleComponent = `import React from 'react';

export interface ExampleProps {
  children?: React.ReactNode;
  className?: string;
}

const Button = React.forwardRef<HTMLDivElement, ExampleProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <button className={className ? className : "px-2 py-1 rounded bg-blue-500 text-zinc-900 hover:bg-blue-300 transition-colors duration-200"}>
        {children}
      </button>
    );
  }
);

Button.displayName = 'ExampleButton';

export default Button;
`;

const exampleTest = `import React from 'react';
import { render, screen } from '@testing-library/react';
import Button from '../Button';

describe('Button', () => {
  it('renders children correctly', () => {
    render(<Button>Hello World</Button>);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<Button className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });
});
`;

async function createPackage() {
  try {
    const packageName = await question('Enter the package name (without "@portfolio/"): ');
    const packageDir = path.join(__dirname, '..', 'packages', packageName);

    if (fs.existsSync(packageDir)) throw new Error(`Package ${packageName} already exists.`);

    const templateName = await question("If you would like to use a template, enter it's name: ");

    console.log('\nSetting up project...');

    let templateExists = false;
    if (templateName) {
      console.log(`Downloading "${templateName}" template...`);
      templateExists = await downloadTemplate('example', templateName, packageDir);

      if (!templateExists) {
        const cont = await question('Template not found. Create a default package? (y/n): ');
        if (!['y', 'yes', 'ye'].includes(cont.toLowerCase())) throw new Error('Cancelled.');
      }
    }

    if (!templateExists) {
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
        ['src/components/Button.tsx', exampleComponent],
        ['src/components/__tests__/Button.test.tsx', exampleTest],
      ];

      files.forEach(([filename, content]) => {
        fs.writeFileSync(path.join(packageDir, filename), content);
      });
    } else {
      const packageJsonPath = path.join(exampleDir, 'package.json');
      try {
        const packageJsonContent = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        packageJsonContent.name = `package-${exampleName}`;
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJsonContent, null, 2));
      } catch (error) {
        console.warn(`Could not update package.json name: ${error.message}`);
      }
      console.log('Template downloaded successfully!');
    }

    console.log('Installing dependencies...');
    execSync('yarn');

    console.log(`\n✨ Package @portfolio/${packageName} created successfully!\n`);
    console.log('Next steps:');
    console.log('1. Develop!');
    console.log('2. Run one of the examples: "yarn dev example-name"');
    console.log('The package will be built ✨ automatically ✨ if any files have changed.\n');
    console.log('To use in an example:');
    console.log(`import { Button } from '@portfolio/${packageName}';\n`);
  } catch (error) {
    console.error('\nError creating package:', error);
    console.log('');
    process.exit(1);
  } finally {
    rl.close();
  }
}

createPackage();
