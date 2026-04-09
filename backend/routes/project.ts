import express from 'express'
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
`;

const tailwindConfig = `
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
`;

const projecschema = z.object({
    title: z.string()
})

router.post('/create', async (req, res, next) => {
    const { title } = projecschema.parse(req.body);
    const sbx = await Sandbox.create('sathwik-dev');
    const sandboxId = sbx.sandboxId
    console.log(`Sandbox is created with id ${sandboxId}`);
    
    // Using a default user ID for now (no auth)
    const defaultUserId = "d124a9e0-b23b-4819-89b1-289453f41371";
    console.log("Creating project for user:", defaultUserId);
    const project = await prisma.project.create({
        data: {
            sandboxId: sandboxId,
            name: title,
            userId: defaultUserId
        }
    })
    await sbx.files.write('/home/user/app/vite.config.js', vitetest);
    await sbx.files.write('/home/user/app/tailwind.config.js', tailwindConfig);
    const config = {
        configurable: {
            sandboxId: sandboxId,
            threadId: "test"
        },
        recursionLimit: 250
    }
    const initialState: any = {
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
        const saveFilesToDb = async (dirPath: string) => {
            const entries = await sbx.files.list(dirPath);
            for (const entry of entries) {
                if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
                // @ts-ignore
                const isDir = entry.isDirectory || entry.type === 'dir'
                if (isDir) {
                    await saveFilesToDb(entry.path);
                } else {
                    const binaryExtensions = ['.ico', '.png', '.jpg', '.jpeg', '.svg', '.woff', '.woff2', '.ttf', '.eot', '.webm', '.mp4'];
                    if (binaryExtensions.some(ext => entry.name.toLowerCase().endsWith(ext))) {
                        continue;
                    }

                    try {
                        let content = await sbx.files.read(entry.path);
                        let safeContent = "";

                        if (typeof content === 'string') {
                            safeContent = content.replace(/\0/g, '');
                        } else if (Buffer.isBuffer(content) || (content as any) instanceof Uint8Array) {
                            safeContent = Buffer.from(content as any).toString('utf8').replace(/\0/g, '');
                        } else {
                            safeContent = String(content).replace(/\0/g, '');
                        }

                        const relativePath = entry.path.replace('/home/user/app/', '');
                        await prisma.file.create({
                            data: {
                                projectId: project.id,
                                path: relativePath,
                                content: safeContent
                            }
                        });
                    } catch (readErr) {
                        console.error(`Skipping unreadable file: ${entry.path}`, readErr);
                    }
                }
            }
        };

        await saveFilesToDb('/home/user/app');


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
    return res.status(200).json({
        url: `https://5173-${sandboxId}.e2b.app`,
        projectId: project.id
    })
})

router.get('/:projectId/files', async (req, res) => {
    const { projectId } = req.params as { projectId: string };
    try {
        const files = await prisma.file.findMany({
            where: {
                projectId: projectId
            },
            select: {
                path: true,
                content: true
            }
        });
        return res.status(200).json(files);
    } catch (e) {
        console.log(e);
        return res.status(500).json({ message: "Error fetching files" });
    }
})

export default router