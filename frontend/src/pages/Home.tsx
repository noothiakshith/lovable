import React from 'react'
import { Code, Eye } from 'lucide-react'
import CodeEditor from '../components/non/CodeEditor'
import LivePreview from '../components/non/LivePreview'
import Chat from '../components/non/Chat'

import axios from 'axios'
import FileTree from '../components/non/FileTree'

const MOCK_FILES = [
    { path: 'package.json', content: '{}' },
    { path: 'vite.config.ts', content: 'export default {}' },
    { path: 'src/App.tsx', content: 'export default function App() {}' },
    { path: 'src/main.tsx', content: 'console.log("main")' },
    { path: 'src/index.css', content: 'body { background: #000; }' },
]

const Home = () => {
    const [activeTab, setActiveTab] = React.useState<'editor' | 'preview'>('editor')
    const [previewUrl, setPreviewUrl] = React.useState<string>('')
    const [projectId, setProjectId] = React.useState<string>('')
    const [files, setFiles] = React.useState<{ path: string, content?: string }[]>(MOCK_FILES)
    const [selectedFile, setSelectedFile] = React.useState<string>('src/App.tsx')

    const handleProjectCreated = (data: { url: string, projectId: string }) => {
        setPreviewUrl(data.url)
        setProjectId(data.projectId)
        setActiveTab('preview')
    }

    React.useEffect(() => {
        if (projectId) {
            const fetchFiles = async () => {
                try {
                    const token = localStorage.getItem('token')
                    const res = await axios.get(`${import.meta.env.VITE_API_URL || ''}/api/project/${projectId}/files`, {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                    setFiles(res.data)
                } catch (e) {
                    console.error("Failed to fetch files", e)
                }
            }
            fetchFiles()
        }
    }, [projectId])

    return (
        <div className="w-full h-screen flex gap-4 p-4 overflow-hidden bg-zinc-950 text-neutral-200 font-sans">

            <div className="flex-[1] min-w-[350px] max-w-[400px] h-full flex flex-col gap-4">
                <Chat onUrlReceived={handleProjectCreated} />
            </div>

            <div className="flex-[3] h-full flex flex-col bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden shadow-2xl relative">
                {/* Tab Header */}
                <div className="flex items-center justify-between p-2 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
                    <div className="flex items-center gap-1 bg-zinc-800/50 p-1 rounded-lg">
                        <button
                            onClick={() => setActiveTab('editor')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${activeTab === 'editor'
                                ? 'bg-zinc-700 text-zinc-100 shadow-sm'
                                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                                }`}
                        >
                            <Code className="w-4 h-4" />
                            Code
                        </button>
                        <button
                            onClick={() => setActiveTab('preview')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${activeTab === 'preview'
                                ? 'bg-zinc-700 text-zinc-100 shadow-sm'
                                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                                }`}
                        >
                            <Eye className="w-4 h-4" />
                            Preview
                        </button>
                    </div>
                    <div className="px-4 text-xs text-zinc-500 font-mono">
                        {projectId ? `Project ID: ${projectId}` : 'No Project Selected'}
                    </div>
                </div>

                <div className="flex-1 relative overflow-hidden bg-zinc-950">
                    {activeTab === 'editor' ? (
                        <div className="h-full w-full flex">
                            {/* File Tree Sidebar */}
                            <div className="w-64 h-full border-r border-zinc-800 overflow-hidden bg-[#1e1e1e]">
                                <FileTree
                                    files={files}
                                    onSelect={setSelectedFile}
                                    selectedFile={selectedFile}
                                />
                            </div>
                            {/* Code Area */}
                            <div className="flex-1 h-full relative">
                                {!files.find(f => f.path === selectedFile) && (
                                    <div className="absolute inset-0 flex items-center justify-center text-zinc-600 text-sm">
                                        Select a file to view content
                                    </div>
                                )}
                                <CodeEditor
                                    code={files.find(f => f.path === selectedFile)?.content || ''}
                                    language={selectedFile.endsWith('json') ? 'json' : selectedFile.endsWith('css') ? 'css' : selectedFile.endsWith('html') ? 'html' : 'typescript'}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="h-full w-full bg-white">
                            {/* White bg for preview typically looks better for web apps unless they are dark mode by default */}
                            <LivePreview url={previewUrl} />
                        </div>
                    )}
                </div>
            </div>

        </div>
    )
}

export default Home
