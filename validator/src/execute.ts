/**
 * Copyright (C) 2023 DevMatch Co. - All Rights Reserved
 **/
const { spawn } = require("child_process");

export function execute(command, printOutput = false, cwd = "") {
  console.log("\u001b[33mExecuting: " + command + "\u001b[0m");
  return new Promise((resolve, reject) => {
    if (!cwd) {
      cwd = process.cwd();
    }

    const [cmd, ...args] = command.split(" ");
    const child = spawn(cmd, args, {
       cwd: cwd ,
       shell: true,
       
      });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (data) => {
      stdout += data.toString();
      if (printOutput) {
        let lines = data.toString().trim().split("\n");
        for (let line of lines) {
          console.log("\u001b[33m  > " + line + "\u001b[0m");
        }
      }
    });

    child.stderr.on("data", (data) => {
      stderr += data.toString();
      if (printOutput) {
        let lines = data.toString().trim().split("\n");
        for (let line of lines) {
          console.log("\u001b[31m  > " + line + "\u001b[0m");
        }
      }
    });

    child.on("close", (code) => {
      if (code !== 0) {
        console.log(`spawn error: ${stderr}`);
        reject(new Error(stderr));
        return;
      }
      resolve(stdout);
    });

    child.on("error", (error) => {
      console.log(`spawn error: ${error}`);
      reject(error);
    });
  });
}

