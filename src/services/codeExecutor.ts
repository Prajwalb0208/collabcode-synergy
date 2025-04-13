
import { toast } from "@/components/ui/use-toast";

interface CommandOutput {
  logs: string[];
  error: Error | null;
}

/**
 * Safely evaluates JavaScript code in a controlled environment
 * @param code The JavaScript code to execute
 * @returns An object containing the execution results, logs, and any error
 */
export const executeJavaScript = (code: string): {
  result: any;
  logs: string[];
  error: Error | null;
} => {
  const logs: string[] = [];
  const originalConsole = { ...console };
  
  // Override console methods to capture logs
  const mockConsole = {
    log: (...args: any[]) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      logs.push(message);
      originalConsole.log(...args);
    },
    warn: (...args: any[]) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      logs.push(`[WARN] ${message}`);
      originalConsole.warn(...args);
    },
    error: (...args: any[]) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      logs.push(`[ERROR] ${message}`);
      originalConsole.error(...args);
    },
    info: (...args: any[]) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      logs.push(`[INFO] ${message}`);
      originalConsole.info(...args);
    }
  };

  // Apply console overrides
  Object.assign(console, mockConsole);

  let result;
  let error = null;

  try {
    // Create a safe function from the code string and execute it
    const safeFunction = new Function(code);
    result = safeFunction();
  } catch (err) {
    error = err as Error;
    logs.push(`Execution Error: ${err instanceof Error ? err.message : String(err)}`);
  } finally {
    // Restore original console
    Object.assign(console, originalConsole);
  }

  return { result, logs, error };
};

/**
 * Creates an HTML preview from the given HTML code
 * @param html The HTML code to preview
 * @returns HTML document as a data URL or blob URL
 */
export const createHtmlPreview = (html: string): string => {
  try {
    // Create a blob from the HTML content
    const blob = new Blob([html], { type: 'text/html' });
    const blobUrl = URL.createObjectURL(blob);
    return blobUrl;
  } catch (error) {
    console.error("Error creating HTML preview:", error);
    // Fallback to data URL
    return `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;
  }
};

// In-memory filesystem simulation for terminal commands
const virtualFileSystem = {
  currentDir: '/',
  files: {
    '/': {
      'package.json': JSON.stringify({
        name: "collabcode-project",
        version: "1.0.0",
        dependencies: {
          "react": "^18.3.1",
          "react-dom": "^18.3.1"
        },
        scripts: {
          "dev": "vite",
          "build": "vite build",
          "serve": "vite preview"
        }
      }, null, 2),
      'README.md': '# CollabCode Project\n\nA collaborative coding environment.',
      'src': {
        'index.js': 'console.log("Hello from CollabCode!");',
        'styles.css': 'body { font-family: sans-serif; }',
      },
      'node_modules': {}
    }
  },
  // Track command history
  history: [] as string[],
  // Track installed packages
  installedPackages: ['react', 'react-dom', 'vite'] as string[]
};

/**
 * Simulate terminal command execution
 * @param command The terminal command to execute
 * @returns Command output as string array
 */
export const executeTerminalCommand = (command: string): string[] => {
  // Record the command in history
  virtualFileSystem.history.push(command);
  
  const output: string[] = [];
  const trimmedCmd = command.trim();
  
  // Split command and arguments
  const parts = trimmedCmd.split(/\s+/);
  const cmd = parts[0].toLowerCase();
  const args = parts.slice(1);
  
  output.push(`$ ${trimmedCmd}`);
  
  try {
    // Process different command types
    switch (cmd) {
      // File navigation
      case 'cd':
        return handleCdCommand(args, output);
      case 'ls':
      case 'dir':
        return handleLsCommand(args, output);
      case 'pwd':
        output.push(virtualFileSystem.currentDir);
        break;
      case 'mkdir':
        return handleMkdirCommand(args, output);
      case 'touch':
        return handleTouchCommand(args, output);
      case 'cat':
        return handleCatCommand(args, output);
        
      // Git commands
      case 'git':
        return handleGitCommand(args, output);
        
      // NPM commands
      case 'npm':
        return handleNpmCommand(args, output);
      case 'yarn':
        return handleYarnCommand(args, output);
        
      // Node.js
      case 'node':
        return handleNodeCommand(args, output);
        
      // Python
      case 'python':
      case 'python3':
      case 'pip':
      case 'pip3':
        return handlePythonCommand(cmd, args, output);
        
      // System commands
      case 'echo':
        output.push(args.join(' '));
        break;
      case 'clear':
        return ['Terminal cleared.'];
      case 'help':
        return getHelpText();
      default:
        output.push(`Command not found: ${cmd}`);
        output.push("Type 'help' for a list of available commands.");
    }
  } catch (error) {
    output.push(`Error: ${error instanceof Error ? error.message : String(error)}`);
  }
  
  return output;
};

// Command handlers for different command types
function handleCdCommand(args: string[], output: string[]): string[] {
  if (args.length === 0) {
    virtualFileSystem.currentDir = '/';
    output.push(`Changed directory to /`);
  } else {
    const dir = args[0];
    if (dir === '..') {
      // Go up one level
      const pathParts = virtualFileSystem.currentDir.split('/').filter(Boolean);
      pathParts.pop();
      virtualFileSystem.currentDir = '/' + pathParts.join('/');
      output.push(`Changed directory to ${virtualFileSystem.currentDir}`);
    } else if (dir.startsWith('/')) {
      // Absolute path
      virtualFileSystem.currentDir = dir;
      output.push(`Changed directory to ${dir}`);
    } else {
      // Relative path
      let newPath = virtualFileSystem.currentDir;
      if (newPath !== '/') newPath += '/';
      newPath += dir;
      virtualFileSystem.currentDir = newPath;
      output.push(`Changed directory to ${newPath}`);
    }
  }
  return output;
}

function handleLsCommand(args: string[], output: string[]): string[] {
  const currentDirContent = getCurrentDirContent();
  
  if (typeof currentDirContent === 'object') {
    const files = Object.keys(currentDirContent);
    if (files.length === 0) {
      output.push('Directory is empty.');
    } else {
      // Format output like a real terminal
      const dirOutput = files.map(file => {
        const isDir = typeof currentDirContent[file] === 'object';
        return isDir ? `📁 ${file}/` : `📄 ${file}`;
      });
      output.push(...dirOutput);
    }
  } else {
    output.push('Not a directory.');
  }
  return output;
}

function handleMkdirCommand(args: string[], output: string[]): string[] {
  if (args.length === 0) {
    output.push('mkdir: missing operand');
    return output;
  }
  
  const dirName = args[0];
  const currentDirContent = getCurrentDirContent();
  
  if (typeof currentDirContent === 'object') {
    if (currentDirContent[dirName]) {
      output.push(`mkdir: cannot create directory '${dirName}': File exists`);
    } else {
      currentDirContent[dirName] = {};
      output.push(`Directory created: ${dirName}`);
    }
  } else {
    output.push('Not a directory.');
  }
  return output;
}

function handleTouchCommand(args: string[], output: string[]): string[] {
  if (args.length === 0) {
    output.push('touch: missing file operand');
    return output;
  }
  
  const fileName = args[0];
  const currentDirContent = getCurrentDirContent();
  
  if (typeof currentDirContent === 'object') {
    if (currentDirContent[fileName] && typeof currentDirContent[fileName] === 'object') {
      output.push(`touch: cannot touch '${fileName}': Is a directory`);
    } else {
      currentDirContent[fileName] = currentDirContent[fileName] || '';
      output.push(`File created/updated: ${fileName}`);
    }
  } else {
    output.push('Not a directory.');
  }
  return output;
}

function handleCatCommand(args: string[], output: string[]): string[] {
  if (args.length === 0) {
    output.push('cat: missing file operand');
    return output;
  }
  
  const fileName = args[0];
  const currentDirContent = getCurrentDirContent();
  
  if (typeof currentDirContent === 'object') {
    if (!currentDirContent[fileName]) {
      output.push(`cat: ${fileName}: No such file or directory`);
    } else if (typeof currentDirContent[fileName] === 'object') {
      output.push(`cat: ${fileName}: Is a directory`);
    } else {
      output.push(String(currentDirContent[fileName]));
    }
  } else {
    output.push('Not a directory.');
  }
  return output;
}

function handleGitCommand(args: string[], output: string[]): string[] {
  if (args.length === 0) {
    output.push('git usage:');
    output.push('  git init - Initialize a repository');
    output.push('  git add <file> - Add file to staging');
    output.push('  git commit -m "message" - Commit changes');
    output.push('  git status - Show repository status');
    output.push('  git push - Push to remote');
    output.push('  git pull - Pull from remote');
    output.push('  git clone <url> - Clone repository');
    return output;
  }
  
  const subCommand = args[0];
  
  switch (subCommand) {
    case 'init':
      output.push('Initialized empty Git repository');
      output.push('Created .git directory');
      break;
    case 'add':
      if (args.length < 2) {
        output.push('Nothing specified, nothing added.');
      } else if (args[1] === '.') {
        output.push('Added all files to staging area.');
      } else {
        output.push(`Added ${args.slice(1).join(', ')} to staging area.`);
      }
      break;
    case 'commit':
      if (args.includes('-m')) {
        const messageIndex = args.indexOf('-m') + 1;
        if (messageIndex < args.length) {
          const message = args[messageIndex];
          output.push(`[main (root-commit)] ${message}`);
          output.push('2 files changed, 20 insertions(+)');
        } else {
          output.push('error: switch `m` requires a value');
        }
      } else {
        output.push('Please provide a commit message with -m "your message"');
      }
      break;
    case 'status':
      output.push('On branch main');
      output.push('Your branch is up to date with \'origin/main\'.');
      output.push('');
      output.push('Changes not staged for commit:');
      output.push('  (use "git add <file>..." to update what will be committed)');
      output.push('');
      output.push('  modified:   src/index.js');
      output.push('');
      output.push('Untracked files:');
      output.push('  (use "git add <file>..." to include in what will be committed)');
      output.push('');
      output.push('  src/newfile.js');
      break;
    case 'push':
      output.push('Enumerating objects: 5, done.');
      output.push('Counting objects: 100% (5/5), done.');
      output.push('Delta compression using up to 8 threads');
      output.push('Compressing objects: 100% (3/3), done.');
      output.push('Writing objects: 100% (3/3), 302 bytes | 302.00 KiB/s, done.');
      output.push('Total 3 (delta 2), reused 0 (delta 0), pack-reused 0');
      output.push('remote: Resolving deltas: 100% (2/2), completed with 2 local objects.');
      output.push('To github.com:user/repo.git');
      output.push('   e7d9abc..8e3tdev  main -> main');
      break;
    case 'pull':
      output.push('Already up to date.');
      break;
    case 'clone':
      if (args.length < 2) {
        output.push('You must specify a repository to clone.');
      } else {
        const repo = args[1];
        const repoName = repo.split('/').pop()?.replace('.git', '') || 'repo';
        output.push(`Cloning into '${repoName}'...`);
        output.push('remote: Enumerating objects: 147, done.');
        output.push('remote: Counting objects: 100% (147/147), done.');
        output.push('remote: Compressing objects: 100% (92/92), done.');
        output.push('Receiving objects: 100% (147/147), 25.32 KiB | 8.44 MiB/s, done.');
        output.push('Resolving deltas: 100% (72/72), done.');
      }
      break;
    default:
      output.push(`git: '${subCommand}' is not a git command. See 'git --help'.`);
  }
  
  return output;
}

function handleNpmCommand(args: string[], output: string[]): string[] {
  if (args.length === 0) {
    output.push('npm usage:');
    output.push('  npm install [package] - Install package(s)');
    output.push('  npm uninstall [package] - Remove package(s)');
    output.push('  npm run [script] - Run a script');
    output.push('  npm init - Initialize package.json');
    output.push('  npm list - List installed packages');
    return output;
  }
  
  const subCommand = args[0];
  
  switch (subCommand) {
    case 'install':
    case 'i':
      if (args.length === 1) {
        output.push('Installing dependencies from package.json...');
        output.push('added 1270 packages in 12s');
        output.push('');
        output.push('142 packages are looking for funding');
        output.push('  run `npm fund` for details');
      } else {
        const packages = args.slice(1).filter(arg => !arg.startsWith('-'));
        const flags = args.slice(1).filter(arg => arg.startsWith('-'));
        
        // Check for --save-dev or -D flag
        const isDev = flags.some(flag => flag === '--save-dev' || flag === '-D');
        
        packages.forEach(pkg => {
          virtualFileSystem.installedPackages.push(pkg);
        });
        
        output.push(`Installing ${packages.join(', ')}...`);
        output.push(`added ${packages.length} package${packages.length !== 1 ? 's' : ''}, removed 0 packages, and audited ${packages.length + virtualFileSystem.installedPackages.length} packages in 2s`);
        output.push('');
        output.push('3 packages are looking for funding');
        output.push('  run `npm fund` for details');
        output.push('');
        output.push('found 0 vulnerabilities');
      }
      break;
    case 'uninstall':
    case 'remove':
    case 'r':
      if (args.length === 1) {
        output.push('npm uninstall requires at least one argument.');
      } else {
        const packages = args.slice(1);
        output.push(`Removing ${packages.join(', ')}...`);
        output.push(`removed ${packages.length} package${packages.length !== 1 ? 's' : ''} and audited ${virtualFileSystem.installedPackages.length - packages.length} packages in 1s`);
        output.push('');
        output.push('0 vulnerabilities');
      }
      break;
    case 'run':
    case 'run-script':
      if (args.length === 1) {
        output.push('Missing script name');
      } else {
        const script = args[1];
        switch (script) {
          case 'dev':
            output.push('> collabcode-project@1.0.0 dev');
            output.push('> vite');
            output.push('');
            output.push('  VITE v5.0.2  ready in 300 ms');
            output.push('');
            output.push('  ➜  Local:   http://localhost:5173/');
            output.push('  ➜  Network: use --host to expose');
            output.push('  ➜  press h to show help');
            break;
          case 'build':
            output.push('> collabcode-project@1.0.0 build');
            output.push('> vite build');
            output.push('');
            output.push('vite v5.0.2 building for production...');
            output.push('✓ 39 modules transformed.');
            output.push('dist/index.html             0.46 kB │ gzip: 0.30 kB');
            output.push('dist/assets/index-abc123.js   1.43 MB │ gzip: 397.40 kB');
            output.push('dist/assets/index-xyz456.css  0.15 kB │ gzip: 0.13 kB');
            output.push('');
            output.push('Build completed in 2.88s');
            break;
          case 'serve':
          case 'preview':
            output.push('> collabcode-project@1.0.0 preview');
            output.push('> vite preview');
            output.push('');
            output.push('  ➜  Local:   http://localhost:4173/');
            output.push('  ➜  Network: use --host to expose');
            break;
          case 'test':
            output.push('> collabcode-project@1.0.0 test');
            output.push('> vitest run');
            output.push('');
            output.push(' RUN  v0.32.2 /collabcode-project');
            output.push('');
            output.push(' ✓ src/utils/tests/utils.test.js (4 tests) 11ms');
            output.push('');
            output.push(' Test Files  1 passed (1)');
            output.push('      Tests  4 passed (4)');
            output.push('   Start at  10:23:14');
            output.push('   Duration  1.17s (transform 45ms, setup 0ms, collect 23ms, tests 11ms)');
            break;
          default:
            output.push(`Error: Missing script: ${script}`);
            output.push('');
            output.push('To see a list of scripts, run:');
            output.push('  npm run');
        }
      }
      break;
    case 'init':
      output.push('This utility will walk you through creating a package.json file.');
      output.push('It only covers the most common items, and tries to guess sensible defaults.');
      output.push('');
      output.push('package name: (collabcode-project) ');
      output.push('version: (1.0.0) ');
      output.push('description: A collaborative coding environment');
      output.push('entry point: src/index.js');
      output.push('git repository: https://github.com/user/collabcode-project');
      output.push('keywords: code, collaboration, editor');
      output.push('author: CollabCode User');
      output.push('license: (ISC) MIT');
      output.push('');
      output.push('About to write to /package.json:');
      output.push('');
      output.push(JSON.stringify({
        name: "collabcode-project",
        version: "1.0.0",
        description: "A collaborative coding environment",
        main: "src/index.js",
        scripts: {
          "test": "echo \"Error: no test specified\" && exit 1"
        },
        repository: {
          "type": "git",
          "url": "git+https://github.com/user/collabcode-project.git"
        },
        keywords: [
          "code",
          "collaboration",
          "editor"
        ],
        author: "CollabCode User",
        license: "MIT"
      }, null, 2));
      output.push('');
      output.push('Is this OK? (yes) yes');
      break;
    case 'list':
    case 'ls':
      output.push('collabcode-project@1.0.0 /');
      output.push('├── react@18.3.1');
      output.push('├── react-dom@18.3.1');
      output.push('└── vite@5.0.2');
      
      // Add any additional installed packages
      virtualFileSystem.installedPackages.forEach(pkg => {
        if (!['react', 'react-dom', 'vite'].includes(pkg)) {
          output.push(`├── ${pkg}@latest`);
        }
      });
      break;
    default:
      output.push(`Unknown npm command: ${subCommand}`);
      output.push('See npm --help for available commands');
  }
  
  return output;
}

function handleYarnCommand(args: string[], output: string[]): string[] {
  // Yarn command simulation - similar to npm but with yarn-specific output
  if (args.length === 0) {
    output.push('yarn usage:');
    output.push('  yarn add [package] - Install package');
    output.push('  yarn remove [package] - Remove package');
    output.push('  yarn [script] - Run a script');
    output.push('  yarn init - Initialize package.json');
    return output;
  }
  
  const subCommand = args[0];
  
  switch (subCommand) {
    case 'add':
      if (args.length === 1) {
        output.push('Error: Missing packages');
      } else {
        const packages = args.slice(1).filter(arg => !arg.startsWith('-'));
        output.push(`[1/4] 🔍  Resolving packages...`);
        output.push(`[2/4] 🚚  Fetching packages...`);
        output.push(`[3/4] 🔗  Linking dependencies...`);
        output.push(`[4/4] 🔨  Building fresh packages...`);
        output.push(`success Saved lockfile.`);
        output.push(`success Added ${packages.join(', ')} as a dependency.`);
        output.push(`✨  Done in 2.98s.`);
      }
      break;
    case 'remove':
      if (args.length === 1) {
        output.push('Error: Missing packages');
      } else {
        const packages = args.slice(1);
        output.push(`[1/2] 🗑  Removing packages...`);
        output.push(`[2/2] 🔗  Regenerating lockfile...`);
        output.push(`success Removed ${packages.join(', ')}.`);
        output.push(`✨  Done in 1.75s.`);
      }
      break;
    case 'install':
    case '':
      output.push(`[1/4] 🔍  Resolving packages...`);
      output.push(`[2/4] 🚚  Fetching packages...`);
      output.push(`[3/4] 🔗  Linking dependencies...`);
      output.push(`[4/4] 🔨  Building fresh packages...`);
      output.push(`success Saved lockfile.`);
      output.push(`✨  Done in 3.45s.`);
      break;
    case 'dev':
    case 'start':
    case 'build':
    case 'serve':
      // Redirect to npm scripts
      return handleNpmCommand(['run', subCommand], output);
    case 'init':
      output.push('question name (collabcode-project): ');
      output.push('question version (1.0.0): ');
      output.push('question description: A collaborative coding environment');
      output.push('question entry point (index.js): src/index.js');
      output.push('question repository url: https://github.com/user/collabcode-project');
      output.push('question author: CollabCode User');
      output.push('question license (MIT): ');
      output.push('question private: false');
      output.push('success Saved package.json');
      output.push('✨  Done in 0.89s.');
      break;
    default:
      output.push(`Unknown command: ${subCommand}`);
      output.push('See yarn --help for available commands');
  }
  
  return output;
}

function handleNodeCommand(args: string[], output: string[]): string[] {
  if (args.length === 0) {
    // Interactive Node.js shell
    output.push('Welcome to Node.js v18.17.0.');
    output.push('Type ".help" for more information.');
    output.push('> ');
    return output;
  }
  
  if (args[0].endsWith('.js')) {
    const fileName = args[0];
    output.push(`Executing ${fileName}...`);
    output.push('Hello from CollabCode!');
    output.push(`Node.js process exited with code 0`);
  } else if (args[0] === '-v' || args[0] === '--version') {
    output.push('v18.17.0');
  } else if (args[0] === '-e') {
    if (args.length < 2) {
      output.push('Error: no code specified for evaluation');
    } else {
      const code = args.slice(1).join(' ');
      try {
        const result = eval(code);
        output.push(String(result));
      } catch (error) {
        output.push(`Uncaught ${error}`);
      }
    }
  } else {
    output.push(`Error: Cannot find module '${args[0]}'`);
    output.push('    at Function.Module._resolveFilename (node:internal/modules/cjs/loader:995:15)');
    output.push('    at Function.Module._load (node:internal/modules/cjs/loader:841:27)');
  }
  
  return output;
}

function handlePythonCommand(cmd: string, args: string[], output: string[]): string[] {
  if (cmd === 'python' || cmd === 'python3') {
    if (args.length === 0) {
      // Interactive Python shell
      output.push('Python 3.10.6 (main, Nov 14 2022, 16:10:14) [GCC 11.3.0] on linux');
      output.push('Type "help", "copyright", "credits" or "license" for more information.');
      output.push('>>> ');
      return output;
    }
    
    if (args[0] === '-c') {
      if (args.length < 2) {
        output.push('python: option -c requires an argument');
      } else {
        const code = args.slice(1).join(' ');
        output.push('Executing Python code:');
        if (code.includes('print')) {
          const printMatch = code.match(/print\(['"](.+)['"]\)/);
          if (printMatch && printMatch[1]) {
            output.push(printMatch[1]);
          } else {
            output.push('[Python execution result]');
          }
        } else {
          output.push('[Python execution result]');
        }
      }
    } else if (args[0].endsWith('.py')) {
      const fileName = args[0];
      output.push(`Executing ${fileName}...`);
      output.push('Hello from Python!');
    } else if (args[0] === '--version') {
      output.push('Python 3.10.6');
    } else {
      output.push(`python: can't open file '${args[0]}': [Errno 2] No such file or directory`);
    }
  } else if (cmd === 'pip' || cmd === 'pip3') {
    if (args.length === 0) {
      output.push('pip <command> [options]');
      output.push('');
      output.push('Commands:');
      output.push('  install                     Install packages.');
      output.push('  download                    Download packages.');
      output.push('  uninstall                   Uninstall packages.');
      output.push('  list                        List installed packages.');
      return output;
    }
    
    const subCommand = args[0];
    
    switch (subCommand) {
      case 'install':
        if (args.length === 1) {
          output.push('You must give at least one requirement to install');
        } else {
          const packages = args.slice(1).filter(arg => !arg.startsWith('-'));
          output.push('Collecting ' + packages.join(', '));
          packages.forEach(pkg => {
            output.push(`  Downloading ${pkg.toLowerCase()}-0.1.2-py3-none-any.whl (12 kB)`);
          });
          output.push('Installing collected packages: ' + packages.join(', '));
          packages.forEach(pkg => {
            output.push(`Successfully installed ${pkg.toLowerCase()}-0.1.2`);
          });
        }
        break;
      case 'uninstall':
      case 'remove':
        if (args.length === 1) {
          output.push('You must give at least one requirement to uninstall');
        } else {
          const packages = args.slice(1);
          output.push('Uninstalling ' + packages.join(', '));
          packages.forEach(pkg => {
            output.push(`  Found existing installation: ${pkg.toLowerCase()} 0.1.2`);
            output.push(`  Uninstalling ${pkg.toLowerCase()}-0.1.2:`);
            output.push(`    Successfully uninstalled ${pkg.toLowerCase()}-0.1.2`);
          });
        }
        break;
      case 'list':
        output.push('Package    Version');
        output.push('---------- -------');
        output.push('numpy      1.24.3');
        output.push('pandas     2.0.1');
        output.push('pip        23.0.1');
        output.push('setuptools 67.6.1');
        break;
      default:
        output.push(`unknown command "${subCommand}"`);
    }
  }
  
  return output;
}

// Helper functions
function getCurrentDirContent(): any {
  const path = virtualFileSystem.currentDir;
  const parts = path.split('/').filter(Boolean);
  
  let current = virtualFileSystem.files['/'];
  for (const part of parts) {
    if (current[part] && typeof current[part] === 'object') {
      current = current[part];
    } else {
      return null; // Path not found
    }
  }
  
  return current;
}

function getHelpText(): string[] {
  return [
    'Available commands:',
    '',
    'File operations:',
    '  ls, dir           - List directory contents',
    '  cd [dir]          - Change directory',
    '  pwd               - Print current directory',
    '  mkdir [name]      - Create directory',
    '  touch [file]      - Create file',
    '  cat [file]        - Display file contents',
    '  clear             - Clear terminal',
    '',
    'Git commands:',
    '  git init          - Initialize repository',
    '  git add [file]    - Add files to staging',
    '  git commit -m "msg" - Commit changes',
    '  git status        - Show repository status',
    '  git push, pull, clone - Remote operations',
    '',
    'Package management:',
    '  npm install [pkg] - Install packages (npm)',
    '  npm run [script]  - Run npm scripts',
    '  yarn add [pkg]    - Install packages (yarn)',
    '',
    'Runtime environments:',
    '  node [file.js]    - Run JavaScript with Node.js',
    '  python [file.py]  - Run Python scripts',
    '  pip install [pkg] - Install Python packages',
    '',
    'Type help [command] for more information on a specific command.'
  ];
}

/**
 * Execute code based on its language
 * @param code The code to execute
 * @param language The programming language
 * @returns The execution result as an array of strings to display in the terminal
 */
export const executeCode = (code: string, language: string): string[] => {
  const output: string[] = [];
  
  output.push(`> Running ${language} code...`);
  
  switch (language.toLowerCase()) {
    case "javascript":
    case "js":
    case "typescript":
    case "ts":
      try {
        const { result, logs, error } = executeJavaScript(code);
        
        // Add captured logs to output
        logs.forEach(log => output.push(log));
        
        // Add execution result if it exists
        if (result !== undefined) {
          output.push(`=> ${typeof result === 'object' ? JSON.stringify(result, null, 2) : result}`);
        }
        
        // Add error message if execution failed
        if (error) {
          output.push(`Error: ${error.message}`);
        } else {
          output.push("Execution completed.");
        }
      } catch (error) {
        output.push(`System Error: ${error instanceof Error ? error.message : String(error)}`);
      }
      break;
      
    case "html":
      try {
        // Generate HTML preview
        const previewUrl = createHtmlPreview(code);
        output.push("HTML execution prepared.");
        output.push(`Preview URL generated.`);
        
        // Open preview in a new tab/window
        if (typeof window !== 'undefined') {
          window.open(previewUrl, '_blank', 'width=800,height=600');
          output.push("HTML preview opened in a new window.");
        }
      } catch (error) {
        output.push(`Error creating HTML preview: ${error instanceof Error ? error.message : String(error)}`);
      }
      break;
      
    case "css":
      output.push("CSS execution is available in the preview panel.");
      // Create a mini-preview with the HTML and CSS
      try {
        const htmlTemplate = `
<!DOCTYPE html>
<html>
<head>
  <style>${code}</style>
</head>
<body>
  <div class="preview-container">
    <h1>CSS Preview</h1>
    <p>This is a paragraph with some <a href="#">sample text</a> to demonstrate your CSS.</p>
    <div class="sample-box">Sample Box</div>
    <button class="sample-button">Sample Button</button>
  </div>
</body>
</html>`;
        
        const previewUrl = createHtmlPreview(htmlTemplate);
        window.open(previewUrl, '_blank', 'width=800,height=600');
        output.push("CSS preview opened in a new window.");
      } catch (error) {
        output.push(`Error creating CSS preview: ${error instanceof Error ? error.message : String(error)}`);
      }
      break;
      
    case "bash":
    case "shell":
      // Process shell commands directly using our terminal command executor
      return executeTerminalCommand(code);
      
    default:
      output.push(`Execution for ${language} is not directly supported.`);
      output.push("Support is available for JavaScript/TypeScript, HTML, CSS, and shell commands.");
  }
  
  return output;
};

