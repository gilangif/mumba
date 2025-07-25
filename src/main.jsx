import { createRoot } from "react-dom/client"

import { Provider } from "react-redux"
import { store } from "./store/store"

import "bootstrap/dist/css/bootstrap.min.css"

import App from "./App.jsx"

createRoot(document.getElementById("root")).render(
  <>
    <Provider store={store}>
      <App />
    </Provider>
  </>
)
