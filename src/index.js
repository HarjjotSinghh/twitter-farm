import { Command } from 'commander';
import logger from './utils/logger.js';
import Orchestrator from './orchestrator/Orchestrator.js';

const program = new Command();

program
  .name('twitter-farm')
  .description('Twitter automation application for engagement and content posting')
  .version('1.0.0');

program
  .option('--dry-run', 'Run in dry-run mode (no actual posting)')
  .option('--content-only', 'Only generate content, do not post')
  .option('--mode <mode>', 'Execution mode (dev, production)', 'production')
  .parse(process.argv);

const options = program.opts();

async function main() {
  logger.info('Starting Twitter Farm Application', {
    component: 'Main',
    options
  });

  console.log('\n==============================================');
  console.log('🐦 Twitter Farm - Browser Automation');
  console.log('==============================================');
  console.log(`Mode: ${options.mode}`);
  console.log(`Dry Run: ${options.dryRun ? 'YES' : 'NO'}`);
  console.log(`Content Only: ${options.contentOnly ? 'YES' : 'NO'}`);
  console.log('==============================================\n');

  const orchestrator = new Orchestrator({
    dryRun: options.dryRun,
    contentOnly: options.contentOnly
  });

  process.on('SIGINT', async () => {
    console.log('\n\nReceived SIGINT, shutting down gracefully...');
    await orchestrator.shutdown();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('\n\nReceived SIGTERM, shutting down gracefully...');
    await orchestrator.shutdown();
    process.exit(0);
  });

  try {
    await orchestrator.initialize();
    await orchestrator.start();
  } catch (error) {
    logger.error('Application error', {
      component: 'Main',
      error: error.message,
      stack: error.stack
    });
    
    console.error('\n❌ Application failed:', error.message);
    await orchestrator.shutdown();
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
