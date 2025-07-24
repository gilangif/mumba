export default function ChatBubbleSender({ chat, time }) {
  return (
    <div className="d-flex justify-content-end my-2 px-3 w-100">
      <div
        style={{
          position: "absolute",
          right: "16px",
          bottom: "16px",
          width: "11px",
          height: "30px",
          backgroundColor: "#0d6efd",
          borderBottomLeftRadius: "15px",
          transform: "rotate(-45deg)",
          zIndex: 22,
        }}
      ></div>

      <div
        className="position-relative d-flex flex-row justify-content-end align-items-center bg-primary text-light py-1 pb-2 px-3"
        style={{
          maxWidth: "90%",
          borderRadius: "0.6rem",
          borderBottomRightRadius: 0,
          zIndex: 522,
        }}
      >
        <p className="text-8 m-0 mt-1 mb-1">{chat}</p>
      </div>
    </div>
  )
}
