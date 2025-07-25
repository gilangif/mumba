import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { useRef, useState, useEffect } from "react"

import { toast } from "react-toastify"

import { dispatchOnlineMode, dispatchChatsOpank, dispatchAddChatsOpank } from "../store/store"

import timestamp from "../utils/timestamp"
import socket from "../utils/socket.io"

import NavbarTop from "../components/NavbarTop"
import ContainerLoading from "../components/ContainerLoading"
import ChatBubbleSender from "../components/chats/ChatBubbleSender"
import ChatBubbleReceived from "../components/chats/ChatBubleReceived"

import axios from "axios"

const duration = (received, created, type) => {
  try {
    let delay = (received ? new Date(received) : new Date()) - new Date(created)

    let s = (delay / 1000).toFixed(2)
    let m = (s / 60).toFixed(0)
    let h = (m / 60).toFixed(1)

    let H = Math.floor(delay / (1000 * 60 * 60))
    let M = Math.floor((delay % (1000 * 60 * 60)) / (1000 * 60))
    let S = Math.floor((delay % (1000 * 60)) / 1000)

    let short = s <= 60 ? s + "s" : m <= 60 ? m + "m" : h + "h"
    let full = `${H.toString().padStart(2, "0")}:${M.toString().padStart(2, "0")}:${S.toString().padStart(2, "0")}`

    return type === "short" ? short : full
  } catch (error) {
    return error.message || "error get duration"
  }
}

const postmanParser = async (msg) => {
  let clean = (text) =>
    text
      .split("\n")
      .map((line) => line.trim())
      .join("\n")
      .trim()

  let chat = clean(msg.chat)

  let cn = ["UpdateNewChannelMessage", "UpdateShortChatMessage"].includes(msg.className) ? "Post" : "Edit"

  let qrdata = msg.qrdata ? `Image QR:\n${msg.qrdata}\n\n` : ""
  let ocrdata = msg.ocrdata && msg.ocrdata.ocrdesc && msg.ocrdata.ocrdata ? `Image ${msg.ocrdata.ocrdesc}:\n${clean(msg.ocrdata.ocrdata).replace(/\s+/g, " ")}\n\n` : ""

  const links = (
    await Promise.all(
      msg.url.map(async (x) => {
        try {
          if (x.merchant === "orderId") return null
          if (x.merchant !== "shopee") return x.link
          if (x.merchant === "shopee" && !x.link.includes("s.shopee.co.id")) return x.link

          const response = await axios(x.link)
          if (!response?.request?.res?.responseUrl?.includes("/angbao")) return null

          return x.link
        } catch (error) {
          return x.link
        }
      })
    )
  ).filter((x) => x)

  let linksdata = links.length > 0 ? `links:\n${links.join("\n")}\n\n` : ""

  let thumbSize = msg.thumbSize ? `${msg.thumbSize} | ` : ""
  let groupinfo = msg.name.replace(/\s+/g, "") === msg.group.title.replace(/\s+/g, "") ? `# ${msg.group.title}` : `# ${msg.name}\n# ${msg.group.title}`
  let information = `<b># ${cn} ${msg.id} (${msg.objectname})</b>\n<b>${groupinfo}</b>`
  let detail = `<b># ${thumbSize}R ${duration(null, msg.received, "short")} | C ${duration(null, msg.created, "short")} ${timestamp(msg.created, "time")}</b>\n\n${information}`

  let caption = `<br><b># ${timestamp(msg.received)}</b>\n\n${msg.chat ? chat + "\n\n" : ""}${ocrdata}${qrdata}${linksdata}${detail}`

  if (msg.note) caption += `\n\n<pre>${msg.note}</pre>`

  return caption
}

function NavbarTopWrapper() {
  return (
    <nav className="sticky-top p-0 w-100 h-100">
      <NavbarTop />
    </nav>
  )
}

export default function Opank() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const containerRef = useRef(null)

  const [caption, setCaption] = useState("")

  const HOST = useSelector((state) => state.user.HOST)
  const online = useSelector((state) => state.user.online)
  const username = useSelector((state) => state.user.username)
  const chats = useSelector((state) => state.user.chatsOpank)

  const theme = useSelector((state) => state.theme)
  const { mode, background, color } = theme

  const sendMessage = async () => {
    try {
      if (!caption)
        return toast.error("cannot send empty message", {
          position: "top-right",
          autoClose: 1500,
          hideProgressBar: true,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        })

      const accessToken = localStorage.getItem("accessToken")
      const { data } = await axios.post(HOST + "/telegraf/message", { caption: `${username}:\n` + caption }, { headers: { Authorization: `Bearer ${accessToken}` } })

      dispatch(dispatchAddChatsOpank({ caption, id: "123456", isMe: true, created: new Date().toISOString() }))
      setCaption("")

      toast.success(`data sended with id ${data.message_id}`, {
        position: "top-right",
        autoClose: 1500,
        hideProgressBar: true,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      })
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
    dispatch(dispatchOnlineMode("web"))

    if (!socket.connected) {
      socket.open()
      socket.on("link", async (msg) => dispatch(dispatchAddChatsOpank({ ...msg, caption: await postmanParser(msg) })))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("opank", JSON.stringify(chats))
  }, [chats])

  if (!online && chats.length === 0)
    return (
      <>
        <NavbarTopWrapper />
        <ContainerLoading note="Connecting socket..." />
      </>
    )

  return (
    <>
      <NavbarTopWrapper />

      <div
        ref={containerRef}
        className="overflow-y-auto"
        id="container-live-chats"
        style={{
          height: "100vh",
          borderRadius: "8px",
          paddingBottom: "210px",
          display: "flex",
          flexDirection: "column-reverse",
        }}
      >
        {chats.map((x, i) => {
          if (x.isMe) return <ChatBubbleSender key={`${i}_${x.id}`} chat={x.caption} time={timestamp(x.created, "time")} />

          return (
            <ChatBubbleReceived
              key={`${x.account}_${x.className}_${x.id}_${x.group.id}`}
              objectname={x.objectname}
              sender={x.name}
              title={x.group.title}
              chat={x.caption}
              group={x.group.username}
              time={timestamp(x.created, "time")}
            />
          )
        })}
      </div>
      <div className={`d-flex position-fixed align-items-center w-100 py-2 px-3 gap-3 ${background} ${color}`} style={{ height: "55px", bottom: "60px", zIndex: "1000" }}>
        <div className="m-0 border-0 w-100 h-100">
          <input
            type="text"
            className="form-control"
            id="inputPassword2"
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
            placeholder="send message to opank"
            style={{ width: "100%", height: "100%", borderRadius: "0.6rem" }}
          />
        </div>
        <div className="m-0">
          <button
            type="submit"
            className="d-flex justify-content-center align-items-center btn btn-primary m-0 rounded-circle"
            style={{ width: "45px", aspectRatio: "1/1" }}
            onClick={() => sendMessage()}
          >
            <span className="material-symbols-outlined">send</span>
          </button>
        </div>
      </div>
    </>
  )
}
