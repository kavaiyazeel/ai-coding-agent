
import { useMemo, useState } from 'react';

function History({ history, onDeleteReview, onClearHistory }) {
  const [search, setSearch] = useState('');
  const [languageFilter, setLanguageFilter] = useState('All');
  const [selectedReview, setSelectedReview] = useState(null);

  const languages = [
    'All',
    ...new Set(history.map((item) => item.language).filter(Boolean))
  ];

  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      const matchesSearch =
        (item.projectName || '').toLowerCase().includes(search.toLowerCase()) ||
        (item.language || '').toLowerCase().includes(search.toLowerCase());

      const matchesLanguage =
        languageFilter === 'All' || item.language === languageFilter;

      return matchesSearch && matchesLanguage;
    });
  }, [history, search, languageFilter]);

  const totalIssues = history.reduce(
    (total, item) => total + (item.issues?.length || 0),
    0
  );

  const cleanReports = history.filter(
    (item) => !item.notice && (item.issues?.length || 0) === 0
  ).length;

  function getStatus(item) {
    if (item.notice) return 'Basic Checks';

    if (item.issues?.some((issue) => issue.severity === 'High')) {
      return 'High';
    }

    if (item.issues?.some((issue) => issue.severity === 'Medium')) {
      return 'Medium';
    }

    if (item.issues?.some((issue) => issue.severity === 'Low')) {
      return 'Low';
    }

    return 'Clean';
  }

  function deleteSelectedReview() {
    onDeleteReview(selectedReview.id);
    setSelectedReview(null);
  }

  return (
    <section className="history-page history-upgraded">

      {/* Heading */}
      <div className="history-heading">
        <div>
          <p className="history-eyebrow">ACTIVITY CENTER</p>
          <h1>Review History</h1>
          <p>Keep track of your previous code analysis reports.</p>
        </div>

        {history.length > 0 && (
          <button
            className="history-clear-button"
            onClick={onClearHistory}
          >
            Clear All History
          </button>
        )}
      </div>

      {/* Summary */}
      <div className="history-stats">
        <div className="history-stat-card">
          <span className="history-stat-icon purple">📚</span>
          <p>Total Reports</p>
          <h2>{history.length}</h2>
        </div>

        <div className="history-stat-card">
          <span className="history-stat-icon orange">⚠️</span>
          <p>Total Issues</p>
          <h2>{totalIssues}</h2>
        </div>

        <div className="history-stat-card">
          <span className="history-stat-icon green">✓</span>
          <p>Clean Reports</p>
          <h2>{cleanReports}</h2>
        </div>
      </div>

      {/* Search and filter */}
      <div className="history-filter-panel">
        <input
          type="text"
          placeholder="Search project or language..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <select
          value={languageFilter}
          onChange={(event) => setLanguageFilter(event.target.value)}
        >
          {languages.map((language) => (
            <option key={language}>{language}</option>
          ))}
        </select>
      </div>

      {/* History list */}
      <div className="history-list-panel">
        <div className="history-list-heading">
          <div>
            <h2>Past Activity</h2>
            <p>{filteredHistory.length} report(s) found</p>
          </div>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="history-empty-state">
            <span>🕘</span>
            <h3>No history found</h3>
            <p>
              {history.length === 0
                ? 'Your completed code reviews will appear here.'
                : 'Try another search or language filter.'}
            </p>
          </div>
        ) : (
          <div className="history-list">
            {filteredHistory.map((item) => {
              const status = getStatus(item);

              return (
                <div className="history-item" key={item.id}>
                  <div className="history-item-icon">
                    {"</>"}
                  </div>

                  <div className="history-item-info">
                    <h3>{item.projectName || 'Untitled Code'}</h3>
                    <p>
                      {item.language} · {item.date || 'Date unavailable'}
                    </p>
                    <p>
                      {item.issues?.length || 0} issue(s) detected
                    </p>
                  </div>

                  <span className={`history-status ${status.toLowerCase().replace(' ', '-')}`}>
                    {status}
                  </span>

                  <div className="history-item-actions">
                    <button
                      className="history-view-button"
                      onClick={() => setSelectedReview(item)}
                    >
                      View
                    </button>

                    <button
                      className="history-delete-button"
                      onClick={() => onDeleteReview(item.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Report details */}
      {selectedReview && (
        <div className="history-modal-overlay">
          <div className="history-modal">

            <div className="history-modal-heading">
              <div>
                <p className="history-eyebrow">SAVED REPORT</p>
                <h2>{selectedReview.projectName || 'Untitled Code'}</h2>
                <p>
                  {selectedReview.language} · {selectedReview.date}
                </p>
              </div>

              <button
                className="history-modal-x"
                onClick={() => setSelectedReview(null)}
                aria-label="Close history details"
              >
                ×
              </button>
            </div>

            <div className="history-modal-stats">
              <div>
                <strong>{selectedReview.lines ?? '—'}</strong>
                <span>Lines</span>
              </div>

              <div>
                <strong>{selectedReview.issues?.length || 0}</strong>
                <span>Issues</span>
              </div>

              <div>
                <strong>{getStatus(selectedReview)}</strong>
                <span>Result</span>
              </div>
            </div>

            {selectedReview.notice && (
              <p className="history-modal-notice">
                {selectedReview.notice}
              </p>
            )}

            {selectedReview.issues?.length > 0 ? (
              <div className="history-modal-issues">
                <h3>Detected Issues</h3>

                {selectedReview.issues.map((issue, index) => (
                  <div className="issue-card" key={index}>
                    <span className={`severity ${issue.severity.toLowerCase()}`}>
                      {issue.severity}
                    </span>

                    <h3>{issue.message}</h3>
                    <p>Line: {issue.line}</p>
                    <p>Suggested fix: {issue.suggestion}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="history-modal-clean">
                <h3>
                  {selectedReview.notice
                    ? 'Detailed checks unavailable'
                    : '✓ No issues detected'}
                </h3>
                <p>
                  {selectedReview.notice
                    ? 'This report contains basic checks only.'
                    : 'No issues were detected by the available checks.'}
                </p>
              </div>
            )}

            <div className="history-modal-actions">
              <button
                className="history-modal-delete"
                onClick={deleteSelectedReview}
              >
                Delete Report
              </button>

              <button
                className="history-modal-close"
                onClick={() => setSelectedReview(null)}
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </section>
  );
}

export default History;
