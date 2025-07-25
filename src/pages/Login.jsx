import { useSelector, useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { useState } from "react"

import { dispatchAccessToken, dispatchAvatar, dispatchRole, dispatchName, dispatchUsername } from "../store/store"

import Swal from "sweetalert2"
import axios from "axios"

export default function Login() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const HOST = useSelector((state) => state.user.HOST)
  const API = useSelector((state) => state.user.HOST)

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = async (e) => {
    try {
      e.preventDefault()

      const { data: login } = await axios.post(HOST + "/users/login", { username, password })

      dispatch(dispatchAvatar(login.avatar))
      dispatch(dispatchAccessToken(login.accessToken))
      dispatch(dispatchName(login.name))
      dispatch(dispatchUsername(login.username))
      dispatch(dispatchRole(login.role))

      localStorage.setItem("role", login.role)
      localStorage.setItem("name", login.name)
      localStorage.setItem("avatar", login.avatar)
      localStorage.setItem("username", login.username)
      localStorage.setItem("accessToken", login.accessToken)

      Swal.fire({
        icon: "success",
        title: `Welcome back ${login.name}`,
        draggable: true,
        didOpen: () => {
          const titleEl = Swal.getTitle()
          const contentEl = Swal.getHtmlContainer()

          if (titleEl) titleEl.style.fontSize = "1rem"
          if (contentEl) contentEl.style.fontSize = "0.9rem"
        },
      })

      navigate("/")
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: error.response?.data?.message || "Something went wrong",
        didOpen: () => {
          const titleEl = Swal.getTitle()
          const contentEl = Swal.getHtmlContainer()

          if (titleEl) titleEl.style.fontSize = "1rem"
          if (contentEl) contentEl.style.fontSize = "0.9rem"
        },
      })
    }
  }

  return (
    <div className="container vh-100 d-flex justify-content-center align-items-center">
      <form onSubmit={handleSubmit} className="form-signin" style={{ maxWidth: "420px" }}>
        <div className="text-center mb-6">
          <img className="mb-4" src="/src/assets/oyen.png" alt="" width="110" height="110" />
          <h1 className="h3 mb-2 font-weight-normal">Welcome back</h1>
          <p>You can sign in to access with your existing account.</p>
        </div>

        <div className="form-label-group mt-4 mb-3">
          <input type="text" className="form-control" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>

        <div className="form-label-group mb-5">
          <input type="password" id="inputPassword" className="form-control" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>

        <button className="btn btn-lg btn-sm btn-primary btn-block w-100 p-2" type="submit">
          Sign in
        </button>
      </form>
    </div>
  )
}
