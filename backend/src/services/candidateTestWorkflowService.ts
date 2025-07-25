import { logger } from "@utils/logger";
import { AppError } from "@utils/error";
import { ExternalQuizApiService } from "./externalQuizApiService";
import { MongoService } from "./mongoService";
import {
  WorkflowInput,
  WorkflowResult,
  CandidateRegistrationData,
  CandidateResult,
  TestGenerationData,
  TestSection,
  TestApplicant,
} from "@types/quizWorkflow";

export class CandidateTestWorkflowService {
  private externalQuizApiService: ExternalQuizApiService;
  private mongoService: MongoService;

  constructor(
    externalQuizApiService?: ExternalQuizApiService,
    mongoService?: MongoService
  ) {
    this.externalQuizApiService =
      externalQuizApiService || new ExternalQuizApiService();
    this.mongoService = mongoService || new MongoService();
  }

  async executeWorkflow(workflowData: WorkflowInput): Promise<WorkflowResult> {
    const workflowId = `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    logger.info("api", "Starting candidate test workflow execution", {
      workflowId,
      candidateEmail: workflowData.candidate.email,
      testName: workflowData.test.TEST_NAME,
      sectionsCount: workflowData.sections.length,
      sendEmail: workflowData.sendEmail,
    });

    const workflowSteps = {
      candidateRegistration: false,
      jwtTokenReset: false,
      topicValidation: false,
      testGeneration: false,
      emailNotification: false,
    };

    try {
      // Step 1: Register candidate
      logger.info("api", "Workflow Step 1: Candidate registration", {
        workflowId,
      });
      const candidateResult = await this.registerCandidate(
        workflowData.candidate
      );
      workflowSteps.candidateRegistration = true;

      logger.info("api", "Workflow Step 1 completed successfully", {
        workflowId,
        candidateId: candidateResult.CANDIDATE_ID,
      });

      // Step 2: Reset JWT token
      logger.info("api", "Workflow Step 2: JWT token reset", {
        workflowId,
        candidateId: candidateResult.CANDIDATE_ID,
      });
      await this.resetJwtToken(candidateResult.CANDIDATE_ID);
      workflowSteps.jwtTokenReset = true;

      logger.info("api", "Workflow Step 2 completed successfully", {
        workflowId,
        candidateId: candidateResult.CANDIDATE_ID,
      });

      // Step 3: Validate existing topics
      logger.info(
        "api",
        "Workflow Step 3: Topic validation using existing MongoDB topics",
        {
          workflowId,
          sectionsToValidate: workflowData.sections.length,
        }
      );
      await this.validateExistingTopics(workflowData.sections);
      workflowSteps.topicValidation = true;

      logger.info("api", "Workflow Step 3 completed successfully", {
        workflowId,
        validatedSections: workflowData.sections.length,
      });

      // Step 4: Generate test
      logger.info("api", "Workflow Step 4: Test generation", { workflowId });
      const testData = this.buildTestData(
        workflowData,
        candidateResult.CANDIDATE_ID
      );
      const testResult = await this.generateTest(testData);
      workflowSteps.testGeneration = true;

      logger.info("api", "Workflow Step 4 completed successfully", {
        workflowId,
        testId: testResult.testId,
      });

      // Step 5: Send email notification (optional)
      if (workflowData.sendEmail) {
        logger.info("api", "Workflow Step 5: Email notification", {
          workflowId,
        });
        await this.sendNotification(workflowData.candidate, testResult);
        workflowSteps.emailNotification = true;

        logger.info("api", "Workflow Step 5 completed successfully", {
          workflowId,
          recipientEmail: workflowData.candidate.email,
        });
      } else {
        logger.info(
          "api",
          "Workflow Step 5: Email notification skipped (sendEmail = false)",
          {
            workflowId,
          }
        );
        workflowSteps.emailNotification = true; // Mark as true since it was intentionally skipped
      }

      const successResult: WorkflowResult = {
        success: true,
        workflowId,
        candidateId: candidateResult.CANDIDATE_ID,
        testId: testResult.testId,
        message: "Candidate test workflow completed successfully",
        steps: workflowSteps,
      };

      logger.info("api", "Candidate test workflow completed successfully", {
        workflowId,
        candidateId: candidateResult.CANDIDATE_ID,
        testId: testResult.testId,
        totalSteps: Object.keys(workflowSteps).length,
        completedSteps: Object.values(workflowSteps).filter(Boolean).length,
      });

      return successResult;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown workflow error";
      const currentStep = this.getCurrentFailedStep(workflowSteps);

      logger.error("api", "Candidate test workflow failed", {
        workflowId,
        currentStep,
        error: errorMessage,
        completedSteps: workflowSteps,
      });

      const failureResult: WorkflowResult = {
        success: false,
        workflowId,
        candidateId: "", // May not be available if registration failed
        message: `Workflow failed at step: ${currentStep}`,
        steps: workflowSteps,
        error: {
          step: currentStep,
          message: errorMessage,
          details:
            error instanceof AppError
              ? error.details
              : { originalError: error },
        },
      };

      // Re-throw the error with workflow context
      throw new AppError(
        `Candidate test workflow failed: ${errorMessage}`,
        500,
        "WORKFLOW_EXECUTION_ERROR",
        true,
        failureResult
      );
    }
  }

  private async registerCandidate(
    candidateData: WorkflowInput["candidate"]
  ): Promise<CandidateResult> {
    try {
      const registrationData: CandidateRegistrationData = {
        FIRST_NAME: candidateData.firstName,
        EMAIL_ID: candidateData.email,
        MOBILE_NUM: candidateData.mobile,
      };

      logger.info("api", "Registering candidate with external Quiz API", {
        firstName: registrationData.FIRST_NAME,
        email: registrationData.EMAIL_ID,
      });

      const result =
        await this.externalQuizApiService.registerCandidate(registrationData);

      if (!result.CANDIDATE_ID) {
        throw new AppError(
          "Candidate registration failed: No candidate ID returned",
          400,
          "CANDIDATE_REGISTRATION_FAILED"
        );
      }

      return result;
    } catch (error) {
      logger.error("api", "Candidate registration failed", {
        error: error instanceof Error ? error.message : "Unknown error",
        candidateData: {
          firstName: candidateData.firstName,
          email: candidateData.email,
        },
      });
      throw error;
    }
  }

  private async resetJwtToken(candidateId: string): Promise<void> {
    try {
      logger.info("api", "Resetting JWT token for candidate", { candidateId });

      const result =
        await this.externalQuizApiService.resetJwtToken(candidateId);

      if (!result.success) {
        throw new AppError(
          `JWT token reset failed: ${result.message || "Unknown error"}`,
          400,
          "JWT_TOKEN_RESET_FAILED"
        );
      }
    } catch (error) {
      logger.error("api", "JWT token reset failed", {
        candidateId,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }

  //TODO: This is not used, hardcoded test-gen used as of now.
  private async validateExistingTopics(sections: TestSection[]): Promise<void> {
    try {
      logger.info("api", "Validating existing topics from MongoDB", {
        sectionsCount: sections.length,
        topics: sections.map((s) => ({
          topicId: s.TOPIC_ID,
          topicName: s.TOPIC_NAME,
        })),
      });

      // Create validation requests for all sections
      const validationRequests: any[] = sections.map((section) => ({
        topicId: section.TOPIC_ID,
        queryType: section.QUERY_TYPE,
        marksPerQuery: section.MARKS_PER_QUERY,
        requiredCount: section.NO_OF_QUERIES,
      }));

      // Validate all topics in parallel
      const validationResults =
        await this.mongoService.validateMultipleTopics(validationRequests);

      // Check for any validation failures
      const failedValidations = validationResults
        .map((result, index) => ({ result, section: sections[index] }))
        .filter(({ result }) => !result.isValid);

      if (failedValidations.length > 0) {
        const errorDetails = failedValidations.map(({ result, section }) => ({
          topicId: section.TOPIC_ID,
          topicName: section.TOPIC_NAME,
          queryType: section.QUERY_TYPE,
          marksPerQuery: section.MARKS_PER_QUERY,
          required: result.requiredCount,
          available: result.availableCount,
          shortage: result.requiredCount - result.availableCount,
        }));

        logger.error("api", "Topic validation failed for some sections", {
          failedValidationsCount: failedValidations.length,
          details: errorDetails,
        });

        throw new AppError(
          `Topic validation failed: Insufficient questions for ${failedValidations.length} topic(s)`,
          400,
          "INSUFFICIENT_QUESTIONS",
          true,
          { failedValidations: errorDetails }
        );
      }

      logger.info("api", "All topics validated successfully", {
        validatedTopics: sections.length,
      });
    } catch (error) {
      logger.error("api", "Topic validation failed", {
        sectionsCount: sections.length,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }

  //TODO: This is not used, hardcoded test-gen used as of now.
  private buildTestData(
    workflowData: WorkflowInput,
    candidateId: string
  ): TestGenerationData {
    const testApplicants: TestApplicant[] = [{ CANDIDATE_ID: candidateId }];

    // Map sections to required structure, providing defaults for missing fields
    const mappedSections = workflowData.sections.map((section, idx) => ({
      TEMP_SEC_ID: null,
      TOPIC_ID: section.TOPIC_ID,
      TOPIC_NAME: section.TOPIC_NAME,
      QUERY_TYPE: section.QUERY_TYPE,
      NO_OF_QUERIES: section.NO_OF_QUERIES,
      NO_OF_CHOICES: 0, // default, as not present in TestSection
      MARKS_PER_QUERY: section.MARKS_PER_QUERY,
      SR_NUM: idx + 1, // default sequence number
    }));

    const testGenerationData: TestGenerationData = {
      TEST: {
        ...workflowData.test,
        TEST_DATE: workflowData.test.TEST_DATE,
      },
      SECTION: mappedSections,
      APPLICANTS: testApplicants,
      SEND_MAIL: workflowData.sendEmail,
    };

    logger.info("api", "Built test generation data", {
      testName: testGenerationData.TEST.TEST_NAME,
      sectionsCount: testGenerationData.SECTION.length,
      applicantsCount: testGenerationData.APPLICANTS.length,
      sendMail: testGenerationData.SEND_MAIL,
    });

    return testGenerationData;
  }

  private async generateTest(
    testData: TestGenerationData
  ): Promise<{ testId: string; success: boolean }> {
    try {
      logger.info("api", "Generating test with external Quiz API", {
        testName: testData.TEST.TEST_NAME,
        sectionsCount: testData.SECTION.length,
      });

      const result = await this.externalQuizApiService.generateTest(testData);

      if (!result.success || !result.testId) {
        throw new AppError(
          `Test generation failed: ${result.message || "Unknown error"}`,
          400,
          "TEST_GENERATION_FAILED"
        );
      }

      return result;
    } catch (error) {
      logger.error("api", "Test generation failed", {
        testName: testData.TEST.TEST_NAME,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }

  private async sendNotification(
    candidate: WorkflowInput["candidate"],
    testResult: { testId: string; success: boolean }
  ): Promise<void> {
    try {
      logger.info("api", "Sending email notification to candidate", {
        candidateEmail: candidate.email,
        testId: testResult.testId,
      });

      // TODO: Implement email service integration
      // For now, we'll just log the notification
      logger.info("api", "Email notification sent successfully", {
        recipientEmail: candidate.email,
        testId: testResult.testId,
        note: "Email service integration pending - notification logged only",
      });
    } catch (error) {
      logger.error("api", "Email notification failed", {
        candidateEmail: candidate.email,
        testId: testResult.testId,
        error: error instanceof Error ? error.message : "Unknown error",
      });

      // For now, we won't fail the entire workflow if email fails
      // TODO: Decide if email failure should be critical or not
      logger.warn(
        "api",
        "Continuing workflow despite email notification failure"
      );
    }
  }

  private getCurrentFailedStep(workflowSteps: WorkflowResult["steps"]): string {
    if (!workflowSteps) {
      return "unknown";
    }

    if (!workflowSteps.candidateRegistration) {
      return "candidate_registration";
    }
    if (!workflowSteps.jwtTokenReset) {
      return "jwt_token_reset";
    }
    if (!workflowSteps.topicValidation) {
      return "topic_validation";
    }
    if (!workflowSteps.testGeneration) {
      return "test_generation";
    }
    if (!workflowSteps.emailNotification) {
      return "email_notification";
    }

    return "completion";
  }

  // Health check method
  async healthCheck(): Promise<{
    externalQuizApi: boolean;
    mongodb: boolean;
    overall: boolean;
  }> {
    try {
      logger.info("api", "Performing workflow service health check");

      const [externalQuizApiHealth, mongodbHealth] = await Promise.all([
        this.externalQuizApiService.healthCheck(),
        this.mongoService.healthCheck(),
      ]);

      const overall = externalQuizApiHealth && mongodbHealth;

      const healthStatus = {
        externalQuizApi: externalQuizApiHealth,
        mongodb: mongodbHealth,
        overall,
      };

      logger.info(
        "api",
        "Workflow service health check completed",
        healthStatus
      );

      return healthStatus;
    } catch (error) {
      logger.error("api", "Workflow service health check failed", {
        error: error instanceof Error ? error.message : "Unknown error",
      });

      return {
        externalQuizApi: false,
        mongodb: false,
        overall: false,
      };
    }
  }

  // Get service configuration
  getConfiguration() {
    return {
      externalQuizApi: this.externalQuizApiService.getConfiguration(),
      mongodb: this.mongoService.getConfiguration(),
    };
  }
}

// Export singleton instance
export const candidateTestWorkflowService = new CandidateTestWorkflowService();
