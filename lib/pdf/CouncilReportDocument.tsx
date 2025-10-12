import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import type { CouncilReportData } from '@/app/actions/city-council-report'
import { format } from 'date-fns'

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
    fontSize: 28,
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'Helvetica-Bold',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
    color: '#666',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 12,
    fontFamily: 'Helvetica-Bold',
    borderBottomWidth: 2,
    borderBottomColor: '#333',
    paddingBottom: 4,
  },
  subsectionTitle: {
    fontSize: 14,
    marginBottom: 8,
    marginTop: 12,
    fontFamily: 'Helvetica-Bold',
  },
  text: {
    marginBottom: 6,
    lineHeight: 1.5,
  },
  table: {
    display: 'flex',
    width: '100%',
    marginTop: 10,
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
    backgroundColor: '#f9f9f9',
    borderRadius: 4,
    marginBottom: 12,
  },
  alert: {
    padding: 12,
    backgroundColor: '#fee',
    borderRadius: 4,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#c00',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
  },
  badgeNeed: {
    backgroundColor: '#fee',
    color: '#c00',
  },
  badgeWant: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
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
})

interface CouncilReportDocumentProps {
  data: CouncilReportData
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`
}

export const CouncilReportDocument: React.FC<CouncilReportDocumentProps> = ({ data }) => {
  const generatedDate = format(new Date(data.metadata.generated_at), 'MMMM d, yyyy')

  return (
    <Document>
      {/* Cover Page */}
      <Page size="A4" style={styles.page}>
        <View style={styles.coverPage}>
          <Text style={styles.title}>{data.metadata.title}</Text>
          <Text style={styles.subtitle}>{data.metadata.municipality_name}</Text>
          <Text style={styles.subtitle}>Fiscal Year(s): {data.metadata.fiscal_years}</Text>
          <Text style={[styles.subtitle, { marginTop: 40 }]}>Prepared by</Text>
          <Text style={styles.subtitle}>{data.metadata.generated_by_name}</Text>
          <Text style={[styles.subtitle, { marginTop: 20 }]}>{generatedDate}</Text>
        </View>
      </Page>

      {/* Executive Summary */}
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Executive Summary</Text>
          <View style={styles.highlight}>
            <Text style={styles.text}>
              Total Strategic Plans: {data.executive_summary.total_plans}
            </Text>
            <Text style={styles.text}>
              Total Strategic Initiatives: {data.executive_summary.total_initiatives}
            </Text>
            <Text style={styles.text}>
              Total Investment: {formatCurrency(data.executive_summary.total_budget)}
            </Text>
            <Text style={styles.text}>
              Initiatives In Progress: {data.executive_summary.in_progress_count}
            </Text>
            <Text style={styles.text}>
              Completed Initiatives: {data.executive_summary.completed_count}
            </Text>
            {data.executive_summary.at_risk_count > 0 && (
              <Text style={[styles.text, { color: '#c00', fontFamily: 'Helvetica-Bold' }]}>
                At-Risk Initiatives: {data.executive_summary.at_risk_count}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.subsectionTitle}>Key Observations</Text>
          <Text style={styles.text}>
            • The city has {data.executive_summary.total_initiatives} strategic initiatives planned
            across {data.executive_summary.total_plans} departmental plans.
          </Text>
          <Text style={styles.text}>
            • Total investment of {formatCurrency(data.executive_summary.total_budget)} over the
            planning period.
          </Text>
          <Text style={styles.text}>
            • {data.executive_summary.in_progress_count} initiatives are currently in progress, with{' '}
            {data.executive_summary.completed_count} successfully completed.
          </Text>
          {data.executive_summary.at_risk_count > 0 && (
            <Text style={[styles.text, { color: '#c00' }]}>
              • {data.executive_summary.at_risk_count} initiatives require immediate attention to
              get back on track.
            </Text>
          )}
        </View>
      </Page>

      {/* Budget Summary */}
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Budget Summary</Text>

          {/* By Year */}
          <Text style={styles.subsectionTitle}>Budget by Fiscal Year</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={styles.tableCell}>Fiscal Year</Text>
              <Text style={styles.tableCellRight}>Amount</Text>
            </View>
            {data.budget_summary.by_year.map((item, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.tableCell}>FY {item.fiscal_year}</Text>
                <Text style={styles.tableCellRight}>{formatCurrency(item.total)}</Text>
              </View>
            ))}
          </View>

          {/* By Department */}
          <Text style={styles.subsectionTitle}>Budget by Department</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={styles.tableCell}>Department</Text>
              <Text style={styles.tableCellRight}>Amount</Text>
              <Text style={styles.tableCellRight}>% of Total</Text>
            </View>
            {data.budget_summary.by_department.slice(0, 10).map((item, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.tableCell}>{item.department_name}</Text>
                <Text style={styles.tableCellRight}>{formatCurrency(item.total)}</Text>
                <Text style={styles.tableCellRight}>{formatPercentage(item.percentage)}</Text>
              </View>
            ))}
          </View>
        </View>

        <Text style={styles.footer}>
          {data.metadata.title} - {generatedDate} - Page 3
        </Text>
      </Page>

      {/* Budget by Funding Source & Priority */}
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          {/* By Funding Source */}
          <Text style={styles.subsectionTitle}>Budget by Funding Source</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={styles.tableCell}>Funding Source</Text>
              <Text style={styles.tableCellRight}>Amount</Text>
              <Text style={styles.tableCellRight}>% of Total</Text>
            </View>
            {data.budget_summary.by_funding_source.map((item, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.tableCell}>{item.source_name}</Text>
                <Text style={styles.tableCellRight}>{formatCurrency(item.total)}</Text>
                <Text style={styles.tableCellRight}>{formatPercentage(item.percentage)}</Text>
              </View>
            ))}
          </View>

          {/* By Priority */}
          <Text style={styles.subsectionTitle}>Budget by Priority Level</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={styles.tableCell}>Priority</Text>
              <Text style={styles.tableCellRight}>Amount</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Need (Critical)</Text>
              <Text style={styles.tableCellRight}>
                {formatCurrency(data.budget_summary.by_priority.need)}
              </Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Want (Important)</Text>
              <Text style={styles.tableCellRight}>
                {formatCurrency(data.budget_summary.by_priority.want)}
              </Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Nice to Have (Optional)</Text>
              <Text style={styles.tableCellRight}>
                {formatCurrency(data.budget_summary.by_priority.nice_to_have)}
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.footer}>
          {data.metadata.title} - {generatedDate} - Page 4
        </Text>
      </Page>

      {/* At-Risk Initiatives */}
      {data.at_risk_initiatives.length > 0 && (
        <Page size="A4" style={styles.page}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>At-Risk Initiatives</Text>
            <View style={styles.alert}>
              <Text style={[styles.text, { fontFamily: 'Helvetica-Bold', color: '#c00' }]}>
                {data.at_risk_initiatives.length} initiatives require immediate attention
              </Text>
            </View>

            {data.at_risk_initiatives.map((init, index) => (
              <View key={index} style={styles.highlight}>
                <Text style={[styles.text, { fontFamily: 'Helvetica-Bold' }]}>{init.name}</Text>
                <Text style={styles.text}>Department: {init.department_name}</Text>
                <Text style={styles.text}>Priority: {init.priority_level}</Text>
                <Text style={styles.text}>Budget: {formatCurrency(init.total_cost)}</Text>
                {init.responsible_party && (
                  <Text style={styles.text}>Owner: {init.responsible_party}</Text>
                )}
              </View>
            ))}
          </View>

          <Text style={styles.footer}>
            {data.metadata.title} - {generatedDate} - Page 5
          </Text>
        </Page>
      )}

      {/* Department Highlights */}
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Department Highlights</Text>

          {data.department_highlights.slice(0, 5).map((dept, index) => (
            <View key={index} style={styles.highlight}>
              <Text style={[styles.text, { fontFamily: 'Helvetica-Bold', fontSize: 12 }]}>
                {dept.department_name}
              </Text>
              <Text style={styles.text}>Plan: {dept.plan_title}</Text>
              <Text style={styles.text}>
                Total Budget: {formatCurrency(dept.total_budget)} • {dept.initiative_count}{' '}
                Initiatives
              </Text>
              <Text style={[styles.text, { marginTop: 6, fontSize: 10 }]}>Top Initiatives:</Text>
              {dept.top_initiatives.map((init, i) => (
                <Text key={i} style={[styles.text, { fontSize: 9, marginLeft: 10 }]}>
                  • {init.name} ({init.priority_level}) - {formatCurrency(init.total_cost)}
                </Text>
              ))}
            </View>
          ))}
        </View>

        <Text style={styles.footer}>
          {data.metadata.title} - {generatedDate} - Page{' '}
          {data.at_risk_initiatives.length > 0 ? '6' : '5'}
        </Text>
      </Page>

      {/* Top 10 Initiatives Appendix */}
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appendix: Top 10 Initiatives by Budget</Text>

          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.tableCell, { flex: 0.5 }]}>Rank</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>Initiative</Text>
              <Text style={styles.tableCell}>Department</Text>
              <Text style={styles.tableCellRight}>Budget</Text>
            </View>
            {data.top_initiatives.map((init) => (
              <View key={init.rank} style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 0.5 }]}>{init.rank}</Text>
                <Text style={[styles.tableCell, { flex: 2 }]}>{init.name}</Text>
                <Text style={styles.tableCell}>{init.department_name}</Text>
                <Text style={styles.tableCellRight}>{formatCurrency(init.total_cost)}</Text>
              </View>
            ))}
          </View>
        </View>

        <Text style={styles.footer}>
          {data.metadata.title} - {generatedDate} - End of Report
        </Text>
      </Page>
    </Document>
  )
}
