import { items } from "../game/rooms"; // ← items を export している場所に合わせて調整

export default function Inventory({ inventory = [] }) {
  return (
    <div
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        height: 90,
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 12px",
        boxSizing: "border-box",
        background: "rgba(0,0,0,0.65)",
        zIndex: 1000
      }}
    >
      {inventory.length === 0 ? (
        <span style={{ color: "#fff" }}>(none)</span>
      ) : (
        inventory.map((id) => {
          const def = items[id];
          if (!def) return null;

          return (
            <div
              key={id}
              title={def.name}
              style={{
                width: 64,
                height: 64,
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.25)",
                background: "rgba(255,255,255,0.08)",
                padding: 6,
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <img
                src={def.icon}
                alt={def.name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain"
                }}
              />
            </div>
          );
        })
      )}
    </div>
  );
}