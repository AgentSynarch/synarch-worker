#!/usr/bin/env node

const { CLI } = require("../src/index");

const cli = new CLI();
cli.run(process.argv.slice(2));
