import { useState } from "react";
import { rooms } from "./game/rooms";
import GameScreen from "./components/GameScreen";
import Modal from "./components/Modal";
import Inventory from "./components/Inventory";

export default function App() {
  const [state, setState] = useState({
    location: { room: "room1", view: "north" },
    inventory: [],
    flags: {},
    message: "",
    debugHotspots: false,
    modalStack: [],
    selectedItem: null // ★追加
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
