import { useLocation, Link } from "react-router-dom"
import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { toast } from "react-toastify"

import axios from "axios"

const style = {
  userSelect: {
    userSelect: "none",
  },
  carouselContainer: { scrollSnapType: "x mandatory" },
  carouselCard: {
    width: "160px",
    scrollSnapAlign: "start",
    background: "none",
  },
  carouselTitle: {
    fontSize: "0.8rem",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
}

function CardRecommended({ photo, title, member, dana }) {
  const theme = useSelector((state) => state.theme)
  const { mode, background, color } = theme

  return (
    <Link to={`/groups?search=${title}`} style={{ textDecoration: "none" }}>
      <div className="card flex-shrink-0 border-0" style={style.carouselCard}>
        <div className="position-relative">
          <img
            src={photo}
            className="card-img-top img-square w-100"
            alt=""
            style={{ display: "block" }}
            onError={(e) => {
              e.target.onerror = null
              e.target.src = "https://cdn.britannica.com/58/129958-050-C0EF01A4/Adolf-Hitler-1933.jpg"
            }}
          />

          {dana && (
            <div className="position-absolute bottom-0 start-0 text-white bg-dark px-2 py-1" style={{ fontSize: "0.6rem", opacity: 0.8, borderRadius: "0.6rem" }}>
              contain dana
            </div>
          )}
        </div>

        <div className={`card-body p-2 ${color}`}>
          <h6 className="card-title m-0" style={style.carouselTitle}>
            {title}
          </h6>
          <p className="card-text small m-0">{member} subscribers</p>
        </div>
      </div>
    </Link>
  )
}

export default function ContainerRecommended() {
  const [groups, setGroups] = useState([])

  const theme = useSelector((state) => state.theme)
  const { mode, background, color } = theme

  const API = useSelector((state) => state.user.API)

  useEffect(() => {
    const getRecommendation = async () => {
      try {
        const { data } = await axios.get(API + "/telegram/groups/recommendation?limit=20&sort=desc&order=unmark")

        setGroups(data.data)
      } catch (err) {
        const status = err.status && typeof err.status === "number" ? err.status : err.response && err.response.status ? err.response.status : 500
        const message = err.response && err.response.data.message ? err.response.data.message : "Internal Server Error"

        toast.error(message, {
          position: "top-right",
          autoClose: 1500,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          progress: undefined,
          theme: "colored",
        })
      }
    }

    getRecommendation()
  }, [])

  return (
    <div className="py-3 px-2 px-lg-3" style={style.userSelect}>
      <div className="d-flex justify-content-between align-items-center mb-3 p-1">
        <Link to="/groups" className={color} style={{ textDecoration: "none" }}>
          <h5 className="text-8 m-0">Recommended for you</h5>
        </Link>
        <Link to="/groups" className={color} style={{ textDecoration: "none" }}>
          <div className="px-2">
            <span className="material-symbols-outlined">chevron_forward</span>
          </div>
        </Link>
      </div>

      <div className="d-flex overflow-auto gap-2 pb-2 hide-scroll" style={style.carouselContainer}>
        {groups.map((x, i) => (
          <CardRecommended key={i} photo={x.photo} title={x.title} member={x.member} dana={x.dana.length > 0} />
        ))}
      </div>
    </div>
  )
}
