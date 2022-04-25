import { SonyCamImageResponse } from "./SonyCamImageResponse";

export interface SonyCamImageResponseEventEmitter {
  addListener(
    eventName: "image",
    eventListener: (imageData: SonyCamImageResponse) => void
  ): this;
  on(
    eventName: "image",
    eventListener: (imageData: SonyCamImageResponse) => void
  ): this;
  once(
    eventName: "image",
    eventListener: (imageData: SonyCamImageResponse) => void
  ): this;
  removeListener(
    eventName: "image",
    eventListener: (imageData: SonyCamImageResponse) => void
  ): this;
  off(
    eventName: "image",
    eventListener: (imageData: SonyCamImageResponse) => void
  ): this;
}
