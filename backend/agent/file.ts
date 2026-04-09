import { SystemMessage, HumanMessage, AIMessage, BaseMessage } from "@langchain/core/messages";
import { ProjectState } from "./state";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { tools, toolNode } from "./toolnode";
import { sanitizeMessages } from "./utils";

const llm = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    apiKey: process.env.GOOGLE_API_KEY,
    temperature: 0,
    maxRetries: 2,
}).bindTools(tools);

const SYSTEM_PROMPT = `
You are a Structural Engineer agent.

GOAL: Create the directory structure and EMPTY placeholder files based on 'plan.md'.

ROOT DIRECTORY: /home/user/app

RULES:
1. Read 'plan.md' first to understand required folders and files.
2. Use 'Make_dir' to create all necessary folders (src/components, src/hooks, etc.).
3. Use 'Write_file' to create placeholder files. Write ONLY "// Placeholder content" as the body.
4. You MUST overwrite 'src/App.jsx', 'src/main.jsx', and 'src/index.css' with the placeholder comment so they are marked for coding.
5. Do NOT overwrite 'package.json', 'vite.config.js', 'index.html', or 'tailwind.config.js' (or .cjs).
6. When ALL directories and files are created, respond ONLY with the text: "STRUCTURE COMPLETE"
`;

export const fileNode = async (state: ProjectState, config: any) => {
    console.log("--- File/Structure Node (self-contained loop) ---");

    // Start with just the original user request to keep context clean
    const originalRequest: BaseMessage = state.messages[0] ?? new HumanMessage("Build the project as planned.");
    let localMessages: BaseMessage[] = [originalRequest];

    const MAX_ROUNDS = 8;

    for (let round = 0; round < MAX_ROUNDS; round++) {
        console.log(`  [File] Round ${round + 1}/${MAX_ROUNDS}`);

        let msgsToSend = [
            new SystemMessage(SYSTEM_PROMPT),
            ...localMessages
        ];

        // Only append the HumanMessage prompt if the last message isn't a ToolMessage.
        // Mistral expects the assistant to reply immediately after tool results.
        const lastMsg = localMessages[localMessages.length - 1];
        if (!lastMsg || lastMsg._getType() !== "tool") {
            msgsToSend.push(
                new HumanMessage(
                    round === 0
                        ? "Read plan.md and execute the full file structure creation now."
                        : "Continue. Create any remaining directories and placeholder files, then say STRUCTURE COMPLETE."
                )
            );
        }

        let response: BaseMessage;
        try {
            console.log(`  [File] Invoking LLM... Messages array:`, JSON.stringify(msgsToSend.map(m => ({ type: m._getType(), content: m.content })), null, 2));
            response = await llm.invoke(msgsToSend);
            console.log(`  [File] LLM responded successfully.`);
        } catch (error) {
            console.error(`  [File] LLM Invoke Error:`, error);
            throw error;
        }

        const aiResponse = response as AIMessage;
        const hasToolCalls = (aiResponse.tool_calls?.length ?? 0) > 0;

        if (!hasToolCalls) {
            console.log("  [File] ✅ Structure complete (LLM finished with no tool calls)");
            break;
        }

        // Add the AI response (with tool_calls) to local history
        localMessages = [...localMessages, response];

        // Execute tools inline via ToolNode — pass config so sandbox ID is available
        const toolResult = await toolNode.invoke(
            { messages: localMessages },
            config
        );

        // Add tool results to local history for next round
        localMessages = [...localMessages, ...toolResult.messages];
        console.log(`  [File] Executed ${toolResult.messages.length} tool(s)`);
    }

    // Return a single summary message + advance phase to "coding"
    return {
        messages: [
            new AIMessage("File structure phase complete. All directories and placeholder files created."),
        ],
        currentPhase: "coding" as const,
    };
};