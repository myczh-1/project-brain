import { startServer as main } from '../packages/mode-service/src/index.js';

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
