import express from 'express'
import verifyUser from '../middleware'
import { prisma } from '../db'
import { HumanMessage } from "@langchain/core/messages";
import { app } from '../agent/graph'
import 'dotenv/config';
import { Sandbox } from '@e2b/code-interpreter';
const router = express.Router()
console.log("Project route module loaded");
import * as z from "zod"


const vitetest = `
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    allowedHosts: true
  }
})
`

const projecschema = z.object({
    title: z.string()
})

router.post('/create', verifyUser, async (req, res, next) => {
    const { title } = projecschema.parse(req.body);
    const sbx = await Sandbox.create('sathwik-dev');
    const sandboxId = sbx.sandboxId
    console.log(`Sandbox is created with id ${sandboxId}`);
    if (!req.userId) {
        console.log("User not found");
        return res.status(401).json({ message: "Unauthorized" });
    }
    console.log("Creating project for user:", req.userId);
    await prisma.project.create({
        data: {
            sandboxId: sandboxId,
            name: title,
            userId: req.userId
        }
    })
    await sbx.files.write('/home/user/app/vite.config.js', vitetest);
    const config = {
        configurable: {
            sandboxId: sandboxId,
            threadId: "test"
        },
        recursionLimit: 250
    }
    const initialState = {
        messages: [new HumanMessage(title)],
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
    }
    try {
        const result = await app.invoke(initialState, config);
        if (result.sandbox.previewUrl) {
            console.log(` ${result.sandbox.previewUrl}`);
        }
        else {
            console.log(" Agent finished, but no URL was returned.");
        }
        const files = await sbx.files.list('/home/user/app/src/components');
        console.log(" Generated Components:", files.map(f => f.path));
    }
    catch (e) {
        console.log(e)
    }
    return res.status(200).json(`https://5173-${sandboxId}.e2b.app`)
})

export default router