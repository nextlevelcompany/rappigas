import { Client, IMessage } from "@stomp/stompjs";
import { PedidoDetalle } from "../api/pedidos.api";

export interface EventoPedidoSocket {
  tipoEvento: "NUEVO_PEDIDO" | "ESTADO_ACTUALIZADO" | "CANCELADO";
  mensaje: string;
  pedido: PedidoDetalle;
}

export type ListenerPedido = (evento: EventoPedidoSocket) => void;

class GestorWebSocketPedidos {
  private cliente: Client | null = null;
  private conectado: boolean = false;
  private suscripciones: Map<string, (evento: EventoPedidoSocket) => void> = new Map();

  public iniciar(onEstadoConexion?: (conectado: boolean) => void): void {
    if (typeof window === "undefined" || this.cliente) {
      return;
    }

    const wsUrl =
      typeof window !== "undefined" &&
      window.location.hostname &&
      window.location.hostname !== "localhost" &&
      window.location.hostname !== "127.0.0.1"
        ? `ws://${window.location.hostname}:8080/ws`
        : process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080/ws";

    this.cliente = new Client({
      brokerURL: wsUrl,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (msg) => {
        // En desarrollo para depuración de sockets
        if (process.env.NODE_ENV === "development") {
          console.debug("[STOMP]", msg);
        }
      },
      onConnect: () => {
        this.conectado = true;
        if (onEstadoConexion) onEstadoConexion(true);

        // Re-suscribir todos los canales activos
        this.suscripciones.forEach((callback, destino) => {
          this.suscribirDestino(destino, callback);
        });
      },
      onDisconnect: () => {
        this.conectado = false;
        if (onEstadoConexion) onEstadoConexion(false);
      },
      onStompError: (frame) => {
        console.warn("[STOMP Error]", frame.headers["message"]);
      },
    });

    this.cliente.activate();
  }

  public suscribirEmpresa(tenantId: number, callback: ListenerPedido): () => void {
    const destino = `/topic/empresas/${tenantId}/pedidos`;
    this.suscripciones.set(destino, callback);

    if (this.conectado && this.cliente) {
      this.suscribirDestino(destino, callback);
    }

    return () => {
      this.suscripciones.delete(destino);
    };
  }

  public suscribirPedido(pedidoPublicId: string, callback: ListenerPedido): () => void {
    const destino = `/topic/pedidos/${pedidoPublicId}`;
    this.suscripciones.set(destino, callback);

    if (this.conectado && this.cliente) {
      this.suscribirDestino(destino, callback);
    }

    return () => {
      this.suscripciones.delete(destino);
    };
  }

  private suscribirDestino(destino: string, callback: ListenerPedido) {
    if (!this.cliente || !this.conectado) return;

    this.cliente.subscribe(destino, (mensaje: IMessage) => {
      try {
        const payload: EventoPedidoSocket = JSON.parse(mensaje.body);
        callback(payload);
      } catch (err) {
        console.error("Error al deserializar evento de pedido:", err);
      }
    });
  }

  public desconectar(): void {
    if (this.cliente) {
      this.cliente.deactivate();
      this.cliente = null;
      this.conectado = false;
    }
  }

  public estaConectado(): boolean {
    return this.conectado;
  }
}

export const pedidosSocket = new GestorWebSocketPedidos();
