import { START, StateGraph, END } from "@langchain/langgraph";
import { StateAnnotation, type ProjectState } from "./state";
import { architect } from "./architect";
import { toolNode } from "./toolnode";
import { fileNode } from "./file";
import { coder } from "./coder";
import { AIMessage } from "@langchain/core/messages";
import { Sandbox } from '@e2b/code-interpreter';


const deployNode = async (state: ProjectState, config: any) => {
    console.log("🚀 Starting Development Server...");
    try {
        const sandboxId = config.configurable.sandboxId;
        const sbx = await Sandbox.connect(sandboxId);

        await sbx.commands.run("npm run dev -- --host", { background: true });

        const host = sbx.getHost(5173);
        const url = `https://${host}`;

        console.log(`\n✅ APP DEPLOYED: ${url}\n`);

        return {
            messages: [new AIMessage(`Server started at: ${url}`)],
            currentPhase: "end",
            sandbox: { ...state.sandbox, isDevServerRunning: true, previewUrl: url }
        };
    } catch (e) {
        console.error("Deploy failed:", e);
        return { messages: [new AIMessage("Failed to start server")] };
    }
};

const agent = new StateGraph(StateAnnotation)
    .addNode("architect", architect)   // plans → writes plan.md via tools
    .addNode("tools", toolNode)        // only used by architect now
    .addNode("file", fileNode)         // self-contained: creates dirs + placeholder files
    .addNode("coder", coder)           // self-contained: writes all real code
    .addNode("deployer", deployNode)   // starts dev server

    .addEdge(START, "architect")

    // Architect loops through tools to write plan.md
    .addConditionalEdges("architect", (state) => {
        const lastMsg = state.messages[state.messages.length - 1];
        if ((lastMsg as AIMessage)?.tool_calls?.length) return "tools";
        return "file";
    })

    // Tools only routes back to architect (planning phase)
    .addEdge("tools", "architect")

    // File node is self-contained — always proceeds to coder
    .addEdge("file", "coder")

    // Coder is self-contained — always proceeds to deployer
    .addEdge("coder", "deployer")

    .addEdge("deployer", END);

export const app = agent.compile();