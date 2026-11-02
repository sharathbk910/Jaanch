import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Eye,
  Edit3,
  CheckCircle2,
  XCircle,
  Flag,
  RotateCcw,
  RefreshCw,
  Search,
  Filter,
  Lock,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext.js';
import { apiClient } from '../lib/apiClient.js';
import { useLanguage } from '../i18n/LanguageContext.js';
import { Button } from '../components/ui/Button.js';
import { Input, Textarea } from '../components/ui/Input.js';
import { SEOHead } from '../components/seo/SEOHead.js';

interface ModerationQueueItem {
  id: string;
  publicId: string;
  status: string;
  category: string;
  scrubbedText: string;
  firstReportedAt: string;
  reportCount: number;
  indicators: string[];
}

interface RecordDetail {
  id: string;
  publicId: string;
  status: string;
  category: string;
  scrubbedText: string;
  firstReportedAt: string;
  confirmedAt: string | null;
  reportCount: number;
  indicators: Array<{ type: string; maskedDisplay: string }>;
  history: Array<{ action: string; reason: string; createdAt: string; newStatus: string | null }>;
}

export function ModerationPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const isModerator = user?.role === 'moderator';

  const [activeTab, setActiveTab] = useState<string>('all');
  const [items, setItems] = useState<ModerationQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Detail modal
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [recordDetail, setRecordDetail] = useState<RecordDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Action modal
  const [actionModal, setActionModal] = useState<{
    recordId: string;
    publicId: string;
    action: 'confirm' | 'dismiss' | 'dispute' | 'retract';
  } | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [actionSubmitting, setActionSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Edit scrubbing modal
  const [editModal, setEditModal] = useState<{
    recordId: string;
    publicId: string;
    scrubbedText: string;
  } | null>(null);
  const [newScrubbedText, setNewScrubbedText] = useState('');
  const [editReason, setEditReason] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const fetchQueue = async () => {
    if (!isModerator) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.getModerationQueue({
        status: activeTab === 'all' ? undefined : activeTab,
        limit: 50,
      });
      setItems(res.items || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load moderation queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [isModerator, activeTab]);

  const handleOpenDetail = async (id: string) => {
    setSelectedRecordId(id);
    setDetailLoading(true);
    try {
      const detail = await apiClient.getModerationRecordDetail(id);
      setRecordDetail(detail);
    } catch (err: any) {
      setError(err.message || 'Failed to load record detail');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleExecuteAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionModal) return;
    if (actionReason.trim().length < 5) {
      setActionError('Mandatory reason must be at least 5 characters');
      return;
    }

    setActionSubmitting(true);
    setActionError(null);

    try {
      await apiClient.executeModerationAction(actionModal.recordId, {
        action: actionModal.action,
        reason: actionReason.trim(),
      });

      setActionModal(null);
      setActionReason('');
      fetchQueue();
      if (selectedRecordId === actionModal.recordId) {
        handleOpenDetail(actionModal.recordId);
      }
    } catch (err: any) {
      setActionError(err.message || 'Action failed');
    } finally {
      setActionSubmitting(false);
    }
  };

  const handleExecuteEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModal) return;
    if (editReason.trim().length < 5) {
      setEditError('Mandatory reason must be at least 5 characters');
      return;
    }

    setEditSubmitting(true);
    setEditError(null);

    try {
      await apiClient.editModerationScrubbing(editModal.recordId, {
        newScrubbedText: newScrubbedText.trim(),
        reason: editReason.trim(),
      });

      setEditModal(null);
      fetchQueue();
      if (selectedRecordId === editModal.recordId) {
        handleOpenDetail(editModal.recordId);
      }
    } catch (err: any) {
      setEditError(err.message || 'Failed to update scrubbed text');
    } finally {
      setEditSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 bg-surface border border-border rounded-2xl text-center space-y-4">
          <div className="w-12 h-12 bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Moderator Sign In Required</h2>
          <p className="text-xs text-muted-foreground">
            The shared threat intelligence and moderation queue requires an authenticated moderator account.
          </p>
          <Button variant="primary" onClick={() => navigate('/login')} className="w-full justify-center">
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  if (!isModerator) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 bg-surface border border-border rounded-2xl text-center space-y-4">
          <div className="w-12 h-12 bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 rounded-full flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Access Restricted</h2>
          <p className="text-xs text-muted-foreground">
            Your current account ({user.email}) has role <code className="text-primary font-mono">{user.role}</code>.
            Only accounts with role <code className="text-primary font-mono">moderator</code> can access the threat
            investigation queue.
          </p>
          <Button variant="outline" onClick={() => navigate('/')} className="w-full justify-center">
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-200">
            Confirmed Scam
          </span>
        );
      case 'suspicious':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-200">
            Suspicious
          </span>
        );
      case 'ai_flagged':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-200">
            AI Flagged
          </span>
        );
      case 'disputed':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-200">
            Disputed
          </span>
        );
      case 'dismissed':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-muted text-muted-foreground">
            Dismissed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-200">
            Reported
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <SEOHead
        noIndex={true}
        title="Threat Intelligence Moderation Portal | Jaanch AI"
        description="Internal human-in-the-loop threat indicator moderation and allowlist review."
      />
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-terracotta" />
            <h1 className="text-2xl font-bold font-serif text-foreground">Scam Intelligence Moderation</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Community threat verification triage. Only verified moderator actions can confirm records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchQueue} disabled={loading}>
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Queue
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto py-4 border-b border-border scrollbar-none">
        {['all', 'reported', 'ai_flagged', 'suspicious', 'confirmed', 'disputed', 'dismissed'].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize whitespace-nowrap transition-colors ${
              activeTab === tab
                ? 'bg-foreground text-background'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted-subtle'
            }`}
          >
            {tab.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Main Content List */}
      <div className="py-6">
        {loading ? (
          <div className="py-20 text-center text-muted-foreground text-sm">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
            Loading threat records...
          </div>
        ) : error ? (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-border rounded-2xl bg-surface/50">
            <ShieldCheck className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-50" />
            <h3 className="text-sm font-semibold text-foreground">Queue Empty</h3>
            <p className="text-xs text-muted-foreground mt-1">
              No threat intelligence records found matching the status filter "{activeTab}".
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-surface border border-border rounded-xl p-5 hover:border-foreground/30 transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-bold text-foreground">{item.publicId}</span>
                    {getStatusBadge(item.status)}
                    <span className="text-xs px-2 py-0.5 rounded bg-muted-subtle text-muted-foreground font-medium">
                      {item.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>
                      <strong>{item.reportCount}</strong> {item.reportCount === 1 ? 'report' : 'reports'}
                    </span>
                    <span>{new Date(item.firstReportedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Scrubbed Text Excerpt */}
                <p className="text-xs text-foreground/90 font-mono bg-muted-subtle/40 p-3 rounded-lg line-clamp-2 border border-border/60">
                  {item.scrubbedText}
                </p>

                {/* Indicators Preview */}
                {item.indicators && item.indicators.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {item.indicators.map((ind, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center text-[11px] font-mono px-2 py-0.5 rounded bg-surface border border-border text-foreground"
                      >
                        {ind}
                      </span>
                    ))}
                  </div>
                )}

                {/* Action Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/60">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenDetail(item.id)}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" />
                      Detail
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditModal({
                          recordId: item.id,
                          publicId: item.publicId,
                          scrubbedText: item.scrubbedText,
                        });
                        setNewScrubbedText(item.scrubbedText);
                        setEditReason('');
                        setEditError(null);
                      }}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      <Edit3 className="w-3.5 h-3.5 mr-1" />
                      Edit Scrubbing
                    </Button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {item.status !== 'confirmed' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          setActionModal({
                            recordId: item.id,
                            publicId: item.publicId,
                            action: 'confirm',
                          });
                          setActionReason('');
                          setActionError(null);
                        }}
                        className="text-xs bg-rose-600 hover:bg-rose-700 text-white"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                        Confirm Scam
                      </Button>
                    )}

                    {item.status !== 'dismissed' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setActionModal({
                            recordId: item.id,
                            publicId: item.publicId,
                            action: 'dismiss',
                          });
                          setActionReason('');
                          setActionError(null);
                        }}
                        className="text-xs"
                      >
                        <XCircle className="w-3.5 h-3.5 mr-1" />
                        Dismiss
                      </Button>
                    )}

                    {item.status === 'confirmed' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setActionModal({
                            recordId: item.id,
                            publicId: item.publicId,
                            action: 'retract',
                          });
                          setActionReason('');
                          setActionError(null);
                        }}
                        className="text-xs text-amber-600 hover:text-amber-700"
                      >
                        <RotateCcw className="w-3.5 h-3.5 mr-1" />
                        Retract
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Record Detail Modal */}
      {selectedRecordId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-2xl bg-surface rounded-2xl border border-border shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted-subtle/30">
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-5 h-5 text-terracotta" />
                <h2 className="text-base font-bold text-foreground">
                  Record Detail {recordDetail?.publicId}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRecordId(null)}
                className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              {detailLoading || !recordDetail ? (
                <div className="py-12 text-center text-muted-foreground">Loading detail...</div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(recordDetail.status)}
                    <span className="text-muted-foreground font-mono">
                      {recordDetail.reportCount} reports
                    </span>
                    <span className="text-muted-foreground">
                      First reported: {new Date(recordDetail.firstReportedAt).toLocaleString()}
                    </span>
                  </div>

                  <div>
                    <label className="font-bold text-foreground uppercase tracking-wider block mb-1">
                      Scrubbed Message (PII Sanitized)
                    </label>
                    <div className="p-4 bg-muted-subtle rounded-xl font-mono whitespace-pre-wrap border border-border/80">
                      {recordDetail.scrubbedText}
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-foreground uppercase tracking-wider block mb-1">
                      Masked Contact & Payment Indicators ({recordDetail.indicators.length})
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {recordDetail.indicators.map((ind, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded bg-surface border border-border font-mono"
                        >
                          {ind.type}: {ind.maskedDisplay}
                        </span>
                      ))}
                    </div>
                  </div>

                  {recordDetail.history && recordDetail.history.length > 0 && (
                    <div>
                      <label className="font-bold text-foreground uppercase tracking-wider block mb-1">
                        Moderation Action History
                      </label>
                      <div className="space-y-2">
                        {recordDetail.history.map((h, i) => (
                          <div key={i} className="p-2.5 bg-muted-subtle/50 rounded-lg border border-border/60">
                            <div className="flex items-center justify-between text-muted-foreground text-[11px]">
                              <span className="font-semibold text-foreground uppercase">{h.action}</span>
                              <span>{new Date(h.createdAt).toLocaleString()}</span>
                            </div>
                            <p className="mt-1 text-foreground">{h.reason}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="p-4 border-t border-border flex justify-end gap-2 bg-muted-subtle/20">
              <Button variant="ghost" onClick={() => setSelectedRecordId(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Moderation Action Modal */}
      {actionModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md bg-surface rounded-2xl border border-border shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-foreground capitalize">
              {actionModal.action} Record {actionModal.publicId}
            </h3>

            {actionModal.action === 'confirm' && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl text-xs text-amber-800 dark:text-amber-200">
                <strong>Attention:</strong> Confirming this record will immediately elevate matching offers for all
                students to <code>CONFIRMED_SCAM</code>. Ensure all evidence has been verified. Domain allowlist is
                enforced.
              </div>
            )}

            {actionError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            <form onSubmit={handleExecuteAction} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1">
                  Mandatory Action Reason *
                </label>
                <Textarea
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder="State the evidence or verification rationale..."
                  rows={3}
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setActionModal(null)}
                  disabled={actionSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={actionSubmitting}>
                  {actionSubmitting ? 'Executing...' : `Execute ${actionModal.action}`}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Scrubbing Modal */}
      {editModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg bg-surface rounded-2xl border border-border shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-foreground">
              Edit Scrubbed Text – {editModal.publicId}
            </h3>

            {editError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleExecuteEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1">
                  Sanitized Scrubbed Text
                </label>
                <Textarea
                  value={newScrubbedText}
                  onChange={(e) => setNewScrubbedText(e.target.value)}
                  rows={6}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1">
                  Reason for Edit *
                </label>
                <Input
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  placeholder="e.g. Redacted student name inadvertently missed in initial pass"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setEditModal(null)}
                  disabled={editSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={editSubmitting}>
                  {editSubmitting ? 'Saving...' : 'Save Scrubbed Text'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ModerationPage;

