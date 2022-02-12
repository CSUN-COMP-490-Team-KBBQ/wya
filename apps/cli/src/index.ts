#!/usr/bin/env node
import { Command } from 'commander';

import add from './add';
import firebase from './firebase';

const program = new Command();

program.version('1.0.1');

program.addCommand(add);
program.addCommand(firebase);

program.parse();
