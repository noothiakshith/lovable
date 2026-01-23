import React, { useState } from 'react'
import { Button } from '../ui/button'
import axios from 'axios'

interface ChatProps {
    onUrlReceived?: (data: { url: string, projectId: string }) => void
}

const Chat = ({ onUrlReceived }: ChatProps) => {
    const [title, setTitle] = useState('')

    const handleSend = async () => {
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
        }
    }

    return (
        <div className="h-full flex flex-col bg-white border rounded-lg">

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-3">
                <p className="text-gray-400 text-sm">
                    Chat messages will appear here…
                </p>
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-300 p-3">
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        placeholder="Enter your message..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                    />

                    <Button
                        variant="outline"
                        className="rounded-full px-5"
                        onClick={handleSend}
                    >
                        Send
                    </Button>
                </div>
            </div>

        </div>
    )
}

export default Chat
