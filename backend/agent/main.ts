import { HumanMessage } from "@langchain/core/messages";
import { app } from "./graph"; 
import 'dotenv/config';
import { Sandbox } from '@e2b/code-interpreter';

async function main() {
    console.log("Starting the Agent...");

    const sbx = await Sandbox.create('sathwik-dev');
    const sandboxId = sbx.sandboxId;
    console.log(` Sandbox Created: ${sandboxId}`);
    await sbx.files.write('/home/user/app/vite.config.js', `
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    allowedHosts: true
  }
})
`)

    const config = {
        configurable: {
            sandboxId: sandboxId,
            threadId: "tic-tac-toe-session-1"
        },
        recursionLimit: 250
    };

    const initialState = {
        messages: [new HumanMessage("Create a fully frontend application like whatsapp using local storage and make sure use the best design and no other external libraries anything code from scrath urslef  ")],
        sandbox: {
            id: sandboxId,
            rootDir: "/home/user/app",
            previewUrl: "",
            isDevServerRunning: false
        },
        directories: ["node_modules", "public", "src", "src/assets"],
        fileSystem: [
            { path: "package.json", type: "file" },
            { path: "vite.config.js", type: "file" },
            { path: "src/App.jsx", type: "file" }
        ],
        iterationCount: 0,
        currentPhase: "planning"
    };

    try {
        const result = await app.invoke(initialState, config);
        if (result.sandbox.previewUrl) {
            console.log(` ${result.sandbox.previewUrl}`);
        } else {
            console.log(" Agent finished, but no URL was returned.");
        }
        const files = await sbx.files.list('/home/user/app/src/components');
        console.log(" Generated Components:", files.map(f => f.path));
    } catch (error) {
        console.error("❌ Graph Execution Error:", error);
    }
}

main();