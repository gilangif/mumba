import { io as ioclient } from "socket.io-client"

const url = "http://192.168.68.78:3000"
const socket = ioclient(url, { autoConnect: false, reconnection: true, reconnectionAttempts: Infinity })

export default socket