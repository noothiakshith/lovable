import { Editor } from '@monaco-editor/react'
import React from 'react'

interface CodeEditorProps {
  code?: string
  language?: string
}

const CodeEditor = ({ code = '// Select a file to view code', language = 'typescript' }: CodeEditorProps) => {
  return (
    <div className="h-full w-full">
      <Editor
        height="100%"
        width="100%"
        language={language}
        value={code}
        theme="vs-dark"
        options={{
          readOnly: true,
          automaticLayout: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          folding: false,
          fontSize: 14,
        }}
      />
    </div>
  )
}

export default CodeEditor
