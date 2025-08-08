export const meta = {
  id: "notes",
  name: "Notes",
  defaultProps: { title: "Notes", text: "" },
  settingsSchema: [{ key: "title", type: "text", label: "Title" }],
};

export default function Notes({ title, text, onChange }) {
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", gap: 8 }}>
      <textarea
        value={text}
        onChange={(e) => onChange({ text: e.target.value })}
        placeholder="Type your notes…"
        style={{
          flex: 1, width: "100%", resize: "none",
          background: "#141414", color: "#eee",
          border: "1px solid #333", borderRadius: 6, padding: 10,
          fontSize: 14, lineHeight: 1.4, outline: "none",
        }}
      />
    </div>
  );
}
