import JsonWebSocketConnection from "./JsonWebSocketConnection"


export interface WebSocketConnectInterface {
  connect(): Promise<WebSocketMessageInterface>
}

export interface WebSocketMessageInterface {
  onMessage(event: MessageEvent<any>): void  
}

export interface WebSocketInitMessage {
  initMessage(socket: WebSocket, event: MessageEvent<any>, {host, port}: {host: string, port: number}): Promise<WebSocketMessageInterface>
}

/**
 * 1. Versucht eine WebScript Verbindung nach localhost:4567 aufzubauen.
 * 2. Die Erste Nachricht die gesendet wird, ist eine Versionsnummer und der Nachrichtentyp JSON oder BINARY
 * 2. Wenn die Verbindung erfolgreich war, kann ein Client von seiner Seite ein TAiInfo Objekt senden
 *    a) welches Format das hat, bestimmt der ausgehandelte Nachrichtentyp.
 * 3. Der Server kann auch ein TAiInfo Objekt senden.  
 *    a) durch eine Methode
 *    b) durch Anfordern des Clients
 */
export default class WebSocketServer {

  private port: number
  private host: string

  constructor(host: string, port: number) {
    this.port = port
    this.host = host
  }

  connect(initMessage: WebSocketInitMessage): Promise<WebSocketMessageInterface> {
    return new Promise((resolve, reject) => {
      const socket = new WebSocket(`ws://${this.host}:${this.port}`, ['application/json', 'application/octet-stream'])

      socket.onerror = (error) => {
        reject(error)
      }

      socket.onclose = (error) => {
        reject(error)
      }

      socket.onopen = () => {
        socket.onmessage = async (event) => {
          const newInstanz: WebSocketMessageInterface = await initMessage.initMessage(socket, event, {host: this.host, port: this.port})
          resolve(newInstanz)
        }
      }
    })
  }


}
