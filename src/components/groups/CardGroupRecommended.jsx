import { dispatchDataTemp } from "../../store/store"

import { useDispatch, useSelector } from "react-redux"
import { useEffect, useState, useRef } from "react"
import { toast } from "react-toastify"
import { Modal } from "bootstrap"

import clipboard from "../../utils/clipboard"

import axios from "axios"
import Swal from "sweetalert2"

const style = {
  cardTitle: { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  userSelect: {
    userSelect: "none",
    cursor: "pointer",
    WebkitUserSelect: "none",
    msUserSelect: "none",
    WebkitTouchCallout: "none",
    touchAction: "manipulation",
  },
  listThumbContainer: {
    width: "80px",
    height: "80px",
  },
  listsMoreContainer: {
    position: "absolute",
    width: "80vw",
    height: "80vh",
    top: 0,
    right: 40,
    zIndex: 10,
  },
  listsMoreDetailContainer: {
    flex: 1,
    overflowWrap: "break-word",
    wordBreak: "break-word",
  },
  listsSheetBackdrop: { backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1040 },
  listsSheetButton: { borderRadius: "0.9rem", fontSize: "0.8rem", padding: "6px" },
}

function GroupCardSheetButton({ icon, title, onClick }) {
  const theme = useSelector((state) => state.theme)
  const { mode, background, color } = theme

  return (
    <div className="d-flex p-1" style={style.userSelect} onClick={onClick}>
      <button className={`btn btn-sm col d-flex p-2 gap-2 ${background} ${color}`}>
        <div className="d-flex justify-content-center align-items-center" style={{ width: "50px" }}>
          <span className="material-symbols-outlined" style={{ scale: "1.2", aspectRatio: "1/1" }}>
            {icon || "settings_night_sight"}
          </span>
        </div>
        <div className="d-flex align-items-center w-100">
          <p className="text-7 m-0">{title || "SETTING"}</p>
        </div>
      </button>
    </div>
  )
}

export default function CardGroupRecommended({ url, photo, title, username, member, dana, joined, description, mark, files, photos, videos, links, preview }) {
  const dispatch = useDispatch()

  const [loading, setLoading] = useState(false)
  const [sheet, setSheet] = useState(false)
  const [marker, setMarker] = useState(mark)

  const theme = useSelector((state) => state.theme)
  const { mode, background, color } = theme

  const arr = []

  if (files !== "???") arr.push(`${files} files`)
  if (photos !== "???") arr.push(`${photos} photos`)
  if (videos !== "???") arr.push(`${videos} videos`)
  if (links !== "???") arr.push(`${links} links`)
  if (preview) arr.push(`has preview group`)

  const HOST = useSelector((state) => state.user.HOST)
  const API = useSelector((state) => state.user.API)

  const showResult = (type) => {
    const modalElement = document.getElementById("modal-account")
    const modal = Modal.getOrCreateInstance(modalElement)

    if (type === "close") return modal.hide()

    modal.toggle()
  }

  const checkGroup = async (inviteCode) => {
    const toastId = toast.loading("Loading data...")

    try {
      setSheet(false)

      const group = { id: null, title: null, username: null, type: null, requestNeeded: false }

      const arr = ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine"].map(async (key) => {
        try {
          const { data: detail } = await axios.post(HOST + "/telegram/groups/detail", { key, inviteCode })
          const { id, className, title, username, requestNeeded, join, banned, channel, user, data } = detail

          const action = banned ? "banned" : join ? "leave" : "join"

          if (id && !group.id) group.id = id
          if (title && !group.title) group.title = title
          if (username && !group.username) group.username = username
          if (requestNeeded !== undefined && requestNeeded !== null) group.requestNeeded = requestNeeded

          if (!group.type) group.type = channel ? "channel" : "group"

          return { action, key, inviteCode }
        } catch (err) {
          return { action: `error`, key, inviteCode }
        }
      })

      const telegram = await Promise.all(arr)

      dispatch(dispatchDataTemp({ group, telegram }))
      showResult()

      toast.dismiss(toastId)
    } catch (error) {
      console.log(error)
      toast.dismiss(toastId)
    }
  }

  const actionHandler = async (username, type, mark) => {
    try {
      if (type === "delete") {
        const confirm = await Swal.fire({
          title: `ARE YOU SURE WANT DELETE ${title} ?`,
          text: "You won't be able to revert this",
          icon: "warning",
          showCancelButton: true,
          draggable: true,
          confirmButtonColor: "#d33",
          cancelButtonColor: "#212529",
          confirmButtonText: "DELETE",
          cancelButtonText: "CANCEL",
          width: "300px",
          didOpen: () => {
            const titleEl = Swal.getTitle()
            const contentEl = Swal.getHtmlContainer()
            const confirmBtn = Swal.getConfirmButton()
            const cancelBtn = Swal.getCancelButton()

            if (titleEl) titleEl.style.fontSize = "1rem"
            if (contentEl) contentEl.style.fontSize = "0.9rem"

            if (confirmBtn) {
              confirmBtn.style.fontSize = "0.85rem"
              confirmBtn.style.borderRadius = "0.5rem"
              confirmBtn.style.padding = "6px 12px"
            }
            if (cancelBtn) {
              cancelBtn.style.fontSize = "0.85rem"
              cancelBtn.style.borderRadius = "0.5rem"
              cancelBtn.style.padding = "6px 12px"
            }
          },
        })

        if (!confirm.isConfirmed) return
      }

      setLoading(true)

      const el = document.getElementById(`card-${username}`)
      const { data } = await axios.post(API + "/telegram/groups/edit", { username, mark, type })

      if (type === "mark") setMarker(mark)
      if (type === "delete" && el) el.remove()

      setSheet(false)
    } catch (err) {
      const message = err.response && err.response.data.message ? err.response.data.message : "Internal Server Error"

      toast.error(message, {
        position: "top-right",
        autoClose: 1500,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "colored",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="d-flex flex-column gap-2 p-0">
        <div className="card border-0 shadow" id={`card-${username}`} style={{ userSelect: "none", pointer: "cursor" }}>
          <div className="position-relative">
            <img
              src={photo}
              onDoubleClick={(e) => actionHandler(username, "mark", !marker)}
              onError={(e) => {
                e.target.onerror = null
                e.target.src = "https://cdn.britannica.com/58/129958-050-C0EF01A4/Adolf-Hitler-1933.jpg"
              }}
              className="card-img-top w-100"
              alt={title}
              style={{ display: "block", filter: marker ? "grayscale(100%)" : "", userSelect: "none", pointer: "cursor" }}
            />

            {loading && (
              <div className="d-flex flex-wrap justify-content-center align-items-center gap-1 position-absolute top-0 w-100 h-100" style={{ background: "rgba(0, 0, 0, 0.62)" }}>
                <div className="spinner-border text-warning" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            )}

            {marker ? (
              <div
                className="d-flex flex-wrap flex-column justify-content-center align-items-center gap-1 position-absolute top-0 w-100 h-100"
                style={{ background: "rgba(0, 0, 0, 0.65)", userSelect: "none", pointer: "cursor" }}
                onDoubleClick={(e) => actionHandler(username, "mark", !marker)}
              >
                <div className="text-warning">
                  <span className="fw-bold">marked</span>
                  <span className="material-symbols-outlined">check</span>
                </div>
                <span className="text-light text-7">(double tap to unmark)</span>
              </div>
            ) : (
              ""
            )}

            <div className="d-flex flex-wrap gap-1 position-absolute bottom-0 start-0 p-2" style={{ opacity: 0.8 }}>
              {joined.map((x, i) => {
                return (
                  <div key={i} className="text-dark fw-bold bg-warning px-2 py-1 text-7" style={{ borderRadius: "0.6rem" }}>
                    {x}
                  </div>
                )
              })}

              {dana.length > 0 && (
                <div className="text-white fw-bold bg-primary px-2 py-1 text-7" style={{ borderRadius: "0.6rem" }}>
                  contain dana
                </div>
              )}
            </div>
          </div>
          <div className="card-body p-3" onDoubleClick={() => (window.location.href = url)}>
            <a href={url} className="text-decoration-none text-dark">
              <h6 className="card-title m-0 text-9" style={style.cardTitle}>
                {title}
              </h6>
            </a>
            <a href={url} className="text-decoration-none text-dark">
              <p className="card-text small m-0 mb-2 text-muted text-8">{username}</p>
            </a>
            <p className="card-text small m-0 mb-2 text-8 text-success fw-bold">{member} subscribers</p>
            <p className="card-text small m-0 text-muted text-7" style={{ textAlign: "justify" }}>
              {description}
            </p>

            {arr.length > 0 ? (
              <ul className="list-group mt-3">
                {arr.map((x, i) => {
                  if (x === "has preview group")
                    return (
                      <a href={preview} key={i} className="text-decoration-none">
                        <li className="list-group-item text-7 text-center text-primary">{x}</li>
                      </a>
                    )

                  return (
                    <li key={i} className={`list-group-item text-7 text-center ${x.includes("links") && parseInt(x.split(" ") || 0) < 50 ? "text-danger fw-bold" : ""}`}>
                      {x}
                    </li>
                  )
                })}
              </ul>
            ) : (
              ""
            )}
          </div>
        </div>
        <button className="btn btn-success btn-sm w-100" onClick={() => setSheet(!sheet)}>
          ACTION
        </button>
      </div>

      {sheet && (
        <>
          <div className="position-fixed top-0 start-0 w-100 h-100" style={style.listsSheetBackdrop} onClick={() => setSheet(false)}></div>

          <div className="d-flex flex-column position-fixed bottom-0 start-0 end-0 rounded-top shadow-lg animate-slide-up py-2" style={{ ...style.userSelect, zIndex: 1050 }}>
            <div className={`container p-0 ${background} ${color}`} style={{ width: "95vw", borderRadius: "0.9rem" }}>
              <div className="d-flex justify-content-center py-1" style={style.userSelect}>
                <span className="material-symbols-outlined">more_horiz</span>
              </div>

              <div className="d-flex flex-row px-3 pt-1 pb-3">
                <div className="d-flex justify-content-center align-items-center" style={{ width: "100px" }}>
                  <img
                    src={photo}
                    alt={photo}
                    className="img-square"
                    onError={(e) => {
                      e.target.onerror = null
                      e.target.src = "https://cdn.britannica.com/58/129958-050-C0EF01A4/Adolf-Hitler-1933.jpg"
                    }}
                  />
                </div>
                <div className="px-3" style={style.listsMoreDetailContainer}>
                  <h6 className="text-uppercase m-0">{title}</h6>
                  <p className="text-7 m-0">{username}</p>
                  <p className="text-6 mt-0">{member}</p>
                  <p className="text-6 m-0">{description}</p>
                </div>
              </div>

              <div className="container p-0">
                <div className="row g-2 pb-3">
                  <GroupCardSheetButton icon="open_in_new" title="OPEN" onClick={() => (window.location.href = url)} />
                  <GroupCardSheetButton icon="account_circle" title="CHECK WITH TELEGRAM" onClick={() => checkGroup(username)} />
                  <GroupCardSheetButton icon="content_copy" title="COPY INVITE LINK" onClick={() => clipboard(url)} />
                  <GroupCardSheetButton icon={marker ? "bookmark_check" : "bookmark"} title={marker ? "UNMARK" : "MARK"} onClick={(e) => actionHandler(username, "mark", !marker)} />
                  <GroupCardSheetButton icon="delete" title="REMOVE" onClick={(e) => actionHandler(username, "delete")} />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
