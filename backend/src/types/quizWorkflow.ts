// External Quiz API Types

// Candidate Registration Types
export interface CandidateRegistrationData {
  FIRST_NAME: string;
  EMAIL_ID: string;
  MOBILE_NUM: string;
}

export interface CandidateResult {
  CANDIDATE_ID: string;
  CANDIDATE_TYPE: string,
  FIRST_NAME: string,
  EMAIL_ID: string,
  MOBILE_NUM: string,
  JWT_TOKEN: string | null,
  BATCH_NAME: string,
  CREATION_DATE: string,
  LAST_UPDATE_DATE: string
}

// JWT Token Reset Types
export interface JwtTokenResetResponse {
  success: boolean;
  message?: string;
}

// Test Generation Types
export interface TestSection {
  TOPIC_ID: string;
  TOPIC_NAME: string;
  QUERY_TYPE: string;
  NO_OF_QUERIES: number;
  MARKS_PER_QUERY: number;
}

export interface TestApplicant {
  CANDIDATE_ID: string;
}

export interface TestData {
  TEST_NAME: string;
  TEST_DESCRIPTION: string;
  TEST_DATE: Date;
  DURATION_MINUTES?: number;
  TOTAL_MARKS?: number;
}

export interface TestGenerationData {
  TEST: {
    TEMPLATE_ID: string | null;
    TEST_NAME: string;
    TEST_DESCRIPTION: string;
    TEST_DATE: string; // ISO timestamp
    NO_OF_SECTIONS: number;
    TEST_KEY_REQUIRED: string;
    RESTRICT_TIME: string;
    TEST_METHOD: string;
    DEPARTMENT: string;
    RETEST_COUNT: number;
    TEST_DURATION: number;
    TEST_TYPE: string;
    TEST_STATUS: string;
    APPLY_MINUS_MARK: string;
  };
  SECTION: {
    TEMP_SEC_ID: string | null;
    TOPIC_ID: string;
    TOPIC_NAME: string;
    QUERY_TYPE: string;
    NO_OF_QUERIES: number;
    NO_OF_CHOICES: number;
    MARKS_PER_QUERY: number;
    SR_NUM: number;
  }[];
  APPLICANTS: {
    CANDIDATE_ID: string;
  }[];
  SEND_MAIL: boolean;
};

export interface TestResult {
  testId: string;
  success: boolean;
  message?: string;
  details?: any;
}

// MongoDB Document Types

export interface Topic {
  _id: string;
  TOPIC_ID: string;
  TOPIC_NAME: string;
  DESCRIPTION?: string;
  ACTIVE: "Y" | "N";
  CREATED_DATE?: Date;
  UPDATED_DATE?: Date;
}

export interface Query {
  _id: string;
  QUERY_ID: string;
  TOPIC_ID: string;
  QUERY_TYPE: string;
  MARKS_PER_QUERY: number;
  QUESTION_TEXT: string;
  OPTIONS?: string[];
  CORRECT_ANSWER?: string;
  ACTIVE: "Y" | "N";
  DIFFICULTY_LEVEL?: string;
  CREATED_DATE?: Date;
  UPDATED_DATE?: Date;
}

export interface Candidate {
  _id: string;
  CANDIDATE_ID: string;
  FIRST_NAME: string;
  LAST_NAME?: string;
  EMAIL_ID: string;
  MOBILE_NUM: string;
  JWT_TOKEN?: string;
  ACTIVE: "Y" | "N";
  CREATED_DATE?: Date;
  UPDATED_DATE?: Date;
}

// Workflow Types

export interface WorkflowInput {
  candidate: {
    firstName: string;
    lastName?: string;
    email: string;
    mobile: string;
  };
  test: TestData;
  sections: TestSection[];
  sendEmail: boolean;
}

export interface WorkflowResult {
  success: boolean;
  workflowId: string;
  candidateId: string;
  testId?: string;
  message: string;
  steps?: {
    candidateRegistration: boolean;
    jwtTokenReset: boolean;
    topicValidation: boolean;
    testGeneration: boolean;
    emailNotification: boolean;
  };
  error?: {
    step: string;
    message: string;
    details?: any;
  };
}

// Service Method Types

export interface TopicValidationRequest {
  topicId: string;
  queryType: string;
  marksPerQuery: number;
  requiredCount: number;
}

export interface TopicValidationResult {
  isValid: boolean;
  availableCount: number;
  requiredCount: number;
  queries?: Query[];
}

// Error Types

export interface ExternalApiError {
  status?: number;
  message: string;
  endpoint?: string;
  requestData?: any;
  responseData?: any;
}

export interface MongoError {
  message: string;
  collection?: string;
  operation?: string;
  query?: any;
}

// Configuration Types

export interface QuizApiConfig {
  baseURL: string;
  timeout: number;
  retryAttempts: number;
}

export interface MongoConfig {
  connectionString: string;
  dbName: string;
  collections: {
    topics: string;
    queries: string;
    candidates: string;
  };
}
