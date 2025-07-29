import { dispatchLogout, dispatchDataTemp } from "../store/store"

import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { useState, useEffect } from "react"
import { toast } from "react-toastify"
import { Modal } from "bootstrap"

import ContainerLoading from "../components/ContainerLoading"

import timestamp from "../utils/timestamp"

import axios from "axios"

function Pagination({ page, pages, onPageChange }) {
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

        {getPageNumbers().map((num) => (
          <button key={num} onClick={() => onPageChange(num)} className={`px-3 py-1 border-0 rounded ${num === page ? "text-danger fw-bold" : ""}`}>
            {num}
          </button>
        ))}

        <button onClick={() => onPageChange(page + 1)} disabled={page === pages || page <= 1} className={`px-3 py-1 border rounded ${page === pages || page <= 1 ? "d-none" : ""}`}>
          NEXT
        </button>
      </div>
    </div>
  )
}

function ModalMonthTable() {
  const username = useSelector((state) => state.user.username)
  const role = useSelector((state) => state.user.role)

  const theme = useSelector((state) => state.theme)
  const { mode, background, color } = theme

  const temp = useSelector((state) => state.data.temp)
  const { title, creator, amount, total, month } = temp || {}

  const handlerDownloadResult = async () => {
    if (creator !== username && role !== "admin") {
      return toast.warning("sorry you're not creator", {
        position: "top-right",
        autoClose: 1500,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "colored",
      })
    }

    const filename = "statement.json"
    const content = JSON.stringify(temp, null, 2)
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
    <div className="modal px-3" id="modal-claims">
      <div className="modal-dialog  modal-dialog-centered">
        <div className="modal-content bg-light text-dark">
          <div className="modal-body p-3">
            <h5>{title}</h5>
            <span>
              Rp.
              {(creator && creator === username) || role === "admin"
                ? new Intl.NumberFormat("id-ID").format(amount || 0)
                : amount  ? amount
                    .toString()
                    .split("")
                    .map((x) => "*")
                    .join("") : ""}{" "}
              ({total} transaction)
            </span>
          </div>
          <div className="table-responsive hide-scroll px-3">
            <table className="table table-sm table-hover ext-nowrap mt-3 bg-light text-dark">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">AMOUNT</th>
                  <th scope="col">TOTAL</th>
                  <th scope="col">%</th>
                </tr>

                {month &&
                  month.map((x, i) => {
                    return (
                      <tr key={i}>
                        <td className="text-8 align-middle">{x.date}</td>
                        <td className="text-8 align-middle">
                          Rp.
                          {(creator && creator === username) || role === "admin"
                            ? new Intl.NumberFormat("id-ID").format(x.amount || 0)
                            : x.amount
                                .toString()
                                .split("")
                                .map((x) => "*")
                                .join("")}
                        </td>
                        <td className="text-8 align-middle">{x.total}</td>
                        <td className="text-8 align-middle">{x.percentage}</td>
                      </tr>
                    )
                  })}
              </thead>
              <tbody></tbody>
            </table>
          </div>
          <div className="d-flex py-1 px-1 justify-content-end">
            <button type="submit" className="d-flex justify-content-center align-items-center btn border-0" id="download-result-btn" onClick={() => handlerDownloadResult()}>
              <span className="material-symbols-outlined w-100 p-2 p-lg-3" style={{ scale: "1.6" }}>
                download_for_offline
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatementBoardAll({ statement }) {
  const dispatch = useDispatch()

  const username = useSelector((state) => state.user.username)
  const role = useSelector((state) => state.user.role)

  const getMore = (title, statement, creator) => {
    showForm()
    dispatch(dispatchDataTemp({ title, creator, amount: statement.mtd.amount, total: statement.mtd.total, month: statement.month }))
  }

  const showForm = (type) => {
    const modalElement = document.getElementById("modal-claims")
    const modal = Modal.getOrCreateInstance(modalElement)

    if (type === "close") return modal.hide()

    modal.toggle()
  }

  return (
    <div className="mb-4">
      <h6>Statement today:</h6>
      {statement && (
        <>
          <li className="text-8 border-0 m-0 p-0 my-1" style={{ cursor: "pointer" }}>
            <span className="text-9 fw-bold text-warning" onClick={() => getMore(`Statement today`, statement, username)}>
              TODAY:
            </span>
            <span className="text-9 px-2">Rp.{new Intl.NumberFormat("id-ID").format(statement.today.amount || 0)}</span>
            <span className="text-9 px-2">({statement.today.total} transaction)</span>
          </li>
          <li className="text-8 border-0 m-0 p-0 my-1" style={{ cursor: "pointer" }}>
            <span className="text-9 fw-bold text-warning" onClick={() => getMore(`Statement today`, statement, username)}>
              MTD:
            </span>
            <span className="text-9 px-2">Rp.{new Intl.NumberFormat("id-ID").format(statement.mtd.amount || 0)}</span>
            <span className="text-9 px-2">({statement.mtd.total} transaction)</span>
          </li>
        </>
      )}
    </div>
  )
}

function StatementBoardCreator({ statement }) {
  const dispatch = useDispatch()

  const theme = useSelector((state) => state.theme)
  const { mode, background, color } = theme

  const username = useSelector((state) => state.user.username)
  const role = useSelector((state) => state.user.role)

  const getMore = (title, statement, creator) => {
    showForm()
    dispatch(dispatchDataTemp({ title, creator, amount: statement.mtd.amount, total: statement.mtd.total, month: statement.month }))
  }

  const showForm = (type) => {
    const modalElement = document.getElementById("modal-claims")
    const modal = Modal.getOrCreateInstance(modalElement)

    if (type === "close") return modal.hide()

    modal.toggle()
  }

  return (
    <div className="mb-4">
      <h6>Statement by creator (today):</h6>
      {statement &&
        statement.creators &&
        Object.entries(statement.creators).map(([key, value]) => {
          return (
            <div key={key}>
              <li className="text-8 border-0 m-0 p-0 my-1" style={{ cursor: "pointer" }}>
                <span className={`text-9 ${key === username ? "fw-bold text-warning" : ""}`} onClick={() => getMore(`Statement by creator ${key}`, value, key)}>
                  {key}:
                </span>
                <span className="text-9 px-2">
                  Rp.
                  {key === username || role === "admin"
                    ? new Intl.NumberFormat("id-ID").format(value.today.amount || 0)
                    : value.today.amount
                        .toString()
                        .split("")
                        .map((x) => "*")}
                </span>
              </li>
            </div>
          )
        })}
    </div>
  )
}

function StatementBoardModel({ statement }) {
  const dispatch = useDispatch()

  const theme = useSelector((state) => state.theme)
  const { mode, background, color } = theme

  const username = useSelector((state) => state.user.username)
  const role = useSelector((state) => state.user.role)

  const getMore = (title, statement, creator) => {
    showForm()
    dispatch(dispatchDataTemp({ title, creator, amount: statement.mtd.amount, total: statement.mtd.total, month: statement.month }))
  }

  const showForm = (type) => {
    const modalElement = document.getElementById("modal-claims")
    const modal = Modal.getOrCreateInstance(modalElement)

    if (type === "close") return modal.hide()

    modal.toggle()
  }

  return (
    <div className="mb-4">
      <h6>Statement by model (today):</h6>
      {statement &&
        statement.models &&
        Object.entries(statement.models).map(([key, value]) => {
          return (
            <div key={key}>
              <li className="text-8 border-0 m-0 p-0 my-1" style={{ cursor: "pointer" }}>
                <span className={`text-9 ${value.creator === username ? "text-warning fw-bold" : ""}`} onClick={() => getMore(`Statement by model ${key}`, value, value.creator)}>
                  {key}:
                </span>
                <span className="text-9 px-2">
                  Rp.{" "}
                  {key === username || role === "admin" || value && value.creator && value.creator === username
                    ? new Intl.NumberFormat("id-ID").format(value.today.amount || 0)
                    : value.today.amount
                        .toString()
                        .split("")
                        .map((x) => "*")}
                </span>
              </li>
            </div>
          )
        })}
    </div>
  )
}

export default function Claims() {

  const theme = useSelector((state) => state.theme)
  const { mode, background, color } = theme

  const HOST = useSelector((state) => state.user.HOST)

  const [searchParams, setSearchParams] = useSearchParams()
  const [pages, setPages] = useState(1)
  const [page, setPage] = useState(parseInt(searchParams.get("page") || "1", 10))

  const [claims, setClaims] = useState([])

  const [selectedDate, setSelectedDate] = useState(searchParams.get("date"))
  const [selectedDateStatement, setSelectedDateStatement] = useState()
  const [selectedModel, setSelectedModel] = useState("")
  const [selectedCreator, setSelectedCreator] = useState("")
  const [selectedType, setSelectedType] = useState("")
  const [selectedSort, setSelectedSort] = useState("desc")

  const [statement, setStatement] = useState()

  const getStatement = async (date) => {
    try {
      const params = { date }
      const { data } = await axios.get(HOST + "/claims/statement", { headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` }, params })

      setStatement(data)
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
      })
    }
  }

  const getClaims = async () => {
    try {
      const params = { page, date: selectedDate, model: selectedModel, creator: selectedCreator, sort: selectedSort, type: selectedType, limit: 100 }

      const { data: detail } = await axios.get(HOST + "/claims", { headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` }, params })
      const { data, pages: totalPages } = detail

      setClaims(data)
      setPages(totalPages)
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
      })
    }
  }

  useEffect(() => {
    const params = new URLSearchParams(searchParams)

    if (searchParams.get("date") !== selectedSort) {
      params.set("page", 1)
    } else if (searchParams.get("date") !== selectedType) {
      params.set("page", 1)
    } else if (searchParams.get("date") !== selectedDate) {
      params.set("page", 1)
    } else if (searchParams.get("model") !== selectedModel) {
      params.set("page", 1)
    } else if (searchParams.get("model") !== selectedCreator) {
      params.set("page", 1)
    } else {
      params.set("page", page)
    }

    if (selectedCreator) params.set("model", selectedCreator)
    if (selectedModel) params.set("model", selectedModel)
    if (selectedSort) params.set("sort", selectedSort)
    if (selectedType) params.set("type", selectedType)
    if (selectedDate) params.set("date", selectedDate)

    setSearchParams(params)
    getClaims()
  }, [page, selectedDate, selectedModel, selectedCreator, selectedSort, selectedType])

  useEffect(() => {
    getStatement(selectedDateStatement)
  }, [selectedDateStatement])

  return (
    <>
      <ModalMonthTable />

      <div className="px-3 py-4">
        <div className="py-2 mb-4">
          <input
            type="date"
            className="form-control"
            value={selectedDateStatement}
            placeholder="test"
            onChange={(e) => {
              setSelectedDateStatement(e.target.value)
              setPage(1)
            }}
          />
        </div>

        <StatementBoardAll statement={statement} />
        <StatementBoardModel statement={statement} />
        <StatementBoardCreator statement={statement} />

        <div>
          <Pagination page={page} pages={pages} onPageChange={setPage} />
        </div>

        <div className="row my-3">
          <div className="col">
            <select className="form-control form-control" value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)}>
              <option value="">MODEL</option>
              {statement &&
                statement.models &&
                Object.entries(statement.models).map(([key, values]) => {
                  return (
                    <option key={key} value={key}>
                      {key}
                    </option>
                  )
                })}
            </select>
          </div>
          <div className="col">
            <select className="form-control form-control" value={selectedCreator} onChange={(e) => setSelectedCreator(e.target.value)}>
              <option value="">CREATOR</option>
              {statement &&
                statement.creators &&
                Object.entries(statement.creators).map(([key, values]) => {
                  return (
                    <option key={key} value={key}>
                      {key}
                    </option>
                  )
                })}
            </select>
          </div>
        </div>

        <div className="row my-3">
          <div className="col">
            <select className="form-control form-control" value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
              <option value="">TYPE</option>
              <option value="device">DEVICE</option>
              <option value="socket">SOCKET</option>
            </select>
          </div>
          <div className="col">
            <select className="form-control form-control" value={selectedSort} onChange={(e) => setSelectedSort(e.target.value)}>
              <option value="">SORT</option>
              <option value="asc">ASC</option>
              <option value="desc">DESC</option>
            </select>
          </div>
        </div>

        <div className="row my-3">
          <div className="col">
            <input
              type="date"
              className="form-control"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value)
                setPage(1)
              }}
            />
          </div>
        </div>

        <div className="row pb-4">
          <div className="col">
            <button
              className="btn btn-light m-0 w-100"
              onClick={() => {
                setSelectedSort("desc")
                setSelectedCreator("")
                setSelectedModel("")
                setSelectedType("")
                setSelectedDate(now)
              }}
            >
              CLEAR
            </button>
          </div>
        </div>

        <div className="table-responsive hide-scroll" style={{ paddingBottom: "80px" }}>
          <table className={`table table-sm table-hover ext-nowrap mt-3 ${background} ${color}`}>
            <thead>
              <tr>
                <th className={`${background} ${color}`} scope="col">
                  #
                </th>
                <th className={`${background} ${color}`} scope="col">
                  MODEL
                </th>
                <th className={`${background} ${color}`} scope="col">
                  CLAIM
                </th>
                <th className={`${background} ${color}`} scope="col">
                  CODE
                </th>
                <th className={`${background} ${color}`} scope="col">
                  ORDER ID
                </th>
                <th className={`${background} ${color}`} scope="col">
                  GROUP
                </th>
                <th className={`${background} ${color}`} scope="col">
                  AMOUNT
                </th>
                <th className={`${background} ${color}`} scope="col">
                  CREATOR
                </th>
                <th className={`${background} ${color}`} scope="col">
                  TYPE
                </th>
                <th className={`${background} ${color}`} scope="col">
                  DATE
                </th>
              </tr>
            </thead>
            <tbody>
              {claims.map((x, i) => {
                return (
                  <tr key={i}>
                    <td className={`text-8 align-middle ${background} ${color}`}>{i + 1}</td>
                    <td className={`text-8 align-middle ${background} ${color}`}>{x.model}</td>
                    <td className={`text-8 align-middle ${background} ${color}`}>{x.claim}</td>
                    <td className={`text-8 align-middle ${background} ${color}`}>
                      <Link to={`https://link.dana.id/kaget?c=${x.danacode}`} className={`fw-bold text-decoration-none text-8 ${color}`}>
                        {x.danacode}
                      </Link>
                    </td>
                    <td className={`text-8 align-middle ${background} ${color}`}>{x.orderId}</td>
                    <td className={`text-8 align-middle ${background} ${color}`}>{x.title}</td>
                    <td className={`text-8 align-middle ${background} ${color}`}>{x.amount}</td>
                    <td className={`text-8 align-middle ${background} ${color}`}>{x.creator}</td>
                    <td className={`text-8 align-middle ${background} ${color}`}>{x.type}</td>
                    <td className={`text-8 align-middle ${background} ${color}`}>{timestamp(x.date)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
