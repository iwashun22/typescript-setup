#!/usr/bin/env node

const { execSync } = require("child_process");
const readline = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout
});
const path = require("path");

let projectName = process.argv[2];

function runCommand(command) {
  try {
    execSync(command, { stdio: "inherit" });
  } catch (e) {
    console.error(`Failed to execute ${command}`, e);
    process.exit(1);
  }
}

if(!projectName) {
  console.log("Please provide a project name");
  readline.question(": ", name => {
    projectName = name;
    readline.close()
  });
}

const makeDir = `mkdir ${projectName}`;
runCommand(makeDir);