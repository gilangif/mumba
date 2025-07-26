import { dispatchDataTemp } from "../../store/store"

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { toast } from "react-toastify"
import { Modal } from "bootstrap"

import axios from "axios"

const ModalGroupChecker = () => {
  const dispatch = useDispatch()

  const [loading, setLoading] = useState(false)

  const HOST = useSelector((state) => state.user.HOST)
  const username = useSelector((state) => state.user.username)

  const theme = useSelector((state) => state.theme)
  const { mode, background, color } = theme

  const temp = useSelector((state) => state.data.temp)
  const { ALIPAYJSESSIONID, image, model, nickname, data } = temp

  const actionGroup = async (key, action, inviteCode) => {
    if (action === "banned") {
      return toast.warning("this account already banned", {
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

    const toastId = toast.loading("Loading data...")

    try {
      const { data } = await axios.post(HOST + "/telegram/groups/action", { key, action, inviteCode })
      const { message } = data

      dispatch(
        dispatchDataTemp({
          group: temp.group,
          telegram: temp.telegram.map((x) => (x.key === key ? { ...x, action: x.action === "leave" ? "join" : "leave" } : x)),
        })
      )

      toast.update(toastId, {
        render: message,
        type: "success",
        isLoading: false,
        autoClose: 3000,
      })

      const { data: send } = await axios.post(HOST + "/telegraf/message", { caption: `${username}: ${message}` })
    } catch (err) {
      const status = err.status && typeof err.status === "number" ? err.status : err.response && err.response.status ? err.response.status : 500
      const message = err.response && err.response.data.message ? err.response.data.message : "Internal Server Error"

      toast.update(toastId, {
        render: message,
        type: "error",
        isLoading: false,
        autoClose: 3000,
      })
    }
  }

  return (
    <div className="modal px-3" id="modal-account">
      <div className="modal-dialog  modal-dialog-centered">
        <div className={`modal-content ${background} ${color}`}>
          <div className="modal-body p-4">
            <h5>{temp?.group?.title}</h5>
            <p className="text-8 m-0">{temp?.group?.username || "unknown"}</p>
            <p className="text-8 mt-0 mb-3">{temp?.group?.type}</p>

            {temp.telegram
              ? temp.telegram.map((x, i) => {
                  console.log(x)
                  return (
                    <button
                      key={i}
                      className={`btn btn -sm text-light w-100 my-2 ${x.action === "error" ? "disabled" : x.action === "banned" ? "bg-warning" : x.action === "leave" ? "bg-danger" : "bg-success"}`}
                      onClick={() => actionGroup(x.key, x.action, x.inviteCode)}
                    >
                      {`${x.action} (${x.key})`.toUpperCase()}
                    </button>
                  )
                })
              : ""}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ModalGroupChecker
