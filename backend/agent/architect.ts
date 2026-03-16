import { ChatOpenAI } from "@langchain/openai"
import { ProjectState } from "./state"
import { HumanMessage, SystemMessage, AIMessage } from "@langchain/core/messages";
import { tools } from "./toolnode";
import { sanitizeMessages } from "./utils";

const llm = new ChatOpenAI({
  model: "mistralai/mistral-large-3-675b-instruct-2512",
  apiKey: process.env.NVIDIA_API_KEY,
  configuration: {
    baseURL: "https://integrate.api.nvidia.com/v1",
  },
  temperature: 0,
  maxRetries: 2,
}).bindTools(tools, {
  parallel_tool_calls: false,
})

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
    The User Request is :
    ${JSON.stringify(state.messages[0])}
    Task:
    1. Create a step-by-step plan to build the requested UI using React.
    2. Organize files inside src/components, src/hooks, etc.
    3. You must use Vite, React, and index.html standard entrypoint.
    4. NO EXTERNAL LIBRARIES: Do NOT use or plan for any external packages (e.g., NO react-router-dom, no lucide-react, no framer-motion, no radix-ui, no shadcn). Use only standard HTML elements and Tailwind CSS. For icons, use emojis or simple SVG paths. Everything MUST be in a single SPA without router libraries.
    5. INTEGRATION & SYNTAX: Ensure the architecture allows for seamless component integration with NO syntax errors or missing imports.
    6. ALWAYS use absolute paths starting with /home/user/app.
    7. You should not give any actual code, instead tell what that file needs to perform.
    In your response, use the Write_file tool to create a file named "plan.md" and write the plan in it.
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