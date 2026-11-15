
import { useState } from 'react';

function CodeEditor({
  project,
  settings,
  onSaveCode,
  onReviewComplete
}) {
  const [language, setLanguage] = useState(
    project?.language || settings?.defaultLanguage || 'Python'
  );

  const [code, setCode] = useState(project?.code || '');
  const [review, setReview] = useState(null);

  const lines = code ? code.split('\n').length : 0;
  const characters = code.length;

  // Save code inside the selected project
  function saveCode() {
    if (!project) {
      alert('Open a project first to save your code.');
      return;
    }

    onSaveCode(project.id, code, language);
    alert('Code and language saved successfully!');
  }

  // Analyze code using the available frontend checks
  function reviewCode() {
    if (!code.trim()) {
      setReview({
        error: 'Please enter some code before starting a review.'
      });
      return;
    }

    const codeLines = code.split('\n');
    const issues = [];
    let notice = '';

    if (language === 'Python') {
      codeLines.forEach((line, index) => {
        if (/\/\s*0(\D|$)/.test(line)) {
          issues.push({
            line: index + 1,
            severity: 'High',
            message: 'Possible division by zero.',
            suggestion:
              'Check whether the divisor is zero before dividing.'
          });
        }

        if (/except\s*:/.test(line)) {
          issues.push({
            line: index + 1,
            severity: 'Medium',
            message: 'Bare except block detected.',
            suggestion:
              'Catch a specific exception, such as ZeroDivisionError.'
          });
        }

        if (line.length > 100) {
          issues.push({
            line: index + 1,
            severity: 'Low',
            message: 'Long line detected.',
            suggestion:
              'Consider splitting this line to improve readability.'
          });
        }
      });
    } else {
      notice = `Detailed checks for ${language} are not available yet.`;
    }

    const report = {
      id: Date.now(),
      projectName: project?.name || 'Untitled Code',
      language,
      date: new Date().toLocaleString(),
      lines: codeLines.length,
      issues,
      notice
    };

    setReview(report);
    onReviewComplete(report);
  }

  // Clear editor content
  function clearCode() {
    if (!code.trim()) return;

    const confirmed = window.confirm(
      'Are you sure you want to clear the editor?'
    );

    if (!confirmed) return;

    setCode('');
    setReview(null);
  }

  // Severity summary
  const highIssues = review?.issues?.filter(
    (issue) => issue.severity === 'High'
  ).length || 0;

  const mediumIssues = review?.issues?.filter(
    (issue) => issue.severity === 'Medium'
  ).length || 0;

  const lowIssues = review?.issues?.filter(
    (issue) => issue.severity === 'Low'
  ).length || 0;

  return (
    <section className="editor-page code-editor-page">

      {/* Page heading */}
      <div className="editor-heading">
        <div>
          <p className="editor-eyebrow">DEVELOPMENT WORKSPACE</p>

          <h1>
            {project ? project.name : 'Code Editor'}
          </h1>

          <p>Write, analyze and improve your code.</p>
        </div>

        {project && (
          <span className="editor-project-badge">
            {project.status || 'Active'} Project
          </span>
        )}
      </div>

      {/* Editor toolbar */}
      <div className="editor-toolbar editor-toolbar-upgraded">
        <div className="editor-language-control">
          <label htmlFor="editor-language">Language</label>

          <select
            id="editor-language"
            value={language}
            onChange={(event) => {
              setLanguage(event.target.value);
              setReview(null);
            }}
          >
            <option>Python</option>
            <option>C++</option>
            <option>JavaScript</option>
            <option>Java</option>
            <option>React</option>
          </select>
        </div>

        <div className="editor-toolbar-actions">
          <button
            className="editor-clear-button"
            onClick={clearCode}
            disabled={!code}
          >
            Clear Code
          </button>
        </div>
      </div>

      {/* Editor panel */}
      <div className="editor-workspace">
        <div className="editor-panel-heading">
          <div className="editor-panel-title">
            <span className="editor-dot purple-dot"></span>
            <span className="editor-dot yellow-dot"></span>
            <span className="editor-dot green-dot"></span>
            <strong>{project?.name || 'untitled'}</strong>
          </div>

          <span className="editor-language-label">{language}</span>
        </div>

        <textarea
          className="code-editor-textarea"
          value={code}
          onChange={(event) => {
            setCode(event.target.value);
            setReview(null);
          }}
          placeholder={`// Start writing your ${language} code here...`}
          spellCheck="false"
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          style={{
            fontSize: `${settings?.fontSize || '14'}px`
          }}
        />

        <div className="editor-statusbar">
          <span>{language}</span>
          <span>{lines} lines</span>
          <span>{characters} characters</span>
        </div>
      </div>

      {/* Editor actions */}
      <div className="editor-actions editor-actions-upgraded">
        <button
          className="review-button"
          onClick={reviewCode}
        >
          Review Code →
        </button>

        {project && (
          <button
            className="editor-save-button"
            onClick={saveCode}
          >
            Save Project
          </button>
        )}
      </div>

      <p className="editor-disclaimer">
        Reviews currently use basic frontend checks. AI-powered analysis
        is not connected yet.
      </p>

      {/* Review results */}
      {review && (
        <div className="review-result upgraded-review-result">

          <div className="review-result-heading">
            <div>
              <p className="editor-eyebrow">ANALYSIS REPORT</p>
              <h2>Review Results</h2>
            </div>

            {!review.error && (
              <span className="review-completed-badge">
                Review Completed
              </span>
            )}
          </div>

          {review.error ? (
            <p className="editor-error-message">
              {review.error}
            </p>
          ) : (
            <>
              <div className="review-overview">
                <div>
                  <strong>{review.lines}</strong>
                  <span>Total Lines</span>
                </div>

                <div>
                  <strong>{review.issues.length}</strong>
                  <span>Total Issues</span>
                </div>

                <div>
                  <strong>{highIssues}</strong>
                  <span>High</span>
                </div>

                <div>
                  <strong>{mediumIssues + lowIssues}</strong>
                  <span>Other Issues</span>
                </div>
              </div>

              {review.notice && (
                <p className="editor-notice">
                  {review.notice}
                </p>
              )}

              {review.issues.length === 0 && !review.notice ? (
                <div className="review-clean-state">
                  <span>✓</span>
                  <h3>No issues detected!</h3>
                  <p>
                    Your code passed the available basic checks.
                  </p>
                </div>
              ) : (
                <div className="editor-issues-list">
                  <h3>Detected Issues</h3>

                  {review.issues.map((issue, index) => (
                    <div className="issue-card" key={index}>
                      <span
                        className={`severity ${issue.severity.toLowerCase()}`}
                      >
                        {issue.severity}
                      </span>

                      <h3>{issue.message}</h3>
                      <p>Line: {issue.line}</p>
                      <p>Suggested fix: {issue.suggestion}</p>
                    </div>
                  ))}
                </div>
              )}

              <p className="editor-review-date">
                Reviewed on: {review.date}
              </p>
            </>
          )}
        </div>
      )}
    </section>
  );
}

export default CodeEditor;
