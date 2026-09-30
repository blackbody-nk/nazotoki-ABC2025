import HotspotLayer from "./HotspotLayer";
import { checkRequires } from "../game/engine";

export default function Modal({ modalStack, state, setState }) {
  const stack = modalStack || [];
  const modal = stack[stack.length - 1];
  if (!modal) return null;

  const { bg, hotspots, resetFlagOnClose } = modal;

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
      // 閉じたらメッセージを消したいなら、次の1行をON
      // next.message = "";

      return next;
    });
  };

  const showBack = stack.length >= 2;

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
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
          borderRadius: 8,
          overflow: "hidden",
          background: "#000"
        }}
      >
        {/* 画像表示エリア（アスペクト比固定） */}
        <div 
          style={{ 
            position: "relative", 
            width: "100%", 
            aspectRatio: "16 / 9", 
            background: "#000" 
          }}
        >

        <img
          src={bg}
          alt="zoom"
          style={{
            maxWidth: "100%",
            maxHeight: "90vh",
            width: "auto",
            height: "auto",
            display: "block",
            margin: "0 auto"
          }}
        />

          {/* sprites（重ね画像） */}
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

          {/* クリック判定 */}
          <HotspotLayer
            hotspots={hotspots || []}
            state={state}
            setState={setState}
            debug={state.debugHotspots}
          />

          {/* 戻る */}
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

          {/* 閉じる */}
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

        {/* メッセージ（ここはスクロールしない＝常に見える） */}
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
        )}
      </div>
    </div>
  );
}