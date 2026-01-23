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
                    const res = await axios.get(`http://localhost:5000/project/${projectId}/files`, {
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
        <div className="w-full h-screen flex gap-4 p-4 overflow-hidden bg-background">



            <div className="flex-[1] min-w-[300px] h-full">
                <Chat onUrlReceived={handleProjectCreated} />
            </div>

            <div className="flex-[3] h-full flex flex-col bg-card rounded-xl border border-border overflow-hidden shadow-sm">
                <div className="flex items-center gap-1 p-2 border-b border-border bg-muted/40 backdrop-blur-sm">
                    <button
                        onClick={() => setActiveTab('editor')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'editor'
                            ? 'bg-background text-foreground shadow-sm ring-1 ring-border'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                            }`}
                    >
                        <Code className="w-4 h-4" />
                        Code Editor
                    </button>
                    <button
                        onClick={() => setActiveTab('preview')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'preview'
                            ? 'bg-background text-foreground shadow-sm ring-1 ring-border'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                            }`}
                    >
                        <Eye className="w-4 h-4" />
                        Live Preview
                    </button>
                </div>

                <div className="flex-1 relative overflow-hidden bg-background">
                    {activeTab === 'editor' ? (
                        <div className="h-full w-full flex">
                            <div className="w-64 h-full border-r border-border overflow-hidden bg-[#1e1e1e]">
                                <FileTree
                                    files={files}
                                    onSelect={setSelectedFile}
                                    selectedFile={selectedFile}
                                />
                            </div>
                            <div className="flex-1 h-full">
                                <CodeEditor
                                    code={files.find(f => f.path === selectedFile)?.content || ''}
                                    language={selectedFile.endsWith('json') ? 'json' : selectedFile.endsWith('css') ? 'css' : 'typescript'}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="h-full w-full">
                            <LivePreview url={previewUrl} />
                        </div>
                    )}
                </div>
            </div>

        </div>
    )
}

export default Home
