# 📝 Candidate Online Test API Guide

---

## ✅ 1. Register Candidate

**URL:**  
POST `http://172.16.1.141/candidateonlinetest/api/candidate/post`

**📦 Payload (JSON):**
```json
{
  "FIRST_NAME": "name",
  "EMAIL_ID": "email",
  "MOBILE_NUM": "9876543210"
}
📨 Response:
Returns the CANDIDATE_ID as JSON.

🔐 2. Set JWT Token to Empty
URL:
GET `http://172.16.1.141/onlinetest/api/candidates/delete-jwt-token?CANDIDATE_ID=${CANDIDATE_ID}`

📌 Usage:
Use the CANDIDATE_ID as a payload to set the JWT token to " ".
Just hit the endpoint and the JWT will be reset to an empty string.

🔗 Connection String (MongoDB):

URL: `mongodb://onlinetestinternal:onlinetestpassword4i@172.16.1.141:28018/onlinetestinternal`

🧪 3. Test Generation
URL:
POST: `http://172.16.1.141/onlinetest/api/testgeneration/

📦 Sample Payload Schema (Zod):

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
      "CANDIDATE_ID": "6875fc30a67a87548506f38a"// registered candidate's CANDIDATE_ID
    },
  ],
  "SEND_MAIL": true
}

📬 Result:
Test will be generated ✅
📧 Mail will be sent to the candidate 📩
🧑‍💻 Candidate will take the test
📊 Results can be viewed in the Admin Portal