import { useNavigate, useLocation, Link } from "react-router-dom"
import { useEffect, useState, useRef } from "react"
import { useSelector } from "react-redux"
import { toast } from "react-toastify"

import axios from "axios"
import Swal from "sweetalert2"

function CardRecommended({ url, photo, title, username, member, dana, joined, description, mark, files, photos, videos, links, preview }) {
  const [loading, setLoading] = useState(false)
  const [marker, setMarker] = useState(mark)

  const arr = []

  if (files !== "???") arr.push(`${files} files`)
  if (photos !== "???") arr.push(`${photos} photos`)
  if (videos !== "???") arr.push(`${videos} videos`)
  if (links !== "???") arr.push(`${links} links`)
  if (preview) arr.push(`has preview group`)

  const API = useSelector((state) => state.user.API)

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
      <div className="card-body px-2 py-3" onDoubleClick={() => actionHandler(username, "delete")} style={{ userSelect: "none", pointer: "cursor" }}>
        <a href={url} className="text-decoration-none text-dark">
          <h6 className="card-title m-0 text-9" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {title}
          </h6>
        </a>
        <a href={url} className="text-decoration-none text-dark">
          <p className="card-text small m-0 mb-2 text-muted text-8">{username}</p>
        </a>
        <p className="card-text small m-0 mb-2 text-7">{member} subscribers</p>
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
                <li key={i} className="list-group-item text-7 text-center">
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
  )
}

export default function Group() {
  const location = useLocation()
  const navigation = useNavigate()

  const theme = useSelector((state) => state.theme)
  const { mode, background, color } = theme

  const API = useSelector((state) => state.user.API)

  const [prev, setPrev] = useState(null)
  const [curr, setCurr] = useState(0)
  const [next, setNext] = useState(null)
  const [form, setForm] = useState([])
  const [groups, setGroups] = useState([])
  const [pagination, setPagination] = useState([])
  const [recomendation, setRecomendation] = useState({})

  const [loading, setLoading] = useState(true)

  const query = new URLSearchParams(location.search)

  const search = query.get("search") || ""
  const limit = query.get("limit") || 20
  const page = query.get("page") || 0

  const rebuild = async () => {
    try {
      Swal.fire({
        title: "Please wait...",
        html: "generate chat dialogs from teleggram..",
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading()

          const titleEl = Swal.getTitle()
          const contentEl = Swal.getHtmlContainer()

          if (titleEl) titleEl.style.fontSize = "1.2rem"
          if (contentEl) contentEl.style.fontSize = "0.9rem"
        },
      })

      const { data } = await axios.post(API + "/telegram/groups/build")

      Swal.fire({
        icon: "success",
        title: "Done",
        text: "Data fetched successfully",
        timer: 1500,
        showConfirmButton: false,
        didOpen: () => {
          const titleEl = Swal.getTitle()
          const contentEl = Swal.getHtmlContainer()

          if (titleEl) titleEl.style.fontSize = "1.2rem"
          if (contentEl) contentEl.style.fontSize = "0.9rem"
        },
      })
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Something went wrong",
        didOpen: () => {
          const titleEl = Swal.getTitle()
          const contentEl = Swal.getHtmlContainer()

          if (titleEl) titleEl.style.fontSize = "1.2rem"
          if (contentEl) contentEl.style.fontSize = "0.9rem"
        },
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const getRecommendation = async () => {
      try {
        setLoading(true)

        const query = new URLSearchParams(location.search)

        const search = query.get("search") || ""
        const limit = query.get("limit") || 20
        const page = query.get("page") || 0

        const { data: recomendation } = await axios.post(API + `/telegram/groups/recommendation?page=${page}&limit=${limit}&search=${search}`)

        setRecomendation(recomendation)
        setPrev(recomendation.prev)
        setCurr(recomendation.curr)
        setNext(recomendation.next)
        setGroups(recomendation.data)
        setPagination(recomendation.pagination)
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

    getRecommendation()
  }, [location.search])

  return (
    <>
      {loading && (
        <div className="d-flex flex-row justify-content-center align-items-center h-100 w-100 p-3">
          <div className="spinner-grow text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <div className="spinner-grow text-secondary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <div className="spinner-grow text-success" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      {!loading && (
        <div className="container py-4 pt-2">
          <div className="alert alert-success" role="alert">
            <h6 className="alert-heading">Success generate {groups.length} group data...</h6>
            <p className="text-8">
              total {recomendation.contents} group data from {recomendation.pages} page, {recomendation.mark} marked, {recomendation.unmark} unmarked.
            </p>
            <p className="text-8">
              you can rebuild group mark data from telegram chat dialogs by click{" "}
              <a onClick={() => rebuild()} className="fw-bold text-decoration-none text-dark" style={{ cursor: "pointer" }}>
                here
              </a>
            </p>
            <hr />
            <p className="mb-0 text-8">
              <span className="fw-bold">Tips:</span> double-tap on an image to mark, and double-tap on the card body to remove it.
            </p>
          </div>
          <div style={{ columnCount: groups.length > 1 ? 2 : 1, columnGap: "1rem", paddingBottom: "100px" }}>
            {groups.map((x, index) => (
              <div key={index} className="mb-3" style={{ breakInside: "avoid" }}>
                <CardRecommended {...x} />
              </div>
            ))}
          </div>

          <nav aria-label="Page navigation" className="d-flex flex-row justify-content-center align-items-center" style={{ columnCount: 2, columnGap: "1rem", paddingBottom: "80px" }}>
            <ul className="pagination w-100 justify-content-center" style={{ marginBottom: "80px" }}>
              {prev ? (
                <li className="page-item">
                  <Link to={`/groups?search=${search}&limit=${limit}&page=${prev}`} className="page-link">
                    PREV
                  </Link>
                </li>
              ) : (
                ""
              )}
              {pagination.map((x, i) => (
                <li className={`page-item ${curr == x ? "active" : ""}`} key={i}>
                  <Link to={`/groups?search=${search}&limit=${limit}&page=${x}`} className="page-link">
                    {x}
                  </Link>
                </li>
              ))}
              {next ? (
                <li className="page-item">
                  <Link to={`/groups?search=${search}&limit=${limit}&page=${next}`} className="page-link">
                    NEXT
                  </Link>
                </li>
              ) : (
                ""
              )}
            </ul>
          </nav>
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault()
          console.log(form)
          navigation(`/groups?search=${form}&limit=${limit}`)
          setForm("")
        }}
      >
        <div className={`d-flex position-fixed align-items-center w-100 py-2 px-3 gap-3 ${background} ${color}`} style={{ height: "55px", bottom: "60px", zIndex: "1000" }}>
          <div className="m-0 border-0 w-100 h-100">
            <input
              type="text"
              className="form-control"
              id="inputPassword2"
              value={form}
              onChange={(event) => setForm(event.target.value)}
              placeholder="search channel or group.."
              style={{ width: "100%", height: "100%", borderRadius: "0.6rem" }}
            />
          </div>
          <div className="m-0">
            <button type="submit" className="d-flex justify-content-center align-items-center btn btn-success m-0 rounded-circle" style={{ width: "45px", aspectRatio: "1/1" }}>
              <span className="material-symbols-outlined">search</span>
            </button>
          </div>
        </div>
      </form>
    </>
  )
}
