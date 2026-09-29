"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, Trash2, AlertTriangle, FolderOpen } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import type { Session } from "@/lib/types";

export default function HistoryPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("medfa_history");
      if (stored) {
        setSessions(JSON.parse(stored));
      }
    } catch {
      // localStorage unavailable
    }
  }, []);

  const deleteSession = (sessionId: string) => {
    const updated = sessions.filter((s) => s.session_id !== sessionId);
    setSessions(updated);
    localStorage.setItem("medfa_history", JSON.stringify(updated));
    setDeleteTarget(null);
  };

  const clearAll = () => {
    setSessions([]);
    localStorage.removeItem("medfa_history");
    setShowConfirm(false);
  };

  const formatDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="history-page">
      <div className="container reading-width">
        <div className="history-header">
          <div>
            <h1>Session History</h1>
            <p className="history-subtitle">
              Anonymous local sessions saved in your browser. No data is sent to
              any server.
            </p>
          </div>
          {sessions.length > 0 && (
            <Button
              variant="danger"
              onClick={() => setShowConfirm(true)}
              icon={<Trash2 size={16} />}
            >
              Clear all
            </Button>
          )}
        </div>

        {/* Clear all confirmation */}
        {showConfirm && (
          <Alert variant="warning" id="clear-confirm">
            <div className="confirm-content">
              <p>
                <strong>Clear all history?</strong> This action cannot be undone.
              </p>
              <div className="confirm-actions">
                <Button variant="danger" onClick={clearAll}>
                  Yes, clear all
                </Button>
                <Button variant="secondary" onClick={() => setShowConfirm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </Alert>
        )}

        {/* Empty state */}
        {sessions.length === 0 && !showConfirm && (
          <div className="empty-state">
            <FolderOpen size={48} strokeWidth={1.2} />
            <h2>No sessions yet</h2>
            <p>
              Complete a symptom assessment to see your history here. Sessions are
              stored locally in your browser.
            </p>
            <Button
              variant="primary"
              onClick={() => router.push("/")}
            >
              Start an assessment
            </Button>
          </div>
        )}

        {/* Session list */}
        <div className="sessions-list">
          {sessions.map((session, i) => (
            <Card
              key={session.session_id}
              id={`session-${session.session_id}`}
              className="session-card"
            >
              <div className="session-row">
                <div className="session-info">
                  <div className="session-date">
                    <Clock size={14} />
                    <span>{formatDate(session.created_at)}</span>
                  </div>
                  <div className="session-result">
                    <span className="session-top">
                      {session.top_diagnosis || "No result"}
                    </span>
                    {session.confidence !== undefined && (
                      <span className="session-confidence">
                        {session.confidence}% relevance
                      </span>
                    )}
                  </div>
                  {session.symptom_count !== undefined && (
                    <span className="text-caption">
                      {session.symptom_count} symptoms provided
                    </span>
                  )}
                </div>
                <div className="session-actions">
                  {deleteTarget === session.session_id ? (
                    <div className="delete-confirm-inline">
                      <Button
                        variant="danger"
                        onClick={() => deleteSession(session.session_id)}
                      >
                        Delete
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => setDeleteTarget(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <button
                      className="delete-btn"
                      onClick={() => setDeleteTarget(session.session_id)}
                      aria-label={`Delete session from ${formatDate(session.created_at)}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <style jsx>{`
        .history-page {
          padding: var(--space-8) 0 var(--space-12);
        }
        .history-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: var(--space-6);
          gap: var(--space-4);
        }
        .history-header h1 {
          margin-bottom: var(--space-1);
        }
        .history-subtitle {
          font-size: 14px;
          color: var(--neutral-500);
        }
        .confirm-content {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }
        .confirm-actions {
          display: flex;
          gap: var(--space-2);
        }
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: var(--space-12) 0;
          gap: var(--space-4);
          text-align: center;
          color: var(--neutral-500);
        }
        .empty-state h2 {
          color: var(--neutral-700);
        }
        .sessions-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }
        .session-card {
          animation: fadeIn var(--transition-normal) ease forwards;
          animation-delay: ${0}ms;
        }
        .session-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: var(--space-4);
        }
        .session-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
        }
        .session-date {
          display: flex;
          align-items: center;
          gap: var(--space-1);
          font-size: 12px;
          color: var(--neutral-500);
        }
        .session-result {
          display: flex;
          align-items: baseline;
          gap: var(--space-3);
        }
        .session-top {
          font-size: 16px;
          font-weight: 600;
          color: var(--neutral-950);
        }
        .session-confidence {
          font-size: 13px;
          font-weight: 500;
          color: var(--primary-700);
        }
        .delete-btn {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          background: none;
          color: var(--neutral-500);
          cursor: pointer;
          border-radius: var(--button-radius);
          transition: all var(--transition-fast);
        }
        .delete-btn:hover {
          background: var(--danger-bg);
          color: var(--danger);
        }
        .delete-confirm-inline {
          display: flex;
          gap: var(--space-2);
        }
        @media (max-width: 639px) {
          .history-header {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}
