'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import ReactMarkdown from 'react-markdown'
import { Eye, Edit3 } from 'lucide-react'

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  placeholder?: string
  disabled?: boolean
  rows?: number
  className?: string
  label?: string
  showPreview?: boolean
}

export function MarkdownEditor({
  value,
  onChange,
  onBlur,
  placeholder,
  disabled = false,
  rows = 8,
  className = '',
  label,
  showPreview = true
}: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState('edit')

  if (!showPreview) {
    // Simple textarea without tabs if preview is disabled
    return (
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        disabled={disabled}
        placeholder={placeholder}
        rows={rows}
        className={`min-h-[200px] w-full ${className}`}
        style={{ minHeight: '200px', resize: 'vertical' }}
      />
    )
  }

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {label}
          </label>
        </div>
      )}
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="edit" className="flex items-center gap-2">
            <Edit3 className="h-4 w-4" />
            Edit
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Preview
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="edit" className="mt-2">
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            disabled={disabled}
            placeholder={placeholder || "Enter Markdown content..."}
            rows={rows}
            className={`min-h-[200px] w-full font-mono text-sm ${className}`}
            style={{ minHeight: '200px', resize: 'vertical' }}
          />
          <p className="mt-1 text-xs text-gray-500">
            Use Markdown syntax for formatting. **bold**, *italic*, ## headers, - bullet points, &gt; blockquotes
          </p>
        </TabsContent>
        
        <TabsContent value="preview" className="mt-2">
          <div 
            className={`min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ${disabled ? 'opacity-50' : ''}`}
            style={{ minHeight: '200px' }}
          >
            {value ? (
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <ReactMarkdown
                  components={{
                    h1: ({ children }) => <h1 className="text-2xl font-bold mb-4 text-gray-900">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-xl font-semibold mb-3 text-gray-800 border-b pb-1">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-lg font-medium mb-2 text-gray-700">{children}</h3>,
                    p: ({ children }) => <p className="mb-3 text-gray-600 leading-relaxed">{children}</p>,
                    strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
                    ul: ({ children }) => <ul className="mb-3 ml-6 space-y-1">{children}</ul>,
                    ol: ({ children }) => <ol className="mb-3 ml-6 space-y-1">{children}</ol>,
                    li: ({ children }) => <li className="text-gray-600">{children}</li>,
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-blue-500 bg-blue-50 pl-4 py-2 mb-3 italic text-gray-700">
                        {children}
                      </blockquote>
                    ),
                    hr: () => <hr className="my-6 border-gray-300" />,
                    code: ({ children, className }) => {
                      const isInline = !className
                      return isInline ? (
                        <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono text-gray-800">
                          {children}
                        </code>
                      ) : (
                        <pre className="bg-gray-100 p-3 rounded text-sm font-mono overflow-x-auto mb-3">
                          <code className="text-gray-800">{children}</code>
                        </pre>
                      )
                    }
                  }}
                >
                  {value}
                </ReactMarkdown>
              </div>
            ) : (
              <p className="text-gray-400 italic">No content to preview. Switch to Edit tab to add content.</p>
            )}
          </div>
          {value && (
            <p className="mt-1 text-xs text-gray-500">
              {value.length} characters - Preview of your Markdown content
            </p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}