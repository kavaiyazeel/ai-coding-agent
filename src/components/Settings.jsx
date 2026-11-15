
import { useState } from 'react';

function Settings({ settings, onSaveSettings }) {
  const [language, setLanguage] = useState(settings.defaultLanguage);
  const [fontSize, setFontSize] = useState(settings.fontSize);
  const [saved, setSaved] = useState(false);

  const hasChanges =
    language !== settings.defaultLanguage ||
    fontSize !== settings.fontSize;

  function saveSettings() {
    onSaveSettings({
      defaultLanguage: language,
      fontSize
    });

    setSaved(true);
  }

  function resetSettings() {
    setLanguage('Python');
    setFontSize('14');
    setSaved(false);
  }

  return (
    <section className="settings-page settings-upgraded">

      {/* Heading */}
      <div className="settings-heading">
        <p className="settings-eyebrow">WORKSPACE PREFERENCES</p>
        <h1>Settings</h1>
        <p>Customize your AI Coding Agent editor and workspace experience.</p>
      </div>

      {/* Editor settings */}
      <div className="settings-layout">

        <div className="settings-main-card">
          <div className="settings-card-heading">
            <div className="settings-card-icon">⚙️</div>
            <div>
              <h2>Editor Preferences</h2>
              <p>Configure your default coding environment.</p>
            </div>
          </div>

          <div className="settings-field">
            <label htmlFor="default-language">
              Default Programming Language
            </label>

            <p>Used when you open a new standalone editor.</p>

            <select
              id="default-language"
              value={language}
              onChange={(event) => {
                setLanguage(event.target.value);
                setSaved(false);
              }}
            >
              <option>Python</option>
              <option>JavaScript</option>
              <option>C++</option>
              <option>Java</option>
              <option>React</option>
            </select>
          </div>

          <div className="settings-field">
            <label htmlFor="editor-font-size">
              Editor Font Size
            </label>

            <p>Choose a comfortable text size for writing code.</p>

            <select
              id="editor-font-size"
              value={fontSize}
              onChange={(event) => {
                setFontSize(event.target.value);
                setSaved(false);
              }}
            >
              <option value="12">12px — Small</option>
              <option value="14">14px — Default</option>
              <option value="16">16px — Medium</option>
              <option value="18">18px — Large</option>
              <option value="20">20px — Extra Large</option>
            </select>
          </div>

          <div className="settings-actions">
            <button
              className="settings-reset-button"
              onClick={resetSettings}
            >
              Reset
            </button>

            <button
              className="settings-save-button"
              onClick={saveSettings}
              disabled={!hasChanges}
            >
              Save Settings
            </button>
          </div>

          {saved && (
            <p className="settings-success-message">
              ✓ Settings saved successfully!
            </p>
          )}
        </div>

        {/* Live preview */}
        <div className="settings-preview-card">
          <p className="settings-eyebrow">LIVE PREVIEW</p>
          <h2>Editor Preview</h2>
          <p>See how your editor preferences will look.</p>

          <div className="settings-preview-editor">
            <div className="settings-preview-topbar">
              <span></span>
              <span></span>
              <span></span>
              <strong>{language}</strong>
            </div>

            <div
              className="settings-preview-code"
              style={{ fontSize: `${fontSize}px` }}
            >
              <p><span>1</span> # Welcome to AI Coding Agent</p>
              <p><span>2</span> </p>
              <p><span>3</span> print("Hello World!")</p>
            </div>
          </div>

          <div className="settings-preview-details">
            <span>Language: <strong>{language}</strong></span>
            <span>Font size: <strong>{fontSize}px</strong></span>
          </div>
        </div>

      </div>

      <div className="settings-info">
        <h3>About your settings</h3>
        <p>
          These preferences are currently stored in frontend application
          state. They will reset when the page is refreshed until persistent
          storage or backend settings are connected.
        </p>
      </div>

    </section>
  );
}

export default Settings;
