#!/usr/bin/env node

const process = require("process");
const { execSync } = require("child_process");
const { existsSync } = require("fs");
const path = require("path");

const readline = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout
});
readline.on("SIGINT", () => { process.emit("SIGINT"); });
process.on("SIGINT", () => {
  console.log("Canceled setup...")
  process.exit();
})

function runCommand(command) {
  try {
    execSync(command, { stdio: "inherit" });
  } catch (e) {
    console.error(`Failed to execute ${command}`, e);
    process.exit(1);
  }
}

const run = () => {
  return new Promise((resolve, reject) => {
    readline.question("Please provide a project name\n: ", name => {
      resolve(name);
    });
  })
  .then(projectName => {
    readline.question("Do you want to set up Dockerfile and docker-compose.yml? (y) ", answer => {
      console.log(projectName, answer);
      const chooseTo = answer.match(/^y(es)?$/i) ? true : false;
      build({ projectName, chooseTo })
      readline.close();
    });
  })
}

/**
 * 
 * @param {{ projectName, chooseTo }} obj 
 */
function build(obj) {
  const { projectName, chooseTo } = obj;
  const makeDir = `mkdir ${projectName}`;
  runCommand(makeDir);
  
  // console.log(__dirname)
  // console.log(process.cwd())
  const workDirectory = path.resolve(process.cwd(), projectName);

  const folderToCopy = path.resolve(__dirname, "../build");
  const copyCommand = copySource(folderToCopy, workDirectory);
  runCommand(copyCommand);

  if(chooseTo) {
    const dockerDirectory = path.resolve(__dirname, "../build-docker");
    const copyDocker = copySource(dockerDirectory, workDirectory);
    runCommand(copyDocker);
  }

  consoleSuccess(projectName);
}

function consoleSuccess(projectName) {
  // ANSI escape code
  const clr = {
    o: convertToANSI(0), // original
    g: convertToANSI(32), // green
    c: convertToANSI(36), // cyan
    m: convertToANSI(35) // magenta
  }
  console.log(`\n:::: ${clr.g} Setting complete! ${clr.o} Install packages by${clr.c} <yarn install>${clr.o} or${clr.c} <npm install>${clr.o} after changing the directory to${clr.m} ${projectName}`);
}

const convertToANSI = (codeNumber) => {
  return `\x1b[${codeNumber}m`;
}

const copySource = (source, destination) => {
  const pathToNpmIgnore = path.resolve(__dirname, "../.npmignore");
  const excluding = existsSync(pathToNpmIgnore) ? 
    `--exclude-from='${pathToNpmIgnore}'` : 
    "";
  return `rsync -rv --progress ${source}/ ${destination} ` + excluding;
}

run();