import React from 'react'
import { Document, Page, Text, View, StyleSheet, Link } from '@react-pdf/renderer'
import { format } from 'date-fns'
import type { DashboardData } from '@/app/actions/dashboard'

// Define styles
const styles = StyleSheet.create({
  page: {
    paddingHorizontal: 40,
    paddingTop: 100,   // reserve space for header
    paddingBottom: 80, // reserve space for footer
    fontSize: 11,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  coverPage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    marginBottom: 24,
    textAlign: 'center',
    fontFamily: 'Helvetica-Bold',
    color: '#1a365d',
    lineHeight: 1.2,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 12,
    textAlign: 'center',
    color: '#4a5568',
    fontFamily: 'Helvetica',
  },
  coverDepartment: {
    fontSize: 20,
    marginBottom: 8,
    textAlign: 'center',
    color: '#2d3748',
    fontFamily: 'Helvetica-Bold',
  },
  coverFiscalYear: {
    fontSize: 14,
    marginBottom: 40,
    textAlign: 'center',
    color: '#718096',
    fontStyle: 'italic',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 16,
    fontFamily: 'Helvetica-Bold',
    color: '#1a365d',
    borderBottomWidth: 3,
    borderBottomColor: '#3182ce',
    paddingBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  subsectionTitle: {
    fontSize: 13,
    marginBottom: 8,
    marginTop: 12,
    fontFamily: 'Helvetica-Bold',
  },
  text: {
    marginBottom: 6,
    lineHeight: 1.5,
  },
  bulletPoint: {
    marginBottom: 4,
    marginLeft: 15,
    lineHeight: 1.4,
  },
  table: {
    display: 'flex',
    width: '100%',
    marginTop: 10,
    marginBottom: 15,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingVertical: 6,
  },
  tableHeader: {
    backgroundColor: '#f5f5f5',
    fontFamily: 'Helvetica-Bold',
  },
  tableCell: {
    flex: 1,
    paddingHorizontal: 4,
  },
  tableCellRight: {
    flex: 1,
    paddingHorizontal: 4,
    textAlign: 'right',
  },
  highlight: {
    padding: 16,
    backgroundColor: '#f7fafc',
    borderRadius: 6,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#3182ce',
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: '#e2e8f0',
    borderRightColor: '#e2e8f0',
    borderBottomColor: '#e2e8f0',
  },
  summaryBox: {
    padding: 20,
    backgroundColor: '#edf2f7',
    borderRadius: 8,
    marginTop: 40,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#cbd5e0',
  },
  metricItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  metricLabel: {
    fontSize: 11,
    color: '#4a5568',
  },
  metricValue: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#2d3748',
  },
  statusBadge: {
    display: 'inline-flex',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    marginRight: 4,
  },
  statusDraft: {
    backgroundColor: '#fff3cd',
    color: '#856404',
  },
  statusReview: {
    backgroundColor: '#cce5ff',
    color: '#004085',
  },
  statusApproved: {
    backgroundColor: '#d4edda',
    color: '#155724',
  },
  priorityNeed: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
  },
  priorityWant: {
    backgroundColor: '#fff3cd',
    color: '#856404',
  },
  priorityNice: {
    backgroundColor: '#d1ecf1',
    color: '#0c5460',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 9,
    color: '#6b7280',
    textAlign: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 8,
  },
  pageHeader: {
    position: 'absolute',
    top: 20,
    left: 40,
    right: 40,
    fontSize: 10,
    color: '#6b7280',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 8,
    marginBottom: 20,
  },
  swotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  swotQuadrant: {
    width: '48%',
    margin: '1%',
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e9ecef',
    minHeight: 120,
  },
  swotTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  swotItem: {
    fontSize: 9,
    marginBottom: 3,
    lineHeight: 1.4,
    paddingLeft: 2,
  },
})

interface DepartmentPlanDocumentProps {
  data: DashboardData
  executiveSummary?: string | null
  generatedBy: string
  initiatives?: Array<{
    id: string
    name: string
    description: string | null
    priority_level: string
    status: string
    responsible_party: string | null
    total_cost: number
    goal_name: string
  }>
  goals?: Array<{
    id: string
    name: string
    description: string | null
    success_criteria: string | null
  }>
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'approved':
      return styles.statusApproved
    case 'under_review':
      return styles.statusReview
    default:
      return styles.statusDraft
  }
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'NEED':
      return styles.priorityNeed
    case 'WANT':
      return styles.priorityWant
    default:
      return styles.priorityNice
  }
}

// Simplified Markdown parser for PDF formatting
const parseMarkdownToPDFElements = (text: string): JSX.Element[] => {
  if (!text) return []
  
  const elements: JSX.Element[] = []
  let elementKey = 0
  
  // Split by lines to process markdown line by line
  const lines = text.split('\n')
  let currentParagraph = ''
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmedLine = line.trim()
    
    // Handle empty lines (paragraph breaks)
    if (!trimmedLine) {
      if (currentParagraph.trim()) {
        elements.push(
          <Text key={elementKey++} style={[styles.text, { marginBottom: 8, lineHeight: 1.5 }]}>
{renderInlineWithLinks(currentParagraph.trim())}
          </Text>
        )
        currentParagraph = ''
      }
      continue
    }
    
    // Handle headers (# ## ### etc)
    const headerMatch = trimmedLine.match(/^(#{1,6})\s+(.+)$/)
    if (headerMatch) {
      // Flush current paragraph first
      if (currentParagraph.trim()) {
        elements.push(
          <Text key={elementKey++} style={[styles.text, { marginBottom: 8, lineHeight: 1.5 }]}>
            {formatMarkdownText(currentParagraph.trim())}
          </Text>
        )
        currentParagraph = ''
      }
      
      const headerLevel = headerMatch[1].length
      const headerText = headerMatch[2]
      const headerStyle = getHeaderStyle(headerLevel)
      
      elements.push(
        <Text key={elementKey++} style={headerStyle}>
{renderInlineWithLinks(headerText)}
        </Text>
      )
      continue
    }
    
    // Handle bullet points (- * +)
    const bulletMatch = trimmedLine.match(/^[\-\*\+]\s+(.+)$/)
    if (bulletMatch) {
      // Flush current paragraph first
      if (currentParagraph.trim()) {
        elements.push(
          <Text key={elementKey++} style={[styles.text, { marginBottom: 8, lineHeight: 1.5 }]}>
            {formatMarkdownText(currentParagraph.trim())}
          </Text>
        )
        currentParagraph = ''
      }
      
      elements.push(
        <Text key={elementKey++} style={[styles.bulletPoint, { marginBottom: 4, lineHeight: 1.4 }]}>
- {renderInlineWithLinks(bulletMatch[1])}
        </Text>
      )
      continue
    }
    
    // Handle numbered lists (1. 2. etc)
    const numberedMatch = trimmedLine.match(/^(\d+)\.\s+(.+)$/)
    if (numberedMatch) {
      // Flush current paragraph first
      if (currentParagraph.trim()) {
        elements.push(
          <Text key={elementKey++} style={[styles.text, { marginBottom: 8, lineHeight: 1.5 }]}>
            {formatMarkdownText(currentParagraph.trim())}
          </Text>
        )
        currentParagraph = ''
      }
      
      elements.push(
        <Text key={elementKey++} style={[styles.bulletPoint, { marginBottom: 4, lineHeight: 1.4 }]}>
{numberedMatch[1]}. {renderInlineWithLinks(numberedMatch[2])}
        </Text>
      )
      continue
    }
    
    // Handle horizontal rules (--- or ***)
    if (trimmedLine.match(/^(---+|\*\*\*+)$/)) {
      // Flush current paragraph first
      if (currentParagraph.trim()) {
        elements.push(
          <Text key={elementKey++} style={[styles.text, { marginBottom: 8, lineHeight: 1.5 }]}>
            {formatMarkdownText(currentParagraph.trim())}
          </Text>
        )
        currentParagraph = ''
      }
      
      elements.push(
        <View key={elementKey++} style={{ borderBottomWidth: 1, borderBottomColor: '#e5e7eb', marginVertical: 16 }} />
      )
      continue
    }
    
    // Handle blockquotes (> text)
    const blockquoteMatch = trimmedLine.match(/^>\s*(.*)$/)
    if (blockquoteMatch) {
      // Flush current paragraph first
      if (currentParagraph.trim()) {
        elements.push(
          <Text key={elementKey++} style={[styles.text, { marginBottom: 8, lineHeight: 1.5 }]}>
            {formatMarkdownText(currentParagraph.trim())}
          </Text>
        )
        currentParagraph = ''
      }
      
      elements.push(
        <View key={elementKey++} style={{ borderLeftWidth: 3, borderLeftColor: '#3182ce', paddingLeft: 12, marginVertical: 8, backgroundColor: '#f8fafc', padding: 8 }}>
          <Text style={[styles.text, { color: '#4a5568' }]}>
{renderInlineWithLinks(blockquoteMatch[1])}
          </Text>
        </View>
      )
      continue
    }
    
    // Regular text - add to current paragraph
    if (currentParagraph) {
      currentParagraph += ' ' + trimmedLine
    } else {
      currentParagraph = trimmedLine
    }
  }
  
  // Don't forget the last paragraph
  if (currentParagraph.trim()) {
    elements.push(
      <Text key={elementKey++} style={[styles.text, { marginBottom: 8, lineHeight: 1.5 }]}>
        {formatMarkdownText(currentParagraph.trim())}
      </Text>
    )
  }
  
  return elements
}

// Simplified inline markdown parser that avoids font conflicts
const parseInlineMarkdownToElements = (text: string, baseStyle: any = {}): JSX.Element => {
  if (!text) return <Text style={baseStyle}></Text>
  
  // For now, let's use the simple approach to avoid font conflicts
  // We'll just clean the markdown and apply base styling
  const children = renderInlineWithLinks(text)
  
  return (
    <Text style={baseStyle}>
      {children}
    </Text>
  )
}


// Get header styling based on markdown level
const getHeaderStyle = (level: number) => {
  const baseStyle = {
    fontFamily: 'Helvetica-Bold',
    color: '#1a365d',
    marginTop: 16,
    marginBottom: 8,
  }
  
  switch (level) {
    case 1: // # Header 1
      return { ...baseStyle, fontSize: 16, marginTop: 20, marginBottom: 12 }
    case 2: // ## Header 2
      return { ...baseStyle, fontSize: 14, marginTop: 16, marginBottom: 10 }
    case 3: // ### Header 3
      return { ...baseStyle, fontSize: 12, marginTop: 14, marginBottom: 8 }
    case 4: // #### Header 4
      return { ...baseStyle, fontSize: 11, marginTop: 12, marginBottom: 6 }
    default: // ##### and ######
      return { ...baseStyle, fontSize: 10, marginTop: 10, marginBottom: 6 }
  }
}

// Enhanced text cleaning function
const formatMarkdownText = (text: string): string => {
  if (!text) return ''
  
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markers
    .replace(/\*(.*?)\*/g, '$1')     // Remove italic markers
    .replace(/`([^`]+)`/g, '$1')     // Remove code markers
    .replace(/~~(.*?)~~/g, '$1')     // Remove strikethrough markers
    // NOTE: do not strip links here; use renderer to convert them to clickable
    .replace(/[^\u0020-\u007E]/g, '') // Remove all non-ASCII characters (keep only printable ASCII)
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim()
}

// Render inline text with clickable links (markdown [text](url) and plain URLs)
const renderInlineWithLinks = (text: string): Array<string | JSX.Element> => {
  if (!text) return []

  const sanitize = (s: string) => (s || '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/~~(.*?)~~/g, '$1')
    .replace(/[^\u0020-\u007E]/g, '')
    .replace(/\s+/g, ' ')

  const input = sanitize(text)
  const regex = /(\[([^\]]+)\]\((https?:\/\/[^\s)]+)\))|((https?:\/\/|www\.)[^\s]+)/g
  const nodes: Array<string | JSX.Element> = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(input)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(input.slice(lastIndex, match.index))
    }
    if (match[3]) {
      const label = sanitize(match[2] || '') || match[3]
      const href = match[3]
      nodes.push(
        <Link src={href} style={{ color: '#2563eb', textDecoration: 'underline' }}>{label}</Link>
      )
    } else {
      const raw = match[4] || ''
      const href = raw.startsWith('http') ? raw : `https://${raw}`
      nodes.push(
        <Link src={href} style={{ color: '#2563eb', textDecoration: 'underline' }}>{raw}</Link>
      )
    }
    lastIndex = regex.lastIndex
  }

  if (lastIndex < input.length) {
    nodes.push(input.slice(lastIndex))
  }

  return nodes.length ? nodes : [input]
}

// Legacy function for backward compatibility
const parseInlineMarkdown = (text: string): string => {
  return formatMarkdownText(text)
}


export const DepartmentPlanDocument: React.FC<DepartmentPlanDocumentProps> = ({ 
  data, 
  executiveSummary, 
  generatedBy, 
  initiatives = [], 
  goals = [] 
}) => {
  const generatedDate = format(new Date(), 'MMMM d, yyyy')
  const totalBudget = data.budgetByYear.year_1 + data.budgetByYear.year_2 + data.budgetByYear.year_3
  const totalInitiatives = Object.values(data.initiativesByPriority).reduce((sum, count) => sum + count, 0)

  return (
    <Document>
      {/* Cover Page */}
      <Page size="A4" style={styles.page}>
        <View style={styles.coverPage}>
          <Text style={styles.title}>{data.plan.title}</Text>
          <Text style={styles.coverDepartment}>{data.plan.department_name}</Text>
          <Text style={styles.coverFiscalYear}>
            FY {data.plan.fiscal_year_start} - FY {data.plan.fiscal_year_end}
          </Text>
          
          {/* Strategic Plan Summary */}
          <View style={styles.summaryBox}>
            <Text style={[styles.text, { fontFamily: 'Helvetica-Bold', fontSize: 14, marginBottom: 12, textAlign: 'center' }]}>
              Strategic Plan Summary
            </Text>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Strategic Goals:</Text>
              <Text style={styles.metricValue}>{data.goalCount}</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Total Initiatives:</Text>
              <Text style={styles.metricValue}>{totalInitiatives}</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Total Investment:</Text>
              <Text style={styles.metricValue}>{formatCurrency(totalBudget)}</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Plan Status:</Text>
              <Text style={styles.metricValue}>{data.plan.status.replace('_', ' ').toUpperCase()}</Text>
            </View>
          </View>

          <View style={{ position: 'absolute', bottom: 60, width: '100%' }}>
            <Text style={[styles.subtitle, { marginBottom: 8 }]}>Prepared by</Text>
            <Text style={[styles.subtitle, { fontFamily: 'Helvetica-Bold', marginBottom: 16 }]}>{generatedBy}</Text>
            <Text style={[styles.subtitle, { fontSize: 12, color: '#718096' }]}>{generatedDate}</Text>
          </View>
        </View>
      </Page>

      {/* Table of Contents */}
      <Page size="A4" style={styles.page}>
        <View style={styles.pageHeader}>
          <Text style={{ textAlign: 'left', fontFamily: 'Helvetica-Bold' }}>{data.plan.department_name}</Text>
          <Text style={{ textAlign: 'right', position: 'absolute', right: 0, top: 0 }}>Strategic Plan | FY {data.plan.fiscal_year_start}-{data.plan.fiscal_year_end}</Text>
        </View>
        <View style={[styles.section, { marginTop: 40 }]}>
          <Text style={styles.sectionTitle}>Table of Contents</Text>
          
          <View style={{ marginTop: 30 }}>
            {executiveSummary && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, paddingHorizontal: 4 }}>
                <Text style={[styles.text, { fontSize: 12 }]}>Executive Summary</Text>
                <Text style={[styles.text, { fontSize: 12, color: '#6b7280' }]}>2</Text>
              </View>
            )}
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, paddingHorizontal: 4 }}>
              <Text style={[styles.text, { fontSize: 12 }]}>Plan Overview</Text>
              <Text style={[styles.text, { fontSize: 12, color: '#6b7280' }]}>{executiveSummary ? '3' : '2'}</Text>
            </View>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, paddingHorizontal: 4 }}>
              <Text style={[styles.text, { fontSize: 12 }]}>Budget Analysis</Text>
              <Text style={[styles.text, { fontSize: 12, color: '#6b7280' }]}>{executiveSummary ? '4' : '3'}</Text>
            </View>
            
            {data.plan.swot_analysis && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, paddingHorizontal: 4 }}>
                <Text style={[styles.text, { fontSize: 12 }]}>SWOT Analysis</Text>
                <Text style={[styles.text, { fontSize: 12, color: '#6b7280' }]}>{executiveSummary ? '5' : '4'}</Text>
              </View>
            )}
            
            {data.plan.environmental_scan && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, paddingHorizontal: 4 }}>
                <Text style={[styles.text, { fontSize: 12 }]}>Environmental Scan</Text>
                <Text style={[styles.text, { fontSize: 12, color: '#6b7280' }]}>
                  {data.plan.swot_analysis ? (executiveSummary ? '6' : '5') : (executiveSummary ? '5' : '4')}
                </Text>
              </View>
            )}
            
            {goals.length > 0 && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, paddingHorizontal: 4 }}>
                <Text style={[styles.text, { fontSize: 12 }]}>Strategic Goals</Text>
                <Text style={[styles.text, { fontSize: 12, color: '#6b7280' }]}>
                  {(data.plan.environmental_scan ? 1 : 0) + (data.plan.swot_analysis ? 1 : 0) + (executiveSummary ? 1 : 0) + 4}
                </Text>
              </View>
            )}
            
            {initiatives.length > 0 && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, paddingHorizontal: 4 }}>
                <Text style={[styles.text, { fontSize: 12 }]}>Strategic Initiatives</Text>
                <Text style={[styles.text, { fontSize: 12, color: '#6b7280' }]}>Final Page</Text>
              </View>
            )}
          </View>
          
          <View style={[styles.highlight, { marginTop: 40, backgroundColor: '#f8fafc' }]}>
            <Text style={[styles.text, { fontFamily: 'Helvetica-Bold', marginBottom: 8, color: '#1e40af' }]}>
              Document Summary
            </Text>
            <Text style={[styles.text, { fontSize: 10, marginBottom: 4 }]}>
              - <Text style={{ fontFamily: 'Helvetica-Bold' }}>Total Pages:</Text> Approximately {Math.ceil(2 + (executiveSummary ? 1 : 0) + (data.plan.swot_analysis ? 1 : 0) + (data.plan.environmental_scan ? 1 : 0) + (goals.length > 0 ? 1 : 0) + (initiatives.length > 0 ? 1 : 0))}
            </Text>
            <Text style={[styles.text, { fontSize: 10, marginBottom: 4 }]}>
              - <Text style={{ fontFamily: 'Helvetica-Bold' }}>Planning Period:</Text> FY {data.plan.fiscal_year_start} - FY {data.plan.fiscal_year_end}
            </Text>
            <Text style={[styles.text, { fontSize: 10 }]}>
              - <Text style={{ fontFamily: 'Helvetica-Bold' }}>Generated:</Text> {generatedDate} by {generatedBy}
            </Text>
          </View>
        </View>
        
        <Text style={styles.footer}>
          {data.plan.title} - {generatedDate} - Page 2
        </Text>
      </Page>

      {/* Executive Summary */}
      {executiveSummary && (
        <Page size="A4" style={styles.page}>
          <View style={styles.pageHeader}>
            <Text style={{ textAlign: 'left', fontFamily: 'Helvetica-Bold' }}>{data.plan.department_name}</Text>
            <Text style={{ textAlign: 'right', position: 'absolute', right: 0, top: 0 }}>Strategic Plan | FY {data.plan.fiscal_year_start}-{data.plan.fiscal_year_end}</Text>
          </View>
          <View style={[styles.section, { marginTop: 40 }]}>
            <Text style={styles.sectionTitle}>Executive Summary</Text>
            {parseMarkdownToPDFElements(executiveSummary)}
          </View>
          <Text style={styles.footer}>
            {data.plan.title} - {generatedDate} - Page 2
          </Text>
        </Page>
      )}

      {/* Plan Overview */}
      <Page size="A4" style={styles.page}>
        <View style={styles.pageHeader}>
          <Text style={{ textAlign: 'left', fontFamily: 'Helvetica-Bold' }}>{data.plan.department_name}</Text>
          <Text style={{ textAlign: 'right', position: 'absolute', right: 0, top: 0 }}>Strategic Plan | FY {data.plan.fiscal_year_start}-{data.plan.fiscal_year_end}</Text>
        </View>
        <View style={[styles.section, { marginTop: 40 }]}>
          <Text style={styles.sectionTitle}>Plan Overview</Text>
          
          <View style={styles.highlight}>
            <Text style={[styles.text, { fontFamily: 'Helvetica-Bold' }]}>
              Plan Status: <Text style={[styles.statusBadge, getStatusColor(data.plan.status)]}>
                {data.plan.status.replace('_', ' ').toUpperCase()}
              </Text>
            </Text>
            <Text style={styles.text}>
              Planning Period: FY {data.plan.fiscal_year_start} - FY {data.plan.fiscal_year_end}
            </Text>
            <Text style={styles.text}>Department: {data.plan.department_name}</Text>
          </View>

          <Text style={styles.subsectionTitle}>Key Metrics</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={styles.tableCell}>Metric</Text>
              <Text style={styles.tableCellRight}>Value</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Strategic Goals</Text>
              <Text style={styles.tableCellRight}>{data.goalCount}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Total Initiatives</Text>
              <Text style={styles.tableCellRight}>{totalInitiatives}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Total Investment</Text>
              <Text style={styles.tableCellRight}>{formatCurrency(totalBudget)}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>In Progress Initiatives</Text>
              <Text style={styles.tableCellRight}>{data.initiativesByStatus.in_progress}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Completed Initiatives</Text>
              <Text style={styles.tableCellRight}>{data.initiativesByStatus.completed}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.footer}>
          {data.plan.title} - {generatedDate} - Page {executiveSummary ? '3' : '2'}
        </Text>
      </Page>

      {/* Budget Analysis */}
      <Page size="A4" style={styles.page}>
        <View style={styles.pageHeader}>
          <Text style={{ textAlign: 'left', fontFamily: 'Helvetica-Bold' }}>{data.plan.department_name}</Text>
          <Text style={{ textAlign: 'right', position: 'absolute', right: 0, top: 0 }}>Strategic Plan | FY {data.plan.fiscal_year_start}-{data.plan.fiscal_year_end}</Text>
        </View>
        <View style={[styles.section, { marginTop: 40 }]}>
          <Text style={styles.sectionTitle}>Budget Analysis</Text>

          <Text style={styles.subsectionTitle}>Budget by Fiscal Year</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={styles.tableCell}>Fiscal Year</Text>
              <Text style={styles.tableCellRight}>Amount</Text>
              <Text style={styles.tableCellRight}>% of Total</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Year 1 (FY {data.plan.fiscal_year_start})</Text>
              <Text style={styles.tableCellRight}>{formatCurrency(data.budgetByYear.year_1)}</Text>
              <Text style={styles.tableCellRight}>
                {totalBudget > 0 ? `${((data.budgetByYear.year_1 / totalBudget) * 100).toFixed(1)}%` : '0%'}
              </Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Year 2</Text>
              <Text style={styles.tableCellRight}>{formatCurrency(data.budgetByYear.year_2)}</Text>
              <Text style={styles.tableCellRight}>
                {totalBudget > 0 ? `${((data.budgetByYear.year_2 / totalBudget) * 100).toFixed(1)}%` : '0%'}
              </Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Year 3 (FY {data.plan.fiscal_year_end})</Text>
              <Text style={styles.tableCellRight}>{formatCurrency(data.budgetByYear.year_3)}</Text>
              <Text style={styles.tableCellRight}>
                {totalBudget > 0 ? `${((data.budgetByYear.year_3 / totalBudget) * 100).toFixed(1)}%` : '0%'}
              </Text>
            </View>
            <View style={[styles.tableRow, { borderTopWidth: 2, borderTopColor: '#333' }]}>
              <Text style={[styles.tableCell, { fontFamily: 'Helvetica-Bold' }]}>Total</Text>
              <Text style={[styles.tableCellRight, { fontFamily: 'Helvetica-Bold' }]}>
                {formatCurrency(totalBudget)}
              </Text>
              <Text style={[styles.tableCellRight, { fontFamily: 'Helvetica-Bold' }]}>100%</Text>
            </View>
          </View>

          <Text style={styles.subsectionTitle}>Budget by Priority Level</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={styles.tableCell}>Priority Level</Text>
              <Text style={styles.tableCellRight}>Initiatives</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Need (Critical)</Text>
              <Text style={styles.tableCellRight}>{data.initiativesByPriority.NEED}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Want (Important)</Text>
              <Text style={styles.tableCellRight}>{data.initiativesByPriority.WANT}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Nice to Have (Optional)</Text>
              <Text style={styles.tableCellRight}>{data.initiativesByPriority.NICE_TO_HAVE}</Text>
            </View>
          </View>

          {data.budgetByFundingSource.length > 0 && (
            <>
              <Text style={styles.subsectionTitle}>Funding Sources</Text>
              <View style={styles.table}>
                <View style={[styles.tableRow, styles.tableHeader]}>
                  <Text style={styles.tableCell}>Funding Source</Text>
                  <Text style={styles.tableCellRight}>Amount</Text>
                </View>
                {data.budgetByFundingSource.map((source, index) => (
                  <View key={index} style={styles.tableRow}>
                    <Text style={styles.tableCell}>{source.source_name}</Text>
                    <Text style={styles.tableCellRight}>{formatCurrency(source.total)}</Text>
                  </View>
                ))}
              </View>
            </>
          )}
        </View>

        <Text style={styles.footer}>
          {data.plan.title} - {generatedDate} - Page {executiveSummary ? '4' : '3'}
        </Text>
      </Page>

      {/* SWOT Analysis */}
      {data.plan.swot_analysis && (
        <Page size="A4" style={styles.page} wrap={true}>
          <View style={styles.pageHeader}>
            <Text style={{ textAlign: 'left', fontFamily: 'Helvetica-Bold' }}>{data.plan.department_name}</Text>
            <Text style={{ textAlign: 'right', position: 'absolute', right: 0, top: 0 }}>Strategic Plan | FY {data.plan.fiscal_year_start}-{data.plan.fiscal_year_end}</Text>
          </View>
          <View style={[styles.section, { marginTop: 40 }]}>
            <Text style={styles.sectionTitle}>SWOT Analysis</Text>
            <Text style={[styles.text, { marginBottom: 20, fontStyle: 'italic' }]}>
              A comprehensive analysis of internal strengths and weaknesses alongside external opportunities and threats.
            </Text>
            
            <View style={styles.swotGrid} wrap={true}>
              <View style={[styles.swotQuadrant, { backgroundColor: '#f0fff4' }]}>
                <Text style={[styles.swotTitle, { color: '#22543d', backgroundColor: '#c6f6d5', padding: 4, borderRadius: 3 }]}>STRENGTHS</Text>
                {(data.plan.swot_analysis as any).strengths?.map((item: string, index: number) => (
                  <View key={index} style={{ marginBottom: 3 }}>
                    <Text style={[styles.swotItem, { color: '#2f855a', lineHeight: 1.3 }]}>
- {renderInlineWithLinks(item)}
                    </Text>
                  </View>
                ))}
              </View>
              
              <View style={[styles.swotQuadrant, { backgroundColor: '#fef5e7' }]}>
                <Text style={[styles.swotTitle, { color: '#744210', backgroundColor: '#fed7d7', padding: 4, borderRadius: 3 }]}>WEAKNESSES</Text>
                {(data.plan.swot_analysis as any).weaknesses?.map((item: string, index: number) => (
                  <View key={index} style={{ marginBottom: 3 }}>
                    <Text style={[styles.swotItem, { color: '#c53030', lineHeight: 1.3 }]}>
                      - {formatMarkdownText(item)}
                    </Text>
                  </View>
                ))}
              </View>
              
              <View style={[styles.swotQuadrant, { backgroundColor: '#ebf8ff' }]}>
                <Text style={[styles.swotTitle, { color: '#1a365d', backgroundColor: '#bee3f8', padding: 4, borderRadius: 3 }]}>OPPORTUNITIES</Text>
                {(data.plan.swot_analysis as any).opportunities?.map((item: string, index: number) => (
                  <View key={index} style={{ marginBottom: 3 }}>
                    <Text style={[styles.swotItem, { color: '#2b6cb0', lineHeight: 1.3 }]}>
                      - {formatMarkdownText(item)}
                    </Text>
                  </View>
                ))}
              </View>
              
              <View style={[styles.swotQuadrant, { backgroundColor: '#fffbeb' }]}>
                <Text style={[styles.swotTitle, { color: '#7c2d12', backgroundColor: '#feebc8', padding: 4, borderRadius: 3 }]}>THREATS</Text>
                {(data.plan.swot_analysis as any).threats?.map((item: string, index: number) => (
                  <View key={index} style={{ marginBottom: 3 }}>
                    <Text style={[styles.swotItem, { color: '#d69e2e', lineHeight: 1.3 }]}>
                      - {formatMarkdownText(item)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
            
            {/* SWOT Summary */}
            <View style={[styles.highlight, { marginTop: 20 }]}>
              <Text style={[styles.text, { fontFamily: 'Helvetica-Bold', marginBottom: 8 }]}>Key Insights:</Text>
              <Text style={styles.text}>
                - Leverage strengths to capitalize on opportunities and address threats
              </Text>
              <Text style={styles.text}>
                - Address critical weaknesses that could hinder strategic objectives
              </Text>
              <Text style={styles.text}>
                - Monitor external factors that could impact plan implementation
              </Text>
            </View>
          </View>

          <Text style={styles.footer}>
            {data.plan.title} - {generatedDate} - Page {executiveSummary ? '5' : '4'}
          </Text>
        </Page>
      )}

      {/* Environmental Scan */}
      {data.plan.environmental_scan && (
        <Page size="A4" style={styles.page} wrap={true}>
          <View style={styles.pageHeader}>
            <Text style={{ textAlign: 'left', fontFamily: 'Helvetica-Bold' }}>{data.plan.department_name}</Text>
            <Text style={{ textAlign: 'right', position: 'absolute', right: 0, top: 0 }}>Strategic Plan | FY {data.plan.fiscal_year_start}-{data.plan.fiscal_year_end}</Text>
          </View>
          <View style={[styles.section, { marginTop: 40 }]}>
            <Text style={styles.sectionTitle}>Environmental Scan</Text>
            <Text style={[styles.text, { marginBottom: 20, fontStyle: 'italic' }]}>
              Analysis of external factors and trends that may impact the department's strategic objectives and operations.
            </Text>
            
            {Object.entries(data.plan.environmental_scan as any).map(([category, items], categoryIndex) => {
              if (!items || !Array.isArray(items) || items.length === 0) return null
              
              const categoryLabels: { [key: string]: { label: string; icon: string; color: string } } = {
                demographic_trends: { label: 'Demographic Trends', icon: '👥', color: '#7c3aed' },
                economic_factors: { label: 'Economic Factors', icon: '💰', color: '#059669' },
                regulatory_changes: { label: 'Regulatory/Legislative Changes', icon: '📜', color: '#dc2626' },
                technology_trends: { label: 'Technology Trends', icon: '🚀', color: '#2563eb' },
                community_expectations: { label: 'Community Expectations', icon: '🏡', color: '#d97706' },
              }
              
              const categoryInfo = categoryLabels[category] || { label: category, icon: '📊', color: '#6b7280' }
              
              return (
                <View key={categoryIndex} style={[styles.highlight, { borderLeftColor: categoryInfo.color, marginBottom: 16 }]}>
                  <Text style={[styles.subsectionTitle, { color: categoryInfo.color, marginTop: 0, marginBottom: 8 }]}>
                    {categoryInfo.label}
                  </Text>
                  <Text style={[styles.text, { fontSize: 10, color: '#6b7280', marginBottom: 8 }]}>
                    {items.length} factor{items.length !== 1 ? 's' : ''} identified
                  </Text>
                  {items.map((item: string, index: number) => (
                    <View key={index} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4 }}>
                      <Text style={[styles.text, { fontSize: 10, color: categoryInfo.color, marginRight: 6 }]}>-</Text>
                      <Text style={[styles.text, { fontSize: 10, flex: 1, lineHeight: 1.4 }]}>
{renderInlineWithLinks(item)}
                      </Text>
                    </View>
                  ))}
                </View>
              )
            })}
            
            {/* Environmental Scan Summary */}
            <View style={[styles.highlight, { backgroundColor: '#f0f9ff', borderLeftColor: '#0ea5e9' }]}>
              <Text style={[styles.text, { fontFamily: 'Helvetica-Bold', marginBottom: 8, color: '#0c4a6e' }]}>
                Strategic Implications
              </Text>
              <Text style={[styles.text, { fontSize: 10, marginBottom: 4 }]}>
                - <Text style={{ fontFamily: 'Helvetica-Bold' }}>Proactive Planning:</Text> These factors inform risk mitigation and opportunity identification
              </Text>
              <Text style={[styles.text, { fontSize: 10, marginBottom: 4 }]}>
                - <Text style={{ fontFamily: 'Helvetica-Bold' }}>Resource Allocation:</Text> Environmental trends influence budget and staffing decisions
              </Text>
              <Text style={[styles.text, { fontSize: 10 }]}>
                - <Text style={{ fontFamily: 'Helvetica-Bold' }}>Continuous Monitoring:</Text> Regular updates ensure strategic alignment with changing conditions
              </Text>
            </View>
          </View>

          <Text style={styles.footer}>
            {data.plan.title} - {generatedDate} - Page {data.plan.swot_analysis ? (executiveSummary ? '6' : '5') : (executiveSummary ? '5' : '4')}
          </Text>
        </Page>
      )}

      {/* Strategic Goals */}
      {goals.length > 0 && (
        <Page size="A4" style={styles.page} wrap={true}>
          <View style={styles.pageHeader}>
            <Text style={{ textAlign: 'left', fontFamily: 'Helvetica-Bold' }}>{data.plan.department_name}</Text>
            <Text style={{ textAlign: 'right', position: 'absolute', right: 0, top: 0 }}>Strategic Plan | FY {data.plan.fiscal_year_start}-{data.plan.fiscal_year_end}</Text>
          </View>
          <View style={[styles.section, { marginTop: 40 }]}>
            <Text style={styles.sectionTitle}>Strategic Goals</Text>
            <Text style={[styles.text, { marginBottom: 20, fontStyle: 'italic' }]}>
              The following strategic goals align with city priorities and guide our department's strategic direction over the planning period.
            </Text>
            
            {goals.map((goal: any, index: number) => {
              // Filter initiatives for this goal
              const goalInitiatives = initiatives.filter(init => init.goal_name === goal.name)
              const totalGoalCost = goalInitiatives.reduce((sum, init) => sum + init.total_cost, 0)
              
              return (
                <View key={goal.id} style={[styles.highlight, { marginBottom: 20, borderLeftColor: index % 2 === 0 ? '#3182ce' : '#38a169' }]}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <Text style={[styles.text, { fontFamily: 'Helvetica-Bold', fontSize: 14, flex: 1, color: '#1a365d' }]}>
                      Goal {goal.goal_number || index + 1}: {goal.title || goal.name}
                    </Text>
                    <Text style={[styles.text, { fontSize: 10, color: '#718096', marginLeft: 10 }]}>
                      {goalInitiatives.length} initiative{goalInitiatives.length !== 1 ? 's' : ''}
                    </Text>
                  </View>
                  
                  {goal.description && (
                    <Text style={[styles.text, { marginBottom: 10, lineHeight: 1.4 }]}>
{renderInlineWithLinks(goal.description)}
                    </Text>
                  )}
                  
                  {goal.city_priority_alignment && (
                    <View style={{ marginBottom: 10 }}>
                      <Text style={[styles.text, { fontFamily: 'Helvetica-Bold', fontSize: 10, color: '#553c9a' }]}>
                        City Priority Alignment:
                      </Text>
                      <Text style={[styles.text, { fontSize: 10, marginLeft: 10, color: '#6b46c1' }]}>
                        {goal.city_priority_alignment}
                      </Text>
                    </View>
                  )}
                  
                  {goal.objectives && goal.objectives.length > 0 && (
                    <View style={{ marginBottom: 10 }}>
                      <Text style={[styles.text, { fontFamily: 'Helvetica-Bold', fontSize: 10, color: '#065f46' }]}>
                        Key Objectives:
                      </Text>
                      {goal.objectives.map((objective: string, objIndex: number) => (
                        <Text key={objIndex} style={[styles.text, { fontSize: 9, marginLeft: 10, marginBottom: 2, lineHeight: 1.3 }]}>
- {renderInlineWithLinks(objective)}
                        </Text>
                      ))}
                    </View>
                  )}
                  
                  {goal.success_measures && goal.success_measures.length > 0 && (
                    <View style={{ marginBottom: 10 }}>
                      <Text style={[styles.text, { fontFamily: 'Helvetica-Bold', fontSize: 10, color: '#92400e' }]}>
                        Success Measures:
                      </Text>
                      {goal.success_measures.map((measure: string, measureIndex: number) => (
                        <Text key={measureIndex} style={[styles.text, { fontSize: 9, marginLeft: 10, marginBottom: 2, lineHeight: 1.3 }]}>
- {renderInlineWithLinks(measure)}
                        </Text>
                      ))}
                    </View>
                  )}
                  
                  {totalGoalCost > 0 && (
                    <View style={{ borderTopWidth: 1, borderTopColor: '#e2e8f0', paddingTop: 8, marginTop: 8 }}>
                      <Text style={[styles.text, { fontSize: 10, color: '#374151', fontFamily: 'Helvetica-Bold' }]}>
                        Total Investment: {formatCurrency(totalGoalCost)}
                      </Text>
                    </View>
                  )}
                </View>
              )
            })}
          </View>

          <Text style={styles.footer}>
            {data.plan.title} - {generatedDate} - Page {
              (data.plan.environmental_scan ? 1 : 0) + 
              (data.plan.swot_analysis ? 1 : 0) + 
              (executiveSummary ? 1 : 0) + 4
            }
          </Text>
        </Page>
      )}

      {/* Initiatives Details */}
      {initiatives.length > 0 && (
        <Page size="A4" style={styles.page} wrap={true}>
          <View style={styles.pageHeader}>
            <Text style={{ textAlign: 'left', fontFamily: 'Helvetica-Bold' }}>{data.plan.department_name}</Text>
            <Text style={{ textAlign: 'right', position: 'absolute', right: 0, top: 0 }}>Strategic Plan | FY {data.plan.fiscal_year_start}-{data.plan.fiscal_year_end}</Text>
          </View>
          <View style={[styles.section, { marginTop: 40 }]}>
            <Text style={styles.sectionTitle}>Strategic Initiatives</Text>
            <Text style={[styles.text, { marginBottom: 20, fontStyle: 'italic' }]}>
              Initiatives are organized by priority level to ensure critical needs are addressed first while maintaining strategic alignment.
            </Text>
            
            {/* Group initiatives by priority */}
            {['NEED', 'WANT', 'NICE_TO_HAVE'].map((priority) => {
              const priorityInitiatives = initiatives.filter(init => init.priority_level === priority)
              if (priorityInitiatives.length === 0) return null
              
              const priorityLabels: { [key: string]: { label: string; icon: string; color: string } } = {
                'NEED': { label: 'Critical Needs', icon: '🔴', color: '#dc2626' },
                'WANT': { label: 'Important Wants', icon: '🟡', color: '#d97706' },
                'NICE_TO_HAVE': { label: 'Nice to Haves', icon: '🟢', color: '#059669' }
              }
              
              const totalPriorityCost = priorityInitiatives.reduce((sum, init) => sum + init.total_cost, 0)
              
              return (
                <View key={priority} style={{ marginBottom: 20 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#e5e7eb', paddingBottom: 6 }}>
                    <Text style={[styles.subsectionTitle, { color: priorityLabels[priority].color, marginBottom: 0, marginTop: 0 }]}>
                      {priorityLabels[priority].label}
                    </Text>
                    <Text style={[styles.text, { fontSize: 10, marginLeft: 10, color: '#6b7280' }]}>
                      ({priorityInitiatives.length} initiative{priorityInitiatives.length !== 1 ? 's' : ''} - {formatCurrency(totalPriorityCost)})
                    </Text>
                  </View>
                  
                  {priorityInitiatives.map((initiative, index) => (
                    <View key={initiative.id} style={[styles.highlight, { marginBottom: 12, borderLeftColor: priorityLabels[priority].color }]}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                        <Text style={[styles.text, { fontFamily: 'Helvetica-Bold', flex: 1, fontSize: 12 }]}>
                          {initiative.name}
                        </Text>
                        <Text style={[styles.statusBadge, getPriorityColor(initiative.priority_level)]}>
                          {formatCurrency(initiative.total_cost)}
                        </Text>
                      </View>
                      
                      <Text style={[styles.text, { fontSize: 10, color: '#553c9a', marginBottom: 4 }]}>
                        {initiative.goal_name}
                      </Text>
                      
                      {initiative.description && (
                        <Text style={[styles.text, { fontSize: 10, lineHeight: 1.4, marginBottom: 6 }]}>
{renderInlineWithLinks(initiative.description)}
                        </Text>
                      )}
                      
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 6, marginTop: 6 }}>
                        <Text style={[styles.text, { fontSize: 9, color: '#6b7280' }]}>
                          Status: <Text style={{ fontFamily: 'Helvetica-Bold' }}>{initiative.status.replace('_', ' ').toUpperCase()}</Text>
                        </Text>
                        {initiative.responsible_party && (
                          <Text style={[styles.text, { fontSize: 9, color: '#6b7280' }]}>
                            Owner: <Text style={{ fontFamily: 'Helvetica-Bold' }}>{initiative.responsible_party}</Text>
                          </Text>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              )
            })}
            
            {/* Initiative Summary */}
            <View style={[styles.highlight, { backgroundColor: '#fefce8', borderLeftColor: '#eab308' }]}>
              <Text style={[styles.text, { fontFamily: 'Helvetica-Bold', marginBottom: 8, color: '#713f12' }]}>
                Initiative Portfolio Summary
              </Text>
              <Text style={[styles.text, { fontSize: 10, marginBottom: 4 }]}>
                - Total Investment: <Text style={{ fontFamily: 'Helvetica-Bold' }}>{formatCurrency(initiatives.reduce((sum, init) => sum + init.total_cost, 0))}</Text>
              </Text>
              <Text style={[styles.text, { fontSize: 10, marginBottom: 4 }]}>
                - High-Priority Initiatives: <Text style={{ fontFamily: 'Helvetica-Bold' }}>{initiatives.filter(i => i.priority_level === 'NEED').length}</Text>
              </Text>
              <Text style={[styles.text, { fontSize: 10 }]}>
                - Implementation will be phased based on priority level and resource availability
              </Text>
            </View>
          </View>

          <Text style={styles.footer}>
            {data.plan.title} - {generatedDate} - Final Page
          </Text>
        </Page>
      )}
    </Document>
  )
}