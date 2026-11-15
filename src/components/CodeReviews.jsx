
import { useMemo, useState } from 'react';

function CodeReviews({ reviews, onDeleteReview }) {
  const [search, setSearch] = useState('');
  const [languageFilter, setLanguageFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [selectedReview, setSelectedReview] = useState(null);

  const languages = [
    'All',
    ...new Set(reviews.map((review) => review.language).filter(Boolean))
  ];

  function getSeverity(review) {
    if (review.notice) return 'Basic Checks';

    if (review.issues?.some((issue) => issue.severity === 'High')) {
      return 'High';
    }

    if (review.issues?.some((issue) => issue.severity === 'Medium')) {
      return 'Medium';
    }

    if (review.issues?.some((issue) => issue.severity === 'Low')) {
      return 'Low';
    }

    return 'Clean';
  }

  const filteredReviews = useMemo(() => {
    return reviews.filter((review) => {
      const matchesSearch =
        (review.projectName || '').toLowerCase().includes(search.toLowerCase()) ||
        (review.language || '').toLowerCase().includes(search.toLowerCase());

      const matchesLanguage =
        languageFilter === 'All' || review.language === languageFilter;

      const severity = getSeverity(review);

      const matchesSeverity =
        severityFilter === 'All' || severity === severityFilter;

      return matchesSearch && matchesLanguage && matchesSeverity;
    });
  }, [reviews, search, languageFilter, severityFilter]);

  const totalIssues = reviews.reduce(
    (total, review) => total + (review.issues?.length || 0),
    0
  );

  const cleanCount = reviews.filter(
    (review) => getSeverity(review) === 'Clean'
  ).length;

  const highCount = reviews.filter(
    (review) => getSeverity(review) === 'High'
  ).length;

  function deleteSelectedReview(reviewId) {
    onDeleteReview(reviewId);
    setSelectedReview(null);
  }

  return (
    <section className="reviews-page reviews-upgraded">

      <div className="reviews-heading">
        <div>
          <p className="reviews-eyebrow">CODE QUALITY CENTER</p>
          <h1>Code Reviews</h1>
          <p>Track your code analysis reports and detected issues.</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="reviews-stats">
        <div className="reviews-stat-card">
          <span className="reviews-stat-icon purple">📋</span>
          <p>Total Reviews</p>
          <h2>{reviews.length}</h2>
        </div>

        <div className="reviews-stat-card">
          <span className="reviews-stat-icon orange">⚠️</span>
          <p>Total Issues</p>
          <h2>{totalIssues}</h2>
        </div>

        <div className="reviews-stat-card">
          <span className="reviews-stat-icon red">🔴</span>
          <p>High Priority</p>
          <h2>{highCount}</h2>
        </div>

        <div className="reviews-stat-card">
          <span className="reviews-stat-icon green">✓</span>
          <p>Clean Reviews</p>
          <h2>{cleanCount}</h2>
        </div>
      </div>

      {/* Search and filters */}
      <div className="reviews-filter-panel">
        <input
          type="text"
          placeholder="Search by project or language..."
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

        <select
          value={severityFilter}
          onChange={(event) => setSeverityFilter(event.target.value)}
        >
          <option>All</option>
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
          <option>Clean</option>
          <option>Basic Checks</option>
        </select>
      </div>

      {/* Review list */}
      <div className="reviews-list-panel">
        <div className="reviews-list-heading">
          <div>
            <h2>Review History</h2>
            <p>{filteredReviews.length} result(s) found</p>
          </div>
        </div>

        {filteredReviews.length === 0 ? (
          <div className="reviews-empty-state">
            <span>📂</span>
            <h3>No reviews found</h3>
            <p>
              {reviews.length === 0
                ? 'Your completed code reviews will appear here.'
                : 'Try changing your search or filters.'}
            </p>
          </div>
        ) : (
          <div className="reviews-table-wrapper">
            <table className="reviews-table">
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Language</th>
                  <th>Issues</th>
                  <th>Result</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredReviews.map((review) => {
                  const severity = getSeverity(review);

                  return (
                    <tr key={review.id}>
                      <td>
                        <strong>{review.projectName || 'Untitled Code'}</strong>
                      </td>

                      <td>{review.language}</td>

                      <td>{review.issues?.length || 0}</td>

                      <td>
                        <span className={`review-result-badge ${severity.toLowerCase().replace(' ', '-')}`}>
                          {severity === 'Basic Checks' ? 'Basic Checks' : severity}
                        </span>
                      </td>

                      <td>{review.date || '—'}</td>

                      <td>
                        <div className="review-row-actions">
                          <button
                            className="review-view-button"
                            onClick={() => setSelectedReview(review)}
                          >
                            View
                          </button>

                          <button
                            className="review-delete-button"
                            onClick={() => onDeleteReview(review.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Selected review details */}
      {selectedReview && (
        <div className="review-detail-overlay">
          <div className="review-detail-modal">

            <div className="review-detail-header">
              <div>
                <p className="reviews-eyebrow">REVIEW REPORT</p>
                <h2>{selectedReview.projectName || 'Untitled Code'}</h2>
                <p>
                  {selectedReview.language} · {selectedReview.date}
                </p>
              </div>

              <button
                className="review-close-button"
                onClick={() => setSelectedReview(null)}
                aria-label="Close review details"
              >
                ×
              </button>
            </div>

            <div className="review-detail-summary">
              <div>
                <strong>{selectedReview.lines ?? '—'}</strong>
                <span>Lines</span>
              </div>

              <div>
                <strong>{selectedReview.issues?.length || 0}</strong>
                <span>Issues</span>
              </div>

              <div>
                <strong>
                  {selectedReview.issues?.filter(
                    (issue) => issue.severity === 'High'
                  ).length || 0}
                </strong>
                <span>High Priority</span>
              </div>
            </div>

            {selectedReview.notice && (
              <p className="review-detail-notice">
                {selectedReview.notice}
              </p>
            )}

            {!selectedReview.issues?.length ? (
              <div className="review-detail-clean">
                <h3>
                  {selectedReview.notice
                    ? 'Detailed analysis not available'
                    : '✓ No issues detected'}
                </h3>
                <p>
                  {selectedReview.notice
                    ? 'This report contains basic checks only.'
                    : 'No issues were detected by the available checks.'}
                </p>
              </div>
            ) : (
              <div className="review-detail-issues">
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
            )}

            <div className="review-detail-actions">
              <button
                className="review-modal-delete"
                onClick={() => deleteSelectedReview(selectedReview.id)}
              >
                Delete Review
              </button>

              <button
                className="review-modal-close"
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

export default CodeReviews;
