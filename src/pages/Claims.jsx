import { useState, useEffect } from "react"

import { toast } from "react-toastify"

import Swal from "sweetalert2"
import axios from "axios"

export default function Claims() {
  useEffect(async () => {
    try {
      const accessToken = localStorage.getItem("accessToken")
      const { data } = await axios.post("http://localhost:3000/users/dana/add", { text }, { headers: { Authorization: `Bearer ${accessToken}` } })
      const { ALIPAYJSESSIONID, creator, result, message } = data
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
  }, [])

  return (
    <>
      <div className="p-2 py-4">
        <h5>Claim lists:</h5>
        <div className="table-responsive hide-scroll">
          <table class="table table-sm table-hover table-dark ext-nowrap mt-3">
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
              <tr>
                <td className="text-7">1</td>
                <td className="text-7">peridot boby</td>
                <td className="text-7">65 rupiah</td>
                <td className="text-7">sz42lftgc</td>
                <td className="text-7">20250722101214772415010300166260832472587</td>
                <td className="text-7">Dadiran Everyday💰</td>
                <td className="text-7">Selasa, 22 Juli 2025 10:07:27 PM</td>
              </tr>
              <tr>
                <td className="text-7">1</td>
                <td className="text-7">peridot boby</td>
                <td className="text-7">65 rupiah</td>
                <td className="text-7">sz42lftgc</td>
                <td className="text-7">20250722101214772415010300166260832472587</td>
                <td className="text-7">Dadiran Everyday💰</td>
                <td className="text-7">Selasa, 22 Juli 2025 10:07:27 PM</td>
              </tr>
              <tr>
                <td className="text-7">1</td>
                <td className="text-7">peridot boby</td>
                <td className="text-7">65 rupiah</td>
                <td className="text-7">sz42lftgc</td>
                <td className="text-7">20250722101214772415010300166260832472587</td>
                <td className="text-7">Dadiran Everyday💰</td>
                <td className="text-7">Selasa, 22 Juli 2025 10:07:27 PM</td>
              </tr>
              <tr>
                <td className="text-7">1</td>
                <td className="text-7">peridot boby</td>
                <td className="text-7">65 rupiah</td>
                <td className="text-7">sz42lftgc</td>
                <td className="text-7">20250722101214772415010300166260832472587</td>
                <td className="text-7">Dadiran Everyday💰</td>
                <td className="text-7">Selasa, 22 Juli 2025 10:07:27 PM</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
