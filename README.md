# Next.js Portfolio Builder

![Yarn Badge](https://img.shields.io/badge/Yarn-2C8EBB?logo=yarn&logoColor=fff&style=flat-square)
![TypeScript Badge](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=fff&style=flat-square)
![Next.js Badge](https://img.shields.io/badge/Next.js-000?logo=nextdotjs&logoColor=fff&style=flat-square)
![Tailwind CSS Badge](https://img.shields.io/badge/Tailwind%20CSS-06B6D4?logo=tailwindcss&logoColor=fff&style=flat-square)
![ESLint Badge](https://img.shields.io/badge/ESLint-4B32C3?logo=eslint&logoColor=fff&style=flat-square)
![Prettier Badge](https://img.shields.io/badge/Prettier-F7B93E?logo=prettier&logoColor=fff&style=flat-square)

`nextjs-portfolio-builder` is a powerful and flexible monorepo template designed to streamline the creation and management of your web design portfolio. It leverages the latest web technologies, including **Next.js**, **Yarn Workspaces**, **TypeScript**, and **Tailwind CSS**, to provide a robust and scalable development environment.

## Overview

This project provides a well-organized structure for showcasing multiple web design examples, each as a separate Next.js application within a unified Yarn workspace. It also includes utilities for easily creating reusable UI component packages that can be shared across your examples.

## Features

- **Monorepo with Yarn Workspaces:** Manage multiple Next.js example projects and shared packages efficiently in a single repository.
- **Next.js:** Build fast, SEO-friendly, and scalable React applications for each of your portfolio examples.
- **TypeScript:** Enhance code quality, maintainability, and developer experience with static typing.
- **Tailwind CSS:** Rapidly style your components and examples using a utility-first CSS framework.
- **Automated Package and Example Creation:** Use the provided scripts (`yarn create:package` and `yarn create:example`) to quickly scaffold new UI packages and Next.js example projects.
- **Incremental Builds:** Build only the packages that have changed, significantly reducing build times, especially in larger projects.
- **Pre-configured Linting and Formatting:** Maintain consistent code style and identify potential issues with ESLint and Prettier.
- **Centralized Configuration:** Manage ESLint and TypeScript configurations from the root for consistency across all projects.
- **Automated License and Gitignore Fetching:** Includes an MIT License and a comprehensive .gitignore file tailored for Node.js development.

## Requirements

> [!IMPORTANT]
> **Yarn (Berry):** This project uses Yarn as its package manager. It is recommended you use Yarn Berry (Yarn 2 or later). If you don't have it installed, run:
>
> ```bash
> npm install -g yarn@berry
> ```

## Setup

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/PlutonusDev/nextjs-portfolio-builder my-portfolio
   cd my-portfolio
   ```

2. **Install the base project dependencies:**

   ```bash
   yarn
   ```

3. **Create a UI Package (Optional):**

   ```bash
   yarn create:package
   ```

   Follow the prompts to create a new UI package (e.g., name it `ui` or something specific to your design). This package will hold your reusable React components.

4. **Create a Next.js Example:**

   ```bash
   yarn create:example
   ```

   Follow the prompts to create a new Next.js example project (e.g., name it `commerce`, `blog`, or `portfolio`).

## Project Structure

```sh
nextjs-portfolio-builder/
├── examples/ # Next.js example projects (e.g., commerce, blog)
│   └── ...
├── packages/ # Shared packages (e.g., ui components)
│   └── ...
├── scripts/  # Helper scripts (create-package.js, create-example.js, etc.)
│   └── ...
├── .eslintrc.js       # Root ESLint configuration
├── .gitignore         # Git ignore file
├── package.json       # Root package.json (defines workspaces, scripts)
├── prettier.config.js # Root Prettier configuration
├── tsconfig.json      # Root TypeScript configuration
└── yarn.lock          # Yarn lock file
```

## Usage

### Development

To start the development server for a specific example:

```bash
yarn dev <example-name>
```

> (Replace `<example-name>` with the actual name of your example directory, for example: `yarn dev example-commerce`). Any edited packages will automatically be built.

### Building

- **Build an example:**

  ```bash
  yarn build example-yourExample
  ```

- **Build only packages:**

  ```bash
  yarn build:packages
  ```

### Linting

- **Lint all projects:**

  ```bash
  yarn lint
  ```

### Other Commands

- **`yarn list`:** List all workspaces in the project. (Uses a custom script to override the default `yarn list`)
- **`yarn clean`:** Removes temporary build files, node_modules, and caches

## Adding New Packages

Use the `yarn create:package` command to create a new package under `packages/`.

## Adding New Examples

Use the `yarn create:example` command to create a new Next.js application under `examples/`.

## License

This project is licensed under the GPL-3.0 License. The `create:example` and `create:package` scripts will automatically fetch the MIT License text from GitHub and include it in each generated workspace.

## Contributing

Contributions are welcome! Please feel free to open issues or submit pull requests.
