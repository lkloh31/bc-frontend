import { useEffect, useState, useMemo } from "react";
import { useAuth } from "../auth/AuthContext";
import { useApi } from "../api/ApiContext";
import Calendar from "react-calendar";

import "react-calendar/dist/Calendar.css"; // Import calendar styles
import "../styles/pages/journal.css";
import "../styles/components/button.css";

// Helper to format a date as YYYY-MM-DD
const toYYYYMMDD = (date) => date.toISOString().split("T")[0];

const BLANK_ENTRY = { title: "", content: "", tags: "" };

export default function JournalPage() {
  const { token } = useAuth();
  const { request } = useApi();
  const [entries, setEntries] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [formData, setFormData] = useState(BLANK_ENTRY);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // 1. Fetch ALL journal entries once on component mount
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

  // 2. Memoize a Set of dates that have entries for performance
  const entryDates = useMemo(() => {
    return new Set(
      entries.map((entry) => toYYYYMMDD(new Date(entry.entry_timestamp)))
    );
  }, [entries]);

  // 3. Memoize the list of entries for the currently selected date
  const entriesForSelectedDate = useMemo(() => {
    return entries.filter(
      (entry) =>
        toYYYYMMDD(new Date(entry.entry_timestamp)) ===
        toYYYYMMDD(selectedDate)
    );
  }, [entries, selectedDate]);

  // 4. When the selected date changes, update the form
  useEffect(() => {
    // If there's an entry for the selected date, show it. Otherwise, clear the form.
    if (entriesForSelectedDate.length > 0) {
      setSelectedEntry(entriesForSelectedDate[0]);
    } else {
      setSelectedEntry(null);
    }
  }, [entriesForSelectedDate]);

  // Update form data when an entry is selected
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

  // --- HANDLER FUNCTIONS ---

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectEntry = (entry) => {
    setSelectedEntry(entry);
  };
  
  const handleNewEntry = () => {
    // Clears the form, preparing it for a new entry on the currently selected date
    setSelectedEntry(null);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedEntry) {
        // Update existing entry
        const updatedEntry = await request(`/journal/${selectedEntry.id}`, {
          method: "PUT",
          body: JSON.stringify(formData),
        });
        setEntries(
          entries.map((e) => (e.id === selectedEntry.id ? updatedEntry : e))
        );
      } else {
        // Create new entry for the selected date
        const newEntryData = { ...formData, entry_timestamp: selectedDate };
        const newEntry = await request("/journal", {
          method: "POST",
          body: JSON.stringify(newEntryData),
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
        {/* The Calendar Component */}
        <Calendar
          onChange={setSelectedDate}
          value={selectedDate}
          tileContent={({ date, view }) =>
            // Add a marker if a date has an entry
            view === "month" && entryDates.has(toYYYYMMDD(date)) ? (
              <div className="entry-marker"></div>
            ) : null
          }
        />
        <button
            onClick={handleNewEntry}
            className="button-primary"
            style={{ width: '100%', marginTop: "1rem" }}
          >
            + New Entry for Selected Date
        </button>
      </aside>
      <main className="journal-main">
        {/* List of entries for the selected day */}
        <div className="daily-entries-list">
          <h4>
            Entries for {selectedDate.toLocaleDateString()}
          </h4>
          {entriesForSelectedDate.length > 0 ? (
            entriesForSelectedDate.map(entry => (
              <div key={entry.id} onClick={() => handleSelectEntry(entry)} className={`entry-item ${selectedEntry?.id === entry.id ? 'active-entry' : ''}`}>
                {entry.title}
              </div>
            ))
          ) : (
            <p>No entry for this day.</p>
          )}
        </div>

        <hr />
        
        {/* The Form for creating/editing */}
        <form className="journal-form" onSubmit={handleSubmit}>
          <h5>{selectedEntry ? "Edit Entry" : "Create New Entry"}</h5>
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