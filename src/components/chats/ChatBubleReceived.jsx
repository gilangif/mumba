import { useSelector } from "react-redux"

function parseMessage(text) {
  const urlRegex = /(https?:\/\/[^\s]+)/g
  const parts = text.split(urlRegex)

  return parts.map((part, index) => {
    if (urlRegex.test(part)) {
      // Jika bagian adalah URL
      return (
        <a key={index} href={part} target="_blank" rel="noopener noreferrer" className="text-8 fw-bold text-danger" style={{ textDecoration: "none" }}>
          {part}
        </a>
      )
    } else {
      const safeHtml = part.replace(/\n/g, "<br />")
      return <span key={index} dangerouslySetInnerHTML={{ __html: safeHtml }} />
    }
  })
}

export default function ChatBubbleReceived({ sender, title, accountkey, chat, time, group }) {
  const theme = useSelector((state) => state.theme)
  const message = parseMessage(chat)

  const background =
    accountkey === "one"
      ? "bg-success"
      : accountkey === "two"
      ? "bg-warning"
      : accountkey === "three"
      ? "bg-info"
      : accountkey === "four"
      ? "bg-danger"
      : accountkey === "five"
      ? "bg-light"
      : accountkey === "six"
      ? "bg-success"
      : "bg-black"

  const color =
    accountkey === "one"
      ? "text-light"
      : accountkey === "two"
      ? "text-dark"
      : accountkey === "three"
      ? "text-light"
      : accountkey === "four"
      ? "text-dark"
      : accountkey === "five"
      ? "text-danger"
      : accountkey === "six"
      ? "text-light"
      : "text-light"

  const account = accountkey === "one" ? 1 : accountkey === "two" ? 2 : accountkey === "three" ? 3 : accountkey === "four" ? 4 : accountkey === "five" ? 5 : accountkey === "six" ? 6 : 7

  return (
    <div className="d-flex my-2 gap-3 px-3 w-100">
      <div className="d-flex align-items-end">
        <div className="d-flex align-items-center justify-content-center" style={{ width: "40px", height: "40px" }}>
          <div className={`d-flex align-items-center justify-content-center fw-bold img-fluid text-uppercase ${background} ${color} w-100 h-100`} style={{ borderRadius: "100%", fontSize: "1rem" }}>
            {account}
          </div>
        </div>
      </div>

      <div className="d-flex align-items-end w-100">
        <div
          className={`position-relative d-flex flex-column justify-content-center p-2 pb-3 ${theme.mode === "dark" ? "bg-light text-dark" : "bg-dark text-light"}`}
          style={{
            minWidth: "40%",
            maxWidth: "90%",
            borderRadius: "0.6rem",
            borderBottomLeftRadius: 0,
          }}
        >
          <div
            style={{
              position: "absolute",
              left: "-10px",
              bottom: "0px",
              width: 0,
              height: 0,
              borderTop: "10px solid transparent",
              borderBottom: "1px solid transparent",
              borderRight: "10px solid #f8f9fa",
              borderBottomLeftRadius: "18px",
            }}
          ></div>

          <p className="fw-bold m-0">{sender}</p>
          <p className="text-7 m-0">
            <a className={`text-7 m-0 text-decoration-none fw-bold ${theme.mode === "dark" ? "text-dark" : "text-light"}`} href={`https://t.me/${title}`}>
              {title}
            </a>
          </p>
          <p className="text-7 m-0 mt-1 mb-1" style={{ wordBreak: "break-word", overflowWrap: "break-word" }}>
            {message}
          </p>

          <small className="position-absolute text-muted" style={{ bottom: "4px", right: "8px", fontSize: "0.6rem" }}>
            {time}
          </small>
        </div>
      </div>
    </div>
  )
}
