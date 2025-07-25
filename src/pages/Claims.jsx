import { dispatchLogout } from "../store/store"

import { useDispatch, useSelector } from "react-redux"
import { Link, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"

import { toast } from "react-toastify"

import ContainerLoading from "../components/ContainerLoading"

import timestamp from "../utils/timestamp"

import axios from "axios"

export default function Claims() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const theme = useSelector((state) => state.theme)
  const { mode, background, color } = theme

  const HOST = useSelector((state) => state.user.HOST)
  const role = useSelector((state) => state.user.role)
  const username = useSelector((state) => state.user.username)

  const [claims, setClaims] = useState([])
  const [board, setBoard] = useState([])

  const [today, setToday] = useState(0)
  const [creators, setCreators] = useState([])

  useEffect(() => {
    const getClaims = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken")
        const { data } = await axios.get(HOST + "/claims", { headers: { Authorization: `Bearer ${accessToken}` } })

        setClaims(data)

        const isToday = (someDate) => {
          const today = new Date()
          const date = new Date(someDate)

          return date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth() && date.getDate() === today.getDate()
        }

        const models = Array.from(new Set(data.map((x) => x.model))).map((model) => {
          return [
            model,
            {
              community: data.find((x) => x.model === model).community,
              today: data
                .filter((x) => x.model === model)
                .filter((x) => isToday(x.date))
                .map((x) => x.amount)
                .reduce((a, b) => a + b),
            },
          ]
        })

        const creators = Array.from(new Set(data.map((x) => x.community))).map((community) => {
          return [
            community,
            {
              member: Array.from(new Set(data.filter((x) => x.community === community).map((x) => x.model))).length,
              today: data
                .filter((x) => x.community === community)
                .filter((x) => isToday(x.date))
                .map((x) => x.amount)
                .reduce((a, b) => a + b),
            },
          ]
        })

        const today = Array.from(new Set(data))
          .filter((x) => isToday(x.date))
          .map((x) => x.amount)
          .reduce((a, b) => a + b)

        setToday(today)
        setBoard(models)
        setCreators(creators)
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

    getClaims()
  }, [])

  if (claims.length === 0) return <ContainerLoading note="Claim data empty" />

  return (
    <>
      <div className="px-3 py-4">
        <h5>Today board:</h5>
        <p className="fw-bold text-8 text-warning">Rp.{new Intl.NumberFormat("id-ID").format(today)}</p>

        <div className="py-3 mb-2">
          <ul className="px-4">
            {board
              .sort((a, b) => b[1] - a[1])
              .map((x, i) => {
                const amount = new Intl.NumberFormat("id-ID").format(x[1].today)

                return (
                  <li className="text-8" key={i}>
                    <span className={`fw-bold ${x[1].community === username ? "text-warning" : ""}`}>{x[0]}</span>: Rp.
                    {role === "admin" || x[1].community === username ? amount : amount.toString().replace(/./g, "*")}
                  </li>
                )
              })}
          </ul>
        </div>

        <h5>Today board by creator:</h5>

        <div className="py-3 mb-2">
          <ul className="px-4">
            {creators
              .sort((a, b) => b[1].today - a[1].today)
              .map((x, i) => {
                const amount = new Intl.NumberFormat("id-ID").format(x[1].today)

                return (
                  <li className="text-8 mb-2" key={i}>
                    <span className={`fw-bold ${x[0] === username ? "text-warning" : ""}`}>{x[0]}</span>:
                    <ul>
                      <li className="text-8"> {x[1].member} member</li>
                      <li className="text-8"> amount Rp.{role === "admin" || x[0] === username ? amount : amount.toString().replace(/./g, "*")}</li>
                    </ul>
                  </li>
                )
              })}
          </ul>
        </div>

        <h5>Claim lists:</h5>

        <div className="table-responsive hide-scroll">
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
                    <td className={`text-8 align-middle ${background} ${color}`}>{x.community}</td>
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
