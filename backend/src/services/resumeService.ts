import pdfParse from "pdf-parse";
import { OpenAI } from "openai";
import { config } from "@config/env";
import { logger } from "@utils/logger";
import { AppError } from "@utils/error";

export const resumeService = {
  async summarizeResume(
    pdfBuffer: Buffer,
    jobDescription: string,
    email: string
  ): Promise<any> {
    try {
      logger.info("api", "Extracting text from PDF");
      // const pdfData = await pdfParse(pdfBuffer);
      // const extractedText = pdfData.text;
      // const basePrompt = `You are an AI-based assistant that evaluates a resume against a provided job description. Your task is to assess how well the candidate matches the job requirements, extract the necessary details from the resume, and return the evaluation in a structured format. Please follow the steps below:
      // 1. **Extract the email** from the resume. If the email is not available, return "Email Not Found".
      // 2. **Assess the candidate's profile** based on the following:
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
      //   model: config.OPENAI_MODEL || "gpt-3.5-turbo",
      //   messages: [
      //     { role: "system", content: basePrompt },
      //     { role: "user", content: prompt },
      //   ],
      //   max_tokens: 1024,
      // });
      // logger.info("api", "OpenAI API call successful");
      // console.info("RESPONSE: ", response.choices[0].message);
      const response = {
        content:
          '{\n    "rating": 8,\n    "content": "The candidate\'s profile is assessed as follows:\\n\\nEducation: The candidate holds a B.Tech in Information Technology with a CGPA of 7.8, which meets the educational requirements for the job.\\n\\nExperience: The candidate has experience as a Web Developer Intern at Clustrex, where they developed features using technologies like AWS, GraphQL, ReactJS, TailWindCSS, demonstrating practical experience relevant to the job.\\n\\nTechnical Skills: The candidate has proficiency in various programming languages like Java, JavaScript, Python, and technologies such as ReactJS, HTML, CSS, NodeJS, and databases like SQL and MongoDB. The candidate also has experience with tools like AWS and GitHub, aligning well with the job requirements. Additionally, the candidate possesses skills in Agile, Scrum, CI/CD, and other development practices\\n\\nSoft Skills: The candidate demonstrates good problem-solving skills, communication, and collaboration abilities as evidenced by their project work in optimizing app development processes and creating secure applications.\\n\\nAdditional Factors: The candidate has certifications in Data Structures and Algorithms and Python Programming. They also have experience in project management, competitive coding, and knowledge of security best practices, which further enhance their suitability for the role.\\n\\nOverall, the candidate\'s profile is strong, with a good educational background, relevant experience, technical skills, and certifications, aligning well with the job description. However, to further improve, the candidate could showcase more experience with frameworks like React and databases like MySQL or MongoDB. The rating provided is 8 out of 10."\n}',
      }; ;
      const parsedContent = JSON.parse(response.content);
      const formattedResponse = {
        email: email,
        rating: parsedContent.rating,
        content: parsedContent.content,
      };
      console.info("PARSED CONTENT: ", formattedResponse);
      // return response.choices[0].message;
      return formattedResponse;
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
