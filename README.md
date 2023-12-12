# Creating a new challenge in DevMatch 
## Introduction
This repo contains the initial file structure of a DevMatch challenge. A configuration file and a workspace folder largely define a challenge. You can develop your challenge locally and run the same validations that DevMatch will run on the cloud.

## Workspace directory

For `GitRepo` problems, anything in the `workspace` directory will be presented to a user solving the problem. Here you can store the problem "starter code". Users will not see anything outside of `workspace`. 

For `CodeReview` problems, you can create a `before` and `after` folder in the `workspace` directory. DevMatch will generate a diff of `before` and `after` file structure. The diff is what is shown to the user to review.

## Configuration

The configuration file `challenge.yaml` defines the type, test cases and other problem essentials. Here is a sample Yaml configuration:

```yaml
# Problems can be of different input types, and allow the user to use various online IDEs directly from DevMatch.
configuration:
    - inputType: GitRepo
    - ideEnabled: false
    - vsliteEnabled: false
    - desktopEnabled: false

# The statement that the user reads on the left side of the arena. This is what tells the user what to do.
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


# Quick start: GitRepo problem

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

If this were the output from your test:
```xml
<?xml version="1.0" encoding="UTF-8"?>
 <testsuites time="15.682687">
     <testsuite name="Tests.DevMatchTestCases" time="6.605871">
         <testcase name="TEST_1" classname="Tests.simpleSum" time="2.111" />
         <testcase name="TEST_2" classname="Tests.simpleSum" time="1.051" />
         <testcase name="TEST_3" classname="Tests.simpleSum" time="3.441" />
     </testsuite>
 </testsuites>
```

Your test cases would need to look like this. Notice the `id` of the DevMatch test case matches the `name` of the Junit test case.
```yml
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

## Workspace

Drop the folder structure that you want the user to work on.

## Publish

Now that you have made modifications to this challenge locally, built it a final time with `npm run devmatch -- validate` to make sure it builds and then commit and push your changes to the same branch. Now go to DevMatch and publish the version. After publishing is completed (takes about 30 seconds)  go to the preview tab to view the statement. You can now open the problem and send submissions.


# Quick start: CodeReview problem

## Statement and input type

In the `challenge.yml` file, modify the input type to be `CodeReview`. Now, change the statement to describe what you are trying to test. This is what the user will see.

## Test cases

For each comment, add these other two required fields to the testcases array:
```yaml
testcases:
    - id: TEST_1
      description: This is a rubric comment.
      maxPoints: 100
      newFileName: main.cpp     # <-------
      newFileCommentLine: 150   # <--------
```

## Workspace

Create a `before` and `after` folder structure.

## Publish

Now that you have made modifications to this challenge locally, built it a final time with `npm run devmatch -- validate` to make sure it builds and then commit and push your changes to the same branch. Now go to DevMatch and publish the version. Now you can go to the preview tab and open the problem, then send a submission.

