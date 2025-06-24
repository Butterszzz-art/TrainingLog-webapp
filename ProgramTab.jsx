import React, { useEffect, useState } from 'react';

// Simple local storage helpers
const loadPrograms = () => JSON.parse(localStorage.getItem('programs') || '[]');
const savePrograms = (programs) => localStorage.setItem('programs', JSON.stringify(programs));

export default function ProgramTab() {
  const [templates, setTemplates] = useState([]);
  const [programs, setPrograms] = useState(loadPrograms());
  const [showShare, setShowShare] = useState(false);

  useEffect(() => {
    // fetch templates from localStorage for now
    const tpl = JSON.parse(localStorage.getItem('programTemplates') || '[]');
    setTemplates(tpl);
  }, []);

  const createProgram = async (data) => {
    const res = await fetch('/createProgram', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (json.id) {
      const newPrograms = [...programs, { ...data, id: json.id }];
      setPrograms(newPrograms);
      savePrograms(newPrograms);
    }
  };

  const shareProgram = async (programId, recipientUsername) => {
    await fetch('/shareProgram', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ programId, recipientUsername })
    });
  };

  // Render placeholders for complex UI pieces
  return (
    <div id="programTabReact">
      <h2>Programs</h2>
      {/* Template library placeholder */}
      <div className="template-library">Template Library Dropdown TODO</div>

      {/* Program editor placeholder */}
      <div className="program-editor">Program Editor TODO</div>

      {/* Progression settings placeholder */}
      <div className="progression-settings">Progression Settings TODO</div>

      {/* Calendar view placeholder */}
      <div className="calendar-view">Calendar & Timeline TODO</div>

      {/* Share modal */}
      {showShare && (
        <div className="share-modal">
          <input id="shareUser" placeholder="Username" />
          <button onClick={() => {
            const user = document.getElementById('shareUser').value;
            if (user) shareProgram(null, user);
            setShowShare(false);
          }}>Share</button>
        </div>
      )}

      {/* Analytics placeholder */}
      <div className="program-analytics">Program Analytics TODO</div>
    </div>
  );
}
