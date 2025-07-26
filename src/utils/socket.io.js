import { io as ioclient } from "socket.io-client"

let url = "http://128.199.70.155:80"

const socket = ioclient(url, { autoConnect: false, reconnection: true, reconnectionAttempts: Infinity })

export default socket
