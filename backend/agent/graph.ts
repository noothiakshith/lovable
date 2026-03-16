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

        // First, ensure dependencies are installed
        console.log("📦 Installing dependencies...");
        const installResult = await sbx.commands.run("cd /home/user/app && npm install");
        if (installResult.exitCode !== 0) {
            console.error("❌ npm install failed:", installResult.stderr);
            throw new Error("Failed to install dependencies");
        }
        console.log("✅ Dependencies installed");

        // Kill any existing process on port 5173 (ignore errors)
        console.log("🧹 Cleaning up any existing processes...");
        try {
            await sbx.commands.run("pkill -f 'vite' || true");
            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (e) {
            // Ignore cleanup errors - process might not exist
            console.log("No existing processes to clean up");
        }

        // Start the dev server in background with proper working directory
        console.log("🚀 Starting Vite dev server...");
        const devServerCmd = await sbx.commands.run(
            "cd /home/user/app && npm run dev -- --host 0.0.0.0 --port 5173", 
            { background: true }
        );
        console.log(`Dev server started with PID: ${devServerCmd.pid}`);

        // Wait for the server to start (give it time to initialize)
        console.log("⏳ Waiting for server to start...");
        await new Promise(resolve => setTimeout(resolve, 8000));

        // Verify the server is running by checking the port
        let serverRunning = false;
        for (let i = 0; i < 15; i++) {
            try {
                const checkResult = await sbx.commands.run("curl -s http://localhost:5173 > /dev/null && echo 'running' || echo 'not running'");
                console.log(`Check attempt ${i + 1}: ${checkResult.stdout.trim()}`);
                if (checkResult.stdout.includes('running')) {
                    serverRunning = true;
                    console.log("✅ Server is responding!");
                    break;
                }
            } catch (e) {
                console.log(`Attempt ${i + 1}/15: Server not ready yet...`);
            }
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        if (!serverRunning) {
            // Check if there are any errors in the logs
            try {
                const logsCheck = await sbx.commands.run("ps aux | grep vite");
                console.log("Process check:", logsCheck.stdout);
            } catch (e) {
                console.log("Could not check process status");
            }
            console.warn("⚠️ Could not verify server is running via curl, but process may still be starting...");
        }

        const host = sbx.getHost(5173);
        const url = `https://${host}`;

        console.log(`\n✅ APP DEPLOYED: ${url}\n`);
        console.log(`📝 Note: If the app doesn't load immediately, wait 10-20 seconds for Vite to compile.\n`);

        return {
            messages: [new AIMessage(`Server started at: ${url}. The dev server is running in the background.`)],
            currentPhase: "end",
            sandbox: { ...state.sandbox, isDevServerRunning: true, previewUrl: url }
        };
    } catch (e) {
        console.error("❌ Deploy failed:", e);
        return { 
            messages: [new AIMessage(`Failed to start server: ${e}`)],
            currentPhase: "end",
            sandbox: { ...state.sandbox, isDevServerRunning: false }
        };
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