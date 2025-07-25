import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useLocation, Link } from "react-router-dom"

const style = {
  userSelect: {
    userSelect: "none",
    cursor: "pointer",
  },
}

function NavItems({ to, active, icon, stylesheet = "", onClick }) {
  const theme = useSelector((state) => state.theme)
  const { mode, background, color } = theme

  const handleScroll = () => {
    const el = document.getElementById("container-live-chats")

    if (el) el.scrollTop = 0
  }

  if (active && to === "/chats/live") {
    return (
      <div className={`text-center ${stylesheet}`} onClick={() => handleScroll()} style={style.userSelect}>
        <span className={`material-symbols-outlined p-2 ${active ? "text-warning" : color}`} style={{ scale: "1.2" }}>
          arrow_downward
        </span>
      </div>
    )
  }

  return (
    <div className={`text-center ${stylesheet}`} style={style.userSelect}>
      <Link to={to}>
        <span className={`material-symbols-outlined p-2 ${active ? "text-warning" : color}`} style={{ scale: "1.2" }}>
          {icon}
        </span>
      </Link>
    </div>
  )
}

export default function Nav() {
  const location = useLocation()

  const theme = useSelector((state) => state.theme)
  const { mode, background, color } = theme

  const items = [
    { to: "/", icon: "home" },
    { to: "/chats/live", icon: "chat" },
    { to: "/chats/opank", icon: "pets" },
    { to: "/claims", icon: "acute" },
    { to: "/others", icon: "build", right: true },
  ]

  return (
    <div className={`navbar fixed-bottom p-1 w-100 ${color} ${mode == "dark" ? background : "bg-white"}`}>
      <div className="d-flex justify-content-around justify-content-lg-start w-100 m-0 p-0 px-3 py-2 py-lg-0 gap-3" style={style.userSelect}>
        {items.map((x, i) => {
          const active = location.pathname === x.to
          const stylesheet = x.right ? "ms-lg-auto" : ""

          return <NavItems key={i} to={x.to} active={active} icon={x.icon} stylesheet={stylesheet} onClick={() => {}} />
        })}
      </div>
    </div>
  )
}
