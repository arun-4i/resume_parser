import pdfParse from "pdf-parse";
import { OpenAI } from "openai";
import { config } from "@config/env";
import { logger } from "@utils/logger";
import { AppError } from "@utils/error";

export const resumeService = {
  async summarizeResume(
    pdfBuffer: Buffer,
    jobDescription: string,
  ): Promise<any> {
    try {
      // logger.info("api", "Extracting text from PDF");
      // const pdfData = await pdfParse(pdfBuffer);
      // const extractedText = pdfData.text;
      // const basePrompt = `You are a Senior Recruitment HR that evaluates a resume against a provided job description. Your task is to assess how well the candidate matches the job requirements, extract the necessary details from the resume, and return the evaluation in a structured format. Please follow the steps below:
      // 1. **Assess the candidate's profile** based on the following:
      //  - Education: Does the candidate meet the educational requirements for the job?
      //  - Experience: Does the candidate's experience align with the required level of experience?
      //  - Technical Skills: Does the candidate have the required technical skills? Mention any relevant skills not explicitly listed in the job description.
      //  - Soft Skills: Does the candidate demonstrate good soft skills like problem-solving, teamwork, and communication?
      //  - Additional Factors: Is there any additional experience, certifications, or other factors that enhance the candidate’s suitability for the role?
      //  3. **Rate the profile** on a scale of 1 to 10 based on how well it matches the job description. Consider all aspects like education, experience, skills, certifications, and overall relevance to the job. A 10/10 means the candidate is a perfect match, and a 1/10 means the candidate is a poor match.
      //  4. **Provide a JSON response** with the following format:
      //  {
      //  "rating": 9,  // The rating based on how well the candidate matches the JD
      //  // "content": "{Complete response here, including all evaluation details in a plain text format}"}`;

      // const prompt = `${basePrompt}\n\nResume Text:\n${extractedText}\n\nJob Description:\n${jobDescription}`;
      // // console.info("PROMPT: ", prompt);
      // logger.info("api", "Calling OpenAI API");
      // const openai = new OpenAI({ apiKey: config.OPENAI_API_KEY });
      // const response = await openai.chat.completions.create({
      //   model: config.OPENAI_MODEL || "gpt-4.1-mini-2025-04-14",
      //   messages: [
      //     { role: "system", content: basePrompt },
      //     { role: "user", content: prompt },
      //   ],
      //   max_tokens: 1024,
      // });
      // logger.info("api", "OpenAI API call successful");
      // const parsedContent = JSON.parse(response.choices[0].message.content as string);
      // const formattedResponse = {
      //   rating: parsedContent.rating,
      //   content: parsedContent.content,
      // };
      // console.info("PARSED CONTENT: ", formattedResponse);
      // return formattedResponse;
      const result =  {
        rating: 8,
        content:
          "The candidate, Arun V S, has a B.Tech in Information Technology with a CGPA of 7.8, which meets the educational requirements for the job. In terms of experience, Arun has relevant experience as a Web Developer Intern, where he worked on projects involving AWS, GraphQL, ReactJS, and TailWindCSS. Additionally, he has worked on various projects using technologies like Java, JavaScript, Python, ReactJS, NodeJS, and machine learning. Arun's technical skills align well with the job description, as he has experience with tools like AWS, GitHub, Docker, and Jenkins, although experience with some specific tools mentioned in the job description like Oracle Policy Automation, Drools, Kafka, OpenShift, etc., is not directly mentioned in the resume. In terms of soft skills, Arun demonstrates problem-solving, project management, communication, teamwork, and critical thinking skills. He also holds certifications in Data Structures and Algorithms and Python Programming. Overall, the candidate shows a good match for the position but lacks some specific technical experience required, hence the rating of 7 out of 10.",
      };
      return result;
    } catch (err: unknown) {
      logger.error("api", "Error in summarizeResume", { error: err });
     throw new AppError(
       err instanceof Error ? err.message : "Failed to summarize resume",
       500,
       "INTERNAL_ERROR",
       false,
       { originalError: err }
     );
    }
  },
};
