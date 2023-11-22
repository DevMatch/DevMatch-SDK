# Creating a new challenge in DevMatch 
## Introduction
This repo contains the initial file structure of a DevMatch challenge. A challenge is  primarily defined by a configuration file and a workspace folder. You can work on the challenge locally and run the same validations locally and on the cloud.

## Workspace directory

For `git` problems, anything in the `workspace` directory will be presented to a user  solving the problem. Users will not see anything outside `workspace`. Here you can store the problem "starter code".

## Configuration

The configuration file `challenge.yaml`, contains essentials about this problem. Most notably:

```yaml
# Define the type of problem and the environments that are available to the user.
configuration:
    - inputType: GitRepo
    - ideEnabled: false
    - vsliteEnabled: false
    - desktopEnabled: false

# The statement that the user reads
statement: "This is the problem statement! Here is a git repository: {repoUrl}"

# Validation will run these steps in sequence. Include environment setup,
# installation of dependencies and running tests. If the step you are running
# will produce a test output file, include the `results` property which should
# contain the name of the file.
validate:
    # Here is a task that compiles the code
    - name: "Compile the code"
      cmd: echo Compiling...

    # The command to run the verification, this can be running tests
    # And it needs to produce a file called with a junit test format
    - name: "Run the tests"
      cmd: |
        echo Running some testing command...
        echo '<?xml version="1.0" encoding="UTF-8"?>
        <!-- This is a basic JUnit-style XML example to highlight the basis structure.  -->
        <testsuites time="15.682687">
            <testsuite name="Tests.DevMatchTestCases" time="6.605871">
                <testcase name="TEST_1" classname="Tests.simpleSum" time="2.111" />
                <testcase name="TEST_2" classname="Tests.simpleSum" time="1.051" />
                <testcase name="TEST_3" classname="Tests.simpleSum" time="3.441" />
            </testsuite>
        </testsuites>' > output.xml
      # The location and filename of the results
      results: output.xml

testcases:
    - id: TEST_1
      description: Add two integers
      maxPoints: 10
    - id: TEST_2
      description: Bad arguments - Too few
      maxPoints: 10
    - id: TEST_3
      description: Bad arguments - Too many
      maxPoints: 80
```


# Quick start

This challenge can be built and tested locally. To build the challenge, first go to the `validator`, install dependencies and then you can run the DevMatch CLI commands.

## First run 
```cmd
cd validator
npm i
npm run devmatch -- validate
```

Running the last `validate` command will run the same set of steps that DevMatch will take when validating a solution on the cloud.

## Make changes to the statement

Change the Yaml file to have a different statement.

## Test cases

Running a test command on the workspace should emit a JUnit compatible XML result file. The name of the test cases need to match the test case id. Don't change anything here for now.

## Workspace

Modify any file in the workspace folder, add a file or modify the contents of an existing file.

## Publish

Now that you have made modifications to this challenge locally, built it a final time with `npm run devmatch -- validate` to make sure it builds and then commit and push your changes to the same branch. Now go to DevMatch and publish the version. Now you can go to the preview tab and open the problem, then send a submission.

