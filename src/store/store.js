import { configureStore } from "@reduxjs/toolkit"
import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  HOST: "http://128.199.70.155:80",
  API: "http://128.199.70.155:3000",
  accessToken: localStorage.getItem("accessToken") || "",
  username: localStorage.getItem("username") || "",
  name: localStorage.getItem("name") || "",
  role: localStorage.getItem("role") || "",
  avatar: localStorage.getItem("avatar") || "",
  chats: [],
  chatsOpank: localStorage.getItem("opank") ? JSON.parse(localStorage.getItem("opank")) : [],
  online: false,
  totalOnline: 0,
  onlineMode: "",
  unreadLiveMessage: 0,
}

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    dispatchLogout: (state) => {
      state.accessToken = ""
      state.username = ""
      state.name = ""
    },
    dispatchAccessToken: (state, action) => {
      state.accessToken = action.payload
    },
    dispatchAvatar: (state, action) => {
      state.avatar = action.payload
    },
    dispatchUsername: (state, action) => {
      state.username = action.payload
    },
    dispatchName: (state, action) => {
      state.name = action.payload
    },
    dispatchRole: (state, action) => {
      state.role = action.payload
    },
    dispatchOnline: (state, action) => {
      state.online = action.payload
    },
    dispatchOnlineMode: (state, action) => {
      state.onlineMode = action.payload
    },
    dispatchTotalOnline: (state, action) => {
      state.totalOnline = action.payload
    },
    dispatchChats: (state, action) => {
      state.chats = action.payload
    },
    dispatchAddChats: (state, action) => {
      if (state.chats.length > 30) state.chats.pop()
      state.chats.unshift(action.payload)
    },
    dispatchChatsOpank: (state, action) => {
      state.chatsOpank = action.payload
    },
    dispatchAddChatsOpank: (state, action) => {
      if (state.chatsOpank.length > 30) state.chatsOpank.pop()
      state.chatsOpank.unshift(action.payload)
    },
  },
})

const themeSlice = createSlice({
  name: "theme",
  initialState: {
    mode: localStorage.getItem("mode") || "dark",
    background: localStorage.getItem("background") || "bg-dark",
    color: localStorage.getItem("color") || "text-light",
  },
  reducers: {
    dispatchTheme: (state, action) => {
      state.mode = action.payload.mode
      state.color = action.payload.color
      state.background = action.payload.background
    },
    dispatchMode: (state, action) => {
      state.mode = action.payload
    },
    dispatchBackground: (state, action) => {
      state.mode = action.payload
    },
    dispatchColor: (state, action) => {
      state.mode = action.payload
    },
  },
})

const dataSlice = createSlice({
  name: "theme",
  initialState: {
    users: [],
    devices: [],
    temp: [],
  },
  reducers: {
    dispatchDataUsers: (state, action) => {
      state.users = action.payload
    },
    dispatchDataUsersAdd: (state, action) => {
      state.users.unshift(action.payload)
    },
    dispatchDataUsersRemove: (state, action) => {
      state.users = state.users.filter((x) => x.model !== action.payload || x.dana.nickname !== action.payload)
    },
    dispatchDataDevices: (state, action) => {
      state.devices = action.payload
    },
    dispatchDataTemp: (state, action) => {
      state.temp = action.payload
    },
  },
})

export const {
  dispatchLogout,
  dispatchRole,
  dispatchAccessToken,
  dispatchAvatar,
  dispatchName,
  dispatchUsername,
  dispatchOnline,
  dispatchTotalOnline,
  dispatchOnlineMode,
  dispatchChats,
  dispatchAddChats,
  dispatchChatsOpank,
  dispatchAddChatsOpank,
} = userSlice.actions

export const { dispatchTheme, dispatchMode, dispatchBackground, dispatchColor } = themeSlice.actions
export const { dispatchDataUsers, dispatchDataUsersAdd, dispatchDataUsersRemove, dispatchDataDevices, dispatchDataTemp } = dataSlice.actions

export const store = configureStore({
  reducer: {
    user: userSlice.reducer,
    theme: themeSlice.reducer,
    data: dataSlice.reducer,
  },
})
