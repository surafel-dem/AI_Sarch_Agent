'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Components } from 'react-markdown'

interface MarkdownMessageProps {
  content: string
}

export function MarkdownMessage({ content }: MarkdownMessageProps) {
  const components: Partial<Components> = {
    a: ({ node, ref, ...props }) => (
      <a {...props} target="_blank" rel="noopener noreferrer" className="text-[#8b5cf6] hover:text-[#7c3aed] underline" />
    ),
    p: ({ node, ref, ...props }) => (
      <p {...props} className="text-gray-300 mb-4" />
    ),
    ul: ({ node, ref, ...props }) => (
      <ul {...props} className="list-disc list-inside mb-4 space-y-2" />
    ),
    ol: ({ node, ref, ...props }) => (
      <ol {...props} className="list-decimal list-inside mb-4 space-y-2" />
    ),
    li: ({ node, ref, ...props }) => (
      <li {...props} className="text-gray-300" />
    ),
    code: ({ node, inline, className, children, ref, ...props }: any) => {
      const match = /language-(\w+)/.exec(className || '')
      return !inline ? (
        <pre className="bg-[rgba(0,7,36,0.6)] p-4 rounded-lg overflow-x-auto mb-4">
          <code className={className} {...props}>
            {children}
          </code>
        </pre>
      ) : (
        <code className="bg-[rgba(139,92,246,0.1)] text-[#8b5cf6] px-1 py-0.5 rounded" {...props}>
          {children}
        </code>
      )
    }
  }

  return (
    <ReactMarkdown 
      remarkPlugins={[remarkGfm]}
      className="prose prose-invert max-w-none"
      components={components}
    >
      {content}
    </ReactMarkdown>
  )
}