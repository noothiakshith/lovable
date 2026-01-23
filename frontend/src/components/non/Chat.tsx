import React, { useState } from 'react'
import { Button } from '../ui/button'
import axios from 'axios'

interface ChatProps {
    onUrlReceived?: (data: { url: string, projectId: string }) => void
}

const Chat = ({ onUrlReceived }: ChatProps) => {
    const [title, setTitle] = useState('')

    const [isLoading, setIsLoading] = useState(false)

    const handleSend = async () => {
        if (!title.trim()) return
        setIsLoading(true)
        try {
            const token = localStorage.getItem('token')
            const response = await axios.post('http://localhost:5000/project/create', {
                title
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            console.log(response.data)
            if (onUrlReceived && response.data.url && response.data.projectId) {
                onUrlReceived(response.data)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="h-full flex flex-col bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
            {/* Header */}
            <div className="p-4 border-b border-zinc-800 bg-zinc-900/50">
                <h2 className="text-zinc-100 font-semibold">AI Assistant</h2>
                <p className="text-zinc-500 text-xs">Describe what you want to build</p>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Placeholder for messages - in a real app these would be mapped */}
                <div className="bg-zinc-800/50 p-3 rounded-lg rounded-tl-none border border-zinc-700/50 max-w-[85%]">
                    <p className="text-zinc-300 text-sm">
                        Hi! I'm your AI developer. Tell me what you'd like to build today, and I'll generate the code for you.
                    </p>
                </div>

                {isLoading && (
                    <div className="bg-zinc-800/50 p-3 rounded-lg rounded-tl-none border border-zinc-700/50 inline-block">
                        <div className="flex items-center gap-2 text-zinc-400 text-sm">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            <span>Generating layout...</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-zinc-900 border-t border-zinc-800">
                <div className="flex items-center gap-2 bg-zinc-950 p-1.5 rounded-xl border border-zinc-800 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500/50 transition-all">
                    <input
                        type="text"
                        placeholder="Build a todo app..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSend()}
                        className="flex-1 bg-transparent border-none text-zinc-200 placeholder:text-zinc-600 px-3 py-2 text-sm focus:outline-none"
                        disabled={isLoading}
                    />

                    <Button
                        onClick={handleSend}
                        disabled={isLoading || !title.trim()}
                        className={`rounded-lg px-4 py-2 h-auto text-xs font-semibold transition-all ${isLoading || !title.trim()
                                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-500/20'
                            }`}
                    >
                        {isLoading ? 'Thinking...' : 'Send'}
                    </Button>
                </div>
            </div>

        </div>
    )
}

export default Chat
