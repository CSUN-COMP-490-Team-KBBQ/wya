import { Command } from 'commander';
import { addReactComponent } from 'wya-api/src';

const react = new Command('react');

react
  .option('-w, --web', 'Add to web app')
  .option('-m, --mobile', 'Add to mobile app')
  .option('-u, --ui', 'Add to ui package')
  .option(
    '-p, --path <path>',
    'Override and add to specific path relative to cwd'
  );

react
  .command('component <name>')
  .alias('c')
  .description('Add a new react component')
  .action((name) => {
    addReactComponent({ ...react.opts(), name });
  });

export default react;
