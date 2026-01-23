
import { ChatMistralAI } from "@langchain/mistralai"
import { ProjectState } from "./state"
import { HumanMessage, SystemMessage, AIMessage } from "@langchain/core/messages";
import { tools } from "./toolnode";

const llm = new ChatMistralAI({
  model: "mistral-large-latest",
  temperature: 0,
  maxRetries: 2,
}).bindTools(tools)

export const architect = async (state: ProjectState) => {
  console.log("Architect START");
  console.log("Architect Messages:", JSON.stringify(state.messages, null, 2));


  const systemPrompt = `
    You are a React Architect. Your goal is to plan a clean, production-ready frontend.
    The project MUST stay inside: /home/user/app
    
    Current Directory Structure:
    ${JSON.stringify(state.fileSystem)}
    The User Request is :
    ${JSON.stringify(state.messages[0])}
    Task:
    1. Create a step-by-step plan to build the requested UI.
    2. Organize files neatly (e.g., src/components, src/hooks).
    3. ALWAYS use absolute paths starting with /home/user/app.
    4. you should not give any code instead tell what that file needs to perform
    In this use the write tool and create a file named plan.md and write the plan in it.
  `;
  try {
    const messages = [
      new SystemMessage(systemPrompt),
      ...state.messages.map((m: any) => {
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