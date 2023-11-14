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

    async prerequesites(user: User) : Promise<ProblemPrerequisitesResult> {
        //
        // There are no pre-requisites for this problem.
        //
        return Promise.resolve(new ProblemPrerequisitesResult(true));
    }

    async getProblemStatement(userId: string): Promise<string> {
        const yaml = CHALLENGE_YAML_STRING 
        return Promise.resolve(yaml.statement)
    }

    /**
     * @returns An instance of the configuration object
     */
    async getProblemConfiguration(): Promise<ProblemConfiguration> {
        let config = new ProblemConfiguration();
        config.ideEnabled = false;
        config.inputType = ProblemInputType.GitRepo;
        return Promise.resolve(config);
    }

    /**
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


    async validate( id: number, user: User, testCases: EvaluatedTestCase[], databag: Map<string, string>, validationInput?: any,): Promise<EvaluatedTestCase[]> {
        for (let testCase of testCases) {
            testCase.actualPoints = testCase.maxPoints
            testCase.hint = 'here is a hint from the problem for case ' + testCase.id
            testCase.solved = true
        }
        return Promise.resolve(testCases);
    }
}

