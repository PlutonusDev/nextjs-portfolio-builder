const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { promisify } = require('util');
const https = require('https');
const readline = require('readline');
const { downloadTemplate, fetchGitignore, fetchLicense } = require("./git-utils");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = promisify(rl.question).bind(rl);

function getWorkspacePackages() {
  const packagesDir = path.join(__dirname, '..', 'packages');
  if (!fs.existsSync(packagesDir)) {
    return {};
  }

  const packages = {};
  const dirs = fs.readdirSync(packagesDir, { withFileTypes: true });

  dirs.forEach((dir) => {
    if (dir.isDirectory()) {
      const packageJsonPath = path.join(packagesDir, dir.name, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        try {
          const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
          packages[packageJson.name] = '*';
        } catch (error) {
          console.warn(`Warning: Could not parse package.json for ${dir.name}`);
        }
      }
    }
  });

  return packages;
}

const packageJson = (exampleName) => {
  const workspacePackages = getWorkspacePackages();

  return {
    name: `example-${exampleName}`,
    version: '0.1.0',
    license: 'MIT',
    private: true,
    scripts: {
      dev: 'next dev',
      build: 'next build',
      start: 'next start',
      lint: 'next lint',
      format: 'prettier --write .',
      'format:check': 'prettier --check .',
      prepare: 'husky install',
    },
    dependencies: {
      next: '^15.1.5',
      react: '^19.0.0',
      'react-dom': '^19.0.0',
      ...workspacePackages,
    },
    devDependencies: {
      '@types/node': '^20.4.5',
      '@types/react': '^19.0.7',
      '@types/react-dom': '^19.0.3',
      autoprefixer: '^10.4.20',
      eslint: '^9.18.0',
      'eslint-config-next': '^15.1.5',
      'eslint-config-prettier': '^10.0.1',
      husky: '^9.1.7',
      'lint-staged': '^15.4.1',
      postcss: '^8.5.1',
      prettier: '^3.4.2',
      'prettier-plugin-tailwindcss': '^0.6.10',
      tailwindcss: '^3.4.17',
      typescript: '^5.7.3',
    },
  };
};

const prettierConfig = {
  semi: true,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'es5',
  printWidth: 80,
  bracketSpacing: true,
  arrowParens: 'always',
};

const eslintConfig = {
  extends: ['next/core-web-vitals', 'prettier'],
  rules: {
    'no-unused-vars': 'error',
    'no-console': 'warn',
  },
};

const postcssConfig = `module.exports = {
    plugins: {
        tailwindcss: {},
        autoprefixer: {},
    },
};`;

const tailwindConfig = `/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx}',
        './components/**/*.{js,ts,jsx,tsx}',
        // Add all workspace packages to content
        '../packages/*/src/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {},
    },
    plugins: [],
};`;

const envExample = `
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# API
NEXT_PUBLIC_API_URL=http://localhost:3000/api
`;

const generateAppPage = () => {
  return `\
  import '../styles/globals.css';

  export default ({ Component, pageProps }: AppProps) => {
  return <Component {...pageProps} />;
}`;
}

const generateIndexPage = (exampleName) => {
  return `\
export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Welcome to ${exampleName}
        </h1>
      </div>
    </div>
  );
}`;
};

const globalStyles = `@tailwind base;
@tailwind components;
@tailwind utilities;`;

const tsConfig = () => {
  const paths = {
    '@/*': ['./*'],
    '@portfolio/*': ['../../packages/*'],
  };

  return {
    extends: '../../tsconfig.json',
    compilerOptions: {
      plugins: [{ name: 'next' }],
      paths,
    },
    include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
    exclude: ['node_modules'],
  };
};

async function createExample() {
  try {
    const exampleName = await question('Enter the name of the new example (without "example-"): ');
    const exampleDir = path.join(__dirname, '..', 'examples', exampleName);

    if (fs.existsSync(exampleDir)) throw new Error(`Example ${exampleName} already exists.`);

    const templateName = await question('If you would like to use a template, enter it\'s name: ');

    console.log('\nSetting up project...');

    if (templateName) {
      console.log(`Downloading "${templateName}" template...`);
      const templateExists = await downloadTemplate('example', templateName, exampleDir);

      if (!templateExists) {
        const cont = await question('Template not found. Create a default example? (y/n): ');
        if (!["y", "yes", "ye"].includes(cont.toLowerCase())) throw new Error("Cancelled.");

        const dirs = [
          exampleDir,
          path.join(exampleDir, 'pages'),
          path.join(exampleDir, 'styles'),
          path.join(exampleDir, 'components'),
          path.join(exampleDir, '.husky'),
        ];

        dirs.forEach((dir) => fs.mkdirSync(dir, { recursive: true }));

        const gitignore = await fetchGitignore('Node.gitignore');
        const license = await fetchLicense('mit');

        const files = [
          ['package.json', JSON.stringify(packageJson(exampleName), null, 2)],
          ['tsconfig.json', JSON.stringify(tsConfig(), null, 2)],
          ['.prettierrc', JSON.stringify(prettierConfig, null, 2)],
          ['.eslintrc', JSON.stringify(eslintConfig, null, 2)],
          ['postcss.config.js', postcssConfig],
          ['tailwind.config.js', tailwindConfig],
          ['.env.example', envExample],
          ['.gitignore', gitignore],
          ['LICENSE.md', license],
          ['pages/_app.tsx', generateAppPage()],
          ['pages/index.tsx', generateIndexPage(exampleName)],
          ['styles/globals.css', globalStyles],
        ];

        files.forEach(([filename, content]) => {
          fs.writeFileSync(path.join(exampleDir, filename), content);
        });

        const huskyPreCommit = `#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

yarn lint-staged
`;
        fs.writeFileSync(path.join(exampleDir, '.husky/pre-commit'), huskyPreCommit, { mode: 0o755 });
      } else {
        console.log('Template downloaded successfully!');
      }
    }

    console.log('Installing dependencies...');
    execSync('yarn', { cwd: exampleDir });

    const workspacePackages = getWorkspacePackages();

    console.log(`\n✨ Example ${exampleName} created successfully!\n`);
    console.log('Detected workspace packages:');
    Object.keys(workspacePackages).forEach((pkg) => console.log(`- ${pkg}`));
    console.log(`\nRun the example: "yarn dev example-${exampleName}"\n`);
  } catch (error) {
    console.error('\nError creating example:', error);
    console.log('');
    process.exit(1);
  } finally {
    rl.close();
  }
}

createExample();
