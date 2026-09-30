import HotspotLayer from "./HotspotLayer";
import { checkRequires } from "../game/engine";

export default function Modal({ modalStack, state, setState }) {
  const stack = modalStack || [];
  const modal = stack[stack.length - 1];
  if (!modal) return null;

  const { bg, hotspots } = modal;

  const close = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setState((prev) => {
      const current = (prev.modalStack || [])[ (prev.modalStack || []).length - 1 ];
      const nextStack = (prev.modalStack || []).slice(0, -1);

      const next = { ...prev, modalStack: nextStack };

      if (current?.resetFlagOnClose) {
        next.flags = { ...prev.flags, [current.resetFlagOnClose]: false };
      }

      return next;
    });
  };

  const showBack = stack.length >= 2;

  const displayText =
    typeof modal.displayText === "function"
      ? modal.displayText(state)
      : modal.displayText;

  return (
    <div
      onMouseDown={close}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        zIndex: 9999
      }}
    >
      <div
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          width: "min(900px, 95vw)",
          height: "min(85vh, 95dvh)",
          display: "flex",
          flexDirection: "column",
          borderRadius: 8,
          overflow: "hidden",
          background: "#000"
        }}
      >
        <div
          style={{
            position: "relative",
            flex: 1,
            minHeight: 0,
            background: "#000"
          }}
        >
          <img
            src={bg}
            alt="zoom"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "contain",
              display: "block"
            }}
          />

          {(modal.sprites || [])
            .filter((sp) => checkRequires(sp.requires, state))
            .map((sp) => (
              <img
                key={sp.id}
                src={sp.src}
                alt={sp.id}
                style={{
                  position: "absolute",
                  left: `${sp.rect.x * 100}%`,
                  top: `${sp.rect.y * 100}%`,
                  width: `${sp.rect.w * 100}%`,
                  height: `${sp.rect.h * 100}%`,
                  pointerEvents: "none"
                }}
              />
            ))}

          {displayText != null && (
            <div
              style={{
                position: "absolute",
                top: "32.5%",
                left: "57.5%",
                transform: "translateX(-50%)",
                minWidth: 180,
                padding: "8px 14px",
                borderRadius: 8,
                background: "rgba(0,0,0,0.75)",
                color: "#00ff66",
                fontSize: 28,
                fontFamily: "monospace",
                textAlign: "center",
                letterSpacing: "0.2em",
                pointerEvents: "none"
              }}
            >
              {displayText}
            </div>
          )}

          <HotspotLayer
            hotspots={hotspots || []}
            state={state}
            setState={setState}
            debug={state.debugHotspots}
          />

          {showBack && (
            <button
              onMouseDown={close}
              style={{
                position: "absolute",
                top: 8,
                left: 8,
                padding: "6px 10px",
                cursor: "pointer"
              }}
            >
              ←
            </button>
          )}

          <button
            onMouseDown={close}
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              padding: "6px 10px",
              cursor: "pointer"
            }}
          >
            ✕
          </button>
        </div>

        <div
          style={{
            minHeight: 44,
            padding: "10px 12px",
            background: "rgba(0,0,0,0.75)",
            color: "#fff",
            fontSize: 14,
            lineHeight: 1.4,
            visibility: state.message ? "visible" : "hidden"
          }}
        >
          {state.message || " "}
        </div>

{/*
        {state.message && (
          <div
            style={{
              padding: "10px 12px",
              background: "rgba(0,0,0,0.75)",
              color: "#fff",
              fontSize: 14,
              lineHeight: 1.4
            }}
          >
            {state.message}
          </div>
        )}   */}

      </div>
    </div>
  );
}