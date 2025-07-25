import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"

import { dispatchDataDevices, dispatchLogout } from "../../store/store"

import CardDevice from "./CardDevice"

import axios from "axios"

export default function ContainerDevice() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const HOST = useSelector((state) => state.user.HOST)
  const devices = useSelector((state) => state.data.devices)

  const [isError, setIsError] = useState(false)

  useEffect(() => {
    const getDevices = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken")
        const { data } = await axios.get(HOST + "/socket/lists", { headers: { Authorization: `Bearer ${accessToken}` } })
        dispatch(dispatchDataDevices(data.reverse()))
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

    getDevices()
  }, [])

  if (isError)
    return (
      <>
        <div className="px-4 py-3">
          <h5>Devices (0)</h5>
        </div>
        <div className="d-flex justify-content-center px-2 py-5">connection error</div>
      </>
    )

  if (devices.length === 0)
    return (
      <>
        <div className="px-4 py-3">
          <h5>Devices (0)</h5>
        </div>
        <div className="d-flex justify-content-center px-2 py-5">no device connected</div>
      </>
    )

  return (
    <>
      <div className="px-4 py-3">
        <h5>Devices ({devices.length})</h5>
      </div>
      <div className="d-flex flex-wrap gap-2 px-3 mt-3 mb-4">
        {devices.map((x, i) => {
          return (
            <CardDevice
              key={i}
              model={x.model}
              image={x.thumb}
              community={x.community}
              id={x.id}
              alipay={x.dana && x.dana.ALIPAYJSESSIONID ? x.dana.ALIPAYJSESSIONID : "-"}
              balance={x.dana ? x.dana.balanceDisplay : null}
              percentage={x.battery ? x.battery.percentage : null}
              status={x.battery ? x.battery.status : null}
              start={x.start}
              data={x}
              onDoubleClick={() => ""}
            />
          )
        })}
      </div>
    </>
  )
}
