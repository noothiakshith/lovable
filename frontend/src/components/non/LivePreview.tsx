import React from 'react'

interface LivePreviewProps {
    url?: string
}

const LivePreview = ({ url }: LivePreviewProps) => {
    return (
        <div className='w-full h-full'>
            <iframe
                src={url || "https://media.geeksforgeeks.org/wp-content/uploads/20240206111438/uni2.html"}
                height="100%"
                width="100%"
                className="border-0"
                title="Live Preview"
            >
            </iframe>
        </div>
    )
}

export default LivePreview