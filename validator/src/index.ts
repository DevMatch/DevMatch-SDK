/**
 * Copyright (C) 2023 DevMatch Co. - All Rights Reserved
 **/
import { EvaluatedTestCase, User } from "./interfaces";
import { Validator } from "./validator";
import { GitHubPlugin } from "./github";
import { UnzipPlugin } from "./unzip";
import { LoggerPlugin } from "./logger";
import { DevMatchGitServer } from "./DevMatchGitServer";
import { StoragePlugin } from "./s3";
import { AzureDevOpsPlugin } from "./devops";
import { execute } from "./execute";

import { program } from "@commander-js/extra-typings";
import { parse as parseJunitXml, TestSuites } from "junit2json";

import fs from "fs";
import path from "path";

import { parse as parseYaml } from "yaml";

const getFileContents = async (path) => {
  if (!fs.existsSync(path)) {
    return false;
  }

  return fs.readFileSync(path, { encoding: "utf8", flag: "r" });
};

/**
 * The DevMatch CLI TOOL
 */
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
    const parsedYaml = parseYaml(yaml);

    //
    // Print the problem configuration for debuggin purposes
    //
    let problemCode = new Validator(
      new GitHubPlugin(),
      new UnzipPlugin(),
      new LoggerPlugin(),
      new DevMatchGitServer(),
      new StoragePlugin(),
      new AzureDevOpsPlugin()
    );
    let problemConfiguration = await problemCode.getProblemConfiguration();
    console.table([
      [ "ideEnabled", problemConfiguration.ideEnabled ],
      [ "inputType", problemConfiguration.inputType ]
    ])

    const worskpaceFolder = path.join(process.cwd(), "..", "workspace");
    console.log("Current working directory", worskpaceFolder)

    console.log(`                                     `)
    console.log(`   _____ _______       _____ _______ `)
    console.log(`  / ____|__   __|/\\   |  __ \\__   __|`)
    console.log(` | (___    | |  /  \\  | |__) | | |   `)
    console.log(`  \\___ \\   | | / /\\ \\ |  _  /  | |   `)
    console.log(`  ____) |  | |/ ____ \\| | \\ \\  | |   `)
    console.log(` |_____/   |_/_/    \\_\\_|  \\_\\ |_|   `)
    console.log(`                                     `)
    console.log(`                                     `)
    try {
        //
        // Get the validate argument
        //
        const compileCmd = parsedYaml.validate[0].compile;
        await execute(compileCmd, true, worskpaceFolder);

        //
        // Run the validation command
        //
        const validateCmd = parsedYaml.validate[0].run;
        await execute(validateCmd, true, worskpaceFolder);
    } catch (e) {
        console.log("Caught exception while executing.");
    }

    console.log(`    ______ _   _ _____  `)
    console.log(`   |  ____| \\ | |  __ \\ `)
    console.log(`   | |__  |  \\| | |  | |`)
    console.log(`   |  __| | . \\\` | |  | |`)
    console.log(`   | |____| |\\  | |__| |`)
    console.log(`   |______|_| \\_|_____/ `)
    console.log(`                        `)

    //
    // Find and parse the output
    //
    const testResultsFileName = path.join(process.cwd(), "..", "workspace", parsedYaml.validate[0].results);
    const resultsContents = await getFileContents(testResultsFileName);
    if (resultsContents === false) {
      console.log(
        `The test run did not produce an output at: ${testResultsFileName}`
      );
      console.log(`The file did not exist`);
      return;
    }


    //
    // Now we reconcile the test cases defined in the yaml file, and the
    // test results from the junit output.
    //
    // In general, we will prefix "yaml" to variables that deal with the
    // test cases as read from yaml configuraiton.
    //
    // We will prefix with "build" to variables that deal with the output
    // out the build.
    //

    //
    // Read build test cases: Parse the JUnit test result file
    //
    console.log(`Found the output file: ${testResultsFileName}`);
    const buildParsedJunitContents = await parseJunitXml(resultsContents);
    if (!buildParsedJunitContents) {
      console.log(`Unable to parse output: ${testResultsFileName}`);
      return;
    }

    const buildTestSuites = (buildParsedJunitContents as TestSuites).testsuite;

    // There must be at least one test suite and test case
    // TODO: IS this really needed?
    if (!(buildTestSuites && buildTestSuites[0] && buildTestSuites[0].testcase)) {
      console.log("Unable to find testcases");
      return;
    }

    // Flatten the tree and just extract all the test cases from the build
    let buildTestCases : any [] = [];
    for (const suites of buildTestSuites) {
        if (suites?.testcase === undefined) {
            continue;
        }
        for (const testCase of suites?.testcase) {
            buildTestCases.push(testCase);
            console.log(`Found test case from the build : ${testCase.name}`)
        }
    }

    // Read the test cases from the YAML file, and start the comparison with the
    // evaluated test cases.

    //
    // Read Yaml test cases: Parse the yaml file
    //
    let evaluatedTestCases: EvaluatedTestCase[] = [];
    for (const yamlTestCase of parsedYaml.testcases) {

      // Initialize Yaml test cases to failed state
      let evaluatedTestCase: EvaluatedTestCase =
        new Object() as EvaluatedTestCase;
      evaluatedTestCase.actualPoints = 0;
      evaluatedTestCase.maxPoints = yamlTestCase.maxPoints;
      //evaluatedTestCase.hint = "here is a hint from the problem for case ";
      evaluatedTestCase.solved = false;
      evaluatedTestCase.id = yamlTestCase.id || "Invalid name";
      evaluatedTestCases.push(evaluatedTestCase);
    }

    //
    // Test case mapping, start from the yamlTest cases
    //
    for (let yamlTestCase of evaluatedTestCases) {
      // Find this result on build test cases
      const foundBuildTestCase = buildTestCases.find((c) => c.name === yamlTestCase.id);
        if (foundBuildTestCase) {
          const failure = foundBuildTestCase.failure !== undefined;
          console.log(`Found mapping ${yamlTestCase.id}. Failure = ${failure}`);

          if (!failure) {
              yamlTestCase.actualPoints = yamlTestCase.maxPoints;
              yamlTestCase.solved = true;
          }

        } else {
            console.log(`Test case mapping ${yamlTestCase.id} NOT found. Build did not produce this test case.`);
        }
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
    let validationFailures: string[] = [];

    // This commands tests codepaths of the problem,
    // first instantiate the validator.
    let validator = new Validator(
      new GitHubPlugin(),
      new UnzipPlugin(),
      new LoggerPlugin(),
      new DevMatchGitServer(),
      new StoragePlugin(),
      new AzureDevOpsPlugin()
    );

    // TODO: Validator must be an instance of DevMatchValidator
    // TODO: DevMatchValidator must have not been tampered with

    // Get the problem configuration
    let problemConfig = await validator.getProblemConfiguration();
    if (problemConfig.ideEnabled) {
      console.log(`configuration.ideEnabled: ${problemConfig.ideEnabled}`);
      console.log(`configuration.inputType: ${problemConfig.inputType}`);
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
      validationFailures.push(
        "Total points of test cases do not add up to 100"
      );
    }

    // Validation rule: Test cases must have unique IDs
    let testCaseIds = problemTestCases.map((t) => t.id);
    for (const testCaseId of testCaseIds) {
      let duplicates = testCaseIds.filter((id) => testCaseId === id);
      if (duplicates.length >= 2) {
        validationFailures.push("ProblemTestCase id's must be unique");
      }
    }

    // Get the problem pre-requisites
    let user: User = new User();
    user.id = "some-user-id";

    let problemPreReq = validator.prerequesites(user);

    // Open the problem
    let problemOpenResult = await validator.openProblem(user);

    // Get the statement
    let problemStatement = await validator.getProblemStatement(user.id);

    // Get the test cases from the problem
    const testCases = await validator.getTestCases();

    // turn these test cases into evaluated test cases
    const evaluatedTestCases: EvaluatedTestCase[] = testCases?.map(
      (testCase) => new EvaluatedTestCase(testCase)
    );

    let totalPoints = 0;
    let passed = true;
    const actualyEvaluatedTestCases = await validator.validate(
      123,
      user,
      evaluatedTestCases,
      problemOpenResult.databag
    );
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
    console.log(verdict);
    console.log("Validation failures: ", validationFailures);
  });

program.parse();
