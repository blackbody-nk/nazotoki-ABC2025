export function checkRequires(requires, state) {
  if (!requires || requires.length === 0) return true;

  return requires.every((r) => {
    switch (r.type) {
      case "hasItem":
        return state.inventory.includes(r.item);
      case "notHasItem":
        return !state.inventory.includes(r.item);
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
          inventory: prev.inventory.filter((x) => x !== a.item)
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
            setState((prev) => ({
            ...prev,
            modalStack: [...(prev.modalStack || []), a.modal],
            message: ""
        }));
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
