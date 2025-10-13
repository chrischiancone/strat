'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { FileText, Download } from 'lucide-react'
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
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate PDF')
      }

      // Get the PDF blob
      const blob = await response.blob()
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      
      // Generate filename with current date
      const timestamp = new Date().toISOString().split('T')[0]
      const sanitizedDepartment = departmentName.replace(/\s+/g, '-')
      link.download = `Strategic-Plan-${sanitizedDepartment}-${timestamp}.pdf`
      
      // Trigger download
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Clean up
      window.URL.revokeObjectURL(url)
      
      toast({
        title: 'PDF Generated Successfully',
        description: `Strategic plan report for ${departmentName} has been downloaded.`,
      })
    } catch (error) {
      console.error('Error generating PDF:', error)
      toast({
        title: 'PDF Generation Failed',
        description: error instanceof Error ? error.message : 'Unable to generate PDF report. Please try again.',
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
      size={size}
      className="gap-2"
    >
      {showIcon && (
        isGenerating ? (
          <Download className="h-4 w-4 animate-spin" />
        ) : (
          <FileText className="h-4 w-4" />
        )
      )}
      {isGenerating ? 'Generating PDF...' : 'Export PDF Report'}
    </Button>
  )
}