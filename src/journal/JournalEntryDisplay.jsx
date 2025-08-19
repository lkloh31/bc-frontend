import React from 'react';

export default function JournalEntryDisplay({ entry }) {
  // If no entry is selected, show a message
  if (!entry) {
    return (
      <div className="journal-display-container">
        <div className="no-entry-selected">
          <p>Select an entry from the list to read it, or create a new one.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="journal-display-container">
      <h3 className="display-title">{entry.title}</h3>
      {entry.tags && (
        <div className="display-tags">
          <strong>Tags:</strong> {entry.tags}
        </div>
      )}
      <div className="display-content">
        <p>{entry.content}</p>
      </div>
    </div>
  );
}