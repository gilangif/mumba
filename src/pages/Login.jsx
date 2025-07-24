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

  const [username, setUsername] = useState("gilangif")
  const [password, setPassword] = useState("gilangif")

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

      Swal.fire({ icon: "success", title: `Welcome back ${login.name}`, draggable: true })

      navigate("/")
    } catch (error) {
      Swal.fire({ icon: "error", title: "Login Failed", text: error.response?.data?.message || "Something went wrong" })
    }
  }

  return (
    <div className="container vh-100 d-flex justify-content-center align-items-center">
      <form onSubmit={handleSubmit} className="form-signin" style={{ maxWidth: "420px" }}>
        <div className="text-center mb-6">
          <img className="mb-4" src="https://getbootstrap.com/docs/4.4/assets/brand/bootstrap-solid.svg" alt="" width="72" height="72" />
          <h1 className="h3 mb-2 font-weight-normal">Welcome back</h1>
          <p>You can sign in to access with your existing account.</p>
        </div>

        <div className="form-label-group mt-4 mb-3">
          <input type="text" className="form-control" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>

        <div className="form-label-group mb-5">
          <input type="password" id="inputPassword" className="form-control" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>

        <button className="btn btn-lg btn-primary btn-block" type="submit">
          Sign in
        </button>
      </form>
    </div>
  )
}
