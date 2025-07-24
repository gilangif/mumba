import { BrowserRouter, Routes, Route, Navigate, Outlet, Link } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { useEffect } from "react"

import { toast, ToastContainer } from "react-toastify"

import { dispatchOnline, dispatchTotalOnline } from "./store/store"

import socket from "./utils/socket.io"
import timestamp from "./utils/timestamp"

import "./App.css"
import Layout from "./Layout"

import Login from "./pages/Login"
import Home from "./pages/Home"
import LiveChats from "./pages/LiveChats"
import Claims from "./pages/Claims"
import Profile from "./pages/Profile"
import Opank from "./pages/Opank"
import NotFound from "./pages/NotFound"

const config = { device: {}, start: new Date() }

function Protect({ login }) {
  if (!login) return <Navigate to="/login" replace />

  return <Outlet />
}

function Guest({ login }) {
  if (login) return <Navigate to="/" replace />

  return <Outlet />
}

function App() {
  const dispatch = useDispatch()

  const login = useSelector((state) => state.user.accessToken)
  const username = useSelector((state) => state.user.username)
  const totalOnline = useSelector((state) => state.user.totalOnline)
  const onlineMode = useSelector((state) => state.user.onlineMode)
  const mode = useSelector((state) => state.theme.mode)

  useEffect(() => {
    document.body.classList.toggle("bg-dark", mode === "dark")
    document.body.classList.toggle("text-white", mode === "dark")
  }, [mode])

  useEffect(() => {
    const handleConnect = async () => {
      socket.emit("hs", { model: `${username} (${onlineMode.toUpperCase()})`, start: config.start })
    }

    const handleHS = async (data) => {
      const { id, model, start, community, online, status } = data

      if (status === "private") {
        config.device = { ...config.device, model, start, community, id }
        socket.device = { ...config.device, model, start, community, id }

        toast.success(`${model} connected`, {
          position: "top-right",
          autoClose: 1500,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: false,
          draggable: true,
          progress: undefined,
          theme: "colored",
        })
      } else {
        toast.info(`${model} connected`, {
          position: "top-right",
          autoClose: 500,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: false,
          draggable: true,
          progress: undefined,
          theme: "colored",
        })
      }

      dispatch(dispatchOnline(true))
      dispatch(dispatchTotalOnline(online))

      console.log(status === "private" ? "\x1b[32m" : "\x1b[35m")
      console.log(`# ${timestamp()} (${online} online)`)
      console.log(`  ${model} connected (${id})`)
      console.log(`  comunity ${community}`)
      console.log("\x1b[0m")
    }

    const handleDisconnect = (data) => {
      const { id, model, start, community, duration, online } = data

      toast.warning(`${model} disconnected (${duration})`, {
        position: "top-right",
        autoClose: 500,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "colored",
      })

      dispatch(dispatchTotalOnline(online))

      console.log("\x1b[33m")
      console.log(`# ${timestamp()} (${online} online)`)
      console.log(`  ${model} disconnected (${id})`)
      console.log(`  comunity ${community}`)
      console.log("\x1b[33m")
      console.log(`  start    : ${timestamp(new Date(start))}`)
      console.log(`  end      : ${timestamp(new Date())}`)
      console.log(`  duration : ${duration}`)
      console.log("\x1b[0m")
    }

    const handleDisconnectServer = () => {
      dispatch(dispatchOnline(false))
      dispatch(dispatchTotalOnline(0))

      console.log("\x1b[33m")
      console.log(`# ${timestamp()}`)
      console.log(`  Server network disconnected`)
      console.log("\x1b[0m")
    }

    const handleConnectError = (err) => {
      dispatch(dispatchOnline(false))

      console.log("\x1b[31m")
      console.log(`# ${timestamp(null, "time")} : socket connection ${err}`)
      console.log("\x1b[0m")
    }

    if (onlineMode) {
      socket.on("connect", handleConnect)
      socket.on("hs", handleHS)
      socket.on("dc", handleDisconnect)
      socket.on("disconnect", handleDisconnectServer)
      socket.on("connect_error", handleConnectError)
    }

    return () => {
      socket.off("connect", handleConnect)
      socket.off("hs", handleHS)
      socket.off("dc", handleDisconnect)
      socket.off("disconnect", handleDisconnectServer)
      socket.off("connect_error", handleConnectError)
    }
  }, [onlineMode])

  return (
    <>
      <ToastContainer />
      <BrowserRouter>
        <div>
          <Routes>
            <Route element={<Guest login={login} />}>
              <Route path="/login" element={<Login />} />
            </Route>

            <Route element={<Layout />}>
              <Route element={<Protect login={login} />}>
                <Route path="/" element={<Home />} />
                <Route path="/chats/live" element={<LiveChats />} />
                <Route path="/chats/opank" element={<Opank />} />
                <Route path="/claims" element={<Claims />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Route>
          </Routes>
        </div>
      </BrowserRouter>
    </>
  )
}

export default App
