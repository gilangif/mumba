import { useNavigate, useLocation, Link, useSearchParams } from "react-router-dom"
import { useEffect, useState, useRef } from "react"
import { useSelector } from "react-redux"
import { toast } from "react-toastify"

import CardGroupRecommended from "../components/groups/CardGroupRecommended"
import ModalGroupChecker from "../components/groups/ModalGroupChecker"

import axios from "axios"
import Swal from "sweetalert2"

function Pagination({ page, pages, onPageChange }) {
  const [searchParams, setSearchParams] = useSearchParams()

  const getPageNumbers = () => {
    const visiblePages = 3
    let start = Math.max(1, page - Math.floor(visiblePages / 2))
    let end = start + visiblePages - 1

    if (end > pages) {
      end = pages
      start = Math.max(1, end - visiblePages + 1)
    }

    const data = []

    for (let i = start; i <= end; i++) {
      data.push(i)
    }

    return data
  }

  return (
    <div className="d-flex justify-content-center align-items-center">
      <div className="d-flex dlex-row gap-2 py-3">
        <button onClick={() => onPageChange(page - 1)} disabled={page === 1} className={`px-3 py-1 border rounded ${page === 1 ? "d-none" : ""}`}>
          PREV
        </button>

        {page > 3 ? (
          <button onClick={() => onPageChange(1)} className={`px-3 py-1 border-0 rounded`}>
            1
          </button>
        ) : (
          ""
        )}

        {getPageNumbers().map((num) => (
          <button key={num} onClick={() => onPageChange(num)} className={`px-3 py-1 border-0 rounded ${num === page ? "text-danger fw-bold" : ""}`}>
            {num}
          </button>
        ))}

        {page >= 3 && page < pages - 3 ? (
          <button onClick={() => onPageChange(pages)} className={`px-3 py-1 border-0 rounded`}>
            {pages}
          </button>
        ) : (
          ""
        )}

        <button onClick={() => onPageChange(page + 1)} disabled={page === pages || page <= 1} className={`px-3 py-1 border rounded ${page === pages || page <= 1 ? "d-none" : ""}`}>
          NEXT
        </button>
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

  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState("")
  const [form, setForm] = useState("")

  const [pages, setPages] = useState(1)
  // const [page, setPage] = useState(parseInt(searchParams.get("page") || "1", 10))
  const [recomendation, setRecomendation] = useState([])
  const [temp, setTemp] = useState({})

  const [loading, setLoading] = useState(true)

  const [selectedOrder, setSelectedOrder] = useState("")
  const [selectedSort, setSelectedSort] = useState("")
  const [selectedKey, setSelectedKey] = useState("")

  const page = parseInt(searchParams.get("page")) || 1

  const rebuild = async () => {
    try {
      Swal.fire({
        title: "Please wait...",
        html: "generate chat dialogs from telegram..",
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

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams)

    params.set("page", newPage)

    setSearchParams(params)
  }

  const getRecomendation = async () => {
    try {
      setLoading(true)

      const params = { page, search, key: selectedKey, order: selectedOrder, sort: selectedSort || "desc", limit: 50 }

      const { data: recomendation } = await axios.get(API + `/telegram/groups`, { params })
      const { data, page: curr, pages, total, mark, unmark } = recomendation

      setTemp(recomendation)
      setRecomendation(data)
      setPages(pages)
    } catch (err) {
      const message = err.response?.data?.message || "Internal Server Error"

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

  useEffect(() => {
    getRecomendation()
  }, [searchParams])

  useEffect(() => {
    const params = new URLSearchParams(searchParams)
    let shouldResetPage = false

    if (searchParams.get("search") !== search) shouldResetPage = true
    else if (searchParams.get("key") !== selectedKey) shouldResetPage = true
    else if (searchParams.get("sort") !== selectedSort) shouldResetPage = true
    else if (searchParams.get("order") !== selectedOrder) shouldResetPage = true

    if (shouldResetPage) {
      params.set("page", "1")
    }

    if (search) params.set("search", search)
    else params.delete("search")

    if (selectedKey) params.set("key", selectedKey)
    else params.delete("key")

    if (selectedSort) params.set("sort", selectedSort)
    else params.delete("sort")

    if (selectedOrder) params.set("order", selectedOrder)
    else params.delete("order")

    if (params.toString() !== searchParams.toString()) {
      setSearchParams(params)
    }

    getRecomendation()
  }, [search, selectedSort, selectedOrder, selectedKey])

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
        <div className="d-flex flex-column">
          <div className="container py-4 pt-2">
            <div className="alert alert-success" role="alert">
              <h6 className="alert-heading">Success generate {recomendation.length} group data...</h6>
              <p className="text-8">
                total {temp.total} group data from {temp.pages} page, {temp.mark} marked, {temp.unmark} unmarked.
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

            <div className="row my-3">
              <div className="col">
                <select className="form-control form-control" value={selectedOrder} onChange={(e) => setSelectedOrder(e.target.value)}>
                  <option value="">ORDER</option>
                  <option value="unmark">UNMARK</option>
                  <option value="mark">MARK</option>
                  <option value="joined">JOINED</option>
                </select>
              </div>
              <div className="col">
                <select className="form-control form-control" value={selectedSort} onChange={(e) => setSelectedSort(e.target.value)}>
                  <option value="">SORT</option>
                  <option value="asc">ASC</option>
                  <option value="desc">DESC</option>
                </select>
              </div>
              <div className="col">
                <select className="form-control form-control" value={selectedKey} onChange={(e) => setSelectedKey(e.target.value)}>
                  <option value="">KEY</option>
                  <option value="one">1</option>
                  <option value="two">2</option>
                  <option value="three">3</option>
                  <option value="four">4</option>
                  <option value="five">5</option>
                  <option value="six">6</option>
                  <option value="seven">7</option>
                  <option value="eight">8</option>
                  <option value="nine">9</option>
                </select>
              </div>
            </div>

            <div className="">
              <Pagination page={page} pages={pages} onPageChange={handlePageChange} />
            </div>

            <div className="column-wrapper">
              {recomendation.map((x, index) => (
                <div key={index} className="mb-3" style={{ breakInside: "avoid" }}>
                  <CardGroupRecommended {...x} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault()
          setSearch(form)
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
