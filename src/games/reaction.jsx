import { useEffect, useRef, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { API } from "../api/ApiContext";

export default function Reaction() {
  const { token } = useAuth();
  const [state, setState] = useState("idle");
  const [msg, setMsg] = useState("Click Start, then wait for green.");
  const [start, setStart] = useState(0);
  const [time, setTime] = useState(null);
  const [best, setBest] = useState(null);
  const timer = useRef(null);

  useEffect(() => {
    if (!token) return;
    (async () => {
      const res = await fetch(`${API}/games/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.reaction?.best_time_ms) setBest(data.reaction.best_time_ms);
      }
    })();
  }, [token]);

  async function saveBest(ms) {
    if (!token) return;
    try {
      const res = await fetch(`${API}/games/score`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ game: "reaction", timeMs: ms }),
      });
      if (res.ok) {
        const row = await res.json();
        setBest(row.best_time_ms);
      }
    } catch {}
  }

  function startTest() {
    clearTimeout(timer.current);
    setState("wait"); setMsg("Wait for green…"); setTime(null);
    const delay = 1000 + Math.random()*2000;
    timer.current = setTimeout(()=>{
      setState("go"); setMsg("CLICK!");
      setStart(performance.now());
    }, delay);
  }

  function click(){
    if (state === "wait") { setMsg("Too soon! 😅"); setState("result"); setTime(null); clearTimeout(timer.current); }
    if (state === "go")   {
      const t = Math.round(performance.now() - start);
      setTime(t);
      setMsg(`Reaction: ${t} ms`);
      setState("result");
      if (!best || t < best) saveBest(t);
    }
  }

  useEffect(()=>()=>clearTimeout(timer.current), []);

  const status = state==="go" ? "CLICK!" : state==="wait" ? "Wait…" : "Start";
  return (
    <div>
      <div style={{ marginBottom:6, fontWeight:600 }}>
        {best != null && <>Best: {best} ms · </>}
        {time != null && <>Last: {time} ms</>}
      </div>
      <button
        onClick={state==="idle"||state==="result" ? startTest : click}
        style={{
          width:220, height:80, fontSize:18,
          background: state==="go" ? "#2ecc71" : state==="wait" ? "#e67e22" : "#1f1f1f",
          color:"#fff", border:"1px solid #444"
        }}
      >
        {status}
      </button>
    </div>
  );
}
