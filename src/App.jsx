import { useState } from "react";
import { rooms } from "./game/rooms";
import GameScreen from "./components/GameScreen";
import Modal from "./components/Modal";
import Inventory from "./components/Inventory";

export default function App() {
  const [state, setState] = useState({
    location: { room: "room1", view: "west" },
    inventory: [],
    flags: {
      safeUnlocked: false,
      safeInput: "",
      card1Flipped: false,
      card1Letter1Combined: false,
      letter1Page: 1,
      letter1CornerFolded: false
    },
    message: "",
    debugHotspots: false,
    modalStack: [],
    selectedItem: null
  });

  return (
    <div style={{ paddingBottom: 90 }}>
      <GameScreen rooms={rooms} state={state} setState={setState} />
      <Modal modalStack={state.modalStack} state={state} setState={setState} />
      <Inventory
        inventory={state.inventory}
        selectedItem={state.selectedItem}
        state={state}
        setState={setState}
      />
    </div>
  );
}