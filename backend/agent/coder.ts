import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { ProjectState } from "./state";
import { tools } from "./toolnode";
import { ChatMistralAI } from "@langchain/mistralai";

const llm = new ChatMistralAI({
  model: "mistral-large-latest",
  temperature: 0,
  maxRetries: 2,
}).bindTools(tools);

export const coder = async (state: ProjectState) => {
  console.log("--- Coder Node Started ---");
  
  const systemPrompt = `
    You are a Senior React Developer.
    
    CURRENT PHASE: CODING
    
    Your Goal: Convert the 'plan.md' into actual, working code.
    
    STRICT RULES:
    1. **READ plan.md** to know exactly which files to build.
    2. **OVERWRITE EVERYTHING**: The previous agent only created placeholders. You MUST overwrite them with real code using 'Write_file'.
    3. **MANDATORY OVERWRITES**: 
       - You MUST overwrite 'src/App.jsx' (The main game container).
       - You MUST overwrite 'src/index.css' (Add the @tailwind directives here!).
       - You MUST overwrite 'src/main.jsx' (Ensure it imports './index.css').
    4. STOP only when *every* file in the plan has valid React code.
    5. **TAILWIND CONFIGURATION**: Check 'tailwind.config.js'. 
       - You MUST ensure the 'content' array includes: "./src/**/*.{js,ts,jsx,tsx}".
       - If it is empty [], you MUST overwrite the file to fix it.
  `;

  const triggerMessage = new HumanMessage(
    "The file structure currently contains only placeholders. " + 
    "Please OVERWRITE 'src/App.jsx', 'src/main.jsx', 'src/index.css' and all components with the complete code now."
  );

  const response = await llm.invoke([
    new SystemMessage(systemPrompt),
    ...state.messages,
    triggerMessage
  ]);

  return {
    messages: [response],
    currentPhase: "coding"
  };
};