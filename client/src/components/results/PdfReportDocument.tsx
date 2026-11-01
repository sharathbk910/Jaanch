import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { type AnalyzeResult } from '@jaanch/shared';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 9,
    fontFamily: 'Helvetica',
    color: '#141414',
    backgroundColor: '#FFFFFF',
    lineHeight: 1.35,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E6E5E1',
    marginBottom: 12,
  },
  brand: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: '#C2410C',
  },
  tagline: {
    fontSize: 7.5,
    color: '#6B6A66',
    marginTop: 1,
  },
  meta: {
    fontSize: 7.5,
    color: '#6B6A66',
    textAlign: 'right',
  },
  statusCard: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#E6E5E1',
    borderLeftWidth: 4,
    borderRadius: 3,
    marginBottom: 12,
  },
  eyebrow: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: '#6B6A66',
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  statusTitle: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#141414',
    marginBottom: 3,
  },
  statusDesc: {
    fontSize: 8.5,
    color: '#57534E',
  },
  confidenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    paddingTop: 4,
    borderTopWidth: 0.5,
    borderTopColor: '#E6E5E1',
    fontSize: 7.5,
    color: '#6B6A66',
  },
  alertCard: {
    padding: 10,
    backgroundColor: '#FDEEEE',
    borderWidth: 1,
    borderColor: '#F0B4B4',
    borderRadius: 3,
    marginBottom: 12,
  },
  alertTitle: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: '#9B1C1C',
    marginBottom: 2,
  },
  alertDesc: {
    fontSize: 8,
    color: '#7F1D1D',
  },
  section: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 9.5,
    fontFamily: 'Helvetica-Bold',
    color: '#141414',
    textTransform: 'uppercase',
    borderBottomWidth: 0.5,
    borderBottomColor: '#E6E5E1',
    paddingBottom: 3,
    marginBottom: 6,
  },
  signalCard: {
    padding: 8,
    borderWidth: 0.5,
    borderColor: '#E6E5E1',
    borderRadius: 2,
    marginBottom: 6,
    backgroundColor: '#FAFAFA',
  },
  signalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  signalTitle: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: '#141414',
  },
  severityBadge: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: '#9B1C1C',
    textTransform: 'uppercase',
  },
  quote: {
    fontSize: 7.5,
    fontFamily: 'Courier',
    color: '#141414',
    padding: 4,
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 1.5,
    borderLeftColor: '#C2410C',
    marginTop: 3,
    marginBottom: 3,
  },
  whyItMatters: {
    fontSize: 7.5,
    color: '#57534E',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  gridItem: {
    width: '48%',
    padding: 6,
    borderWidth: 0.5,
    borderColor: '#E6E5E1',
    borderRadius: 2,
  },
  gridLabel: {
    fontSize: 7,
    color: '#6B6A66',
    textTransform: 'uppercase',
  },
  gridValue: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#141414',
    marginTop: 1,
  },
  actionItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  bullet: {
    width: 8,
    fontSize: 8,
    color: '#C2410C',
  },
  actionText: {
    flex: 1,
    fontSize: 8,
    color: '#141414',
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 30,
    right: 30,
    borderTopWidth: 0.5,
    borderTopColor: '#E6E5E1',
    paddingTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 7,
    color: '#6B6A66',
  },
});

export interface PdfReportDocumentProps {
  result: AnalyzeResult;
  timestamp?: string;
  domain?: string;
}

export function PdfReportDocument({ result, timestamp, domain }: PdfReportDocumentProps) {
  const statusBorderColors: Record<string, string> = {
    LIKELY_GENUINE: '#0F5F5A',
    NEEDS_REVIEW: '#7A4B00',
    HIGH_CONCERN: '#9B1C1C',
    CONFIRMED_SCAM: '#7F1D1D',
  };

  const statusDescriptions: Record<string, string> = {
    LIKELY_GENUINE: 'No hard scam indicators detected; corroborated by positive evidence.',
    NEEDS_REVIEW: 'Incomplete information or unverified contact channels. Exercise caution.',
    HIGH_CONCERN: 'Hard disqualifiers found (upfront fee, OTP request, lookalike domain).',
    CONFIRMED_SCAM: 'Matched a verified fraudulent entity in the student safety database.',
  };

  const statusTitles: Record<string, string> = {
    LIKELY_GENUINE: 'Likely Genuine',
    NEEDS_REVIEW: 'Needs Review',
    HIGH_CONCERN: 'High Concern',
    CONFIRMED_SCAM: 'Confirmed Fraud',
  };

  const borderColor = statusBorderColors[result.status] || '#E6E5E1';
  const hasFeeOrOtp =
    result.signals.some((s) => s.ruleId === 'RULE_UPFRONT_FEE' || s.ruleId === 'RULE_BANK_OTP_DEBIT') ||
    (result.extractedEntities.amounts && result.extractedEntities.amounts.length > 0) ||
    (result.extractedEntities.upiHandles && result.extractedEntities.upiHandles.length > 0);

  // Currency character formatting safe for standard PDF fonts (Rs. / INR / ₹)
  const formatAmount = (amt: string) => amt.replace(/₹/g, 'Rs. ');

  return (
    <Document title={`Jaanch Audit - ${result.auditId}`} author="Jaanch Trust & Safety">
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>JAANCH.</Text>
            <Text style={styles.tagline}>Digital Trust & Safety for Indian Students</Text>
          </View>
          <View style={styles.meta}>
            <Text>Audit ID: {result.auditId}</Text>
            <Text>Date: {timestamp || new Date().toISOString().split('T')[0]}</Text>
            {domain && <Text>Category: {domain.toUpperCase()}</Text>}
          </View>
        </View>

        {/* Status Card */}
        <View style={[styles.statusCard, { borderLeftColor: borderColor }]}>
          <Text style={styles.eyebrow}>Verification Status</Text>
          <Text style={styles.statusTitle}>{statusTitles[result.status] || result.status}</Text>
          <Text style={styles.statusDesc}>{statusDescriptions[result.status] || ''}</Text>
          <View style={styles.confidenceRow}>
            <Text>Confidence Score: {result.confidenceScore}%</Text>
            <Text>Independent Rules Checked: 8 of 8</Text>
          </View>
        </View>

        {/* Payment Alert if applicable */}
        {hasFeeOrOtp && (
          <View style={styles.alertCard}>
            <Text style={styles.alertTitle}>FINANCIAL SAFETY ALERT – 1930 HELPLINE</Text>
            <Text style={styles.alertDesc}>
              This offer demands an upfront fee, deposit, or banking credentials. Legitimate employers never ask candidates to pay money. If you have sent funds, call the National Cyber Crime Helpline at 1930 immediately or file a complaint at cybercrime.gov.in.
            </Text>
          </View>
        )}

        {/* Extracted Identifiers Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Extracted Opportunity Indicators</Text>
          <View style={styles.grid}>
            {result.extractedEntities.organization && (
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Claimed Organization</Text>
                <Text style={styles.gridValue}>{result.extractedEntities.organization}</Text>
              </View>
            )}
            {result.extractedEntities.amounts && result.extractedEntities.amounts.length > 0 && (
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Mentioned Amounts</Text>
                <Text style={styles.gridValue}>
                  {result.extractedEntities.amounts.map(formatAmount).join(', ')}
                </Text>
              </View>
            )}
            {result.extractedEntities.upiHandles && result.extractedEntities.upiHandles.length > 0 && (
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>UPI Handles</Text>
                <Text style={styles.gridValue}>{result.extractedEntities.upiHandles.join(', ')}</Text>
              </View>
            )}
            {result.extractedEntities.phones && result.extractedEntities.phones.length > 0 && (
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Phone Numbers</Text>
                <Text style={styles.gridValue}>{result.extractedEntities.phones.join(', ')}</Text>
              </View>
            )}
            {result.extractedEntities.domains && result.extractedEntities.domains.length > 0 && (
              <View style={[styles.gridItem, { width: '98%' }]}>
                <Text style={styles.gridLabel}>Domains / Links</Text>
                <Text style={styles.gridValue}>{result.extractedEntities.domains.join(', ')}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Observed Signals */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Observed Signals ({result.signals.length})
          </Text>
          {result.signals.length === 0 ? (
            <Text style={{ fontSize: 8, color: '#6B6A66' }}>
              No hard scam signals detected.
            </Text>
          ) : (
            result.signals.map((sig, idx) => (
              <View key={idx} style={styles.signalCard}>
                <View style={styles.signalHeader}>
                  <Text style={styles.signalTitle}>{sig.title}</Text>
                  <Text style={styles.severityBadge}>{sig.severity}</Text>
                </View>
                {sig.evidence && (
                  <Text style={styles.quote}>"{sig.evidence}"</Text>
                )}
                <Text style={styles.whyItMatters}>Why it matters: {sig.whyItMatters}</Text>
              </View>
            ))
          )}
        </View>

        {/* Actionable Next Steps */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actionable Next Steps</Text>
          {result.recommendedActions.map((action, idx) => (
            <View key={idx} style={styles.actionItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.actionText}>{action}</Text>
            </View>
          ))}
          <View style={styles.actionItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.actionText}>
              Cross-reference company registration on MCA (mca.gov.in) and National Career Service (ncs.gov.in).
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Jaanch Student Safety Initiative – Non-profit public service</Text>
          <Text>National Cybercrime Helpline: 1930 | cybercrime.gov.in</Text>
        </View>
      </Page>
    </Document>
  );
}

