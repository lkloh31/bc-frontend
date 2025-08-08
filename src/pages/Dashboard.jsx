import { useState, useCallback, useMemo } from "react";
import RGL, { WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { registry, defaultLayout } from "../widgets";
import "../styles/pages/dashboard.css";

const AutoGrid = WidthProvider(RGL);

export default function Dashboard() {
  const [items, setItems] = useState(defaultLayout);

  const widgetChoices = useMemo(
    () => Object.keys(registry).map((id) => ({ id, name: registry[id].meta.name })),
    []
  );
  const [choice, setChoice] = useState(widgetChoices[0]?.id || "");

  const onLayoutChange = useCallback((nextLayout) => {
    setItems((prev) =>
      prev.map((it) => {
        const pos = nextLayout.find((l) => l.i === it.i);
        return pos ? { ...it, ...pos } : it;
      })
    );
  }, []);

  const onWidgetChange = (i, patch) => {
    setItems((prev) =>
      prev.map((it) => (it.i === i ? { ...it, props: { ...it.props, ...patch } } : it))
    );
  };

  const addWidget = (widgetId) => {
    if (!registry[widgetId]) return;
    const id = String(Date.now());
    const w = 4; // < cols (12) so it can move left/right
    const h = 3;
    setItems((prev) => [
      ...prev,
      {
        i: id,
        x: 0,
        y: Infinity, // place at bottom
        w,
        h,
        widgetId,
        props: registry[widgetId].meta.defaultProps,
      },
    ]);
  };

  const removeWidget = (i) => setItems((prev) => prev.filter((it) => it.i !== i));

  return (
    <div className="dashboard">
      {/* Sticky toolbar below navbar */}
      <div className="dashboard-toolbar">
        <select value={choice} onChange={(e) => setChoice(e.target.value)}>
          {widgetChoices.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name}
            </option>
          ))}
        </select>
        <button onClick={() => addWidget(choice)}>+ Add widget</button>
      </div>

      <AutoGrid
        className="layout"
        cols={12}
        rowHeight={32}
        margin={[12, 12]}
        containerPadding={[12, 12]}
        compactType={null}
        preventCollision={false}
        onLayoutChange={onLayoutChange}
        draggableHandle=".widget-header"
      >
        {items.map(({ i, widgetId, props, x, y, w, h }) => {
          const entry = registry[widgetId];
          const Widget = entry?.Component;
          return (
            <div key={i} data-grid={{ i, x, y, w: w ?? 4, h: h ?? 3 }}>
              <div className="widget-card">
                <div className="widget-header">
                  <span>{entry?.meta?.name ?? "Widget"}</span>
                  <button onClick={() => removeWidget(i)} title="Remove">✕</button>
                </div>
                <div className="widget-body">
                  {Widget ? (
                    <Widget {...props} onChange={(patch) => onWidgetChange(i, patch)} />
                  ) : (
                    <div>Unknown widget: {widgetId}</div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </AutoGrid>
    </div>
  );
}
