import { SystemMessage, HumanMessage, AIMessage, BaseMessage } from "@langchain/core/messages";
import { ProjectState } from "./state";
import { tools, toolNode } from "./toolnode";
import { ChatMistralAI } from "@langchain/mistralai";

const llm = new ChatMistralAI({
  model: "codestral-latest",
  apiKey: process.env.CODESTRAL_API_KEY,
  serverURL: "https://codestral.mistral.ai",
  temperature: 0,
  maxRetries: 2,
}).bindTools(tools);

const SYSTEM_PROMPT = `
You are a Senior React Developer. Your ONLY job is to write complete, working code into files.

ROOT DIRECTORY: /home/user/app

STRICT RULES:
1. First READ /home/user/app/plan.md to understand what files to build.
2. Use ONLY React (Vite) + Tailwind CSS. STRICTLY NO external packages, no lucide-react, no framer-motion, no radix-ui, no shadcn, no external icons. If you need icons, use emojis or hand-written SVG paths. No 'npm install' or 'bun add' allowed.
4. DESIGN AESTHETICS: You MUST build a visually stunning, premium UI with HEAVY Tailwind CSS.
   - Use EXTENSIVE Tailwind utility classes on almost every element.
   - Use vibrant, harmonious color palettes (e.g., bg-slate-900, text-emerald-400, ring-purple-500).
   - ALWAYS use smooth gradients (bg-gradient-to-r), glassmorphism (backdrop-blur-xl bg-white/10), and soft shadows (drop-shadow-2xl).
   - Add hover effects (hover:scale-105, hover:bg-opacity-80), transitions (transition-all duration-300), and active states.
   - Use clean, modern typography (tracking-wide, leading-relaxed) and generous padding (p-6, max-w-4xl). Do NOT build basic/ugly wireframes. MAKE IT LOOK EXPENSIVE.
5. ALL config files MUST use 'export default' syntax.
6. OVERWRITE every placeholder file with full, real, working code using Write_file.
30. MANDATORY files to overwrite:
   - src/App.jsx    (main app component)
   - src/main.jsx   (must import './index.css' and render App)
   - src/index.css  (must have @tailwind base/components/utilities)
   - Every component, hook, AND style file (.css, .module.css) listed in plan.md
32. DO NOT SKIP STYLE FILES. If plan.md lists CSS modules or style files, you MUST write them.
33. NEVER respond with "CODING COMPLETE" until you have manually checked off EVERY single file listed in plan.md and verified you have written it.
34. NEVER use empty strings for img src attributes (e.g., <img src="" />). If an image is needed, use a placeholder URL or a colored div.
35. If there are still empty placeholder files, you MUST write them.
`;

export const coder = async (state: ProjectState, config: any) => {
  console.log("--- Coder Node (self-contained loop) ---");

  let localMessages: BaseMessage[] = [];
  // Ensure we start with a human message from the state
  const firstMsg = state.messages[0];
  if (firstMsg instanceof HumanMessage) {
    localMessages.push(firstMsg);
  } else {
    localMessages.push(new HumanMessage("Build the requested application."));
  }

  const MAX_ROUNDS = 40;

  for (let round = 0; round < MAX_ROUNDS; round++) {
    console.log(`  [Coder] Round ${round + 1}/${MAX_ROUNDS}`);

    const lastMsg = localMessages[localMessages.length - 1];
    if (!lastMsg) continue;

    // Create a fresh instruction message for this round
    const instruction = round === 0
      ? "First, READ /home/user/app/plan.md. Then write the code for ALL files listed using the Write_file tool. You MUST write src/App.jsx, src/main.jsx, and src/index.css in addition to the components in the plan. Do NOT stop until EVERY file is fully implemented."
      : "Continue writing the code for the remaining files in plan.md. If EVERY file is fully implemented and no placeholders remain, respond with 'CODING COMPLETE'.";

    let msgsToSend: BaseMessage[] = [new SystemMessage(SYSTEM_PROMPT)];

    // Construct valid message sequence: [System, Human, AI, Tool, Human, AI, Tool, ...]
    // Mistral is very sensitive to 2 Humans or 2 AIs in a row.
    for (let i = 0; i < localMessages.length; i++) {
      const msg = localMessages[i];
      if (msg) {
        msgsToSend.push(msg);
      }
    }

    // Always append instruction as a Human message IF the last message was a Tool message or if we are at start
    if (lastMsg._getType() === "tool" || round === 0) {
      msgsToSend.push(new HumanMessage(instruction));
    }

    let response: BaseMessage;
    try {
      console.log(`  [Coder] Invoking LLM...`);
      response = await llm.invoke(msgsToSend);
      if (!response) {
        throw new Error("LLM returned an empty response.");
      }
      console.log(`  [Coder] AI response: ${response.content.slice(0, 100)}...`);
    } catch (error) {
      console.error(`  [Coder] LLM Invoke Error:`, error);
      throw error;
    }

    const aiResponse = response as AIMessage;
    const hasToolCalls = (aiResponse.tool_calls?.length ?? 0) > 0;

    if (!hasToolCalls) {
      console.log("  [Coder] ✅ Coding complete (LLM finished with no tool calls)");
      break;
    }

    // Add AI response to local history
    localMessages = [...localMessages, response];

    // Execute tools inline (Write_file, Read_file, etc.) — passes sandbox config
    const toolResult = await toolNode.invoke(
      { messages: localMessages },
      config
    );

    const toolMsgs = toolResult.messages as BaseMessage[];
    localMessages = [...localMessages, ...toolMsgs];

    console.log(`  [Coder] Executed ${toolMsgs.length} tool call(s) this round`);

    // Removed aggressive history truncation to ensure the LLM doesn't lose tool context.
    // The sequence of reads/writes needs to remain intact for it to complete all files.
  }

  return {
    messages: [new AIMessage("Coding phase complete. All files written with working code.")],
    currentPhase: "coding" as const,
  };
};