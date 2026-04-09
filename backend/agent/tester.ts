import { SystemMessage, HumanMessage, AIMessage, BaseMessage } from "@langchain/core/messages";
import { ProjectState } from "./state";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { tools, toolNode } from "./toolnode";

const llm = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  apiKey: process.env.GOOGLE_API_KEY,
  temperature: 0,
  maxRetries: 2,
}).bindTools(tools);

const SYSTEM_PROMPT = `
You are a QA Engineer and Test Automation Specialist.

ROOT DIRECTORY: /home/user/app

YOUR RESPONSIBILITIES:
1. Read requirements.md to understand what needs to be tested
2. Create comprehensive test files for the application
3. Write unit tests for components using Vitest and React Testing Library
4. Create integration tests for key user flows
5. Ensure all tests are runnable and follow best practices

TESTING SETUP:
- Use Vitest (already configured in package.json)
- Use @testing-library/react for component testing
- Use @testing-library/jest-dom for assertions
- Place test files in src/__tests__/ directory
- Name test files as ComponentName.test.jsx

TEST STRUCTURE:
- Test component rendering
- Test user interactions
- Test state changes
- Test edge cases
- Test accessibility

CRITICAL RULES:
1. Create src/__tests__/ directory first using Make_dir
2. Write test files using Write_file
3. Each major component should have a test file
4. Tests must be syntactically correct and runnable
5. Use proper imports and setup
6. After writing all tests, run: npm test -- --run
7. If tests fail, analyze and report the issues

When all tests are written and executed, respond with "TESTING COMPLETE" and a summary of results.
`;

export const testerNode = async (state: ProjectState, config: any) => {
  console.log("--- Testing Node (self-contained loop) ---");

  let localMessages: BaseMessage[] = [state.messages[0] || new HumanMessage("Create tests")];
  const MAX_ROUNDS = 20;

  for (let round = 0; round < MAX_ROUNDS; round++) {
    console.log(`  [Tester] Round ${round + 1}/${MAX_ROUNDS}`);

    const lastMsg = localMessages[localMessages.length - 1];
    if (!lastMsg) continue;

    const instruction = round === 0
      ? "Read requirements.md and create comprehensive test files for all components. Then run the tests using npm test -- --run."
      : "Continue writing tests or analyze test results. If all tests are written and executed, respond with 'TESTING COMPLETE'.";

    let msgsToSend: BaseMessage[] = [new SystemMessage(SYSTEM_PROMPT)];

    for (let i = 0; i < localMessages.length; i++) {
      const msg = localMessages[i];
      if (msg) {
        msgsToSend.push(msg);
      }
    }

    if (lastMsg._getType() === "tool" || round === 0) {
      msgsToSend.push(new HumanMessage(instruction));
    }

    let response: BaseMessage;
    try {
      console.log(`  [Tester] Invoking LLM...`);
      response = await llm.invoke(msgsToSend);
      if (!response) {
        throw new Error("LLM returned an empty response.");
      }
      console.log(`  [Tester] AI response: ${response.content.toString().slice(0, 100)}...`);
    } catch (error) {
      console.error(`  [Tester] LLM Invoke Error:`, error);
      throw error;
    }

    const aiResponse = response as AIMessage;
    const hasToolCalls = (aiResponse.tool_calls?.length ?? 0) > 0;

    // Check if testing is complete
    const content = response.content.toString().toUpperCase();
    if (!hasToolCalls && content.includes("TESTING COMPLETE")) {
      console.log("  [Tester] ✅ Testing complete");
      break;
    }

    if (!hasToolCalls) {
      console.log("  [Tester] ✅ Testing phase finished");
      break;
    }

    localMessages = [...localMessages, response];

    const toolResult = await toolNode.invoke(
      { messages: localMessages },
      config
    );

    const toolMsgs = toolResult.messages as BaseMessage[];
    localMessages = [...localMessages, ...toolMsgs];

    console.log(`  [Tester] Executed ${toolMsgs.length} tool call(s) this round`);
  }

  return {
    messages: [new AIMessage("Testing phase complete. All tests written and executed.")],
    currentPhase: "testing" as const,
  };
};
