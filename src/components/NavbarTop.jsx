import { useSelector, useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { Modal } from "bootstrap"

import { toast } from "react-toastify"

import { dispatchLogout, dispatchDataUsersAdd, dispatchOnlineMode, dispatchTotalOnline, dispatchOnline, dispatchTheme } from "../store/store"

import socket from "../utils/socket.io"

import Swal from "sweetalert2"
import axios from "axios"

const style = {
  navbarContainer: {
    userSelect: "none",
    cursor: "pointer",
  },
  iconContainer: {
    width: "35px",
    height: "35px",
    aspectRatio: "1/1",
  },
  iconProfile: {
    width: "100%",
    borderRadius: "100%",
    aspectRatio: "1/1",
    objectFit: "cover",
    objectPosition: "cover",
  },
}

export default function NavbarTop() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const avatar = useSelector((state) => state.user.avatar)
  const online = useSelector((state) => state.user.online)
  const totalOnline = useSelector((state) => state.user.totalOnline)

  const HOST = useSelector((state) => state.user.HOST)
  const name = useSelector((state) => state.user.name)
  const username = useSelector((state) => state.user.username)
  const role = useSelector((state) => state.user.role)

  const theme = useSelector((state) => state.theme)
  const { mode, background, color } = theme

  const [text, setText] = useState(localStorage.getItem("text") || "")

  const toggleTheme = () => {
    const theme = {
      mode: mode === "dark" ? "light" : "dark",
      background: mode === "dark" ? "bg-light" : "bg-dark",
      color: mode === "dark" ? "text-dark" : "text-light",
    }

    dispatch(dispatchTheme(theme))

    localStorage.setItem("mode", theme.mode)
    localStorage.setItem("background", theme.background)
    localStorage.setItem("color", theme.color)
  }

  const handleLogout = async () => {
    const confirm = await Swal.fire({
      title: `HEY ${username} ARE YOU SURE WANT LOGOUT ?`,
      text: "You won't be able to revert this",
      icon: "warning",
      showCancelButton: true,
      draggable: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#212529",
      confirmButtonText: "LOGOUT",
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

    localStorage.clear()
    dispatch(dispatchLogout())
    navigate("/login")
  }

  const disconnectSocket = async () => {
    if (!online) {
      return toast.warning("socket connection already disconnect", {
        position: "top-right",
        autoClose: 1500,
        hideProgressBar: true,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      })
    }

    const confirm = await Swal.fire({
      title: `ARE YOU SURE WANT DISCONNECT FROM SOCKET ${socket?.device?.community?.toUpperCase()} MODE ?`,
      text: "You won't be able to revert this",
      icon: "warning",
      showCancelButton: true,
      draggable: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#212529",
      confirmButtonText: "DISCONNECT",
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

    socket.disconnect()

    dispatch(dispatchOnlineMode(""))
    dispatch(dispatchTotalOnline(0))
    dispatch(dispatchOnline(false))
  }

  const showForm = (type) => {
    const modalElement = document.getElementById("modal-session")
    const modal = Modal.getOrCreateInstance(modalElement)

    if (type === "close") return modal.hide()

    modal.toggle()
  }

  const handlerUpdateSession = async (e) => {
    try {
      e.preventDefault()

      const accessToken = localStorage.getItem("accessToken")
      const { data } = await axios.post(HOST + "/users/dana/add", { text }, { headers: { Authorization: `Bearer ${accessToken}` } })
      const { ALIPAYJSESSIONID, creator, result, message } = data

      dispatch(dispatchDataUsersAdd({ creator, ALIPAYJSESSIONID, dana: result, logs: [], start: new Date() }))

      localStorage.setItem("text", text)

      toast.success(message, {
        position: "top-right",
        autoClose: 1500,
        hideProgressBar: true,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      })

      showForm("close")
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
    const backspaceBtn = document.getElementById("backspace-session-btn")
    const addBtn = document.getElementById("add-session-btn")

    const label = document.getElementById("textarea-session-label")

    const match = text.match(/GZ00(.*?)GZ00/)
    label.innerHTML = match ? `<span class="text-success">${match[0]}</span>` : `<span class="text-danger">alipay not found</span>`

    if (!text) {
      backspaceBtn.classList.add("disabled")
      addBtn.classList.add("disabled")

      label.innerHTML = "input alipay"
    } else {
      backspaceBtn.classList.remove("disabled")
      addBtn.classList.remove("disabled")
    }

    match ? addBtn.classList.remove("disabled") : addBtn.classList.add("disabled")
  }, [text])

  return (
    <div>
      <div className="modal px-3" id="modal-session">
        <div className="modal-dialog  modal-dialog-centered">
          <div className={`modal-content ${background} ${color}`}>
            <div className="modal-header border-0 pb-2">
              <h6 className="modal-title">Update or add session</h6>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <form onSubmit={(event) => handlerUpdateSession(event)}>
              <div className="modal-body p-2">
                <div className="form-floating">
                  <textarea
                    className={`form-control ${background} ${color}`}
                    value={text}
                    style={{ height: "20vh", fontSize: "0.8rem", fontFamily: "Fira Code" }}
                    id="textarea-session"
                    onChange={(e) => setText(e.target.value)}
                  ></textarea>
                  <label id="textarea-session-label" className={color}>
                    alipay
                  </label>
                </div>
              </div>
              <div className="d-flex justify-content-end pb-3 px-3 gap-3">
                <button type="button" className={`d-flex justify-content-center align-items-center btn border-0 ${background} ${color}`} id="backspace-session-btn" onClick={() => setText("")}>
                  <span className="material-symbols-outlined w-100" style={{ scale: "1.6" }}>
                    backspace
                  </span>
                </button>
                <button type="submit" className={`d-flex justify-content-center align-items-center btn border-0 ${background} ${color}`} id="add-session-btn">
                  <span className="material-symbols-outlined w-100" style={{ scale: "1.6" }}>
                    add_circle
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <nav className={`navbar  ${mode == "dark" ? background : "bg-white"} ${color}`} style={style.navbarContainer}>
        <div className="row w-100">
          <div className="col px-4 py-1 d-flex flex-column justify-content-center align-items-start">
            <h5 className="m-0">Hi {name}</h5>
            <p className="m-0 text-sm">{role}</p>
          </div>

          <div className="col py-1 px-2 gap-3 gap-lg-4 d-flex justify-content-end align-items-center">
            <div className="d-flex justify-content-center align-items-center" style={style.iconContainer} onClick={() => showForm()}>
              <span className="material-symbols-outlined fs-2 fs-lg-4">edit</span>
            </div>

            <div className="d-flex justify-content-center align-items-center" style={style.iconContainer} onClick={() => toggleTheme()}>
              <span className={`material-symbols-outlined fs-2 fs-lg-4 ${mode === "dark" ? "text-warning" : "text-primary"}`}>{mode === "dark" ? "light_mode" : "dark_mode"}</span>
            </div>

            <div
              className={`d-flex justify-content-center align-items-center ${
                online && socket.device ? (socket.device.community === "web live" ? "text-danger" : socket.device.community === "web" ? "text-success" : "") : ""
              }`}
              style={style.iconContainer}
              onClick={() => disconnectSocket()}
            >
              <span className="material-symbols-outlined fs-2 fs-lg-4">devices</span>
              <small className="position-relative" style={{ top: 0, right: 0 }}>
                {totalOnline}
              </small>
            </div>

            <div className="d-flex justify-content-center align-items-center" style={style.iconContainer} onClick={() => handleLogout()}>
              <img
                src={avatar || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS884yE-aP3PQdStnZ7KZecX04EDdYa2YpRgQ&s"}
                alt={avatar || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS884yE-aP3PQdStnZ7KZecX04EDdYa2YpRgQ&s"}
                style={style.iconProfile}
              />
            </div>
          </div>
        </div>
      </nav>
    </div>
  )
}
