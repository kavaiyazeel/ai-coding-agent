
import { useEffect, useState } from "react";

const API_URL = "http://127.0.0.1:8001";

function CodeEditor({
  project,
  settings,
  onSaveCode,
  onReviewComplete,
}) {
  const [language, setLanguage] = useState(
    project?.language || settings?.defaultLanguage || "Python"
  );

  const [code, setCode] = useState(project?.code || "");
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(false);

  // Update the editor when another project is selected.
  useEffect(() => {
    setCode(project?.code || "");
    setLanguage(
      project?.language || settings?.defaultLanguage || "Python"
    );
    setReview(null);
  }, [project?.id]);

  const lines = code ? code.split("\n").length : 0;
  const characters = code.length;

  function saveCode() {
    if (!project) {
      alert("Open a project first to save your code.");
      return;
    }

    if (typeof onSaveCode === "function") {
      onSaveCode(project.id, code, language);
      alert("Code saved successfully!");
    }
  }

  function clearCode() {
    if (loading || !code.trim()) return;

    if (window.confirm("Clear all code from the editor?")) {
      setCode("");
      setReview(null);
    }
  }

  // Send code to FastAPI -> LangGraph -> Ollama -> Validator.
  async function reviewCode() {
    if (loading) return;

    if (!code.trim()) {
      setReview({
        error: "Please enter Python code before reviewing.",
      });
      return;
    }

    if (language.toLowerCase() !== "python") {
      setReview({
        error: "AI code review currently supports Python only.",
      });
      return;
    }

    setLoading(true);
    setReview(null);

    try {
      const response = await fetch(`${API_URL}/run-agent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        let message = `Backend returned HTTP ${response.status}`;

        try {
          const errorData = await response.json();
          if (errorData.detail) {
            message = String(errorData.detail);
          }
        } catch {
          // Keep the original error message.
        }

        throw new Error(message);
      }

      const data = await response.json();

      // LangGraph currently wraps the Ollama response
      // inside another "ai_review" object.
      const aiData = data.ai_review?.ai_review
        ?? data.ai_review
        ?? {};

      const bugFound = aiData.bug_found === true;

      const report = {
        id: Date.now(),
        projectName: project?.name || "Untitled Code",
        language,
        date: new Date().toLocaleString(),
        lines: code.split("\n").length,
        issues: bugFound
          ? [{
              severity: aiData.severity || "medium",
              message: aiData.explanation || "Bug detected",
              line: "Not specified",
              suggestion: aiData.corrected_code || "",
            }]
          : [],
        notice: "",
        syntaxResult: data.syntax_result ?? null,
        aiReview: aiData,
        bugFound,
        bugType: aiData.bug_type || "none",
        severity: aiData.severity || "none",
        explanation: aiData.explanation || "",
        correctedCode:
          data.corrected_code
          || aiData.corrected_code
          || "",
        validationResult: data.validation_result ?? null,
        originalCode: code,
      };

      setReview(report);

      if (typeof onReviewComplete === "function") {
        onReviewComplete(report);
      }
    } catch (error) {
      setReview({
        error:
          error instanceof TypeError
            ? "Failed to connect to FastAPI. Check that the backend is running on port 8001 and CORS allows this frontend."
            : `AI review failed: ${error.message}`,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="code-editor-page">
      <div className="editor-header">
        <div>
          <p className="editor-eyebrow">AI CODING AGENT</p>
          <h1>Code Editor</h1>
          <p>
            Write Python code and let LangGraph and Ollama
            analyze it for bugs.
          </p>
        </div>
      </div>

      <div className="editor-toolbar">
        <div>
          <span>Project: </span>
          <strong>{project?.name || "Untitled Code"}</strong>
        </div>

        <select
          value={language}
          onChange={(event) => {
            setLanguage(event.target.value);
            setReview(null);
          }}
          disabled={loading}
        >
          <option value="Python">Python</option>
          <option value="JavaScript">JavaScript</option>
          <option value="Java">Java</option>
          <option value="C++">C++</option>
        </select>
      </div>

      <div className="editor-container">
        <div className="editor-file-header">
          <span>main.py</span>
          <span className="editor-language-label">
            {language}
          </span>
        </div>

        <textarea
          className="code-editor-textarea"
          value={code}
          onChange={(event) => {
            setCode(event.target.value);
            setReview(null);
          }}
          placeholder="Write your Python code here..."
          disabled={loading}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          style={{
            fontSize: `${settings?.fontSize || 14}px`,
            minHeight: "350px",
            width: "100%",
            fontFamily: "monospace",
          }}
        />

        <div className="editor-statusbar">
          <span>{language}</span>
          <span>{lines} lines</span>
          <span>{characters} characters</span>
        </div>
      </div>

      <div className="editor-actions editor-actions-upgraded">
        <button
          className="review-button"
          onClick={reviewCode}
          disabled={loading}
        >
          {loading ? "Analyzing with AI..." : "Review Code →"}
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

        <button
          type="button"
          onClick={clearCode}
          disabled={loading || !code.trim()}
        >
          Clear Code
        </button>
      </div>

      <p className="editor-disclaimer">
        Python code reviews are sent to FastAPI for AI-powered
        analysis using LangGraph and Ollama. Other languages
        are not supported yet.
      </p>

      {loading && (
        <div className="review-result upgraded-review-result">
          <h3>AI is reviewing your code...</h3>
          <p>
            Ollama is analyzing your code and LangGraph is
            validating the suggested correction.
          </p>
        </div>
      )}

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
                    {review.bugFound ? "Yes" : "No"}
                  </strong>
                  <span>Bug Detected</span>
                </div>

                <div>
                  <strong>{review.bugType}</strong>
                  <span>Bug Type</span>
                </div>

                <div>
                  <strong>{review.severity}</strong>
                  <span>Severity</span>
                </div>
              </div>

              <div className="editor-issues-list">
                <h3>1. Python Syntax Analysis</h3>

                <div className="issue-card">
                  <p>
                    <strong>Status: </strong>
                    {review.syntaxResult?.status || "Unknown"}
                  </p>

                  <p>
                    {review.syntaxResult?.message
                      || "No syntax message returned."}
                  </p>
                </div>
              </div>

              <div className="editor-issues-list">
                <h3>2. AI Bug Detection</h3>

                <div className="issue-card">
                  <p>
                    <strong>Bug Found: </strong>
                    {review.bugFound ? "Yes" : "No"}
                  </p>

                  <p>
                    <strong>Type: </strong>
                    {review.bugType}
                  </p>

                  <p>
                    <strong>Severity: </strong>
                    {review.severity}
                  </p>

                  <p>
                    <strong>Explanation:</strong>
                  </p>

                  <p>
                    {review.explanation
                      || "No explanation returned by the AI."}
                  </p>
                </div>
              </div>

              <div className="editor-issues-list">
                <h3>3. Suggested Corrected Code</h3>

                <div className="issue-card">
                  {review.correctedCode ? (
                    <>
                      <pre
                        style={{
                          whiteSpace: "pre-wrap",
                          overflowWrap: "anywhere",
                          fontFamily: "monospace",
                          lineHeight: 1.7,
                        }}
                      >
                        {review.correctedCode}
                      </pre>

                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            review.correctedCode
                          );
                        }}
                      >
                        Copy Corrected Code
                      </button>
                    </>
                  ) : (
                    <p>
                      No corrected code was returned.
                    </p>
                  )}
                </div>
              </div>

              <div className="editor-issues-list">
                <h3>4. Code Validation</h3>

                <div className="issue-card">
                  <p>
                    <strong>Status: </strong>
                    {review.validationResult?.status
                      || "Unknown"}
                  </p>

                  <p>
                    {review.validationResult?.message
                      || "No validation result returned."}
                  </p>
                </div>
              </div>

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
