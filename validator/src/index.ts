/**
 *
 * 2023 DevMatch Co.
 *
 **/
import { Command } from '@commander-js/extra-typings';
import { program } from '@commander-js/extra-typings';
import { EvaluatedTestCase, User } from './interfaces';
import { Validator } from './validator';
import { GitHubPlugin } from './github';
import { UnzipPlugin } from './unzip';
import { LoggerPlugin } from './logger';
import { DevMatchGitServer } from './DevMatchGitServer';
import { StoragePlugin } from './s3';
import { AzureDevOpsPlugin } from './devops';

import { parse as parseJunitXml, TestSuites } from 'junit2json' // ESM

let exec = require("child_process").exec;
import { parse as parseYaml } from 'yaml'
import fs from 'fs';

function log(s) {
    console.log(s)
}

function execute(command, printOutput = false, cwd: string = "") {
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

//
// Get the contents of a file. If the file does not exist, returns false.
//
const getFileContents = async (path) => {
      if (!fs.existsSync(path)) {
        return false;
      }

      return await fs.readFileSync(path, { encoding: 'utf8', flag: 'r' });
}

program
    //
    // This is run when validating the problem
    //
    .command("validate")
    .action(async (targetFile, options) => {
        const yaml = await getFileContents("../challenge.yaml");
        if (yaml === false) {
            console.log("challenge file does not exist");
            return;
        }
        const parsedYaml = parseYaml(yaml)

        //
        // Get the validate argument
        //
        const compileCmd = parsedYaml.validate[0].compile;
        await execute(compileCmd, true);

        //
        // Run the validation command
        //
        const validateCmd = parsedYaml.validate[0].run;
        await execute(validateCmd, true);

        //
        // Find and parse the output
        //
        const testResultsFileName = parsedYaml.validate[0].results;
        const resultsContents = await getFileContents(testResultsFileName);
        if (resultsContents === false) {
            console.log(`The test run did not produce an output at: ${testResultsFileName}` );
            console.log(`The file did not exist` );
            return;
        }

        console.log("Found the output file");

        // Prase the JUnit test result file
        const output = await parseJunitXml(resultsContents)
        if (!output) {
            console.log(`Unable to parse output: ${testResultsFileName}`);
            return;
        }

        const jUnitTestSuites = (output as TestSuites).testsuite;

        if (!(jUnitTestSuites && jUnitTestSuites[0] && jUnitTestSuites[0].testcase)) {
            console.log("Unable to find testcases")
            return;
        }


        // Read the test cases from the YAML file, and start the comparison with the
        // evaluated test cases.


        let evaluatedTestCases : EvaluatedTestCase[] = []
        const numberOfTestCases = jUnitTestSuites[0]?.testcase.length;
        for (const testCase of jUnitTestSuites[0]?.testcase) {
            let evaluatedTestCase : EvaluatedTestCase = new Object() as EvaluatedTestCase;
            evaluatedTestCase.actualPoints = 100 / numberOfTestCases;
            evaluatedTestCase.maxPoints = 100 / numberOfTestCases;
            evaluatedTestCase.hint = 'here is a hint from the problem for case '
            evaluatedTestCase.solved = true
            evaluatedTestCase.id = testCase.name || "Invalid name";
            evaluatedTestCases.push(evaluatedTestCase);
        }

        //
        // Write the DevMatch judge output
        //
        fs.writeFileSync("output.json", JSON.stringify(evaluatedTestCases));
        console.table(evaluatedTestCases);
    })
    //
    // test command - Make sure all the outputes return valid results
    //
    .command("test")
    .action(async (targetFile, options) => {
        let validationFailures : string[] = [];

        // This commands tests codepaths of the problem,
        // first instantiate the validator.
        let validator = new Validator(
            new GitHubPlugin(),
            new UnzipPlugin(),
            new LoggerPlugin(),
            new DevMatchGitServer(),
            new StoragePlugin(),
            new AzureDevOpsPlugin());

        // TODO: Validator must be an instance of DevMatchValidator
        // TODO: DevMatchValidator must have not been tampered with

        // Get the problem configuration
        let problemConfig = await validator.getProblemConfiguration();
        if (problemConfig.ideEnabled) {
            log(`configuration.ideEnabled: ${problemConfig.ideEnabled}`)
            log(`configuration.inputType: ${problemConfig.inputType}`)
        }

        // Validation rule: Test cases must add up to 100
        const problemTestCases = await validator.getTestCases();
        const moreThanOneTestCase = problemTestCases.length > 1;
        if (!moreThanOneTestCase) {
            validationFailures.push("Must have more than one test case.");
        }

        let total = 0;
        for (let testCase of problemTestCases) {
            total += testCase.maxPoints;
        }

        if (total != 100) {
            validationFailures.push("Total points of test cases do not add up to 100")
        }

        // Validation rule: Test cases must have unique IDs
        let testCaseIds = problemTestCases.map((t) => t.id)
        for (const testCaseId of testCaseIds) {
            let duplicates = testCaseIds.filter((id) => testCaseId === id);
            if (duplicates.length >= 2) {
                validationFailures.push("ProblemTestCase id's must be unique")
            }
        }

        // Get the problem pre-requisites
        let user : User = new User();
        user.id = "some-user-id"

        let problemPreReq = validator.prerequesites(user)

        // Open the problem
        let problemOpenResult = await validator.openProblem(user);

        // Get the statement
        let problemStatement = await validator.getProblemStatement(user.id)

        // Get the test cases from the problem
        const testCases = await validator.getTestCases();

        // turn these test cases into evaluated test cases
        const evaluatedTestCases: EvaluatedTestCase[] = testCases?.map(
            (testCase) => new EvaluatedTestCase(testCase)
        );

        let totalPoints = 0;
        let passed = true;
        const actualyEvaluatedTestCases = await validator.validate(123, user, evaluatedTestCases, problemOpenResult.databag)
        for (const testCase of actualyEvaluatedTestCases) {
            console.log(
              `Evaluating case ${testCase.id} - ${testCase.actualPoints} / ${testCase.maxPoints}`
            );
            totalPoints += testCase.actualPoints;

            // If any test case fails, then we fail the whole thing
            if (!testCase.solved) {
              passed = false;
            }
          }

          const verdict = {
            totalPoints: totalPoints,
            passed: passed,
            testCases: actualyEvaluatedTestCases,
          };
          console.log(verdict)


        console.log("Validation failures: ", validationFailures)
    });

program.parse();
