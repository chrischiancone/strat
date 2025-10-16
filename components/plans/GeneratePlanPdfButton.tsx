'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { FileText, Download, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface GeneratePlanPdfButtonProps {
  planId: string
  planTitle: string
  departmentName: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
}

export function GeneratePlanPdfButton({
  planId,
  planTitle: _planTitle,
  departmentName,
  variant = 'outline',
  size = 'md',
  showIcon = true
}: GeneratePlanPdfButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()

  const generatePdf = async () => {
    setIsGenerating(true)
    
    // Show initial toast
    toast({
      title: 'Generating PDF Report',
      description: 'Compiling strategic plan data and creating your report...',
    })
    
    try {
      const response = await fetch('/api/reports/department-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: planId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error occurred' }))
        throw new Error(errorData.error || `Server error: ${response.status} ${response.statusText}`)
      }

      // Check if response is actually a PDF
      const contentType = response.headers.get('content-type')
      if (!contentType?.includes('application/pdf')) {
        throw new Error('Invalid response format - expected PDF')
      }

      // Get the PDF blob
      const blob = await response.blob()
      
      if (blob.size === 0) {
        throw new Error('Generated PDF is empty')
      }
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      
      // Generate filename with current date and time
      const now = new Date()
      const timestamp = now.toISOString().split('T')[0]
      const timeStamp = now.toTimeString().split(' ')[0].replace(/:/g, '-')
      const sanitizedDepartment = departmentName.replace(/[^a-zA-Z0-9-_]/g, '-')
      link.download = `Strategic-Plan-${sanitizedDepartment}-${timestamp}-${timeStamp}.pdf`
      
      // Trigger download
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Clean up
      window.URL.revokeObjectURL(url)
      
      toast({
        title: '📄 PDF Generated Successfully',
        description: `Strategic plan report for ${departmentName} has been downloaded (${(blob.size / 1024 / 1024).toFixed(1)} MB).`,
      })
    } catch (error) {
      console.error('Error generating PDF:', error)
      
      let errorMessage = 'Unable to generate PDF report. Please try again.'
      let errorTitle = 'PDF Generation Failed'
      
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Network error. Please check your connection and try again.'
          errorTitle = 'Connection Error'
        } else if (error.message.includes('Server error: 500')) {
          errorMessage = 'Server error occurred. Please try again in a few moments.'
          errorTitle = 'Server Error'
        } else {
          errorMessage = error.message
        }
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Button
      onClick={generatePdf}
      disabled={isGenerating}
      variant={variant}
      size={size === 'md' ? 'default' : size}
      className={`gap-2 ${isGenerating ? 'cursor-wait' : ''}`}
    >
      {showIcon && (
        isGenerating ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <FileText className="h-4 w-4" />
        )
      )}
      {isGenerating ? (
        <span className="flex items-center gap-1">
          Generating PDF
          <span className="animate-pulse">...</span>
        </span>
      ) : (
        'Export PDF Report'
      )}
    </Button>
  )
}