# Candidate Test Workflow Implementation Plan

## Overview

Simple implementation of candidate test workflow using external Quiz API endpoints. Test generation should only occur if the LLM rating response is > 7 (out of 10).

## Updated Flow from quiz_app_flow.md

1. **Rating Condition**: Only proceed if resume rating > 7
2. **Register Candidate**: POST `http://172.16.1.141/candidateonlinetest/api/candidate/post`
3. **Reset JWT Token**: GET `http://172.16.1.141/onlinetest/api/candidates/delete-jwt-token?CANDIDATE_ID=${CANDIDATE_ID}`
4. **Generate Test**: POST `http://172.16.1.141/onlinetest/api/testgeneration/` with static payload

## Implementation Approach

Create a single `generateTest` function in the resume controller that:

- Checks if rating > 7 before proceeding
- Takes candidate data directly from req.body
- Follows the 3-step API workflow

## Implementation Status

### ✅ Phase 1: Updated Plan & Analysis

- [x] Review updated quiz_app_flow.md
- [x] Update task plan with rating condition
- [x] Plan single function approach

### ✅ Phase 2: Implementation (COMPLETED)

- [x] Create single `generateTest` function in resumeController
- [x] Add rating condition check (> 7)
- [x] Implement 3-step API workflow:
  1. Register candidate
  2. Reset JWT token (GET request with query param)
  3. Generate test with static payload (only CANDIDATE_ID dynamic)
- [x] Remove environment variable logic and hardcode API URLs
- [ ] Test basic workflow

### ⏳ Phase 3: Future Enhancements

- [ ] Add proper error handling
- [ ] Add validation
- [ ] Swagger documentation

## Technical Details

### API Endpoints (Hardcoded Implementation)

1. **Register**: `POST http://172.16.1.141/candidateonlinetest/api/candidate/post`
2. **JWT Reset**: `GET http://172.16.1.141/onlinetest/api/candidates/delete-jwt-token?CANDIDATE_ID=${CANDIDATE_ID}`
3. **Test Gen**: `POST http://172.16.1.141/onlinetest/api/testgeneration/`

**Note**: URLs are now hardcoded in the service, no environment variables needed.

### Request Body Structure

```json
{
  "file": "resume.pdf",
  "jobDescription": "job description text",
  "email": "candidate@example.com",
  "phone": "1234567890",
  "firstName": "John",
  "enableWorkflow": true
}
```

### Test Generation Payload Schema

!!NOTE:
We only need to append the

```json
 "CANDIDATE_ID": "6875fc30a67a87548506f38a"
```

~Rest of that data can remain as it is for now.

```json
{
  "TEST": {
    "TEMPLATE_ID": "64f91d12a4e2fa001245e999",
    "TEST_NAME": "Resume Summariser Sample test",
    "TEST_DESCRIPTION": "Sample test for the resume summariser",
    "TEST_DATE": "2025-07-15T07:38:49.000+00:00",
    "NO_OF_SECTIONS": 1,
    "TEST_KEY_REQUIRED": "Y",
    "RESTRICT_TIME": "N",
    "TEST_METHOD": "Online",
    "DEPARTMENT": "Engineering",
    "RETEST_COUNT": 1,
    "TEST_DURATION": 10,
    "TEST_TYPE": "MCQ",
    "TEST_STATUS": "Active",
    "APPLY_MINUS_MARK": "Y"
  },
  "SECTION": [
    {
      "TEMP_SEC_ID": null,
      "TOPIC_ID": "682c57553fb8871a0e56dfaa",
      "TOPIC_NAME": "JAVA",
      "QUERY_TYPE": "657c7dfb0d63d9b4c097fd76",
      "NO_OF_QUERIES": 20,
      "NO_OF_CHOICES": 4,
      "MARKS_PER_QUERY": 1
    }
  ],
  "APPLICANTS": [
    {
      "CANDIDATE_ID": "6875fc30a67a87548506f38a" //need to append this only
    }
  ],
  "SEND_MAIL": true
}
```

### Rating Condition

- Only generate test if `resumeResult.rating > 7`
- Rating is out of 10 from OpenAI LLM response

## Current Focus

✅ **COMPLETED**: Single `generateTest` function implemented with rating check and 3-step workflow.

## Next Actions

1. ✅ Create `generateTest` function in resumeController
2. ✅ Add rating > 7 condition check
3. ✅ Implement 4-step API workflow
4. 🔄 Test end-to-end functionality

## Implementation Summary

- Single `generateTest` function created in `resumeController.ts`
- Rating condition: Only generates test if resume rating > 7 out of 10
- 3-step workflow implemented following quiz_app_flow.md:
  1. Register candidate via POST API
  2. Reset JWT token via GET API with query parameter
  3. Generate test with static payload (only CANDIDATE_ID is dynamic)
- **Hardcoded API URLs**: Removed environment variable logic
  - Candidate API: `http://172.16.1.141/candidateonlinetest/api/`
  - Test API: `http://172.16.1.141/onlinetest/api/`
- Clean response structure with rating threshold information
- Simplified approach: No MongoDB topic fetching, uses static test configuration
- Ready for testing!
