import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { useApi } from "../api/ApiContext";

import "../styles/pages/journal.css";
import "../styles/components/button.css";

const BLANK_ENTRY = { title: "", content: "", tags: "" };

export default function JournalPage() {
  const { token } = useAuth();
  const { request } = useApi();
  const [entries, setEntries] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [formData, setFormData] = useState(BLANK_ENTRY);

  // Fetch entries when the component mounts
  useEffect(() => {
    if (!token) return;
    const getEntries = async () => {
      try {
        const response = await request("/journal");
        setEntries(response);
      } catch (err) {
        console.error("Failed to fetch journal entries:", err);
      }
    };
    getEntries();
  }, [token, request]);

  useEffect(() => {
    if (selectedEntry) {
      setFormData({
        title: selectedEntry.title,
        content: selectedEntry.content,
        tags: selectedEntry.tags || "",
      });
    } else {
      setFormData(BLANK_ENTRY);
    }
  }, [selectedEntry]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectEntry = (entry) => {
    setSelectedEntry(entry);
  };

  const handleNewEntry = () => {
    setSelectedEntry(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedEntry) {
        // Update existing entry
        const updatedEntry = await request(`/journal/${selectedEntry.id}`, {
          method: "PUT",
          body: JSON.stringify(formData), // Stringify the formData
        });
        setEntries(
          entries.map((e) => (e.id === selectedEntry.id ? updatedEntry : e))
        );
      } else {
        // Create new entry
        const newEntry = await request("/journal", {
          method: "POST",
          body: JSON.stringify(formData), // Stringify the formData
        });
        setEntries([newEntry, ...entries]);
        setSelectedEntry(newEntry);
      }
    } catch (err) {
      console.error("Failed to save entry:", err);
    }
  };

  const handleDelete = async () => {
    if (!selectedEntry) return;
    if (window.confirm("Are you sure you want to delete this entry?")) {
      try {
        await request(`/journal/${selectedEntry.id}`, { method: "DELETE" });
        setEntries(entries.filter((e) => e.id !== selectedEntry.id));
        setSelectedEntry(null);
      } catch (err) {
        console.error("Failed to delete entry:", err);
      }
    }
  };

  return (
    <div className="journal-page">
      <aside className="journal-sidebar">
        <div className="journal-list">
          <h3>Entries</h3>
          <button
            onClick={handleNewEntry}
            className="button-primary"
            style={{ marginBottom: "1rem" }}
          >
            + New Entry
          </button>
          <ul>
            {entries.map((entry) => (
              <li
                key={entry.id}
                onClick={() => handleSelectEntry(entry)}
                className={selectedEntry?.id === entry.id ? "active-entry" : ""}
              >
                {entry.title}
              </li>
            ))}
          </ul>
        </div>
      </aside>
      <main className="journal-main">
        <form className="journal-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="title"
            placeholder="Entry Title"
            value={formData.title}
            onChange={handleInputChange}
            required
          />
          <textarea
            name="content"
            placeholder="Start writing..."
            value={formData.content}
            onChange={handleInputChange}
            required
          ></textarea>
          <input
            type="text"
            name="tags"
            placeholder="Tags (e.g., work, personal, ideas)"
            value={formData.tags}
            onChange={handleInputChange}
          />
          <div className="form-buttons">
            <button type="submit" className="button-primary">
              {selectedEntry ? "Save Changes" : "Create Entry"}
            </button>
            {selectedEntry && (
              <button
                type="button"
                className="button-danger"
                onClick={handleDelete}
              >
                Delete
              </button>
            )}
          </div>
        </form>
      </main>
    </div>
  );
}
