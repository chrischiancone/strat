import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { format } from 'date-fns'
import type { DashboardData } from '@/app/actions/dashboard'

// Define styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: 'Helvetica',
  },
  coverPage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'Helvetica-Bold',
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 10,
    textAlign: 'center',
    color: '#666',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 12,
    fontFamily: 'Helvetica-Bold',
    borderBottomWidth: 2,
    borderBottomColor: '#333',
    paddingBottom: 4,
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
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 4,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
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
    color: '#666',
    textAlign: 'center',
  },
  swotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  swotQuadrant: {
    width: '48%',
    margin: '1%',
    padding: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  swotTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  swotItem: {
    fontSize: 9,
    marginBottom: 2,
    lineHeight: 1.3,
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

const formatMarkdownText = (text: string): string => {
  // Simple markdown to plain text conversion for PDF
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markers
    .replace(/\*(.*?)\*/g, '$1') // Remove italic markers
    .replace(/\[\[.*?\]\]\(.*?\)/g, '') // Remove reference links
    .replace(/[#]+\s*/g, '') // Remove headers
    .trim()
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
          <Text style={styles.subtitle}>{data.plan.department_name}</Text>
          <Text style={styles.subtitle}>
            FY {data.plan.fiscal_year_start} - FY {data.plan.fiscal_year_end}
          </Text>
          
          <View style={[styles.highlight, { marginTop: 40, textAlign: 'center' }]}>
            <Text style={styles.text}>Strategic Plan Summary</Text>
            <Text style={styles.text}>{data.goalCount} Strategic Goals</Text>
            <Text style={styles.text}>{totalInitiatives} Initiatives</Text>
            <Text style={styles.text}>{formatCurrency(totalBudget)} Total Investment</Text>
          </View>

          <Text style={[styles.subtitle, { marginTop: 40 }]}>Prepared by</Text>
          <Text style={styles.subtitle}>{generatedBy}</Text>
          <Text style={[styles.subtitle, { marginTop: 20 }]}>{generatedDate}</Text>
        </View>
      </Page>

      {/* Executive Summary */}
      {executiveSummary && (
        <Page size="A4" style={styles.page}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Executive Summary</Text>
            {executiveSummary.split('\n\n').map((paragraph, index) => (
              <Text key={index} style={styles.text}>
                {formatMarkdownText(paragraph)}
              </Text>
            ))}
          </View>
          <Text style={styles.footer}>
            {data.plan.title} - {generatedDate} - Page 2
          </Text>
        </Page>
      )}

      {/* Plan Overview */}
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
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
        <View style={styles.section}>
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
        <Page size="A4" style={styles.page}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>SWOT Analysis</Text>
            
            <View style={styles.swotGrid}>
              <View style={styles.swotQuadrant}>
                <Text style={[styles.swotTitle, { color: '#155724' }]}>Strengths</Text>
                {(data.plan.swot_analysis as any).strengths?.map((item: string, index: number) => (
                  <Text key={index} style={styles.swotItem}>• {formatMarkdownText(item)}</Text>
                ))}
              </View>
              
              <View style={styles.swotQuadrant}>
                <Text style={[styles.swotTitle, { color: '#721c24' }]}>Weaknesses</Text>
                {(data.plan.swot_analysis as any).weaknesses?.map((item: string, index: number) => (
                  <Text key={index} style={styles.swotItem}>• {formatMarkdownText(item)}</Text>
                ))}
              </View>
              
              <View style={styles.swotQuadrant}>
                <Text style={[styles.swotTitle, { color: '#004085' }]}>Opportunities</Text>
                {(data.plan.swot_analysis as any).opportunities?.map((item: string, index: number) => (
                  <Text key={index} style={styles.swotItem}>• {formatMarkdownText(item)}</Text>
                ))}
              </View>
              
              <View style={styles.swotQuadrant}>
                <Text style={[styles.swotTitle, { color: '#856404' }]}>Threats</Text>
                {(data.plan.swot_analysis as any).threats?.map((item: string, index: number) => (
                  <Text key={index} style={styles.swotItem}>• {formatMarkdownText(item)}</Text>
                ))}
              </View>
            </View>
          </View>

          <Text style={styles.footer}>
            {data.plan.title} - {generatedDate} - Page {executiveSummary ? '5' : '4'}
          </Text>
        </Page>
      )}

      {/* Environmental Scan */}
      {data.plan.environmental_scan && (
        <Page size="A4" style={styles.page}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Environmental Scan</Text>
            
            {Object.entries(data.plan.environmental_scan as any).map(([category, items], categoryIndex) => {
              if (!items || !Array.isArray(items) || items.length === 0) return null
              
              const categoryLabels: { [key: string]: string } = {
                demographic_trends: 'Demographic Trends',
                economic_factors: 'Economic Factors',
                regulatory_changes: 'Regulatory/Legislative Changes',
                technology_trends: 'Technology Trends',
                community_expectations: 'Community Expectations',
              }
              
              return (
                <View key={categoryIndex}>
                  <Text style={styles.subsectionTitle}>{categoryLabels[category] || category}</Text>
                  {items.slice(0, 5).map((item: string, index: number) => (
                    <Text key={index} style={styles.bulletPoint}>
                      • {formatMarkdownText(item)}
                    </Text>
                  ))}
                </View>
              )
            })}
          </View>

          <Text style={styles.footer}>
            {data.plan.title} - {generatedDate} - Page {data.plan.swot_analysis ? (executiveSummary ? '6' : '5') : (executiveSummary ? '5' : '4')}
          </Text>
        </Page>
      )}

      {/* Strategic Goals */}
      {goals.length > 0 && (
        <Page size="A4" style={styles.page}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Strategic Goals</Text>
            
            {goals.map((goal, index) => (
              <View key={goal.id} style={styles.highlight}>
                <Text style={[styles.text, { fontFamily: 'Helvetica-Bold', fontSize: 12 }]}>
                  Goal {index + 1}: {goal.name}
                </Text>
                {goal.description && (
                  <Text style={styles.text}>{goal.description}</Text>
                )}
                {goal.success_criteria && (
                  <>
                    <Text style={[styles.text, { fontFamily: 'Helvetica-Bold', marginTop: 6 }]}>
                      Success Criteria:
                    </Text>
                    <Text style={styles.text}>{goal.success_criteria}</Text>
                  </>
                )}
              </View>
            ))}
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
        <Page size="A4" style={styles.page}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Strategic Initiatives</Text>
            
            {initiatives.slice(0, 8).map((initiative, index) => (
              <View key={initiative.id} style={styles.highlight}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Text style={[styles.text, { fontFamily: 'Helvetica-Bold', flex: 1 }]}>
                    {initiative.name}
                  </Text>
                  <Text style={[styles.statusBadge, getPriorityColor(initiative.priority_level)]}>
                    {initiative.priority_level}
                  </Text>
                </View>
                
                <Text style={[styles.text, { fontSize: 10, color: '#666' }]}>
                  Goal: {initiative.goal_name}
                </Text>
                
                {initiative.description && (
                  <Text style={styles.text}>{initiative.description}</Text>
                )}
                
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
                  <Text style={[styles.text, { fontSize: 10 }]}>
                    Status: {initiative.status.replace('_', ' ').toUpperCase()}
                  </Text>
                  <Text style={[styles.text, { fontSize: 10, fontFamily: 'Helvetica-Bold' }]}>
                    {formatCurrency(initiative.total_cost)}
                  </Text>
                </View>
                
                {initiative.responsible_party && (
                  <Text style={[styles.text, { fontSize: 10, color: '#666' }]}>
                    Owner: {initiative.responsible_party}
                  </Text>
                )}
              </View>
            ))}

            {initiatives.length > 8 && (
              <Text style={[styles.text, { fontStyle: 'italic', textAlign: 'center' }]}>
                ... and {initiatives.length - 8} more initiatives
              </Text>
            )}
          </View>

          <Text style={styles.footer}>
            {data.plan.title} - {generatedDate} - Final Page
          </Text>
        </Page>
      )}
    </Document>
  )
}