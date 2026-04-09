import { SystemMessage, HumanMessage, AIMessage } from "@langchain/core/messages";
import { ProjectState } from "./state";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

const llm = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  apiKey: process.env.GOOGLE_API_KEY,
  temperature: 0,
  maxRetries: 2,
});

const SYSTEM_PROMPT = `
You are a Business Analyst and Requirements Engineer.

GOAL: Analyze the user's request and provide comprehensive requirements.

YOUR RESPONSIBILITIES:
1. Analyze the user's request thoroughly
2. Identify functional requirements (what the app should do)
3. Identify non-functional requirements (performance, usability, design)
4. Define user stories and acceptance criteria
5. List all required features and components
6. Document technical constraints (no external libraries, React + Vite + Tailwind only)

OUTPUT FORMAT:
Provide a detailed requirements document with the following sections:
- Project Overview
- Functional Requirements (numbered list)
- Non-Functional Requirements
- User Stories
- Technical Constraints
- Features List
- Component Structure (high-level)

IMPORTANT: Respond with the complete requirements document in your message. Do NOT use any tools.
`;

export const requirementsNode = async (state: ProjectState, config: any) => {
  console.log("--- Requirements Gathering Node ---");

  const userRequest = state.messages[0] || new HumanMessage("Create an application");

  try {
    const messages = [
      new SystemMessage(SYSTEM_PROMPT),
      userRequest,
      new HumanMessage("Analyze the user's request and provide a comprehensive requirements document. Respond with the full document in your message.")
    ];

    const response = await llm.invoke(messages);
    
    console.log("✅ Requirements gathered");

    // Write the requirements to a file using the sandbox
    const sandboxId = config?.configurable?.sandboxId;
    if (sandboxId) {
      const { Sandbox } = await import('@e2b/code-interpreter');
      const sbx = await Sandbox.connect(sandboxId);
      await sbx.files.write('/home/user/app/requirements.md', response.content.toString());
      console.log("✅ Requirements written to requirements.md");
    }

    return {
      messages: [response],
      currentPhase: "planning" as const,
    };
  } catch (e: any) {
    console.error("Requirements Node Error:", e);
    throw e;
  }
};
