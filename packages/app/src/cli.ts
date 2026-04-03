#!/usr/bin/env node
import { main } from './serverMain.js';
import { parseCliArgs, printHelp, runDoctor, runInit, runSetup } from './setup.js';

async function run() {
  const { command, nonInteractive } = parseCliArgs(process.argv);

  switch (command) {
    case 'setup':
      await runSetup(nonInteractive);
      return;
    case 'doctor':
      await runDoctor();
      return;
    case 'init':
      await runInit();
      return;
    case 'help':
      printHelp();
      return;
    case 'serve':
    default:
      await main();
  }
}

run().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
