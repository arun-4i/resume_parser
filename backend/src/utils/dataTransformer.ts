import { logger } from "@utils/logger";
import { AppError } from "@utils/error";
import {
  WorkflowInput,
  CandidateRegistrationData,
  TestGenerationData,
  TestSection,
  TestData,
  TestApplicant,
} from "../types/quizWorkflow";
import {
  workflowInputSchema,
  type ResumeWorkflowInput,
} from "@validators/quizWorkflowValidator";

export class DataTransformer {
  /**
   * Transform resume workflow input to standard workflow input format
   */
  static transformResumeWorkflowInput(
    resumeInput: ResumeWorkflowInput
  ): WorkflowInput {
    try {
      logger.info("api", "Transforming resume workflow input", {
        candidateEmail: resumeInput.email,
        testName: resumeInput.test.name,
        topicsCount: resumeInput.topics.length,
      });

      // Transform candidate data
      const candidate = {
        firstName: this.sanitizeString(resumeInput.candidate.firstName),
        lastName: resumeInput.candidate.lastName
          ? this.sanitizeString(resumeInput.candidate.lastName)
          : undefined,
        email: this.sanitizeEmail(resumeInput.email),
        mobile: this.sanitizePhone(resumeInput.candidate.mobile),
      };

      // Transform test data
      const testDate = new Date();
      testDate.setHours(testDate.getHours() + 1); // Schedule test 1 hour from now

      const test: TestData = {
        TEST_NAME: this.sanitizeString(resumeInput.test.name),
        TEST_DESCRIPTION: this.sanitizeString(resumeInput.test.description),
        TEST_DATE: testDate,
        DURATION_MINUTES: resumeInput.test.duration || 60, // Default 60 minutes
        TOTAL_MARKS: this.calculateTotalMarks(resumeInput.topics),
      };

      // Transform topics to sections
      const sections: TestSection[] = resumeInput.topics.map((topic) => ({
        TOPIC_ID: this.sanitizeString(topic.topicId),
        TOPIC_NAME: this.sanitizeString(topic.topicName),
        QUERY_TYPE: topic.queryType,
        NO_OF_QUERIES: topic.numberOfQuestions,
        MARKS_PER_QUERY: topic.marksPerQuestion,
      }));

      const workflowInput: WorkflowInput = {
        candidate,
        test,
        sections,
        sendEmail: resumeInput.sendEmail,
      };

      // Validate the transformed data
      const validatedInput = workflowInputSchema.parse(workflowInput);

      logger.info("api", "Resume workflow input transformed successfully", {
        candidateEmail: validatedInput.candidate.email,
        testName: validatedInput.test.TEST_NAME,
        sectionsCount: validatedInput.sections.length,
        totalMarks: validatedInput.test.TOTAL_MARKS,
      });

      return validatedInput;
    } catch (error) {
      logger.error("api", "Error transforming resume workflow input", {
        error: error instanceof Error ? error.message : "Unknown error",
        resumeInput: {
          email: resumeInput.email,
          testName: resumeInput.test.name,
        },
      });

      throw new AppError(
        `Failed to transform resume workflow input: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        400,
        "DATA_TRANSFORMATION_ERROR",
        true,
        { originalInput: resumeInput }
      );
    }
  }

  /**
   * Transform candidate data for external API registration
   */
  static transformCandidateForRegistration(
    candidate: WorkflowInput["candidate"]
  ): CandidateRegistrationData {
    try {
      logger.info("api", "Transforming candidate data for registration", {
        email: candidate.email,
        firstName: candidate.firstName,
      });

      const registrationData: CandidateRegistrationData = {
        FIRST_NAME: this.sanitizeString(candidate.firstName),
        EMAIL_ID: this.sanitizeEmail(candidate.email),
        MOBILE_NUM: this.sanitizePhone(candidate.mobile),
      };

      logger.info("api", "Candidate data transformed for registration", {
        firstName: registrationData.FIRST_NAME,
        email: registrationData.EMAIL_ID,
      });

      return registrationData;
    } catch (error) {
      logger.error(
        "api",
        "Error transforming candidate data for registration",
        {
          error: error instanceof Error ? error.message : "Unknown error",
          candidateEmail: candidate.email,
        }
      );

      throw new AppError(
        `Failed to transform candidate data: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        400,
        "CANDIDATE_TRANSFORMATION_ERROR"
      );
    }
  }

  /**
   * Build test generation data from workflow input
   */
  static buildTestGenerationData(
    workflowInput: WorkflowInput,
    candidateId: string
  ): TestGenerationData {
    try {
      logger.info("api", "Building test generation data", {
        testName: workflowInput.test.TEST_NAME,
        candidateId,
        sectionsCount: workflowInput.sections.length,
      });

      const testApplicants: TestApplicant[] = [{ CANDIDATE_ID: candidateId }];

      const testGenerationData: TestGenerationData = {
        TEST: {
          ...workflowInput.test,
          TEST_DATE: new Date(workflowInput.test.TEST_DATE),
        },
        SECTION: workflowInput.sections.map((section) => ({
          ...section,
          TOPIC_ID: this.sanitizeString(section.TOPIC_ID),
          TOPIC_NAME: this.sanitizeString(section.TOPIC_NAME),
        })),
        APPLICANTS: testApplicants,
        SEND_MAIL: workflowInput.sendEmail,
      };

      logger.info("api", "Test generation data built successfully", {
        testName: testGenerationData.TEST.TEST_NAME,
        sectionsCount: testGenerationData.SECTION.length,
        applicantsCount: testGenerationData.APPLICANTS.length,
      });

      return testGenerationData;
    } catch (error) {
      logger.error("api", "Error building test generation data", {
        error: error instanceof Error ? error.message : "Unknown error",
        candidateId,
        testName: workflowInput.test.TEST_NAME,
      });

      throw new AppError(
        `Failed to build test generation data: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        400,
        "TEST_DATA_TRANSFORMATION_ERROR"
      );
    }
  }

  /**
   * Extract candidate information from resume text using basic parsing
   */
  static extractCandidateFromResume(
    resumeText: string,
    providedEmail: string
  ): { firstName: string; lastName?: string; email: string; mobile: string } {
    try {
      logger.info("api", "Extracting candidate information from resume", {
        providedEmail,
        resumeTextLength: resumeText.length,
      });

      // Extract name (look for common patterns)
      const nameMatches = resumeText.match(
        /(?:Name|NAME)\s*:?\s*([A-Za-z\s]+)/i
      );
      let firstName = "Candidate";
      let lastName: string | undefined;

      if (nameMatches && nameMatches[1]) {
        const fullName = nameMatches[1].trim().split(/\s+/);
        firstName = fullName[0];
        if (fullName.length > 1) {
          lastName = fullName.slice(1).join(" ");
        }
      }

      // Extract phone number (look for various formats)
      const phonePatterns = [
        /(?:Phone|Mobile|Contact|Tel)\s*:?\s*([+]?[\d\s\-()]{10,15})/i,
        /([+]?\d{1,3}[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/,
        /([+]?\d{10,15})/,
      ];

      let mobile = "0000000000"; // Default fallback
      for (const pattern of phonePatterns) {
        const phoneMatch = resumeText.match(pattern);
        if (phoneMatch && phoneMatch[1]) {
          // Clean phone number (remove non-digits except +)
          const cleanPhone = phoneMatch[1].replace(/[^\d+]/g, "");
          if (cleanPhone.length >= 10) {
            mobile = cleanPhone;
            break;
          }
        }
      }

      const candidateInfo = {
        firstName: this.sanitizeString(firstName),
        lastName: lastName ? this.sanitizeString(lastName) : undefined,
        email: this.sanitizeEmail(providedEmail),
        mobile: this.sanitizePhone(mobile),
      };

      logger.info("api", "Candidate information extracted from resume", {
        firstName: candidateInfo.firstName,
        lastName: candidateInfo.lastName,
        email: candidateInfo.email,
        extractedPhone: mobile !== "0000000000",
      });

      return candidateInfo;
    } catch (error) {
      logger.error("api", "Error extracting candidate from resume", {
        error: error instanceof Error ? error.message : "Unknown error",
        providedEmail,
      });

      // Return fallback data if extraction fails
      return {
        firstName: "Candidate",
        email: this.sanitizeEmail(providedEmail),
        mobile: "0000000000",
      };
    }
  }

  /**
   * Generate default test configuration based on job description
   */
  static generateDefaultTestConfig(jobDescription: string): {
    test: { name: string; description: string; duration?: number };
    topics: Array<{
      topicId: string;
      topicName: string;
      queryType: "MCQ" | "DESCRIPTIVE" | "TRUE_FALSE" | "FILL_BLANK";
      numberOfQuestions: number;
      marksPerQuestion: number;
    }>;
  } {
    try {
      logger.info("api", "Generating default test configuration", {
        jobDescriptionLength: jobDescription.length,
      });

      // Extract technology keywords from job description
      const techKeywords = this.extractTechnicalKeywords(jobDescription);

      const testConfig = {
        test: {
          name: "Technical Assessment - Resume Based",
          description:
            "Technical assessment generated based on resume analysis and job requirements",
          duration: 90, // 90 minutes default
        },
        topics: [
          {
            topicId: "TECH_001", // Default topic ID
            topicName: "Technical Skills Assessment",
            queryType: "MCQ" as const,
            numberOfQuestions: 10,
            marksPerQuestion: 2,
          },
          {
            topicId: "PROG_001", // Default programming topic
            topicName: "Programming Concepts",
            queryType: "MCQ" as const,
            numberOfQuestions: 8,
            marksPerQuestion: 3,
          },
        ],
      };

      logger.info("api", "Default test configuration generated", {
        testName: testConfig.test.name,
        topicsCount: testConfig.topics.length,
        totalQuestions: testConfig.topics.reduce(
          (sum, topic) => sum + topic.numberOfQuestions,
          0
        ),
        extractedKeywords: techKeywords.slice(0, 5), // Log first 5 keywords
      });

      return testConfig;
    } catch (error) {
      logger.error("api", "Error generating default test configuration", {
        error: error instanceof Error ? error.message : "Unknown error",
      });

      // Return basic fallback configuration
      return {
        test: {
          name: "General Technical Assessment",
          description: "General technical assessment",
          duration: 60,
        },
        topics: [
          {
            topicId: "GEN_001",
            topicName: "General Technical Knowledge",
            queryType: "MCQ" as const,
            numberOfQuestions: 10,
            marksPerQuestion: 2,
          },
        ],
      };
    }
  }

  // Private utility methods

  private static sanitizeString(input: string): string {
    return input
      .trim()
      .replace(/[<>"/\\&]/g, "")
      .substring(0, 100);
  }

  private static sanitizeEmail(email: string): string {
    // Basic email sanitization
    return email.toLowerCase().trim();
  }

  private static sanitizePhone(phone: string): string {
    // Remove all non-digits except +
    const cleaned = phone.replace(/[^\d+]/g, "");
    // Ensure minimum length
    return cleaned.length >= 10 ? cleaned : "0000000000";
  }

  private static calculateTotalMarks(
    topics: ResumeWorkflowInput["topics"]
  ): number {
    return topics.reduce((total, topic) => {
      return total + topic.numberOfQuestions * topic.marksPerQuestion;
    }, 0);
  }

  private static extractTechnicalKeywords(jobDescription: string): string[] {
    const commonTechTerms = [
      "javascript",
      "python",
      "java",
      "react",
      "angular",
      "vue",
      "node",
      "express",
      "spring",
      "django",
      "flask",
      "sql",
      "mongodb",
      "mysql",
      "postgresql",
      "aws",
      "azure",
      "docker",
      "kubernetes",
      "git",
      "agile",
      "scrum",
      "ci/cd",
    ];

    const foundTerms: string[] = [];
    const lowerJobDesc = jobDescription.toLowerCase();

    for (const term of commonTechTerms) {
      if (lowerJobDesc.includes(term)) {
        foundTerms.push(term);
      }
    }

    return foundTerms;
  }
}

// Export utility functions for direct use
export const transformResumeWorkflowInput =
  DataTransformer.transformResumeWorkflowInput;
export const transformCandidateForRegistration =
  DataTransformer.transformCandidateForRegistration;
export const buildTestGenerationData = DataTransformer.buildTestGenerationData;
export const extractCandidateFromResume =
  DataTransformer.extractCandidateFromResume;
export const generateDefaultTestConfig =
  DataTransformer.generateDefaultTestConfig;
