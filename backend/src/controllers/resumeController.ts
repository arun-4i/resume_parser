import type { Request, Response, Express } from "express";
import { resumeService } from "@services/resumeService";
import { ExternalQuizApiService } from "@services/externalQuizApiService";
import { logger } from "@utils/logger";
import { registry } from "@utils/swaggerRegistry";
import { summarySchema } from "@validators/resumeValidator";
import { AppError } from "@utils/error";

// Register schema for OpenAPI
registry.register("ResumeSummaryRequest", summarySchema);

const externalQuizApiService = new ExternalQuizApiService();

export const resumeSummaryController = {
  summary: async (req: Request, res: Response): Promise<void> => {
    console.info("req.body", req.body);
    const file = req.file as Express.Multer.File;
    const jobDescription = req.body.jobDescription;
    const email = req.body.email;

    console.info("req.body", req.body);
    
    logger.info("api", "Received resume summary request", {
      email,
      fileSize: file.buffer.length,
    });

    try {
      // Step 1: Process resume analysis
      logger.info("api", "Starting resume analysis", { email });
      const resumeResult = await resumeService.summarizeResume(
        file.buffer,
        jobDescription
      );

      logger.info("api", "Resume analysis completed", {
        email,
        rating: resumeResult.rating,
      });

      console.info("RESUME RESULT: ", resumeResult);

      // Step 2: Generate test only if rating > 7 and workflow enabled
      let testResult = null;
      if (resumeResult.rating > 7) {
        logger.info("api", "Rating > 7, proceeding with test generation", {
          email,
          rating: resumeResult.rating,
        });
        testResult = await generateTest(req.body);
      } else if (resumeResult.rating <= 7) {
        logger.info("api", "Rating <= 7, skipping test generation", {
          email,
          rating: resumeResult.rating,
        });
        testResult = {
          success: false,
          message: "Test not generated - rating must be > 7",
          rating: resumeResult.rating,
        };
      }

      // Prepare response
      const responseData = {
        resumeAnalysis: resumeResult,
        testGeneration: testResult,
        metadata: {
          ratingThresholdMet: resumeResult.rating > 7,
          timestamp: new Date().toISOString(),
          email,
        },
      };

      logger.info("api", "Resume summary request completed", {
        email,
        resumeRating: resumeResult.rating,
        testGenerated: testResult?.success,
      });

      res.json({
        success: true,
        data: responseData,
      });
    } catch (error) {
      logger.error("api", "Resume summary request failed", {
        error: error instanceof Error ? error.message : "Unknown error",
        email,
      });

      handleControllerError(error, res);
    }
  },
};

// Single function to handle complete test generation workflow
async function generateTest(requestBody: any): Promise<any> {
  const { email, phone, firstName } = requestBody;

  try {
    logger.info("api", "Starting test generation workflow", { email });

    // Step 1: Register candidate
    logger.info("api", "Step 1: Registering candidate", { email });
    const candidateData = {
      FIRST_NAME: firstName,
      EMAIL_ID: email,
      MOBILE_NUM: phone,
    };

    const registrationResult =
      await externalQuizApiService.registerCandidate(candidateData);
    const candidateId = registrationResult.CANDIDATE_ID;
    console.info("Candidate_ID: ", candidateId);

    logger.info("api", "Candidate registered successfully", {
      email,
      candidateId,
    });

    // Step 2: Reset JWT token using service
    logger.info("api", "Step 2: Resetting JWT token", { email, candidateId });
    await externalQuizApiService.resetJwtToken(candidateId);
    logger.info("api", "JWT token reset completed", { email, candidateId });

    // Step 3: Generate test with static payload (only CANDIDATE_ID is dynamic)
    logger.info("api", "Step 3: Generating test", { email, candidateId });
    const testData = {
      TEST: {
        TEMPLATE_ID: null,
        TEST_NAME: `Test_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        TEST_DESCRIPTION: "Sample test for the resume summariser",
        TEST_DATE: "2025-07-24T07:38:49.000+00:00",
        NO_OF_SECTIONS: 1,
        TEST_KEY_REQUIRED: "Y",
        RESTRICT_TIME: "N",
        TEST_METHOD: "657bd69bc69a56857195d5aa",
        DEPARTMENT: "67dd307a9734f3c11bfb1846",
        RETEST_COUNT: 1,
        TEST_DURATION: 10,
        TEST_TYPE: "6575a7ebb9343de71b3e6341",
        TEST_STATUS: "65af89eb6fdb8053fce2e59e",
        APPLY_MINUS_MARK: "N",
      },
      SECTION: [
        {
          TEMP_SEC_ID: null,
          TOPIC_ID: "682c57553fb8871a0e56dfaa",
          TOPIC_NAME: "JAVA",
          QUERY_TYPE: "657c7dfb0d63d9b4c097fd76",
          NO_OF_QUERIES: 20,
          NO_OF_CHOICES: 4,
          MARKS_PER_QUERY: 1,
          SR_NUM: 1,
        },
      ],
      APPLICANTS: [
        {
          CANDIDATE_ID: candidateId,
        },
      ],
      SEND_MAIL: true,
    };

    const testResult = await externalQuizApiService.generateTest(testData);

    logger.info("api", "Test generation completed successfully", {
      email,
      candidateId,
      testId: testResult.testId,
    });

    return {
      success: true,
      candidateId,
      testId: testResult.testId,
      message: "Test generated and email sent to candidate",
    };
  } catch (error) {
    logger.error("api", "Test generation workflow failed", {
      email,
      error: error instanceof Error ? error.message : "Unknown error",
    });

    return {
      success: false,
      error: {
        message:
          error instanceof Error ? error.message : "Test generation failed",
        step: error instanceof AppError ? error.details?.step : "unknown",
      },
    };
  }
}

function handleControllerError(error: unknown, res: Response): void {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      error: error.message,
      code: error.code,
      details: error.details,
    });
  } else if (
    error &&
    typeof error === "object" &&
    "status" in error &&
    "message" in error
  ) {
    res.status((error as any).status ?? 500).json({
      success: false,
      error: (error as any).message ?? "Internal Server Error",
    });
  } else {
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
}

export const resumeSummaryRouteConfig = {
  method: "post",
  path: "/summary",
  handler: resumeSummaryController.summary,
  schemas: {
    request: summarySchema,
  },
  summary: "Summarize resume using OpenAI",
  tags: ["Resume"],
  security: [{ bearerAuth: [] }],
  version: "1.0.0",
};

export const resumeRoutes = [resumeSummaryRouteConfig] as const;
