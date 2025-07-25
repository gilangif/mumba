import { Outlet } from "react-router-dom"

import Nav from "./components/Nav"

export default function Layout() {
  return (
    <div>
      <div className="p-0">
        <Outlet />
      </div>

      <Nav />
    </div>
  )
}
