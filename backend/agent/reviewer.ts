import { SystemMessage, HumanMessage, AIMessage, BaseMessage } from "@langchain/core/messages";
import { ProjectState } from "./state";
import { ChatOpenAI } from "@langchain/openai";
import { tools } from "./toolnode";
import { Sandbox } from '@e2b/code-interpreter';
import { sanitizeMessages } from "./utils";

const llm = new ChatOpenAI({
    model: "mistralai/mistral-large-3-675b-instruct-2512",
    apiKey: process.env.NVIDIA_API_KEY,
    configuration: {
        baseURL: "https://integrate.api.nvidia.com/v1",
    },
    temperature: 0,
}).bindTools(tools, {
    parallel_tool_calls: false,
});

export const reviewerNode = async (state: ProjectState, config: any) => {
    console.log("\n---  Reviewer Node Started ---");

    const systemPrompt = `
    You are a QA / Build Engineer.
    
    YOUR RESPONSIBILITIES:
    1. If you haven't run the build yet, run: 'npm install && npm run build'
    2. Check the output:
       - If it SUCCEEDS: Respond with ONLY: "BUILD SUCCESSFUL"
       - If it FAILS: Analyze the error.
    
    CRITICAL RULES:
    - Do NOT try to fix the code files yourself. 
    - If the build fails, check if 'react-router-dom' was used. If so, EXPLICITLY TELL THE CODER to remove it and use state-based conditional rendering instead.
    - If the build fails, just explain the error in text. The Coder will fix it.
    - Do not loop. run the check once.
    `;

    const triggerMessage = new HumanMessage("Run the build / QA check now.");

    try {
        const response = await llm.invoke([
            new SystemMessage(systemPrompt),
            triggerMessage
        ]);

        console.log("🤖 Reviewer Thought:", response.content);

        const content = response.content as string;

        if (content.toUpperCase().includes("BUILD SUCCESSFUL")) {
            console.log("✅ Build Passed. Initializing Deployment...");

            try {
                const sandboxId = config.configurable.sandboxId;
                const sbx = await Sandbox.connect(sandboxId);

                console.log("🚀 Starting Vite Server...");
                await sbx.commands.run("npm run dev -- --host", { background: true });

                const host = sbx.getHost(5173);
                const url = `https://${host}`;

                console.log(`🌎 App is live at: ${url}`);

                return {
                    messages: [response, new AIMessage(`Server started at: ${url}`)],
                    currentPhase: "end",
                    sandbox: {
                        ...state.sandbox,
                        isDevServerRunning: true,
                        previewUrl: url
                    }
                };
            } catch (e) {
                console.error("❌ Deployment failed:", e);
                return {
                    messages: [response, new AIMessage(`Build passed but deployment failed: ${e}`)],
                    currentPhase: "review"
                };
            }
        }

        return {
            messages: [response],
            currentPhase: "review"
        };

    } catch (error) {
        console.error("❌ Reviewer LLM Error:", error);
        return {
            messages: [new AIMessage("Error in Reviewer Node. Retrying...")],
            currentPhase: "review"
        };
    }
};