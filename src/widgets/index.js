import Notes, { meta as notesMeta } from "./Notes";
import Clock, { meta as clockMeta } from "./Clock";
import Tetris, { meta as tetrisMeta } from "./Tetris";

export const registry = {
  [notesMeta.id]: { Component: Notes, meta: notesMeta },
  [clockMeta.id]: { Component: Clock, meta: clockMeta },
};

// put two items side-by-side
export const defaultLayout = [
  { i: "1", x: 0, y: 0, w: 4, h: 3, widgetId: "notes", props: notesMeta.defaultProps },
  { i: "2", x: 4, y: 0, w: 4, h: 2, widgetId: "clock", props: clockMeta.defaultProps },
];
