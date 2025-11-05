export const Relations = ({ title, getLabel, relations }) => {
  if (relations.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        marginBottom: 8,
      }}
    >
      <div style={{ fontSize: "0.8em", fontWeight: "bold", marginBottom: 4 }}>
        {title}
      </div>
      {relations.map((e) => (
        <div key={e.id}>
          <div style={{ fontSize: "0.7em", color: e.style.stroke }}>
            {getLabel(e)} - {e.data.label}
          </div>
          <div style={{ fontSize: "0.6em" }}>{e.data.note}</div>
        </div>
      ))}
    </div>
  );
};
