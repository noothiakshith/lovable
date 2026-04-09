import { ChatGoogleGenerativeAI } from "@langchain/google-genai"
import { ProjectState } from "./state"
import { HumanMessage, SystemMessage, AIMessage } from "@langchain/core/messages";
import { tools } from "./toolnode";
import { sanitizeMessages } from "./utils";

const llm = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  apiKey: process.env.GOOGLE_API_KEY,
  temperature: 0,
  maxRetries: 2,
}).bindTools(tools)

export const architect = async (state: ProjectState) => {
  console.log("Architect START");

  const systemPrompt = `
    You are a React Architect & Premium UI Designer. Your goal is to plan a clean, production-ready frontend using React Single Page App (Vite) and HEAVY Tailwind CSS.
    The project MUST stay inside: /home/user/app
    
    CRITICAL WARNING: 
    - NEVER use 'react-router-dom' or any other routing library. 
    - DO NOT create 'src/routes/', 'AppRoutes.jsx', or any routing configuration.
    - For navigation (e.g., Feed, Profile), use React state (e.g., const [view, setView] = useState('home')) and CONDITIONAL RENDERING in App.jsx.
    - If the user asks for multiple "pages", build them as separate components and switch between them using state.
    
    Current Directory Structure:
    ${JSON.stringify(state.fileSystem)}
    
    Task:
    1. READ /home/user/app/requirements.md to understand the project requirements
    2. Create a detailed technical plan based on the requirements
    3. Organize files inside src/components, src/hooks, etc.
    4. You must use Vite, React, and index.html standard entrypoint.
    5. NO EXTERNAL LIBRARIES: Do NOT use or plan for any external packages (e.g., NO react-router-dom, no lucide-react, no framer-motion, no radix-ui, no shadcn). Use only standard HTML elements and Tailwind CSS. For icons, use emojis or simple SVG paths. Everything MUST be in a single SPA without router libraries.
    6. INTEGRATION & SYNTAX: Ensure the architecture allows for seamless component integration with NO syntax errors or missing imports.
    7. ALWAYS use absolute paths starting with /home/user/app.
    8. You should not give any actual code, instead tell what that file needs to perform.
    
    In your response, use the Write_file tool to create a file named "plan.md" with the technical architecture plan.
  `;

  try {
    const safeMessages = sanitizeMessages(state.messages, 10);

    const messages = [
      new SystemMessage(systemPrompt),
      ...safeMessages.map((m: any) => {
        if (m.tool_calls?.length > 0 && !m.content) {
          return new AIMessage({
            content: "Processing tool execution...",
            tool_calls: m.tool_calls,
            id: m.id,
            additional_kwargs: m.additional_kwargs,
            response_metadata: m.response_metadata
          });
        }
        return m;
      })
    ];

    // Ensure the last message is a human message to avoid API errors
    const lastMsg = messages[messages.length - 1];
    if (lastMsg && lastMsg._getType() === "ai") {
      messages.push(new HumanMessage("Read the requirements.md file and create a detailed technical architecture plan in plan.md."));
    }

    const response = await llm.invoke(messages)
    return {
      messages: [response],
      currentPhase: "planning"
    }
  } catch (e: any) {
    console.error("Architect LLM Error:", e);
    if (e.response) {
      console.error("Response Data:", JSON.stringify(e.response.data || e.response, null, 2));
    }
    throw e;
  }
}