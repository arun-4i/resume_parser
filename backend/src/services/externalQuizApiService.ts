import axios from "axios";
import { logger } from "@utils/logger";
import {
  CandidateRegistrationData,
  CandidateResult,
  JwtTokenResetResponse,
  TestGenerationData,
  TestResult,
} from "../types/quizWorkflow";

export class ExternalQuizApiService {
  async registerCandidate(
    candidateData: CandidateRegistrationData
  ): Promise<CandidateResult> {
    logger.info("api", "Registering candidate with external Quiz API", {
      firstName: candidateData.FIRST_NAME,
      email: candidateData.EMAIL_ID,
      mobile: candidateData.MOBILE_NUM,
    });

    const response = await axios.post(
      `http://172.16.1.141/candidateonlinetest/api/candidate/post`,
      candidateData);

    const data = response.data as CandidateResult;
    logger.info("api", "Candidate registration successful", {
      candidateId: data.CANDIDATE_ID,
    });

    return data;
  }

  async resetJwtToken(candidateId: string): Promise<JwtTokenResetResponse> {
    logger.info("api", "Resetting JWT token for candidate", {
      candidateId,
    });

    console.info("Resetting JWT token for candidate", {
      candidateId,
    });
    const response = await axios.get(
      `http://172.16.1.141/onlinetest-noauth/api/candidates/delete-jwt-token?CANDIDATE_ID=${candidateId}`
    );

    const data = response.data as JwtTokenResetResponse;
    logger.info("api", "JWT token reset successful", {
      candidateId,
      success: data.success,
    });

    return data;
  }

  async generateTest(testData: TestGenerationData): Promise<TestResult> {
    logger.info("api", "Generating test with external Quiz API", {
      testName: testData.TEST.TEST_NAME,
      sectionsCount: testData.SECTION.length,
      applicantsCount: testData.APPLICANTS.length,
      sendMail: testData.SEND_MAIL,
    });

    const response = await axios.post(
      `http://172.16.1.141/onlinetest-noauth/api/testgeneration/`,testData);

    const data = response.data as TestResult;
    logger.info("api", "Test generation successful", {
      testId: data.testId,
      success: data.success,
    });

    return data;
  }
}

// Export singleton instance
export const externalQuizApiService = new ExternalQuizApiService();
