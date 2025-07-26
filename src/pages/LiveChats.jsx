import { useDispatch, useSelector } from "react-redux"
import { useRef, useState } from "react"
import { useEffect } from "react"

import { dispatchOnlineMode, dispatchChats, dispatchAddChats } from "../store/store"

import timestamp from "../utils/timestamp"
import socket from "../utils/socket.io"

import NavbarTop from "../components/NavbarTop"
import ContainerLoading from "../components/ContainerLoading"

import ChatBubbleReceived from "../components/chats/ChatBubleReceived"

function NavbarTopWrapper() {
  return (
    <nav className="sticky-top p-0 w-100 h-100">
      <NavbarTop />
    </nav>
  )
}

export default function LiveChats() {
  const dispatch = useDispatch()

  const containerRef = useRef(null)
  const userInteractingRef = useRef(false)

  const chats = useSelector((state) => state.user.chats)
  const online = useSelector((state) => state.user.online)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleScroll = () => {
      const isNearBottom = container.scrollTop <= 50
      userInteractingRef.current = !isNearBottom
    }

    container.addEventListener("scroll", handleScroll)
    return () => container.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    dispatch(dispatchOnlineMode("web live"))

    if (!socket.connected) {
      socket.open()

      socket.on("message", (msg) => dispatch(dispatchAddChats(msg)))
    }
  }, [])

  if (!online)
    return (
      <>
        <NavbarTopWrapper />
        <ContainerLoading note="Connecting socket..." />
      </>
    )

  if (online && socket.device && socket.device.community !== "web live")
    return (
      <>
        <NavbarTopWrapper />
        <ContainerLoading note="You're connected with web mode only, live message will not appear.." />
      </>
    )

  if (online && chats.length === 0)
    return (
      <>
        <NavbarTopWrapper />
        <ContainerLoading note="Waiting for live message..." />
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
          paddingBottom: "120px",
          display: "flex",
          flexDirection: "column-reverse",
        }}
      >
        {chats.map((x, i) => (
          <ChatBubbleReceived
            key={`${x.account}_${x.className}_${x.id}_${x.group.id}`}
            accountkey={x.key}
            sender={x.name}
            title={x.group.title}
            chat={x.chat}
            group={x.group.username}
            time={timestamp(x.created, "time")}
          />
        ))}
      </div>
    </>
  )
}
