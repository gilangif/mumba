import { dispatchLogout, dispatchDataUsersRemove, dispatchDataTemp } from "../../store/store"

import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import { Modal } from "bootstrap"

import clipboard from "../../utils/clipboard"

import Swal from "sweetalert2"
import axios from "axios"

const style = {
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

function UserCardSheetButton({ icon, title, onClick }) {
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

export default function CardUser({ image, model, nickname, community, creator, alipay, balance, start, data }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [sheet, setSheet] = useState(false)
  const [duration, setDuration] = useState("00:00:00")

  const username = useSelector((state) => state.user.username)

  const theme = useSelector((state) => state.theme)
  const { mode, background, color } = theme

  const avatar = useSelector((state) => state.user.avatar)
  const HOST = useSelector((state) => state.user.HOST)

  const img = avatar || "https://storage.googleapis.com/storage-ajaib-prd-coin-wp-artifact/2023/06/pepe-coin.webp"

  const viewData = () => {
    dispatch(dispatchDataTemp({ ALIPAYJSESSIONID: alipay, image: image || img, nickname, data }))
    setSheet(false)
    showResult()
  }

  const showResult = (type) => {
    const modalElement = document.getElementById("modal-result")
    const modal = Modal.getOrCreateInstance(modalElement)

    if (type === "close") return modal.hide()

    modal.toggle()
  }

  const checkSession = async (ALIPAYJSESSIONID) => {
    try {
      const accessToken = localStorage.getItem("accessToken")
      const { data } = await axios.post(HOST + "/users/dana/checker", { ALIPAYJSESSIONID }, { headers: { Authorization: `Bearer ${accessToken}` } })

      dispatch(dispatchDataTemp({ ALIPAYJSESSIONID: alipay, image: image || img, nickname, data }))
      setSheet(false)
      showResult()
    } catch (err) {
      const status = err.status && typeof err.status === "number" ? err.status : err.response && err.response.status ? err.response.status : 500
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
        onClose: () => {
          if (status === 401) {
            localStorage.clear()
            dispatch(dispatchLogout())
            navigate("/login", { replace: true })
          }
        },
      })
    }
  }

  const removeUser = async (model) => {
    try {
      const confirm = await Swal.fire({
        title: `REMOVE ${model} ?`,
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

      const accessToken = localStorage.getItem("accessToken")
      const { data } = await axios.post(HOST + "/users/dana/remove", { model }, { headers: { Authorization: `Bearer ${accessToken}` } })
      console.log("📢[:167]: ", data)
      const { message } = data

      dispatch(dispatchDataUsersRemove(model))
      setSheet(false)

      toast.success(message, {
        position: "top-right",
        autoClose: 1500,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "colored",
      })
    } catch (err) {
      console.log("📢[:184]: ", err)
      const status = err.status && typeof err.status === "number" ? err.status : err.response && err.response.status ? err.response.status : 500
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
        onClose: () => {
          if (status === 401) {
            localStorage.clear()
            dispatch(dispatchLogout())
            navigate("/login", { replace: true })
          }
        },
      })
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      const c = new Date() - new Date(start)
      const h = Math.floor(c / (1000 * 60 * 60))
      const m = Math.floor((c % (1000 * 60 * 60)) / (1000 * 60))
      const s = Math.floor((c % (1000 * 60)) / 1000)
      setDuration(`${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`)
    }, 1000)

    return () => clearInterval(interval)
  }, [start])

  return (
    <>
      <div className="w-100 d-flex align-items-center justify-content-between px-2 py-2" style={style.userSelect}>
        <div className="d-flex gap-3">
          <div className="d-flex justify-content-center align-items-center p-1" style={style.listThumbContainer}>
            <img
              src={image || img}
              alt={image || img}
              className="img-square"
              onError={(e) => {
                e.target.onerror = null
                e.target.src = "https://storage.googleapis.com/storage-ajaib-prd-coin-wp-artifact/2023/06/pepe-coin.webp"
              }}
              style={{ filter: username !== creator ? "grayscale(100%)" : "" }}
            />
          </div>
          <div className="d-flex flex-column justify-content-center gap-1">
            <p className="fw-bold text-truncate m-0" style={{ maxWidth: "260px" }}>
              {nickname}
            </p>
            <p className="text-7 text-truncate m-0" style={{ maxWidth: "260px" }}>
              {community} {creator}
            </p>
            <p className={`fw-bold text-6 m-0 ${balance === "Unauthorized" || balance === "invalid" ? "text-danger" : ""}`}>Rp.{balance}</p>
          </div>
        </div>

        <div className="d-flex justify-content-center align-items-center px-2 h-100">
          <span className="material-symbols-outlined" onClick={() => setSheet(!sheet)}>
            more_vert
          </span>
        </div>
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
                  <img src={image || img} alt={image || img} className="img-square" />
                </div>
                <div className="px-3" style={style.listsMoreDetailContainer}>
                  <h6 className="text-uppercase m-0">{nickname}</h6>
                  <p className="text-7 m-0">
                    {community} {creator}
                  </p>
                  <p className="text-6 mt-0">{alipay}</p>
                  <p className="text-6 m-0">Rp.{balance}</p>
                </div>
              </div>

              <div className="container p-0">
                <div className="row g-2 pb-3">
                  <UserCardSheetButton icon="timer" title={duration} />
                  <UserCardSheetButton icon="content_copy" title="COPY SESSION" onClick={() => clipboard(alipay)} />
                  <UserCardSheetButton icon="download" title="VIEW EXISTS DATA" onClick={() => viewData()} />
                  <UserCardSheetButton icon="delete" title="REMOVE" onClick={() => removeUser(model)} />
                  <UserCardSheetButton icon="science" title="CHECK" onClick={() => checkSession(alipay)} />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
