
import { useState } from 'react';

import Sidebar from './components/Sidebar';
import CodeEditor from './components/CodeEditor';
import Projects from './components/Projects';
import CodeReviews from './components/CodeReviews';
import History from './components/History';
import Settings from './components/Settings';

import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('Dashboard');

  const [projects, setProjects] = useState([
    { id: 1, name: 'FinShield', language: 'Python', status: 'Active', code: '' },
    { id: 2, name: 'Amazon Clone', language: 'JavaScript', status: 'Completed', code: '' },
    { id: 3, name: 'AI Coding Agent', language: 'React', status: 'Active', code: '' }
  ]);

  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [reviewHistory, setReviewHistory] = useState([]);

  const [settings, setSettings] = useState({
    defaultLanguage: 'Python',
    fontSize: '14'
  });

  const selectedProject = projects.find(
    (project) => project.id === selectedProjectId
  );

  // Open project in editor
  function openProject(project) {
    setSelectedProjectId(project.id);
    setActiveTab('Code Editor');
  }

  // Save project code
  function saveProjectCode(projectId, code, language) {
    setProjects((previousProjects) =>
      previousProjects.map((project) =>
        project.id === projectId
          ? { ...project, code, language }
          : project
      )
    );
  }

  // Add project
  function addProject(name) {
    const cleanName = name.trim();

    if (!cleanName) {
      alert('Project name cannot be empty.');
      return;
    }

    const alreadyExists = projects.some(
      (project) => project.name.toLowerCase() === cleanName.toLowerCase()
    );

    if (alreadyExists) {
      alert('A project with this name already exists.');
      return;
    }

    const newProject = {
      id: Date.now(),
      name: cleanName,
      language: settings.defaultLanguage,
      status: 'Active',
      code: ''
    };

    setProjects((previousProjects) => [
      ...previousProjects,
      newProject
    ]);
  }

  // Rename project
  function renameProject(projectId, newName) {
    const cleanName = newName.trim();

    if (!cleanName) {
      alert('Project name cannot be empty.');
      return;
    }

    const alreadyExists = projects.some(
      (project) =>
        project.id !== projectId &&
        project.name.toLowerCase() === cleanName.toLowerCase()
    );

    if (alreadyExists) {
      alert('Another project already has this name.');
      return;
    }

    setProjects((previousProjects) =>
      previousProjects.map((project) =>
        project.id === projectId
          ? { ...project, name: cleanName }
          : project
      )
    );
  }

  // Delete project
  function deleteProject(projectId) {
    const confirmed = window.confirm(
      'Are you sure you want to delete this project?'
    );

    if (!confirmed) return;

    setProjects((previousProjects) =>
      previousProjects.filter((project) => project.id !== projectId)
    );

    if (selectedProjectId === projectId) {
      setSelectedProjectId(null);
      setActiveTab('Projects');
    }
  }

  // Duplicate project
  function duplicateProject(projectId) {
    const original = projects.find(
      (project) => project.id === projectId
    );

    if (!original) return;

    let copyName = `${original.name} Copy`;
    let count = 2;

    while (
      projects.some(
        (project) => project.name.toLowerCase() === copyName.toLowerCase()
      )
    ) {
      copyName = `${original.name} Copy ${count}`;
      count++;
    }

    const duplicated = {
      ...original,
      id: Date.now(),
      name: copyName,
      status: 'Active'
    };

    setProjects((previousProjects) => [
      ...previousProjects,
      duplicated
    ]);
  }

  // Save completed review
  function saveReview(report) {
    setReviewHistory((previousHistory) => [
      report,
      ...previousHistory
    ]);
  }

  // Delete one review
  function deleteReview(reviewId) {
    const confirmed = window.confirm(
      'Are you sure you want to delete this review?'
    );

    if (!confirmed) return;

    setReviewHistory((previousHistory) =>
      previousHistory.filter((review) => review.id !== reviewId)
    );
  }

  // Clear all reviews
  function clearHistory() {
    if (reviewHistory.length === 0) return;

    const confirmed = window.confirm(
      'Delete all review history? This cannot be undone.'
    );

    if (confirmed) {
      setReviewHistory([]);
    }
  }

  // Dashboard calculations
  const totalIssues = reviewHistory.reduce(
    (total, report) => total + (report.issues?.length || 0),
    0
  );

  const cleanReviews = reviewHistory.filter(
    (report) => !report.notice && (report.issues?.length || 0) === 0
  ).length;

  const recentProjects = [...projects].slice(-3).reverse();

  const recentReviews = reviewHistory.slice(0, 4);

  // Dashboard
  function renderDashboard() {
    return (
      <section className="dashboard">
        <div className="dashboard-heading">
          <div>
            <p className="dashboard-label">YOUR WORKSPACE</p>
            <h1>Welcome to AI Coding Agent 👋</h1>
            <p>Manage projects, review code and improve your development workflow.</p>
          </div>

          <button
            className="dashboard-primary-button"
            onClick={() => {
              setSelectedProjectId(null);
              setActiveTab('Code Editor');
            }}
          >
            + New Code Review
          </button>
        </div>

        <div className="dashboard-stats">
          <div className="dashboard-stat-card">
            <div className="stat-icon purple">📁</div>
            <p>Total Projects</p>
            <h2>{projects.length}</h2>
            <span>Your workspace projects</span>
          </div>

          <div className="dashboard-stat-card">
            <div className="stat-icon blue">🔍</div>
            <p>Code Reviews</p>
            <h2>{reviewHistory.length}</h2>
            <span>Completed reviews</span>
          </div>

          <div className="dashboard-stat-card">
            <div className="stat-icon orange">⚠️</div>
            <p>Issues Found</p>
            <h2>{totalIssues}</h2>
            <span>Across all reviews</span>
          </div>

          <div className="dashboard-stat-card">
            <div className="stat-icon green">✓</div>
            <p>Clean Reviews</p>
            <h2>{cleanReviews}</h2>
            <span>Without detected issues</span>
          </div>
        </div>

        <div className="dashboard-welcome-card">
          <div>
            <p className="dashboard-label">AI CODING AGENT ASSISTANT</p>
            <h2>Ready to write better code?</h2>
            <p>Analyze your code, identify potential issues and get suggestions to improve it.</p>
            <button
              onClick={() => {
                setSelectedProjectId(null);
                setActiveTab('Code Editor');
              }}
            >
              Open Code Editor →
            </button>
          </div>
          <div className="welcome-decoration">{"</>"}</div>
        </div>

        <div className="dashboard-bottom-grid">
          <div className="dashboard-section-card">
            <div className="dashboard-section-heading">
              <div>
                <h2>Recent Projects</h2>
                <p>Your latest workspace projects</p>
              </div>

              <button onClick={() => setActiveTab('Projects')}>
                View All →
              </button>
            </div>

            {recentProjects.length === 0 ? (
              <p className="dashboard-empty">No projects available.</p>
            ) : (
              recentProjects.map((project) => (
                <div className="dashboard-project-item" key={project.id}>
                  <div className="dashboard-project-icon">{"</>"}</div>

                  <div className="dashboard-item-info">
                    <h3>{project.name}</h3>
                    <p>{project.language}</p>
                  </div>

                  <button onClick={() => openProject(project)}>
                    Open →
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="dashboard-section-card">
            <div className="dashboard-section-heading">
              <div>
                <h2>Recent Reviews</h2>
                <p>Your latest code analysis reports</p>
              </div>

              <button onClick={() => setActiveTab('Code Reviews')}>
                View All →
              </button>
            </div>

            {recentReviews.length === 0 ? (
              <p className="dashboard-empty">
                No reviews yet. Start your first code review!
              </p>
            ) : (
              recentReviews.map((report) => (
                <div className="dashboard-review-item" key={report.id}>
                  <div>
                    <h3>{report.projectName}</h3>
                    <p>{report.language} · {report.issues?.length || 0} issues</p>
                  </div>

                  <span className={
                    report.notice
                      ? 'dashboard-review-status pending'
                      : report.issues?.length
                        ? 'dashboard-review-status warning'
                        : 'dashboard-review-status clean'
                  }>
                    {report.notice
                      ? 'Basic checks'
                      : report.issues?.length
                        ? 'Issues found'
                        : 'Clean'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="app-layout">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <main className="main-content">
        <header className="topbar">
          <span>Workspace / {activeTab}</span>
          <div className="profile">D</div>
        </header>

        {activeTab === 'Dashboard' ? (
          renderDashboard()

        ) : activeTab === 'Projects' ? (
          <Projects
            projects={projects}
            onAddProject={addProject}
            onOpenProject={openProject}
            onRenameProject={renameProject}
            onDeleteProject={deleteProject}
            onDuplicateProject={duplicateProject}
          />

        ) : activeTab === 'Code Editor' ? (
          <CodeEditor
            key={selectedProjectId ?? 'standalone'}
            project={selectedProject}
            settings={settings}
            onSaveCode={saveProjectCode}
            onReviewComplete={saveReview}
          />

        ) : activeTab === 'Code Reviews' ? (
          <CodeReviews
            reviews={reviewHistory}
            onDeleteReview={deleteReview}
          />

        ) : activeTab === 'History' ? (
          <History
            history={reviewHistory}
            onDeleteReview={deleteReview}
            onClearHistory={clearHistory}
          />

        ) : activeTab === 'Settings' ? (
          <Settings
            key={`${settings.defaultLanguage}-${settings.fontSize}`}
            settings={settings}
            onSaveSettings={setSettings}
          />

        ) : (
          <section className="dashboard">
            <h1>{activeTab}</h1>
            <p>This section is coming soon.</p>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
