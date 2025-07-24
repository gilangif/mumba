import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"

import { toast } from "react-toastify"

import ContainerLoading from "../components/ContainerLoading"
import timestamp from "../utils/timestamp"

import axios from "axios"

export default function Claims() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const HOST = useSelector((state) => state.user.HOST)

  const [claims, setClaims] = useState([])

  useEffect(() => {
    const getClaims = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken")
        const { data } = await axios.get(HOST + "/claims", { headers: { Authorization: `Bearer ${accessToken}` } })

        setClaims(data)
      } catch (err) {
        const status = err.status && typeof err.status === "number" ? err.status : err.response && err.response.status ? err.response.status : 500
        const message = err.response && err.response.data.message ? err.response.data.message : "Internal Server Error"

        toast.error(message, {
          position: "top-right",
          autoClose: 1500,
          hideProgressBar: true,
          closeOnClick: false,
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

  if (claims.length === 0) return (
    <ContainerLoading note="Claim data empty"/>
  )

  return (
    <>
      <div className="p-2 py-4">
        <h5>Claim lists:</h5>
        <div className="table-responsive hide-scroll">
          <table className="table table-sm table-hover table-dark ext-nowrap mt-3">
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">MODEL</th>
                <th scope="col">CLAIM</th>
                <th scope="col">CODE</th>
                <th scope="col">ORDER ID</th>
                <th scope="col">GROUP</th>
                <th scope="col">DATE</th>
              </tr>
            </thead>
            <tbody>
              {claims.map((x, i) => {
                return (
                  <tr key={i}>
                    <td className="text-7">{i + 1}</td>
                    <td className="text-7">{x.model}</td>
                    <td className="text-7">{x.claims}</td>
                    <td className="text-7">{x.code}</td>
                    <td className="text-7">{x.orderId}</td>
                    <td className="text-7">{x.title}</td>
                    <td className="text-7">{timestamp(x.date)}</td>
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
