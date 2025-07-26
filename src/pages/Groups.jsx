import { useNavigate, useLocation, Link } from "react-router-dom"
import { useEffect, useState, useRef } from "react"
import { useSelector } from "react-redux"
import { toast } from "react-toastify"

import CardGroupRecommended from "../components/groups/CardGroupRecommended"
import ModalGroupChecker from "../components/groups/ModalGroupChecker"

import axios from "axios"
import Swal from "sweetalert2"

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

      <ModalGroupChecker />

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

          <div className="column-wrapper">
            {groups.map((x, index) => (
              <div key={index} className="mb-3" style={{ breakInside: "avoid" }}>
                <CardGroupRecommended {...x} />
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
