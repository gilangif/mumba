import { Link } from "react-router-dom"

export default function NotFound() {
  return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <h1>404 - Page not found</h1>
      <p>Sorry we couldn't find the page.</p>
      <Link to="/">Back to homepage</Link>
    </div>
  )
}
