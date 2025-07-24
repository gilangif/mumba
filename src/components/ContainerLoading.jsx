export default function ContainerLoading({ note }) {
  return (
    <div
      className="d-flex flex-column justify-content-center gap-5 align-items-center"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 1,
      }}
    >
      <div className="spinner-border" role="status" style={{ width: "3rem", height: "3rem" }}>
        <span className="visually-hidden">Loading...</span>
      </div>
      <div className="text-center" style={{ overflowWrap: "break-word", width: "70%" }}>
        <p className="fw-bold">{note}</p>
      </div>
    </div>
  )
}
