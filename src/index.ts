import { main } from './app/serverMain.js';

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
