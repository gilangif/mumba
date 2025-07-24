import { useSelector } from "react-redux"

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
  },
}

export default function RecommendedContainer() {
  const theme = useSelector((state) => state.theme)
  const { mode, background, color } = theme

  return (
    <div className="py-3 px-2 px-lg-3" style={style.userSelect}>
      <h5 className="mb-3 text-8">Recommended for you</h5>

      <div className="d-flex overflow-auto gap-2 pb-2 hide-scroll" style={style.carouselContainer}>
        {[...Array(16)].map((_, i) => (
          <div key={i} className="card flex-shrink-0 border-0" style={style.carouselCard}>
            <img src={`https://picsum.photos/id/${i + 10}/300/200`} className="card-img-top img-square" alt="" />
            <div className={`card-body p-2 ${background} ${color}`}>
              <h6 className="card-title m-0" style={style.carouselTitle}>
                Lorem ipsum dolor sit amet
              </h6>
              <p className="card-text small m-0">Category</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
