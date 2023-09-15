#!/usr/bin/env node

const process = require("process");
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("node:path");

const readline = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout
});
readline.on("SIGINT", () => { process.emit("SIGINT"); });
process.on("SIGINT", () => {
  console.log("\nCanceled setup...");
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
      const chooseTo = Boolean(answer.match(/^y(es)?$/i));
      build({ projectName, chooseTo });
      readline.pause();
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
  const workDir = path.resolve(process.cwd(), projectName);
  const folderToCopy = path.resolve(__dirname, "../build");

  const copy = () => copyProject(projectName, folderToCopy, workDir, chooseTo);
  
  !fs.existsSync(workDir) ? 
    copy() :
    (() => {  
      const files = fs.readdirSync(workDir) || [];
      if(files.length !== 0) {
        const dirName = workDir.split(path.sep).pop();
        consoleError(`there are already files in directory \"${dirName}\"`);
        readline.question("Do you still want to setup project? There might be a change or overwrite in your files. (y): ", answer => {
          answer.match(/^y(es)?$/i) ? 
            copy() : null;
          readline.close();
        })
      } 
      else {
        copy();
      }
    })();

  return;
}

function copyProject(projectName, source, destination, includeDocker) {
  try {
    fs.cpSync(source, destination, { recursive: true });
    runCommand(`cd ${destination} && echo "node_modules" > .gitignore`);

    if(includeDocker) {
      const dockerSource = path.resolve(__dirname, "../build-docker");
      fs.cpSync(dockerSource, destination, { recursive: true, force: true });
    }
    consoleSuccess(projectName);
  } catch(err) {
    consoleError("failed to copy", err);
  }
}

function consoleError(message, err = null) {
  const str = `${clr.r}Error:${clr.y} ${message}${clr.m}`;
  err ? console.error(str, err, clr.o) : console.error(str, clr.o);
}

function consoleSuccess(projectName) {
  const message = `\n:::: ${clr.g} Setting complete! ${clr.o} Install packages by${clr.c} <yarn install>${clr.o} or${clr.c} <npm install>`;
  if(projectName === ".") console.log(message);
  else console.log(message + `${clr.o} after changing the directory to${clr.g} ${projectName}`);
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

run();