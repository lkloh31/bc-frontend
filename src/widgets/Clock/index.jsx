export const meta = {
  id: "clock",
  name: "Clock",
  defaultProps: {},
  settingsSchema: [],
};

export default function Clock() {
  const now = new Date().toLocaleTimeString();
  return <div style={{ fontSize: 24 }}>{now}</div>;
}
