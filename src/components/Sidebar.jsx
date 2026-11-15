
const navigationItems = [
  { name: 'Dashboard', icon: '⌂' },
  { name: 'Projects', icon: '▣' },
  { name: 'Code Editor', icon: '</>' },
  { name: 'Code Reviews', icon: '⌕' },
  { name: 'History', icon: '◷' },
  { name: 'Settings', icon: '⚙' }
];

function Sidebar({ activeTab, setActiveTab }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-icon">{'</>'}</div>
        <span>AI Coding Agent</span>
      </div>

      <div className="sidebar-navigation">
        <p className="menu-label">WORKSPACE</p>

        <nav>
          {navigationItems.map((item) => (
            <button
              key={item.name}
              className={`nav-item ${
                activeTab === item.name ? 'active' : ''
              }`}
              onClick={() => setActiveTab(item.name)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.name}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="sidebar-bottom">
        <div className="sidebar-user-avatar">D</div>
        <div className="sidebar-user-info">
          <strong>Developer</strong>
          <span>AI Coding Agent Workspace</span>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
