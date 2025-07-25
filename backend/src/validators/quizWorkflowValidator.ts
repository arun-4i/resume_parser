import { z } from "zod";

// Base validation schemas
const objectIdSchema = z.string().length(24, "Invalid ObjectId format");
const emailSchema = z.string().email("Invalid email format");
const phoneSchema = z
  .string()
  .min(10, "Phone number must be at least 10 digits")
  .max(15, "Phone number too long");
const activeStatusSchema = z.enum(["Y", "N"]);

// Candidate Registration Validation
export const candidateRegistrationSchema = z.object({
  FIRST_NAME: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name too long")
    .regex(/^[a-zA-Z\s]+$/, "First name can only contain letters and spaces"),
  EMAIL_ID: emailSchema,
  MOBILE_NUM: phoneSchema,
});

export const candidateResultSchema = z.object({
  CANDIDATE_ID: z.string().min(1, "Candidate ID is required"),
  success: z.boolean().optional(),
  message: z.string().optional(),
});

// JWT Token Reset Validation
export const jwtTokenResetResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
});

// Test Section Validation
export const testSectionSchema = z.object({
  TOPIC_ID: z.string().min(1, "Topic ID is required"),
  TOPIC_NAME: z
    .string()
    .min(1, "Topic name is required")
    .max(100, "Topic name too long"),
  QUERY_TYPE: z.enum(["MCQ", "DESCRIPTIVE", "TRUE_FALSE", "FILL_BLANK"], {
    errorMap: () => ({ message: "Invalid query type" }),
  }),
  NO_OF_QUERIES: z
    .number()
    .int("Number of queries must be an integer")
    .min(1, "At least 1 question is required")
    .max(100, "Too many questions requested"),
  MARKS_PER_QUERY: z
    .number()
    .int("Marks per query must be an integer")
    .min(1, "Marks per query must be at least 1")
    .max(10, "Marks per query cannot exceed 10"),
});

// Test Data Validation
export const testDataSchema = z.object({
  TEST_NAME: z
    .string()
    .min(1, "Test name is required")
    .max(200, "Test name too long"),
  TEST_DESCRIPTION: z
    .string()
    .min(1, "Test description is required")
    .max(500, "Test description too long"),
  TEST_DATE: z.date({
    required_error: "Test date is required",
    invalid_type_error: "Invalid test date format",
  }),
  DURATION_MINUTES: z
    .number()
    .int("Duration must be an integer")
    .min(15, "Test duration must be at least 15 minutes")
    .max(480, "Test duration cannot exceed 8 hours")
    .optional(),
  TOTAL_MARKS: z
    .number()
    .int("Total marks must be an integer")
    .min(1, "Total marks must be at least 1")
    .optional(),
});

// Test Applicant Validation
export const testApplicantSchema = z.object({
  CANDIDATE_ID: z.string().min(1, "Candidate ID is required"),
});

// Test Generation Data Validation
export const testGenerationDataSchema = z.object({
  TEST: testDataSchema,
  SECTION: z
    .array(testSectionSchema)
    .min(1, "At least one test section is required")
    .max(10, "Too many test sections"),
  APPLICANTS: z
    .array(testApplicantSchema)
    .min(1, "At least one applicant is required")
    .max(100, "Too many applicants"),
  SEND_MAIL: z.boolean(),
});

// Test Result Validation
export const testResultSchema = z.object({
  testId: z.string().min(1, "Test ID is required"),
  success: z.boolean(),
  message: z.string().optional(),
  details: z.any().optional(),
});

// MongoDB Document Validation Schemas
export const topicSchema = z.object({
  _id: z.string(),
  TOPIC_ID: z.string().min(1, "Topic ID is required"),
  TOPIC_NAME: z.string().min(1, "Topic name is required"),
  DESCRIPTION: z.string().optional(),
  ACTIVE: activeStatusSchema,
  CREATED_DATE: z.date().optional(),
  UPDATED_DATE: z.date().optional(),
});

export const querySchema = z.object({
  _id: z.string(),
  QUERY_ID: z.string().min(1, "Query ID is required"),
  TOPIC_ID: z.string().min(1, "Topic ID is required"),
  QUERY_TYPE: z.string().min(1, "Query type is required"),
  MARKS_PER_QUERY: z.number().int().min(1),
  QUESTION_TEXT: z.string().min(1, "Question text is required"),
  OPTIONS: z.array(z.string()).optional(),
  CORRECT_ANSWER: z.string().optional(),
  ACTIVE: activeStatusSchema,
  DIFFICULTY_LEVEL: z.string().optional(),
  CREATED_DATE: z.date().optional(),
  UPDATED_DATE: z.date().optional(),
});

// Workflow Input Validation
export const workflowInputSchema = z.object({
  candidate: z.object({
    firstName: z
      .string()
      .min(1, "First name is required")
      .max(50, "First name too long")
      .regex(/^[a-zA-Z\s]+$/, "First name can only contain letters and spaces"),
    lastName: z
      .string()
      .max(50, "Last name too long")
      .regex(/^[a-zA-Z\s]*$/, "Last name can only contain letters and spaces")
      .optional(),
    email: emailSchema,
    mobile: phoneSchema,
  }),
  test: testDataSchema,
  sections: z
    .array(testSectionSchema)
    .min(1, "At least one test section is required")
    .max(10, "Too many test sections"),
  sendEmail: z.boolean(),
});

// Topic Validation Request Schema
export const topicValidationRequestSchema = z.object({
  topicId: z.string().min(1, "Topic ID is required"),
  queryType: z.string().min(1, "Query type is required"),
  marksPerQuery: z.number().int().min(1, "Marks per query must be at least 1"),
  requiredCount: z.number().int().min(1, "Required count must be at least 1"),
});

// Topic Validation Result Schema
export const topicValidationResultSchema = z.object({
  isValid: z.boolean(),
  availableCount: z.number().int().min(0),
  requiredCount: z.number().int().min(1),
  queries: z.array(querySchema).optional(),
});

// Workflow Result Validation
export const workflowResultSchema = z.object({
  success: z.boolean(),
  workflowId: z.string().min(1, "Workflow ID is required"),
  candidateId: z.string(),
  testId: z.string().optional(),
  message: z.string().min(1, "Message is required"),
  steps: z
    .object({
      candidateRegistration: z.boolean(),
      jwtTokenReset: z.boolean(),
      topicValidation: z.boolean(),
      testGeneration: z.boolean(),
      emailNotification: z.boolean(),
    })
    .optional(),
  error: z
    .object({
      step: z.string(),
      message: z.string(),
      details: z.any().optional(),
    })
    .optional(),
});

// Resume Controller Integration Schema
export const resumeWorkflowInputSchema = z.object({
  jobDescription: z.string().min(1, "Job description is required"),
  email: emailSchema,
  candidate: z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().optional(),
    mobile: phoneSchema,
  }),
  test: z.object({
    name: z.string().min(1, "Test name is required"),
    description: z.string().min(1, "Test description is required"),
    duration: z.number().int().min(15).max(480).optional(),
  }),
  topics: z
    .array(
      z.object({
        topicId: z.string().min(1, "Topic ID is required"),
        topicName: z.string().min(1, "Topic name is required"),
        queryType: z.enum(["MCQ", "DESCRIPTIVE", "TRUE_FALSE", "FILL_BLANK"]),
        numberOfQuestions: z.number().int().min(1).max(50),
        marksPerQuestion: z.number().int().min(1).max(10),
      })
    )
    .min(1, "At least one topic is required"),
  sendEmail: z.boolean().default(true),
});

// Data transformation schemas for external API compatibility
export const transformCandidateDataSchema = z
  .function()
  .args(workflowInputSchema.shape.candidate)
  .returns(candidateRegistrationSchema);

export const transformTestDataSchema = z
  .function()
  .args(
    workflowInputSchema.shape.test,
    z.string() // candidate ID
  )
  .returns(testGenerationDataSchema);

// Error validation schemas
export const externalApiErrorSchema = z.object({
  status: z.number().optional(),
  message: z.string(),
  endpoint: z.string().optional(),
  requestData: z.any().optional(),
  responseData: z.any().optional(),
});

export const mongoErrorSchema = z.object({
  message: z.string(),
  collection: z.string().optional(),
  operation: z.string().optional(),
  query: z.any().optional(),
});

// Configuration validation schemas
export const quizApiConfigSchema = z.object({
  baseURL: z.string().url("Invalid base URL"),
  timeout: z.number().int().min(1000, "Timeout must be at least 1 second"),
  retryAttempts: z.number().int().min(0).max(10, "Too many retry attempts"),
});

export const mongoConfigSchema = z.object({
  connectionString: z.string().min(1, "Connection string is required"),
  dbName: z.string().min(1, "Database name is required"),
  collections: z.object({
    topics: z.string().min(1),
    queries: z.string().min(1),
    candidates: z.string().min(1),
  }),
});

// Export type inference helpers
export type CandidateRegistrationInput = z.infer<
  typeof candidateRegistrationSchema
>;
export type TestGenerationInput = z.infer<typeof testGenerationDataSchema>;
export type WorkflowInput = z.infer<typeof workflowInputSchema>;
export type TopicValidationRequest = z.infer<
  typeof topicValidationRequestSchema
>;
export type TopicValidationResult = z.infer<typeof topicValidationResultSchema>;
export type WorkflowResult = z.infer<typeof workflowResultSchema>;
export type ResumeWorkflowInput = z.infer<typeof resumeWorkflowInputSchema>;
export type ExternalApiError = z.infer<typeof externalApiErrorSchema>;
export type MongoError = z.infer<typeof mongoErrorSchema>;
export type QuizApiConfig = z.infer<typeof quizApiConfigSchema>;
export type MongoConfig = z.infer<typeof mongoConfigSchema>;
