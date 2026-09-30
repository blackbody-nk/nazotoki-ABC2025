export function checkRequires(requires, state) {
  if (!requires || requires.length === 0) return true;

  return requires.every((r) => {
    switch (r.type) {
      case "hasItem":
        return state.inventory.includes(r.item);
      case "notHasItem":
        return !state.inventory.includes(r.item);
      case "selectedItem":
        return state.selectedItem === r.item;   // ★追加
      case "flag":
        return Boolean(state.flags[r.flag]) === Boolean(r.value);
      default:
        return true;
    }
  });
}

export function applyActions(actions, setState) {
  for (const a of actions || []) {
    switch (a.type) {
      case "message":
        setState((prev) => ({ ...prev, message: a.text }));
        break;

      case "addItem":
        setState((prev) => {
          if (prev.inventory.includes(a.item)) return prev;
          return { ...prev, inventory: [...prev.inventory, a.item] };
        });
        break;

      case "removeItem":
        setState((prev) => ({
          ...prev,
          inventory: prev.inventory.filter((x) => x !== a.item),
          selectedItem: prev.selectedItem === a.item ? null : prev.selectedItem
        }));
        break;

      case "clearSelectedItem":
        setState((prev) => ({
          ...prev,
          selectedItem: null
        }));
        break;

      case "setFlag":
        setState((prev) => ({
          ...prev,
          flags: { ...prev.flags, [a.flag]: a.value }
        }));
        break;

      case "goto":
        setState((prev) => ({
          ...prev,
          location: { room: a.room, view: a.view },
          message: ""
        }));
        break;

      case "openModal":
        setState((prev) => {
          const stack = prev.modalStack || [];
          const nextModal = 
            typeof a.modal === "function" ? a.modal(prev) : a.modal;

          if (a.replace) {
            if (stack.length === 0) {
              return { ...prev, modalStack: [nextModal], message: "" };
            }
            return {
              ...prev,
              modalStack: [...stack.slice(0, -1), nextModal],
              message: ""
            };
          }

          return {
            ...prev,
            modalStack: [...stack, nextModal],
            message: ""
          };
        });
        break;

      case "closeModal":
        setState((prev) => ({
          ...prev,
          modalStack: (prev.modalStack || []).slice(0, -1)
        }));
        break;

      default:
        break;
    }
  }
}
