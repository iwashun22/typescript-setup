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
    consoleError(`failed to execute ${command}`, e);
    process.exit(1);
  }
}

const run = () => {
  return new Promise((resolve, reject) => {
    readline.question("Please provide a project name (type . for current directory): ", name => {
      if(!name) reject("Please provide a project name.");

      const hasSpace = name.match(/\s/g) ? true : false;
      if(hasSpace) reject("Please remove the spaces for a project name");

      resolve(name);
    });
  })
  .then(projectName => {
    readline.question("Do you want to set up Dockerfile and docker-compose.yml? (y) ", answer => {
      // console.log(projectName, answer);
      const chooseTo = answer.match(/^y(es)?$/i) ? true : false;
      build({ projectName, chooseTo })
      readline.close();
    });
  })
  .catch(err => {
    consoleError(err);
    process.exit(1);
  })
}

/**
 * 
 * @param {{ projectName, chooseTo }} obj 
 */
function build(obj) {
  const { projectName, chooseTo } = obj;
  if(projectName !== ".") {
    const makeDir = `mkdir ${projectName}`;
    runCommand(makeDir);
  }
  
  // console.log(__dirname)
  // console.log(process.cwd())
  const workDirectory = path.resolve(process.cwd(), projectName);

  const folderToCopy = path.resolve(__dirname, "../build");
  const copyCommand = copySource(folderToCopy, workDirectory);
  runCommand(copyCommand);
  runCommand(`cd ${workDirectory} && echo "node_modules" > .gitignore`);

  if(chooseTo) {
    const dockerDirectory = path.resolve(__dirname, "../build-docker");
    const copyDocker = copySource(dockerDirectory, workDirectory);
    runCommand(copyDocker);
  }

  consoleSuccess(projectName);
}

function consoleError(message, err = null) {
  const str = `${clr.r}Error:${clr.y} ${message}${clr.m}`;
  err ? console.error(str, err) : console.error(str);
}

function consoleSuccess(projectName) {
  console.log(`\n:::: ${clr.g} Setting complete! ${clr.o} Install packages by${clr.c} <yarn install>${clr.o} or${clr.c} <npm install>${clr.o} after changing the directory to${clr.m} ${projectName}`);
}

// ANSI escape code
const convertToANSI = (codeNumber) => {
  return `\x1b[${codeNumber}m`;
}
const clr = {
  o: convertToANSI(0), // original
  g: convertToANSI(32), // green
  c: convertToANSI(36), // cyan
  m: convertToANSI(35), // magenta
  y: convertToANSI(33), // yellow
  r: convertToANSI(31) // red
}

const copySource = (source, destination) => {
  const pathToNpmIgnore = path.resolve(__dirname, "../.npmignore");
  const excluding = existsSync(pathToNpmIgnore) ? 
    `--exclude-from='${pathToNpmIgnore}'` : 
    "";
  return `rsync -rv --progress ${source}/ ${destination} ` + excluding;
}

run();