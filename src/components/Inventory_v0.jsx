export default function Inventory({ inventory }) {
  return (
    <div style={{ padding: 8, borderTop: "1px solid #ddd" }}>
      <strong>Items:</strong>{" "}
      {inventory.length === 0 ? (
        <span>(none)</span>
      ) : (
        inventory.map((item) => (
          <span key={item} style={{ marginLeft: 10 }}>
            {item}
          </span>
        ))
      )}
    </div>
  );
}
