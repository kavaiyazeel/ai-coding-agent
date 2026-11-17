
import { useState } from 'react';

const API_URL = 'http://127.0.0.1:8001';

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
  const [loading, setLoading] = useState(false);

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

  // Send Python code to FastAPI and LangGraph
  async function reviewCode() {
    if (!code.trim()) {
      setReview({
        error: 'Please enter some code before starting a review.'
      });
      return;
    }

    if (language !== 'Python') {
      setReview({
        error: 'AI code review currently supports Python only.'
      });
      return;
    }

    if (loading) return;

    setLoading(true);
    setReview(null);

    try {
      const response = await fetch(`${API_URL}/run-agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code })
      });

      if (!response.ok) {
        let message = `Backend error: ${response.status}`;

        try {
          const errorData = await response.json();

          if (typeof errorData.detail === 'string') {
            message = errorData.detail;
          }
        } catch {
          // Keep the original HTTP error message
        }

        throw new Error(message);
      }

      const data = await response.json();

      // Extract the AI review from the LangGraph response
      const aiResult =
        data.ai_review?.ai_review ||
        data.ai_review ||
        {};

      const correctedCode =
        data.corrected_code ||
        aiResult.corrected_code ||
        '';

      const validation = data.validation_result || {};
      const syntax = data.syntax_result || {};

      const aiText = [
        `Bug Found: ${aiResult.bug_found ?? 'Unknown'}`,
        `Bug Type: ${aiResult.bug_type || 'Unknown'}`,
        `Severity: ${aiResult.severity || 'Unknown'}`,
        '',
        'Explanation:',
        aiResult.explanation || 'No explanation provided.',
        '',
        'Corrected Code:',
        correctedCode || 'No corrected code returned.',
        '',
        'Syntax Analysis:',
        JSON.stringify(syntax, null, 2),
        '',
        'Validation:',
        validation.message ||
          validation.status ||
          'No validation result available.'
      ].join('\n');

      // Create the review report
      const report = {
        id: Date.now(),
        projectName: project?.name || 'Untitled Code',
        language,
        date: new Date().toLocaleString(),
        lines: code.split('\n').length,
        issues: [],
        notice: '',
        aiReview: aiText,
        correctedCode,
        validationResult: validation,
        syntaxResult: syntax
      };

      setReview(report);

      // Save review to history if callback is provided
      if (typeof onReviewComplete === 'function') {
        onReviewComplete(report);
      }

    } catch (error) {
      setReview({
        error: `AI review failed: ${error.message}`
      });

    } finally {
      setLoading(false);
    }
  }

  // Clear editor content
  function clearCode() {
    if (!code.trim() || loading) return;

    const confirmed = window.confirm(
      'Are you sure you want to clear the editor?'
    );

    if (!confirmed) return;

    setCode('');
    setReview(null);
  }

  // Severity summary
  const highIssues =
    review?.issues?.filter(
      (issue) => issue.severity === 'High'
    ).length || 0;

  const mediumIssues =
    review?.issues?.filter(
      (issue) => issue.severity === 'Medium'
    ).length || 0;

  const lowIssues =
    review?.issues?.filter(
      (issue) => issue.severity === 'Low'
    ).length || 0;

  return (
    <section className="editor-page code-editor-page">

      {/* Page heading */}
      <div className="editor-heading">
        <div>
          <p className="editor-eyebrow">
            DEVELOPMENT WORKSPACE
          </p>

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
          <label htmlFor="editor-language">
            Language
          </label>

          <select
            id="editor-language"
            value={language}
            disabled={loading}
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
            disabled={!code || loading}
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

            <strong>
              {project?.name || 'untitled'}
            </strong>
          </div>

          <span className="editor-language-label">
            {language}
          </span>
        </div>

        <textarea
          className="code-editor-textarea"
          value={code}
          disabled={loading}
          onChange={(event) => {
            setCode(event.target.value);
            setReview(null);
          }}
          placeholder={`// Start writing your ${language} code here...`}
          spellCheck={false}
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
          disabled={loading}
        >
          {loading
            ? 'Analyzing with AI...'
            : 'Review Code →'}
        </button>

        {project && (
          <button
            className="editor-save-button"
            onClick={saveCode}
            disabled={loading}
          >
            Save Project
          </button>
        )}
      </div>

      <p className="editor-disclaimer">
        Python code reviews are sent to the FastAPI backend
        for AI-powered analysis using Ollama and LangGraph.
        Other languages are not supported yet.
      </p>

      {/* Loading message */}
      {loading && (
        <div className="review-result upgraded-review-result">
          <h3>AI is reviewing your code...</h3>
          <p>
            Please wait while the AI model analyzes your code.
          </p>
        </div>
      )}

      {/* Review results */}
      {review && (
        <div className="review-result upgraded-review-result">

          <div className="review-result-heading">
            <div>
              <p className="editor-eyebrow">
                ANALYSIS REPORT
              </p>

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
                  <strong>
                    {review.issues.length
                      ? review.issues.length
                      : '—'}
                  </strong>
                  <span>Structured Issues</span>
                </div>

                <div>
                  <strong>
                    {review.issues.length
                      ? highIssues
                      : '—'}
                  </strong>
                  <span>High</span>
                </div>

                <div>
                  <strong>
                    {review.issues.length
                      ? mediumIssues + lowIssues
                      : '—'}
                  </strong>
                  <span>Other Issues</span>
                </div>
              </div>

              {/* AI-generated review */}
              {review.aiReview && (
                <div className="editor-issues-list">
                  <h3>AI Code Review</h3>

                  <div className="issue-card">
                    <pre
                      style={{
                        whiteSpace: 'pre-wrap',
                        overflowWrap: 'anywhere',
                        fontFamily: 'inherit',
                        lineHeight: '1.7',
                        margin: 0
                      }}
                    >
                      {review.aiReview}
                    </pre>
                  </div>
                </div>
              )}

              {review.notice && (
                <p className="editor-notice">
                  {review.notice}
                </p>
              )}

              {/* Structured issues, if available */}
              {review.issues.length > 0 && (
                <div className="editor-issues-list">
                  <h3>Detected Issues</h3>

                  {review.issues.map((issue, index) => (
                    <div
                      className="issue-card"
                      key={index}
                    >
                      <span
                        className={`severity ${issue.severity.toLowerCase()}`}
                      >
                        {issue.severity}
                      </span>

                      <h3>{issue.message}</h3>
                      <p>Line: {issue.line}</p>
                      <p>
                        Suggested fix: {issue.suggestion}
                      </p>
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
