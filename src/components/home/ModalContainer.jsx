import { useSelector } from "react-redux"

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"

const style = {
  imageSquare: { width: "40px", borderRadius: "100%", aspectRatio: "1/1", objectFit: "cover", objectPosition: "center" },
}

const ModalResult = () => {
  const theme = useSelector((state) => state.theme)
  const { mode, background, color } = theme

  const temp = useSelector((state) => state.data.temp)
  const { ALIPAYJSESSIONID, image, model, nickname, data } = temp

  const handlerDownloadResult = async () => {
    const filename = `${ALIPAYJSESSIONID || "result"}.json`
    const content = typeof data === "object" ? JSON.stringify(data, null, 2) : data
    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    URL.revokeObjectURL(url)
  }

  return (
    <div className="modal px-3" id="modal-result">
      <div className="modal-dialog  modal-dialog-centered">
        <div className={`modal-content ${background} ${color}`}>
          <div className="modal-body p-2">
            <div className="form-floating w-100">
              <SyntaxHighlighter
                language="json"
                style={vscDarkPlus}
                className="hide-scroll"
                customStyle={{
                  maxHeight: "50vh",
                  borderRadius: "10px",
                  padding: "1rem",
                  fontSize: "12px",
                  overflowY: "auto",
                }}
              >
                {typeof data === "object" ? JSON.stringify(data, null, 2) : data}
              </SyntaxHighlighter>
              <label id="textarea-result-label">results</label>
            </div>
          </div>
          <div className="d-flex py-1 px-1 justify-content-between">
            <div className="d-flex gap-1 align-items-center">
              <button type="submit" className="d-flex justify-content-center align-items-center btn border-0" id="download-result-btn">
                <img src={image} alt={image} style={style.imageSquare} />
              </button>
              <div>
                <h6 className="m-0">{model || nickname}</h6>
              </div>
            </div>
            <button type="submit" className="d-flex justify-content-center align-items-center btn border-0" id="download-result-btn" onClick={() => handlerDownloadResult()}>
              <span className={`material-symbols-outlined w-100 p-2 p-lg-3 ${color}`} style={{ scale: "1.6" }}>
                download_for_offline
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ModalResult
