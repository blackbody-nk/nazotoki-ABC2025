import HotspotLayer from "./HotspotLayer";

export default function GameScreen({ rooms, state, setState }) {
  const { room, view } = state.location;
  const current = rooms[room]?.views?.[view];

  if (!current) return <div>View not found: {room}/{view}</div>;

  const go = (dir) => {
    const nextView = current.nav?.[dir];
    if (!nextView) return;
    setState((prev) => ({
      ...prev,
      location: { ...prev.location, view: nextView },
      message: ""
    }));
  };

  const navButtonStyle = {
    padding: "6px 10px",
    marginRight: 6
  };

  return (
    <div style={{ maxWidth: 900, margin: "12px auto", padding: 12 }}>
      <div style={{ position: "relative", width: "100%", userSelect: "none" }}>
        <img
          src={current.bg}
          alt={`${room}-${view}`}
          style={{ width: "100%", display: "block" }}
        />
        <HotspotLayer
          hotspots={current.hotspots || []}
          state={state}
          setState={setState}
          /*debug={state.debugHotspots}*/
          debug={false}
        />
      </div>

      <div style={{ marginTop: 10 }}>
        <button style={navButtonStyle} onClick={() => go("left")}>
          ←
        </button>
        <button style={navButtonStyle} onClick={() => go("right")}>
          →
        </button>
        <button style={navButtonStyle} onClick={() => go("up")}>
          ↑
        </button>
        <button style={navButtonStyle} onClick={() => go("down")}>
          ↓
        </button>

{/*  コメントアウト行　デバッグ用ボタンの表示 
        <button
          style={{ ...navButtonStyle, marginLeft: 10 }}
          onClick={() =>
            setState((prev) => ({ ...prev, debugHotspots: !prev.debugHotspots }))
          }
        >
          Hotspot Debug: {state.debugHotspots ? "ON" : "OFF"}
        </button>*/}
      </div>

      <div style={{ marginTop: 8, minHeight: 22 }}>
        {state.message ? <em>{state.message}</em> : null}
      </div>
    </div>
  );
}
