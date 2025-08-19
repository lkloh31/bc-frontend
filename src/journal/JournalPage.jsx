import { useEffect, useState, useMemo } from "react";
import { useAuth } from "../auth/AuthContext";
import { useApi } from "../api/ApiContext";
import Calendar from "react-calendar";

import "react-calendar/dist/Calendar.css";
import "../styles/pages/journal.css";

const toLocalYYYYMMDD = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
const BLANK_ENTRY = { title: "", content: "", tags: "" };

const moodMap = {
  1: { label: "Sad", emoji: "😢" },
  2: { label: "Frustrated", emoji: "😤" },
  3: { label: "Tired", emoji: "😴" },
  4: { label: "Neutral", emoji: "😐" },
  5: { label: "Calm", emoji: "😌" },
  6: { label: "Happy", emoji: "😊" },
  7: { label: "Loved", emoji: "😍" },
  8: { label: "Thrilled", emoji: "🤩" },
};

export default function JournalPage() {
  const { token } = useAuth();
  const { request } = useApi();
  const [entries, setEntries] = useState([]);
  const [moods, setMoods] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [formData, setFormData] = useState(BLANK_ENTRY);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeStartDate, setActiveStartDate] = useState(new Date());

  // --- NEW: State for search and tag filtering ---
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState(null);
  const [tagsVisible, setTagsVisible] = useState(true);

  useEffect(() => {
    if (!token) return;
    const getData = async () => {
      try {
        const [journalRes, moodRes] = await Promise.all([
          request("/journal"),
          request("/mood"),
        ]);
        setEntries(journalRes);
        setMoods(moodRes || []);
      } catch (err) {
        console.error("Failed to fetch page data:", err);
      }
    };
    getData();
  }, [token, request]);

  // --- NEW: Memoized list of all unique tags ---
  const allUniqueTags = useMemo(() => {
    const tagsSet = new Set();
    entries.forEach((entry) => {
      if (entry.tags) {
        entry.tags.split(",").forEach((tag) => {
          if (tag.trim()) tagsSet.add(tag.trim());
        });
      }
    });
    return Array.from(tagsSet).sort();
  }, [entries]);

  // --- UPDATED: Filtering logic now includes search and tags ---
  const filteredEntries = useMemo(() => {
    let tempEntries = [...entries];

    // Filter by selected tag first
    if (selectedTag) {
      tempEntries = tempEntries.filter(
        (entry) =>
          entry.tags &&
          entry.tags
            .split(",")
            .map((t) => t.trim())
            .includes(selectedTag)
      );
    }

    // Then, filter by search term (searches title and tags)
    if (searchTerm) {
      tempEntries = tempEntries.filter(
        (entry) =>
          (entry.title &&
            entry.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (entry.tags &&
            entry.tags.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    return tempEntries;
  }, [entries, searchTerm, selectedTag]);

  // --- This logic now uses the master 'filteredEntries' list ---
  const entriesForSelectedDate = useMemo(() => {
    // If a search or tag filter is active, show results from all dates. Otherwise, filter by selected date.
    if (searchTerm || selectedTag) {
      return filteredEntries;
    }
    return entries.filter(
      (e) =>
        toLocalYYYYMMDD(new Date(e.entry_timestamp)) ===
        toLocalYYYYMMDD(selectedDate)
    );
  }, [entries, selectedDate, searchTerm, selectedTag, filteredEntries]);

  // --- All other state management and handlers are unchanged ---
  const entryDateSet = useMemo(
    () =>
      new Set(entries.map((e) => toLocalYYYYMMDD(new Date(e.entry_timestamp)))),
    [entries]
  );
  const moodDateMap = useMemo(
    () =>
      new Map(
        moods.map((m) => [toLocalYYYYMMDD(new Date(m.mood_date)), m.mood_value])
      ),
    [moods]
  );
  const selectedDayMood = useMemo(() => {
    const moodValue = moodDateMap.get(toLocalYYYYMMDD(selectedDate));
    return moodValue
      ? `${moodMap[moodValue].emoji} ${moodMap[moodValue].label}`
      : "No mood logged";
  }, [selectedDate, moodDateMap]);
  const monthMood = useMemo(() => {
    const month = activeStartDate.getMonth();
    const year = activeStartDate.getFullYear();
    const moodsForMonth = moods.filter((m) => {
      const moodDate = new Date(m.mood_date);
      return moodDate.getMonth() === month && moodDate.getFullYear() === year;
    });
    if (moodsForMonth.length === 0) return "Not logged yet.";
    const total = moodsForMonth.reduce(
      (sum, mood) => sum + Number(mood.mood_value),
      0
    );
    const avgValue = Math.round(total / moodsForMonth.length);
    if (avgValue < 1 || avgValue > 5 || !moodMap[avgValue]) return "N/A";
    return `${moodMap[avgValue].emoji} ${moodMap[avgValue].label}`;
  }, [moods, activeStartDate]);

  useEffect(() => {
    if (entriesForSelectedDate.length > 0 && !selectedTag && !searchTerm) {
      setSelectedEntry(entriesForSelectedDate[0]);
    } else {
      setSelectedEntry(null);
    }
  }, [entriesForSelectedDate, selectedTag, searchTerm]);

  useEffect(() => {
    if (selectedEntry) {
      setFormData({
        title: selectedEntry.title,
        content: selectedEntry.content || "",
        tags: selectedEntry.tags || "",
      });
    } else {
      setFormData(BLANK_ENTRY);
    }
  }, [selectedEntry]);

  const handleInputChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleSelectEntry = (entry) => setSelectedEntry(entry);
  const handleNewEntry = () => setSelectedEntry(null);
  const handleTagClick = (tag) => {
    setSelectedTag((currentTag) => (currentTag === tag ? null : tag)); // Toggle selection
    setSearchTerm(""); // Clear search when a tag is clicked
  };
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setSelectedTag(null); // Clear tag when searching
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let updatedEntry;
      if (selectedEntry) {
        updatedEntry = await request(`/journal/${selectedEntry.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        setEntries(
          entries.map((e) => (e.id === selectedEntry.id ? updatedEntry : e))
        );
      } else {
        const newEntryData = {
          ...formData,
          entry_timestamp: toLocalYYYYMMDD(selectedDate),
        };
        updatedEntry = await request("/journal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newEntryData),
        });
        setEntries([updatedEntry, ...entries]);
      }
      setSelectedEntry(updatedEntry);
    } catch (err) {
      console.error("Failed to save entry:", err);
    }
  };
  const handleDelete = async () => {
    if (!selectedEntry || !window.confirm("Are you sure?")) return;
    try {
      await request(`/journal/${selectedEntry.id}`, { method: "DELETE" });
      setEntries(entries.filter((e) => e.id !== selectedEntry.id));
      setSelectedEntry(null);
    } catch (err) {
      console.error("Failed to delete entry:", err);
    }
  };

  return (
    <div className="journal-page">
      <aside className="journal-sidebar">
        <Calendar
          onChange={setSelectedDate}
          value={selectedDate}
          onActiveStartDateChange={({ activeStartDate }) =>
            setActiveStartDate(activeStartDate)
          }
          tileClassName={({ date, view }) => {
            if (view === "month" && moodDateMap.has(toLocalYYYYMMDD(date))) {
              return `mood-${moodDateMap.get(toLocalYYYYMMDD(date))}`;
            }
          }}
          tileContent={({ date, view }) =>
            view === "month" && entryDateSet.has(toLocalYYYYMMDD(date)) ? (
              <div className="entry-marker"></div>
            ) : null
          }
        />
        <div className="mood-summary">
          <div className="selected-day-mood">
            <h4>Selected Day's Mood:</h4>
            <p>{selectedDayMood}</p>
          </div>
          <div className="monthly-mood">
            <h4>This Month's Average Mood:</h4>
            <p>{monthMood}</p>
          </div>
        </div>
        {/* --- Search and Filter Section --- */}
        <div className="search-filter-section">
          <input
            type="text"
            placeholder="Search entries..."
            className="journal-search-bar"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <div className="tags-collapsible">
            <button
              className="tags-toggle"
              onClick={() => setTagsVisible(!tagsVisible)}
            >
              Filter by Tag {tagsVisible ? "▲" : "▼"}
            </button>
            {tagsVisible && (
              <div className="tags-list">
                {allUniqueTags.length > 0 ? (
                  allUniqueTags.map((tag) => (
                    <button
                      key={tag}
                      className={`tag-button ${
                        selectedTag === tag ? "active" : ""
                      }`}
                      onClick={() => handleTagClick(tag)}
                    >
                      {tag}
                    </button>
                  ))
                ) : (
                  <p className="no-tags">No tags created yet.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* --- THIS MAIN SECTION IS NOW CORRECTLY FILLED IN --- */}
      <main className="journal-main">
        {/* Column 1 (in main): The Form */}
        <div className="journal-form-section">
          <button
            onClick={handleNewEntry}
            className="button-primary new-entry-button"
          >
            + New Entry
          </button>
          <form className="journal-form" onSubmit={handleSubmit}>
            <h5 className="form-header">
              {selectedEntry ? "Edit Entry" : "Create New Entry"}
            </h5>
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
        </div>

        {/* Column 2 (in main): The Entry List */}
        <div className="daily-entries-section">
          <h4>
            {searchTerm || selectedTag
              ? "Filtered Results"
              : `Entries for ${selectedDate.toLocaleDateString()}`}
          </h4>
          <div className="entries-list">
            {entriesForSelectedDate.length > 0 ? (
              entriesForSelectedDate.map((entry) => (
                <div
                  key={entry.id}
                  onClick={() => handleSelectEntry(entry)}
                  className={`entry-item ${
                    selectedEntry?.id === entry.id ? "active-entry" : ""
                  }`}
                >
                  {entry.title}
                </div>
              ))
            ) : (
              <p className="no-entries">
                {searchTerm || selectedTag
                  ? "No matching entries found."
                  : "No entry for this day."}
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
