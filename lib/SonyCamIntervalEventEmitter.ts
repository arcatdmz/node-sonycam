export interface SonyCamIntervalEventEmitter {
  addListener(
    eventName: "interval",
    eventListener: (interval: number) => void
  ): this;
  on(eventName: "interval", eventListener: (interval: number) => void): this;
  once(eventName: "interval", eventListener: (interval: number) => void): this;
  removeListener(
    eventName: "interval",
    eventListener: (interval: number) => void
  ): this;
  off(eventName: "interval", eventListener: (interval: number) => void): this;
}
