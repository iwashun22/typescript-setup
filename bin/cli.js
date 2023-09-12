#!/usr/bin/env node

const { execSync } = require("child_process");
const path = require("path");

const projectName = process.argv[2];

function runCommand(command) {
  try {
    execSync(command, { stdio: "inherit" });
  } catch (e) {
    console.error(`Failed to execute ${command}`, e);
    process.exit(1);
  }
}

if(!projectName) {
  console.error("Please provide a project name");
  process.exit(1);
}

const makeDir = `mkdir ${projectName}`;
runCommand(makeDir);