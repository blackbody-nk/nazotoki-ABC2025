import { items } from "../game/rooms";

export default function Inventory({ inventory = [], selectedItem = null, setState }) {
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

          const isSelected = selectedItem === id;

          return (
            <div
              key={id}
              title={def.name}
              onClick={() => {
                if (!setState) return;
                setState((prev) => ({
                  ...prev,
                  selectedItem: prev.selectedItem === id ? null : id
                }));
              }}
              style={{
                width: 64,
                height: 64,
                borderRadius: 10,
                border: isSelected
                  ? "2px solid rgba(255,255,0,0.95)"
                  : "1px solid rgba(255,255,255,0.25)",
                background: isSelected
                  ? "rgba(255,255,0,0.18)"
                  : "rgba(255,255,255,0.08)",
                padding: 6,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer"
              }}
            >
              <img
                src={def.icon}
                alt={def.name}
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            </div>
          );
        })
      )}
    </div>
  );
}