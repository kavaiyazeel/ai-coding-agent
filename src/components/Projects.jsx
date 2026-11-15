
import { useState } from 'react';

function Projects({
  projects,
  onAddProject,
  onOpenProject,
  onRenameProject,
  onDeleteProject,
  onDuplicateProject
}) {
  const [search, setSearch] = useState('');

  // Create project
  function addProject() {
    const name = prompt('Enter project name:');

    if (name !== null) {
      onAddProject(name);
    }
  }

  // Rename project
  function renameProject(project) {
    const newName = prompt(
      'Enter new project name:',
      project.name
    );

    if (newName !== null) {
      onRenameProject(project.id, newName);
    }
  }

  // Search projects
  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section className="projects-page">

      <div className="page-heading">
        <div>
          <h1>My Projects</h1>
          <p>Manage and analyze your coding projects.</p>
        </div>

        <button onClick={addProject}>
          + New Project
        </button>
      </div>

      <input
        className="project-search"
        type="text"
        placeholder="Search projects..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />

      <div className="project-grid">

        {filteredProjects.length > 0 ? (

          filteredProjects.map((project) => (

            <div className="project-card" key={project.id}>

              <div
                className="project-info"
                onClick={() => onOpenProject(project)}
              >
                <h2>{project.name}</h2>

                <p>Language: {project.language}</p>

                <span className="project-status">
                  {project.status}
                </span>

                <p>Open project →</p>
              </div>

              <div className="project-actions">

                <button
                  onClick={() => renameProject(project)}
                >
                  Rename
                </button>

                <button
                  onClick={() => onDuplicateProject(project.id)}
                >
                  Duplicate
                </button>

                <button
                  className="delete-button"
                  onClick={() => onDeleteProject(project.id)}
                >
                  Delete
                </button>

              </div>

            </div>

          ))

        ) : (

          <p className="empty-state">
            {search
              ? 'No projects match your search.'
              : 'No projects yet. Create your first project!'}
          </p>

        )}

      </div>
    </section>
  );
}

export default Projects;
