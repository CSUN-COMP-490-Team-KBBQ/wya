#!/usr/bin/env node
import { Command } from 'commander';
import add from './add';

const program = new Command();

program.version('1.0.0');

program.addCommand(add);

program.parse();
