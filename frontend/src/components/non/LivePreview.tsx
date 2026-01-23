

interface LivePreviewProps {
    url?: string
}

const LivePreview = ({ url }: LivePreviewProps) => {
    return (
        <div className='w-full h-full'>
            <iframe
                src={url}
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