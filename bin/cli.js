#!/usr/bin/env node

const process = require("process");
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
    build();
    readline.close()
  });
} else {
  build();
}


function build() {
  const makeDir = `mkdir ${projectName}`;
  runCommand(makeDir);
  
  // console.log(__dirname)
  // console.log(process.cwd())
  const workDirectory = path.resolve(process.cwd(), projectName);

  const folderToCopy = path.resolve(__dirname, "../build");
  const copyCommand = `rsync -av --progress ${folderToCopy}/* ${workDirectory}`
  runCommand(copyCommand);

  runCommand(`echo "Setting complete! Install packages by <yarn install> or <npm install>"`);
  
  process.chdir(workDirectory);
}