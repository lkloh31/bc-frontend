import { useEffect, useState, useMemo } from "react";
import { useAuth } from "../auth/AuthContext";
import { useApi } from "../api/ApiContext";
import Calendar from "react-calendar";
import JournalEntryDisplay from "./JournalEntryDisplay";
import EmojiPicker from "emoji-picker-react";

import "react-calendar/dist/Calendar.css";
import "../styles/pages/journal.css";

const toLocalYYYYMMDD = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
const BLANK_ENTRY = { title: "", content: "", tags: "" };

// This moodMap now correctly reflects the 8 moods
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
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState(null);
  const [tagsVisible, setTagsVisible] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

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

  const filteredEntries = useMemo(() => {
    let tempEntries = [...entries];
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

  const entriesForSelectedDate = useMemo(() => {
    if (searchTerm || selectedTag) {
      return filteredEntries;
    }
    return entries.filter(
      (e) =>
        toLocalYYYYMMDD(new Date(e.entry_timestamp)) ===
        toLocalYYYYMMDD(selectedDate)
    );
  }, [entries, selectedDate, searchTerm, selectedTag, filteredEntries]);

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

  // NEW: Replaced the 'monthMood' average with a percentage breakdown
  const monthMoodStats = useMemo(() => {
    const month = activeStartDate.getMonth();
    const year = activeStartDate.getFullYear();
    const moodsForMonth = moods.filter((m) => {
      const moodDate = new Date(m.mood_date);
      return moodDate.getMonth() === month && moodDate.getFullYear() === year;
    });

    if (moodsForMonth.length === 0) return [];

    const counts = moodsForMonth.reduce((acc, mood) => {
      acc[mood.mood_value] = (acc[mood.mood_value] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts)
      .map(([moodValue, count]) => ({
        ...moodMap[moodValue],
        count,
        percentage: Math.round((count / moodsForMonth.length) * 100),
      }))
      .sort((a, b) => b.count - a.count); // Sort by most frequent
  }, [moods, activeStartDate]);


  useEffect(() => {
    if (selectedEntry) {
      setFormData({
        title: selectedEntry.title,
        content: selectedEntry.content || "",
        tags: selectedEntry.tags || "",
      });
      setIsEditing(false);
    } else {
      setFormData(BLANK_ENTRY);
      setIsEditing(true);
    }
    setShowEmojiPicker(false);
  }, [selectedEntry]);

  const hasUnsavedChanges = () => {
    if (!selectedEntry) return false;
    return (
      formData.title !== selectedEntry.title ||
      formData.content !== (selectedEntry.content || "") ||
      formData.tags !== (selectedEntry.tags || "")
    );
  };

  const handleInputChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleSelectEntry = (entry) => setSelectedEntry(entry);
  const handleTagClick = (tag) => {
    setSelectedTag((currentTag) => (currentTag === tag ? null : tag));
    setSearchTerm("");
  };
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setSelectedTag(null);
  };
  const handleNewEntry = () => setSelectedEntry(null);

  const handleCancelEdit = () => {
    if (
      hasUnsavedChanges() &&
      !window.confirm(
        "You have unsaved changes. Are you sure you want to cancel?"
      )
    ) {
      return;
    }

    if (selectedEntry) {
      setFormData({
        title: selectedEntry.title,
        content: selectedEntry.content || "",
        tags: selectedEntry.tags || "",
      });
      setIsEditing(false);
    } else {
      setFormData(BLANK_ENTRY);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let updatedEntry;
      if (selectedEntry) {
        updatedEntry = await request(`/journal/${selectedEntry.id}`, {
          method: "PUT",
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
    if (
      !selectedEntry ||
      !window.confirm("Are you sure you want to permanently delete this entry?")
    )
      return;
    try {
      await request(`/journal/${selectedEntry.id}`, { method: "DELETE" });
      setEntries(entries.filter((e) => e.id !== selectedEntry.id));
      setSelectedEntry(null);
    } catch (err) {
      console.error("Failed to delete entry:", err);
    }
  };

  const onEmojiClick = (emojiObject) => {
    setFormData((prevData) => ({
      ...prevData,
      content: prevData.content + emojiObject.emoji,
    }));
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
          {/* UPDATED: The monthly summary now displays the breakdown */}
          <div className="monthly-mood">
            <h4>This Month's Moods:</h4>
            <div className="mood-stats-list">
              {monthMoodStats.length > 0 ? (
                monthMoodStats.map((mood) => (
                  <div key={mood.label} className="mood-stat-item">
                    <span>{mood.emoji} {mood.label}</span>
                    <span className="mood-percentage">{mood.percentage}%</span>
                  </div>
                ))
              ) : (
                <p className="no-moods-logged">No moods logged this month.</p>
              )}
            </div>
          </div>
        </div>
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

      <main className="journal-main">
        <div className="journal-form-section">
          {!isEditing && (
            <button
              onClick={handleNewEntry}
              className="button-primary new-entry-button"
            >
              + New Entry
            </button>
          )}

          {isEditing ? (
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
              <div className="textarea-wrapper">
                <textarea
                  name="content"
                  placeholder="Start writing..."
                  value={formData.content}
                  onChange={handleInputChange}
                  required
                ></textarea>
                {showEmojiPicker && (
                  <div className="emoji-picker-container">
                    <EmojiPicker
                      onEmojiClick={onEmojiClick}
                      height={350}
                      width="100%"
                      previewConfig={{ showPreview: false }}
                    />
                  </div>
                )}
              </div>
              <input
                type="text"
                name="tags"
                placeholder="Tags (e.g., work, personal, ideas)"
                value={formData.tags}
                onChange={handleInputChange}
              />
              <div className="form-buttons">
                <button
                  type="button"
                  className="button-emoji"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  title="Add Emoji"
                >
                  😊
                </button>
                <div className="main-form-buttons">
                  <button type="submit" className="button-primary">
                    {selectedEntry ? "Save Changes" : "Create Entry"}
                  </button>
                  {selectedEntry && (
                    <button
                      type="button"
                      className="button-secondary"
                      onClick={handleCancelEdit}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </form>
          ) : (
            <div className="journal-read-mode">
              <JournalEntryDisplay entry={selectedEntry} />
              <div className="form-buttons">
                {selectedEntry && (
                  <>
                    <button
                      className="button-primary"
                      onClick={() => setIsEditing(true)}
                    >
                      Edit
                    </button>
                    <button className="button-danger" onClick={handleDelete}>
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

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