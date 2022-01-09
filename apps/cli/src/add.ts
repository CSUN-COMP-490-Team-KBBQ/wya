import { Command } from 'commander';
import { addApp, addPackage } from 'wya-api';

const add = new Command('add');

add.command('app <name>').description('Add a new wya app').action(addApp);

add
  .command('package <name>')
  .description('Add a new wya package')
  .action(addPackage);

export default add;
