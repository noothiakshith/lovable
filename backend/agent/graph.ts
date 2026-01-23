import { START, StateGraph, END } from "@langchain/langgraph";
import { StateAnnotation, ProjectState } from "./state"; // Ensure ProjectState is imported
import { architect } from "./architect";
import { toolNode } from "./toolnode";
import { fileNode } from "./file";
import { coder } from "./coder";
import { AIMessage } from "@langchain/core/messages";
import { Sandbox } from '@e2b/code-interpreter';


const deployNode = async (state: ProjectState, config: any) => {
    console.log(" Starting Development Server...");
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
    .addNode("architect", architect)
    .addNode("file", fileNode)
    .addNode("coder", coder)
    .addNode("deployer", deployNode)
    .addNode("tools", toolNode)

    .addEdge(START, "architect")

    .addConditionalEdges("architect", (state) => {
        const lastMsg = state.messages[state.messages.length - 1];
        if ((lastMsg as AIMessage)?.tool_calls?.length) return "tools";
        return "file";
    })

    .addConditionalEdges("file", (state) => {
        const lastMsg = state.messages[state.messages.length - 1];
        if ((lastMsg as AIMessage)?.tool_calls?.length) return "tools";
        return "coder";
    })

    .addConditionalEdges("coder", (state) => {
        const lastMsg = state.messages[state.messages.length - 1];
        if ((lastMsg as AIMessage)?.tool_calls?.length) return "tools";
        
        return "deployer"; 
    })

    .addEdge("deployer", END)

    .addConditionalEdges("tools", (state) => {
        if (state.currentPhase === "planning") return "architect";
        if (state.currentPhase === "structure") return "file";
        return "coder";
    });

export const app = agent.compile();