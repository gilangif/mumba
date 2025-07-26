import { useSelector } from "react-redux"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"

import ContainerLoading from "../components/ContainerLoading"

import axios from "axios"
import Swal from "sweetalert2"

export default function Others() {
  const API = useSelector((state) => state.user.API)

  const [form, setForm] = useState("")
  const [mode, setMode] = useState("1")
  const [pages, setPages] = useState([])

  const handleSubmit = async (e) => {
    try {
      e.preventDefault()

      const links = [...new Set(form.match(/https?:\/\/[^\s/$.?#].[^\s]*/gi) || [])]
      const lists = links.filter((x) => x.includes("https://t.me"))

      if (lists.length === 0) {
        return toast.error("cannot find telegram link from input", {
          position: "top-right",
          autoClose: 1500,
          hideProgressBar: true,
          closeOnClick: false,
          pauseOnHover: false,
          draggable: true,
          progress: undefined,
          theme: "colored",
        })
      }

      if (lists && lists.length > 1) {
        return toast.error("Looks like you've included too many telegram invite links in your message.", {
          position: "top-right",
          autoClose: 1500,
          hideProgressBar: true,
          closeOnClick: false,
          pauseOnHover: false,
          draggable: true,
          progress: undefined,
          theme: "colored",
        })
      }

      const match = lists[0].replace(/[()]/g, "").match(/^https:\/\/t\.me\/(@?[a-zA-Z0-9_]{5,32}|\+[a-zA-Z0-9_-]{16,})(?:\/\d+)?(?:\?.*)?$/)

      if (!match) {
        return toast.error("cannot find telegram invite code from input", {
          position: "top-right",
          autoClose: 1500,
          hideProgressBar: true,
          closeOnClick: false,
          pauseOnHover: false,
          draggable: true,
          progress: undefined,
          theme: "colored",
        })
      }

      const target = match[1]
      const discuss = mode === 2 ? true : false
      console.log("📢[:67]: ", discuss)

      const { data } = await axios.post(API + "/browser/telegram/standby", { target, discuss })
      const { id, url, pages, buffer, message } = data

      setPages([...pages, { id, url }])

      if (buffer) {
        const uint8Array = new Uint8Array(buffer.data)
        const binary = uint8Array.reduce((acc, byte) => acc + String.fromCharCode(byte), "")
        const base64 = `data:image/png;base64,${btoa(binary)}`

        return Swal.fire({
          title: "Success",
          text: message,
          html: `<img src="${base64}" style="width: 100%; max-width: 200px; height: auto; max-height: 200px; object-fit: contain;" />`,
        })
      }

      toast.success(message, {
        position: "top-right",
        autoClose: 1500,
        hideProgressBar: true,
        closeOnClick: false,
        pauseOnHover: false,
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
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "colored",
      })
    }
  }

  const handleAction = async (id, action) => {
    try {
      const { data } = await axios.post(API + "/browser/pages", { id, action })
      const { buffer, message } = data

      if (action === "screenshot" && buffer) {
        const uint8Array = new Uint8Array(buffer.data)
        const binary = uint8Array.reduce((acc, byte) => acc + String.fromCharCode(byte), "")
        const base64 = `data:image/png;base64,${btoa(binary)}`

        return Swal.fire({
          title: "Success",
          text: message,
          imageUrl: base64,
          imageWidth: 400,
        })
      }

      setPages(pages.filter((x) => x.id !== id))

      toast.success(message, {
        position: "top-right",
        autoClose: 1500,
        hideProgressBar: true,
        closeOnClick: false,
        pauseOnHover: false,
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
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "colored",
      })
    }
  }

  useEffect(() => {
    const getPages = async () => {
      try {
        const { data } = await axios.post(API + "/browser/pages")

        setPages(data.pages)
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
        })
      }
    }

    getPages()
  }, [])

  return (
    <div className="container mt-3">
      <form onSubmit={handleSubmit}>
        <div className="px-1">
          <div className="form-floating">
            <textarea className="form-control" value={form} onChange={(e) => setForm(e.target.value)} placeholder="add standby mode here" style={{ minHeight: "20vh" }} />
            <label htmlFor="floatingTextarea2">Please input telegram invite link</label>
          </div>

          <div className="col-md mt-3">
            <div className="form-floating">
              <select className="form-select" id="floatingSelectGrid" value={mode} onChange={(e) => setMode(e.target.value)}>
                <option value="1">CHANNEL & GROUP</option>
                <option value="2">CHANNEL DISCUSSION</option>
              </select>
              <label htmlFor="floatingSelectGrid">Standby mode option</label>
            </div>
          </div>

          <div className="col-md mt-3">
            <button type="submit" className="btn btn-sm btn-success text-light w-100 p-1">
              STANDBY
            </button>
          </div>
        </div>
      </form>

      <div className="px-1 mt-4 py-3">
        <ol className="mt-4">
          {pages.map((x, i) => {
            return (
              <li className="mt-4 py-2" key={i}>
                <h6 className="text-wrap" style={{ wordBreak: "break-all" }}>
                  {x.url}
                </h6>

                <span className="text-7">{x.id}</span>
                <div className="d-flex flex-row flex-start gap-2 mt-2">
                  <button className="btn text-light btn-sm btn-info" onClick={() => handleAction(x.id, "screenshot")}>
                    CAPTURE
                  </button>
                  <button className="btn text-light btn-sm btn-primary" onClick={() => handleAction(x.id, "reload")}>
                    RELOAD
                  </button>
                  <button className="btn text-light btn-sm btn-danger" onClick={() => handleAction(x.id, "close")}>
                    CLOSE
                  </button>
                </div>
              </li>
            )
          })}
        </ol>
      </div>
    </div>
  )
}
