import * as fs from 'fs';
import * as path from 'path';
import { projectInit } from '@myczh/project-brain/core';
import { createFsStorage } from '@myczh/project-brain/infra-fs';

export type SetupMode = 'lightweight' | 'service' | 'both';

interface RepoFacts {
  cwd: string;
  repoRoot: string;
  isGitRepo: boolean;
  hasOpenSpec: boolean;
  hasBrainDir: boolean;
  hasManifest: boolean;
}

function parseArgs(argv: string[]): {
  command: 'serve' | 'setup' | 'doctor' | 'init' | 'help';
  nonInteractive: boolean;
} {
  const args = argv.slice(2);
  const first = args[0];
  const command =
    first === 'setup' || first === 'doctor' || first === 'init' || first === 'help' || first === '--help' || first === '-h'
      ? first
      : 'serve';

  return {
    command: command === '--help' || command === '-h' ? 'help' : command,
    nonInteractive: args.includes('--yes') || args.includes('--non-interactive'),
  };
}

function detectRepoFacts(cwd = process.cwd()): RepoFacts {
  const storage = createFsStorage();
  const repoRoot = storage.getRepoRootPath(cwd);
  const openspecDir = path.join(repoRoot, 'openspec');
  const brainDir = path.join(repoRoot, '.project-brain');

  return {
    cwd,
    repoRoot,
    isGitRepo: repoRoot === path.resolve(cwd) ? fs.existsSync(path.join(repoRoot, '.git')) : true,
    hasOpenSpec: fs.existsSync(openspecDir),
    hasBrainDir: fs.existsSync(brainDir),
    hasManifest: storage.manifestExists(repoRoot),
  };
}

function printHeader(title: string): void {
  console.error('');
  console.error(title);
  console.error('='.repeat(title.length));
}

function printModeSummary(mode: SetupMode): void {
  if (mode === 'lightweight') {
    console.error('Selected: Lightweight mode');
    console.error('- Best when you already use OpenSpec and want Project Brain as the durable memory layer.');
    console.error('- No HTTP service required. AI tools read and write .project-brain/ directly.');
    return;
  }

  if (mode === 'service') {
    console.error('Selected: Service mode');
    console.error('- Best when you want MCP/HTTP access, a local dashboard, or shared agent access.');
    console.error('- Start the server with `project-brain` or `npx -y @myczh/project-brain`.');
    return;
  }

  console.error('Selected: Both modes');
  console.error('- Use lightweight mode for repository-local memory updates.');
  console.error('- Use service mode when an MCP client or dashboard needs HTTP access.');
}

function getRecommendedMode(facts: RepoFacts): SetupMode {
  return facts.hasOpenSpec ? 'lightweight' : 'service';
}

function createPromptIO() {
  const stdin = process.stdin;
  const stdout = process.stderr;

  async function ask(question: string): Promise<string> {
    stdout.write(`${question} `);
    stdin.resume();
    stdin.setEncoding('utf8');

    return await new Promise(resolve => {
      const onData = (chunk: string) => {
        stdin.pause();
        stdin.removeListener('data', onData);
        resolve(chunk.trim());
      };
      stdin.on('data', onData);
    });
  }

  return { ask };
}

async function chooseModeInteractively(facts: RepoFacts): Promise<SetupMode> {
  const io = createPromptIO();
  const recommended = getRecommendedMode(facts);

  console.error('Choose a setup mode:');
  console.error(`1. Lightweight mode${recommended === 'lightweight' ? ' (recommended)' : ''}`);
  console.error(`2. Service mode${recommended === 'service' ? ' (recommended)' : ''}`);
  console.error('3. Both');

  while (true) {
    const answer = await io.ask('Enter 1, 2, or 3:');
    if (answer === '1') return 'lightweight';
    if (answer === '2') return 'service';
    if (answer === '3') return 'both';
    console.error('Please enter 1, 2, or 3.');
  }
}

async function ensureBrainInitialized(facts: RepoFacts): Promise<void> {
  const storage = createFsStorage();
  storage.ensureBrainDir(facts.repoRoot);

  if (storage.manifestExists(facts.repoRoot)) {
    console.error(`Project Brain directory is ready at ${path.join(facts.repoRoot, '.project-brain')}`);
    return;
  }

  const inferredName = path.basename(facts.repoRoot);
  const result = await projectInit(
    {
      repo_path: facts.repoRoot,
      answers: {
        project_name: inferredName,
        summary: `Project Brain memory for ${inferredName}`,
        repo_type: 'application',
        primary_stack: ['unknown'],
      },
    },
    storage
  );

  console.error(result.message || 'Project Brain initialized.');
  if (result.manifest_path) {
    console.error(`Manifest created at ${result.manifest_path}`);
  }
}

function printLightweightInstructions(facts: RepoFacts): void {
  console.error('');
  console.error('Lightweight mode next steps');
  console.error('- Keep using your AI tool in this repository; it should read and write `.project-brain/` directly.');
  console.error('- Point the tool at `protocol/` when it needs the Project Brain contract.');
  if (facts.hasOpenSpec) {
    console.error('- OpenSpec detected: lightweight mode is the default recommendation for this repository.');
  }
  console.error('- Recommended prompt line: "Use Project Brain as the durable memory layer for this repository. When updating .project-brain/, follow the protocol/ contract."');
}

function printServiceInstructions(): void {
  console.error('');
  console.error('Service mode next steps');
  console.error('- Start the local server with `project-brain` or `npx -y @myczh/project-brain`.');
  console.error('- Health check: `curl http://127.0.0.1:3210/health`');
  console.error('- MCP endpoint: `http://127.0.0.1:3210/mcp`');
}

function printDoctorLine(label: string, ok: boolean, detail: string): void {
  console.error(`${ok ? 'OK' : 'WARN'}  ${label}: ${detail}`);
}

async function checkHealthEndpoint(): Promise<boolean> {
  try {
    const response = await fetch('http://127.0.0.1:3210/health');
    if (!response.ok) return false;
    const payload = (await response.json()) as { status?: string };
    return payload.status === 'ok';
  } catch {
    return false;
  }
}

export async function runSetup(nonInteractive = false): Promise<void> {
  const facts = detectRepoFacts();
  const recommended = getRecommendedMode(facts);

  printHeader('Project Brain Setup');
  console.error(`Repository: ${facts.repoRoot}`);
  console.error(`OpenSpec detected: ${facts.hasOpenSpec ? 'yes' : 'no'}`);
  console.error(`Existing .project-brain/: ${facts.hasBrainDir ? 'yes' : 'no'}`);
  console.error(`Recommended mode: ${recommended}`);

  const mode =
    nonInteractive || !process.stdin.isTTY || !process.stderr.isTTY ? recommended : await chooseModeInteractively(facts);

  console.error('');
  printModeSummary(mode);
  await ensureBrainInitialized(facts);

  if (mode === 'lightweight' || mode === 'both') {
    printLightweightInstructions(facts);
  }

  if (mode === 'service' || mode === 'both') {
    printServiceInstructions();
  }
}

export async function runDoctor(): Promise<void> {
  const facts = detectRepoFacts();
  const healthOk = await checkHealthEndpoint();
  const brainDir = path.join(facts.repoRoot, '.project-brain');
  const protocolDir = path.join(facts.repoRoot, 'protocol');

  printHeader('Project Brain Doctor');
  printDoctorLine('Repository root', true, facts.repoRoot);
  printDoctorLine('Git repository', facts.isGitRepo, facts.isGitRepo ? 'git metadata detected' : 'working outside a git repository');
  printDoctorLine('OpenSpec', facts.hasOpenSpec, facts.hasOpenSpec ? 'openspec/ is present' : 'openspec/ not found');
  printDoctorLine('.project-brain', facts.hasBrainDir, facts.hasBrainDir ? brainDir : 'directory not created yet');
  printDoctorLine('Manifest', facts.hasManifest, facts.hasManifest ? 'manifest.json is present' : 'manifest.json not found');
  printDoctorLine('Protocol docs', fs.existsSync(protocolDir), fs.existsSync(protocolDir) ? 'protocol/ is present' : 'protocol/ not found');
  printDoctorLine('HTTP health', healthOk, healthOk ? 'http://127.0.0.1:3210/health responded ok' : 'server not reachable on port 3210');

  console.error('');
  console.error('Suggested next step:');
  if (!facts.hasBrainDir) {
    console.error('- Run `project-brain setup` to initialize Project Brain for this repository.');
  } else if (facts.hasOpenSpec) {
    console.error('- Use lightweight mode by default; keep service mode optional for MCP clients.');
  } else if (!healthOk) {
    console.error('- Start the local service with `project-brain` if you want MCP/HTTP access.');
  } else {
    console.error('- Your repository is ready for Project Brain usage.');
  }
}

export async function runInit(): Promise<void> {
  const facts = detectRepoFacts();
  printHeader('Project Brain Init');
  await ensureBrainInitialized(facts);
  console.error('- Next: run `project-brain setup` for mode-specific guidance.');
}

export function printHelp(): void {
  console.error('Project Brain');
  console.error('');
  console.error('Usage:');
  console.error('  project-brain                 Start the HTTP/MCP service');
  console.error('  project-brain setup           Recommend a mode and initialize .project-brain/');
  console.error('  project-brain doctor          Check repository readiness and local service health');
  console.error('  project-brain init            Initialize .project-brain/ with a minimal manifest');
  console.error('  project-brain help            Show this help');
}

export function parseCliArgs(argv: string[]) {
  return parseArgs(argv);
}
