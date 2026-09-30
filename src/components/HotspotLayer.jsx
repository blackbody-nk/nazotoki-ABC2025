import { checkRequires, applyActions } from "../game/engine";

export default function HotspotLayer({ hotspots = [], state, setState, debug }) {
  // ★ requires を満たすものだけ残す
  const visible = hotspots.filter((h) => checkRequires(h.requires, state));

  // ★ priority（大きいほど上）でソート。未指定は0
  const ordered = [...visible].sort(
    (a, b) => (a.priority ?? 0) - (b.priority ?? 0)
  );

  return (
    <>
      {ordered.map((h) => (
        <div
          key={h.id}
          onClick={(e) => {
            e.stopPropagation(); // ★下層や親に伝播させない（安全）
            applyActions(h.actions, setState);
          }}
          style={{
            position: "absolute",
            left: `${h.rect.x * 100}%`,
            top: `${h.rect.y * 100}%`,
            width: `${h.rect.w * 100}%`,
            height: `${h.rect.h * 100}%`,
            cursor: "pointer",
            // ★重なった時の前後を確定させる
            zIndex: 100 + (h.priority ?? 0),
            border: debug ? "1px solid red" : "none",
            background: debug ? "rgba(255,0,0,0.08)" : "transparent"
          }}
          title={debug ? `${h.id} (p=${h.priority ?? 0})` : undefined}
        />
      ))}
    </>
  );
}