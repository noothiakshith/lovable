import { HumanMessage } from "@langchain/core/messages";
import { app } from "./graph"; 
import 'dotenv/config';
import { Sandbox } from '@e2b/code-interpreter';

async function main() {
    console.log("Starting the Agent...");

    const sbx = await Sandbox.create('sathwik-dev', {
        timeoutMs: 20 * 60 * 1000 // 20 minutes in milliseconds
    });
    const sandboxId = sbx.sandboxId;
    console.log(`Sandbox Created: ${sandboxId} (timeout: 20 minutes)`);
    
    // Write vite.config.js with test configuration
    await sbx.files.write('/home/user/app/vite.config.js', `
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: false,
    hmr: {
      clientPort: 5173
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
  }
})
`);

    // Create test directory and setup file
    await sbx.files.makeDir('/home/user/app/src/test');
    await sbx.files.write('/home/user/app/src/test/setup.js', `
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

afterEach(() => {
  cleanup();
});
`);

    const config = {
        configurable: {
            sandboxId: sandboxId,
            threadId: "sdlc-session-1"
        },
        recursionLimit: 250
    };

    const initialState = {
        messages: [new HumanMessage("Create a fully frontend application like whatsapp using local storage and make sure use the best design and no other external libraries anything code from scrath urslef  ")],
        sandbox: {
            id: sandboxId,
            rootDir: "/home/user/app" as const,
            previewUrl: "",
            isDevServerRunning: false
        },
        directories: ["node_modules", "public", "src", "src/assets", "src/test"],
        fileSystem: [
            { path: "package.json", type: "file" as const },
            { path: "vite.config.js", type: "file" as const },
            { path: "src/App.jsx", type: "file" as const }
        ],
        iterationCount: 0,
        currentPhase: "requirements" as const
    };

    try {
        const result = await app.invoke(initialState, config);
        if (result.sandbox.previewUrl) {
            console.log(`${result.sandbox.previewUrl}`);
        } else {
            console.log("Agent finished, but no URL was returned.");
        }
        const files = await sbx.files.list('/home/user/app/src/components');
        console.log("Generated Components:", files.map(f => f.path));
    } catch (error) {
        console.error("❌ Graph Execution Error:", error);
    }
}

main();
