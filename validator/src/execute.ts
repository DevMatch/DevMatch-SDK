/**
 * Copyright (C) 2023 DevMatch Co. - All Rights Reserved
 **/
let exec = require("child_process").exec;

export function execute(command, printOutput = false, cwd: string = "") {
  console.log("\u001b[33mExecuting: " + command + "\u001b[0m");
  return new Promise((resolve, reject) => {
    if (!cwd) {
      cwd = process.cwd();
    }
    exec(
      command,
      { maxBuffer: 1024 * 500, cwd: cwd },
      function (error, stdout, stderr) {
        if (error) {
          console.log(`exec error: ${error}`);
          reject(error);
          return;
        }

        if (stdout && printOutput) {
          let lines = stdout.trim().split("\n");
          for (let line of lines) {
            console.log("  > " + line);
          }
        }

        if (stderr && printOutput) {
          let lines = stderr.trim().split("\n");
          for (let line of lines) {
            console.log("  > " + line);
          }
        }

        resolve(stdout);
      }
    );
  });
}