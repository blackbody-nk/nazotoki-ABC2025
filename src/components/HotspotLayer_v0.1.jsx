import { checkRequires, applyActions } from "../game/engine";

export default function HotspotLayer({ hotspots, state, setState, debug }) {
  return (
    <>
      {hotspots.map((h) => {
        const ok = checkRequires(h.requires, state);
        if (!ok) return null;

        return (
          <div
            key={h.id}
            onClick={() => applyActions(h.actions, setState)}
            style={{
              position: "absolute",
              left: `${h.rect.x * 100}%`,
              top: `${h.rect.y * 100}%`,
              width: `${h.rect.w * 100}%`,
              height: `${h.rect.h * 100}%`,
              cursor: "pointer",
              border: debug ? "1px solid red" : "none",
              background: debug ? "rgba(255,0,0,0.08)" : "transparent"
            }}
            title={debug ? h.id : undefined}
          />
        );
      })}
    </>
  );
}
