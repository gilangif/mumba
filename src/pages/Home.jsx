import { useSelector } from "react-redux"
import { useEffect, useState } from "react"

import NavbarTop from "../components/NavbarTop"

import ContainerRecommended from "../components/home/ContainerRecommended"
import ContainerDevice from "../components/home/ContainerDevice"
import ContainerUser from "../components/home/ContainerUser"
import ModalResult from "../components/home/ModalContainer"

import axios from "axios"
import socket from "../utils/socket.io"

function OfflineContainer() {
  const HOST = useSelector((state) => state.user.HOST)

  const [offline, setOffline] = useState([])
  const [online, setOnline] = useState([])

  useEffect(() => {
    const getInfo = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken")
        const { data } = await axios.get(HOST + "/socket/devices", { headers: { Authorization: `Bearer ${accessToken}` } })
        const { online, offline } = data

        setOffline(offline)
        setOnline(online)
      } catch (err) {
        console.error(err)
      }
    }

    getInfo()
  }, [])

  return (
    <div className="px-2 px-lg-3">
      <div className="alert alert-warning" role="alert">
        <h6 className="alert-heading">Attention</h6>
        <p className="text-8 m-0">{offline.length} devices are currently disconnected from the network. Please check the connections and ensure all devices are properly connected to the network.</p>
        <hr />
        <ol>
          {offline.map((x, i) => {
            return (
              <li key={i} className="fw-bold mx-1 text-8">
                {x}
              </li>
            )
          })}
        </ol>
      </div>
    </div>
  )
}

export default function Home() {
  const online = useSelector((state) => state.user.online)

  return (
    <>
      <ModalResult />
      <div className="pb-5 mb-4">
        <NavbarTop />

        {online && socket.device && socket.device.community === "web live" ? (
          <div className="px-2 px-lg-3">
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
              <p className="text-8 m-0">Your program is now connected to live mode. This may consume excessive bandwidth and put additional load on both the server and your device.</p>
            </div>
          </div>
        ) : (
          ""
        )}

        <OfflineContainer />

        <ContainerRecommended />
        <ContainerUser />
        <ContainerDevice />
      </div>
    </>
  )
}
