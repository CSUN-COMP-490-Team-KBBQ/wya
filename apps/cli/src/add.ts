import { Command } from 'commander';
import { addApp, addPackage } from 'wya-api';
import react from './react';

const add = new Command('add');

add.command('app <name>').description('Add a new wya app').action(addApp);

add
  .command('package <name>')
  .description('Add a new wya package')
  .action(addPackage);

add.addCommand(react);

export default add;
