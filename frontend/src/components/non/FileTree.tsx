import { useState, useMemo } from 'react'
import { File, Folder, ChevronRight, ChevronDown } from 'lucide-react'

// Helper to build tree from paths
interface FileNode {
    name: string
    path: string
    type: 'file' | 'dir'
    children?: FileNode[]
}

const buildTree = (files: { path: string }[]): FileNode[] => {
    const root: FileNode[] = []

    files.forEach(file => {
        const parts = file.path.split('/')
        let currentLevel = root

        parts.forEach((part, index) => {
            const isFile = index === parts.length - 1
            const path = parts.slice(0, index + 1).join('/')
            const existingNode = currentLevel.find(node => node.name === part)

            if (existingNode) {
                if (!isFile && existingNode.children) {
                    currentLevel = existingNode.children
                }
            } else {
                const newNode: FileNode = {
                    name: part,
                    path,
                    type: isFile ? 'file' : 'dir',
                    children: isFile ? undefined : []
                }
                currentLevel.push(newNode)
                if (!isFile && newNode.children) {
                    currentLevel = newNode.children
                }
            }
        })
    })

    // Sort: folders first, then files
    const sortNodes = (nodes: FileNode[]) => {
        nodes.sort((a, b) => {
            if (a.type === b.type) return a.name.localeCompare(b.name)
            return a.type === 'dir' ? -1 : 1
        })
        nodes.forEach(node => {
            if (node.children) sortNodes(node.children)
        })
    }

    sortNodes(root)
    return root
}

interface FileTreeProps {
    files: { path: string }[]
    onSelect: (path: string) => void
    selectedFile: string
}

const FileTreeNode = ({ node, depth, onSelect, selectedFile }: { node: FileNode, depth: number, onSelect: (path: string) => void, selectedFile: string }) => {
    const [isOpen, setIsOpen] = useState(false)

    const handleClick = () => {
        if (node.type === 'dir') {
            setIsOpen(!isOpen)
        } else {
            onSelect(node.path)
        }
    }

    return (
        <div className="select-none cursor-pointer text-sm text-gray-300">
            <div
                className={`flex items-center gap-1.5 py-1 px-2 hover:bg-gray-800 rounded transition
          ${selectedFile === node.path ? 'bg-gray-800 text-blue-400' : ''}`}
                style={{ paddingLeft: `${depth * 12 + 8}px` }}
                onClick={handleClick}
            >
                {node.type === 'dir' ? (
                    isOpen ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />
                ) : (
                    <File className="w-4 h-4 text-blue-400" />
                )}

                {node.type === 'dir' ? (
                    <Folder className={`w-4 h-4 ${isOpen ? 'text-yellow-400' : 'text-yellow-500'}`} />
                ) : null}

                <span>{node.name}</span>
            </div>

            {isOpen && node.children && (
                <div>
                    {node.children.map(child => (
                        <FileTreeNode
                            key={child.path}
                            node={child}
                            depth={depth + 1}
                            onSelect={onSelect}
                            selectedFile={selectedFile}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

const FileTree = ({ files, onSelect, selectedFile }: FileTreeProps) => {
    const tree = useMemo(() => buildTree(files), [files])

    return (
        <div className="h-full overflow-y-auto p-2 bg-[#1e1e1e] text-gray-300 font-mono text-sm">
            {tree.map(node => (
                <FileTreeNode
                    key={node.path}
                    node={node}
                    depth={0}
                    onSelect={onSelect}
                    selectedFile={selectedFile}
                />
            ))}
        </div>
    )
}

export default FileTree
