import WebSocketConnection, {WebSocketMessageInterface} from "./WebSocketConnection"


/**
 * 1. Versucht eine WebScript Verbindung nach localhost:4567 aufzubauen.
 * 2. Die Erste Nachricht die gesendet wird, ist eine Versionsnummer und der Nachrichtentyp JSON oder BINARY
 * 2. Wenn die Verbindung erfolgreich war, kann ein Client von seiner Seite ein TAiInfo Objekt senden
 *    a) welches Format das hat, bestimmt der ausgehandelte Nachrichtentyp.
 * 3. Der Server kann auch ein TAiInfo Objekt senden.  
 *    a) durch eine Methode
 *    b) durch Anfordern des Clients
 */
export default class JsonWebSocketConnection extends WebSocketConnection implements WebSocketMessageInterface {
  constructor(socket: WebSocket, host: string, port: number) {
    super(host, port)

    socket.onmessage = (event) => {
      try {
        this.onMessage(event.data)
      } catch (e) {
        console.error(e)
      }
    }

    socket.onerror = (event) => {
      this.onError(event)
    }

    socket.onclose = (event) => {
      this.onClose(event)
    }
  }

  onMessage(event: MessageEvent<any>) {
    const json : JsonMessageEventData = JSON.parse(event.data)
  }

  onError(event: Event) {
    console.error(event)
  }

  onClose(event: CloseEvent) {
    console.info(event)    
  }
}

export type JsonMessageEventData = {
  command: string,
  payload: any
}