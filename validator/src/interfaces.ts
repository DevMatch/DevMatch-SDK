export class User {
  id: string
  name: string
  role: string
  email: string
  github: string
  last_login: string | null
  last_login_pretty: string | null
}

export class ProblemTestCase {
  public id: string
  public description: string
  public hint: string
  public maxPoints: number

  public constructor(init?: Partial<ProblemTestCase>) {
    Object.assign(this, init)
  }
}

export class CodeReviewTestCase extends ProblemTestCase {
  public newFileName: string
  public newFileCommentLine: number

  public constructor(init?: Partial<CodeReviewTestCase>) {
    super(init)
    Object.assign(this, init)
  }
}

export class EvaluatedTestCase extends ProblemTestCase {
  // After you have evaluated, you need to fill out these
  public actualPoints: number = 0
  public solved: boolean = false
  public verdictHint: string = ""

  constructor(testCase?: ProblemTestCase) {
    super(testCase)
  }
}


/**
 * Different configurations for this problem, the defaults are defined here.
 */
export class ProblemConfiguration {
  inputType: ProblemInputType = ProblemInputType.GitRepo
  ideEnabled: boolean = false
}

/**
 * Problems can accept user submisions in a variety of ways, including
 * pushing to a git repo, a url cotaining a website to test, a simple
 * text entry.
 */
export enum ProblemInputType {
  GitRepo,
  Url,
  CodeReview
}

export class ProblemOpenedMetadata {
  public databag: Map<string, string>
}

export class ProblemOpenedResult {
  opened: boolean
  databag: Map<string, string>
  instructions: string

  static OK: ProblemOpenedResult

  static {
    this.OK = new ProblemOpenedResult()
    this.OK.opened = true
  }

  constructor() {
    this.opened = false
    this.databag = new Map()
  }
}

export class ProblemPrerequisitesResult {
  opened: boolean;
  message: string | null;

  constructor(opened, message : string | null = null) {
    this.opened = opened;
    this.message = message;
  }
}


export interface DevMatchValidator {
  getTestCases(): Promise<ProblemTestCase[]>

  prerequesites(user: User): Promise<ProblemPrerequisitesResult>

  getProblemStatement(userId: string): Promise<string>;

  getProblemConfiguration(): Promise<ProblemConfiguration> ;

  openProblem(user: User): Promise<ProblemOpenedResult>

  validate( id: number, user: User, testCases: EvaluatedTestCase[], databag: Map<string, string>, validationInput?: any,): Promise<EvaluatedTestCase[]>
}


