import { DevMatchValidator, EvaluatedTestCase, ProblemConfiguration, ProblemInputType, ProblemOpenedResult, ProblemPrerequisitesResult, ProblemTestCase, User } from './interfaces'

import { GitHubPlugin } from './github'
import { LoggerPlugin } from './logger'
import { UnzipPlugin } from './unzip'
import { DevMatchGitServer } from './DevMatchGitServer'
import { StoragePlugin } from './s3'
import { AzureDevOpsPlugin } from "./devops";

import { CHALLENGE_YAML_STRING } from './challenge'

export class Validator implements DevMatchValidator{
    constructor(
      private githubPlugin: GitHubPlugin,
      private unzipPlugin: UnzipPlugin,
      private logger: LoggerPlugin,
      private gitServer: DevMatchGitServer,
      private storagePlugin: StoragePlugin,
      private devopsClient: AzureDevOpsPlugin){
    }

    /**
     * Gets the test cases as read from the Yaml file. If you want to
     * generate test cases using code you can do that here.
     * 
     * @returns A promise with the test cases from this problem.
     */
    async getTestCases(): Promise<ProblemTestCase[]> {
        const yaml = CHALLENGE_YAML_STRING
        let testCases : ProblemTestCase[] = []
        for (const testCase of testCases) {
            testCases.push(new ProblemTestCase({
                id: testCase.id,
                description: testCase.description,
                maxPoints: testCase.maxPoints
            }))
        }

        return Promise.resolve(testCases)
    }

    /**
     * Some problems have pre-requisites, such as having a GitHub profile
     * linked, or solving other problems, or anything. Most problems don't
     * have a pre-req. But you can add that here.
     * 
     * @param user The user opening the problem
     * @returns Wether the prerequistes have been satisfied or not.
     */
    async prerequesites(user: User) : Promise<ProblemPrerequisitesResult> {
        //
        // By default, there are no pre-requisites.
        //
        return Promise.resolve(new ProblemPrerequisitesResult(true));
    }

    /**
     * The statement is read from the Yaml in most cases and returned as is.
     * 
     * @param userId The user opening the problem.
     * @returns A string with the problem statement.
     */
    async getProblemStatement(userId: string): Promise<string> {
        return Promise.resolve(CHALLENGE_YAML_STRING.statement)
    }

    /**
     * @returns An instance of the configuration object
     */
    async getProblemConfiguration(): Promise<ProblemConfiguration> {
        const rawConfig = CHALLENGE_YAML_STRING.configuration;

        let config = new ProblemConfiguration();
        config.ideEnabled = rawConfig.find((config)=> config.ideEnabled !== undefined)?.ideEnabled || false;

        // The Yaml contains strings, turn that into types:
        const rawInputType =rawConfig.find((config)=> config.inputType !== undefined)?.inputType; 
        switch (rawInputType) {
            case 'GitRepo': config.inputType = ProblemInputType.GitRepo; break;
            case 'Url': config.inputType = ProblemInputType.Url; break;
            case 'CodeReview': config.inputType = ProblemInputType.CodeReview; break;
        }

        return Promise.resolve(config);
    }

    /**
     * Gets called when a user is opening this problem. The result contains a `databag`
     * in which you can add anything you want for this specific user. The contents of the
     * databag will get replaced in the statement.
     * 
     * @param user The user that is opening this problem
     * @returns A ProblemOpenedResult with information about the action of opening.
     */
    async openProblem(user: User): Promise<ProblemOpenedResult> {
        let openResult = new ProblemOpenedResult();
        openResult.opened = true;
        openResult.databag.set('date', new Date().getTime().toString())
        openResult.instructions = `These are instructions.`
        return Promise.resolve(openResult)
    }


    /**
     * As of right now, this is deprecated.
     */
    async validate( id: number, user: User, testCases: EvaluatedTestCase[], databag: Map<string, string>, validationInput?: any,): Promise<EvaluatedTestCase[]> {
        for (let testCase of testCases) {
            testCase.actualPoints = testCase.maxPoints
            testCase.hint = 'here is a hint from the problem for case ' + testCase.id
            testCase.solved = true
        }
        return Promise.resolve(testCases);
    }
}

