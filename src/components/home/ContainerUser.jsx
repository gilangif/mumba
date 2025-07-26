import { dispatchDataUsers } from "../../store/store"

import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"

import axios from "axios"
import CardUser from "./CardUser"

export default function ContainerUser() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const HOST = useSelector((state) => state.user.HOST)
  const users = useSelector((state) => state.data.users)
  const username = useSelector((state) => state.user.username)

  const [isError, setIsError] = useState(false)

  useEffect(() => {
    const getUsers = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken")
        const { data } = await axios.get(HOST + "/users/dana", { headers: { Authorization: `Bearer ${accessToken}` } })
        
        dispatch(
          dispatchDataUsers(
            data.reverse().sort((a, b) => {
              if (a.creator === username && b.creator !== username) return -1
              if (a.creator !== username && b.creator === username) return 1
              return 0
            })
          )
        )
      } catch (err) {
        const status = err.status && typeof err.status === "number" ? err.status : err.response && err.response.status ? err.response.status : 500
        const message = err.response && err.response.data.message ? err.response.data.message : "Internal Server Error"

        setIsError(true)

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

    getUsers()
  }, [])

  if (isError)
    return (
      <>
        <div className="px-4 py-3">
          <h5>Users (0)</h5>
        </div>
        <div className="d-flex justify-content-center px-2 py-5">connection error</div>
      </>
    )

  if (users.length === 0)
    return (
      <>
        <div className="px-4 py-3">
          <h5>Users (0)</h5>
        </div>
        <div className="d-flex justify-content-center px-2 py-5">no user register</div>
      </>
    )

  return (
    <>
      <div className="px-4 py-3">
        <h5>Users ({users.length})</h5>
      </div>
      <div className="container-fluid px-2">
        <div className="row g-1">
          {users.map((x, i) => (
            <div className="col-12 col-md-4" key={i}>
              <CardUser
                image={x.dana.avatarUrl}
                nickname={x.dana.nickname}
                community="member"
                creator={x.creator}
                alipay={x.ALIPAYJSESSIONID}
                balance={x.dana.balanceDisplay.amount}
                start={x.start}
                data={x}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
