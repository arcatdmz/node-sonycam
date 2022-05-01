import EventEmitter from "events";
import fetch, { AbortError } from "node-fetch";
import semver from "semver";

import { RpcParameter } from "./RpcParameter";
import { RpcRequest } from "./RpcRequest";
import { RpcResponse } from "./RpcResponse";
import { SonyCamImageResponse } from "./SonyCamImageResponse";
import { SonyCamImageResponseEventEmitter } from "./SonyCamImageResponseEventEmitter";
import { SonyCamIntervalEventEmitter } from "./SonyCamIntervalEventEmitter";
import {
  parseSonyCamLiveviewDataHeaders,
  SonyCamLiveviewHeaderSize,
} from "./utils";
import { SonyCamLiveviewHeaders } from "./utils/SonyCamLiveviewHeaders";

/**
 * Utility class to fetch information from a Sony camera.
 *
 * 1. construct {@link SonyCam} instance with its service endpoint url
 * 2. call {@link SonyCam.connect} to fetch available API list
 * 3. call {@link SonyCam.startLiveview} to make the device start streaming images
 * 4. call {@link SonyCam.fetchLiveview} to start fetching liveview images
 * 5. call {@link SonyCam.stopLiveview} to make the device stop streaming images
 * 6. call {@link SonyCam.disconnect} to do some clean up
 *
 * @see {@link SonyCamImageResponse} - Liveview image information received by "image" event listeners
 */
export class SonyCam
  extends EventEmitter
  implements SonyCamImageResponseEventEmitter, SonyCamIntervalEventEmitter
{
  minVersionRequired = "2.0.0";
  connecting: boolean;
  connected: boolean;
  version: string;
  availableApiList: string[];
  liveviewUrl: string;
  private _fetchingLiveview: boolean;
  status: any;
  private _fetchingStatus: boolean;

  get liveviewing(): boolean {
    return !!this.liveviewUrl;
  }
  get fetchingLiveview(): boolean {
    return this._fetchingLiveview;
  }
  get fetchingStatus(): boolean {
    return this._fetchingStatus;
  }

  constructor(
    public sonyCamUrl: string = "http://192.168.122.1:8080/sony/camera"
  ) {
    super();
  }

  async call(
    method: string,
    params: RpcParameter[] = null
  ): Promise<RpcResponse> {
    const rpcReq: RpcRequest = {
      id: 1,
      version: "1.0",
      method,
      params: params || [],
    };
    const body = JSON.stringify(rpcReq);
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
    }, 2000);
    try {
      const res = await fetch(this.sonyCamUrl, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "content-length": String(Buffer.byteLength(body)),
        },
        signal: controller.signal,
        body,
      });
      if (!res.ok || res.status !== 200) {
        throw new Error(
          "Response error (http code " + res.status + " for " + method + ")"
        );
      }
      const parsedData = (await res.json()) as any,
        result = parsedData ? parsedData.result : null,
        error = parsedData ? parsedData.error : null;
      if (error) {
        // retry getEvent function call
        if (error.length > 0 && error[0] == 1 && method == "getEvent") {
          return this.call(method, params);
        }
      }
      if (error) {
        throw new Error(
          `Error during request for ${method}: ${
            error.length > 1 ? error[1] : JSON.stringify(error)
          }`
        );
      }
      return result;
    } catch (e) {
      if (e instanceof AbortError) {
        if (method !== "getEvent") {
          throw new Error(`Request timed out for ${method}`);
        }
      }
      throw e;
    } finally {
      clearTimeout(timeout);
    }
  }

  async connect(): Promise<string> {
    if (this.connecting) {
      throw new Error("Already trying to connect");
    }
    this.connecting = true;
    try {
      const version = await this.getAppVersion();
      if (!semver.gte(version, this.minVersionRequired)) {
        throw new Error(
          `Could not connect to camera -- remote control application must be updated (currently installed: ${version}, should be ${this.minVersionRequired} or newer)`
        );
      }
      this.availableApiList = await this.getAvailableApiList();
      if (this.availableApiList.includes("startRecMode")) {
        await this.call("startRecMode");
      }
      this.connected = true;
      return version;
    } catch (e) {
      throw e;
    } finally {
      this.connecting = false;
    }
  }

  async disconnect() {
    await this.stopLiveview();
    await this.stopFetchingStatus();
    if (
      Array.isArray(this.availableApiList) &&
      this.availableApiList.includes("stopRecMode")
    ) {
      await this.call("stopRecMode");
    }
    this.connected = false;
  }

  async getAppVersion(): Promise<string> {
    const res = await this.call("getApplicationInfo");
    if (!Array.isArray(res) || res.length < 2) {
      throw new Error(
        "getApplicationInfo failed with invalid response: " +
          JSON.stringify(res)
      );
    }
    // res[0]: app name
    // res[1]: app version
    this.version = res[1] as string;
    return this.version;
  }

  async getAvailableApiList(): Promise<string[]> {
    const res = await this.call("getAvailableApiList", null);
    if (!Array.isArray(res) || res.length < 1) {
      throw new Error(
        "getAvailableApiList failed with invalid response: " +
          JSON.stringify(res)
      );
    }
    return res[0] as string[];
  }

  async startLiveview(size?: "M" | "L"): Promise<string> {
    const res = await this.call(
      size ? "startLiveviewWithSize" : "startLiveview",
      size ? [size] : null
    );
    if (!Array.isArray(res) || res.length < 1) {
      throw new Error(
        "startLivewview failed with invalid response: " + JSON.stringify(res)
      );
    }
    this.liveviewUrl = res[0] as string;
    return this.liveviewUrl;
  }

  async stopLiveview(): Promise<void> {
    await this.call("stopLiveview", null);
    this.liveviewUrl = null;
  }

  async fetchLiveview(): Promise<void> {
    if (!this.liveviewing) {
      throw new Error("Call startLiveview before fetching images");
    }
    if (this._fetchingLiveview) {
      throw new Error("Already fetching liveview images");
    }
    const res = await fetch(this.liveviewUrl);
    if (!res.ok || res.status !== 200) {
      throw new Error(
        "Response error (http code " + res.status + " for fetching images)"
      );
    }
    this._fetchingLiveview = true;
    let headers: SonyCamLiveviewHeaders,
      payloadDataSize = 0,
      bufferIndex = 0,
      buffer = Buffer.alloc(0),
      imageBuffer: Buffer = null;
    res.body.on("data", (chunk: Buffer) => {
      if (!this.liveviewUrl) {
        return;
      }
      if (payloadDataSize === 0) {
        buffer = Buffer.concat([buffer, chunk]);
        if (buffer.byteLength >= SonyCamLiveviewHeaderSize) {
          headers = parseSonyCamLiveviewDataHeaders(buffer);

          // allocate buffer of payload data size for imageBuffer
          payloadDataSize = headers.payloadHeader.payloadDataSize;
          imageBuffer = Buffer.alloc(payloadDataSize);
          buffer = buffer.slice(SonyCamLiveviewHeaderSize);
          if (buffer.byteLength > 0) {
            buffer.copy(imageBuffer, bufferIndex, 0, buffer.byteLength);
            bufferIndex += buffer.byteLength;
            payloadDataSize -= buffer.byteLength;
          }
        }
      } else {
        const chunkLength = chunk.byteLength;
        chunk.copy(imageBuffer, bufferIndex, 0, chunkLength);
        bufferIndex += chunkLength;
        if (chunkLength < payloadDataSize) {
          payloadDataSize -= chunkLength;
        } else {
          if (headers.commonHeader.payloadType === 0x01) {
            this.emit("image", {
              frameNumber: headers.commonHeader.frameNumber,
              timestamp: headers.commonHeader.timestamp,
              dataSize: headers.payloadHeader.payloadDataSize,
              data: imageBuffer,
            });
          }
          buffer = Uint8Array.prototype.slice.call(
            chunk,
            payloadDataSize + headers.payloadHeader.paddingSize
          );
          bufferIndex = 0;
          payloadDataSize = 0;
        }
      }
    });
    res.body.on("close", () => {
      this._fetchingLiveview = false;
    });
  }

  async startFetchingStatus(): Promise<any> {
    if (!this._fetchingStatus) {
      this._fetchingStatus = true;
      this.status = await this.call("getEvent", [false]);
      this._fetchingStatus && this.emit("status", this.status);
      this.continuouslyFetchStatus();
    }
    return this.status;
  }

  private async continuouslyFetchStatus() {
    while (this._fetchingStatus) {
      try {
        const result = await this.call("getEvent", [true]);
        if (result.length > this.status.length) {
          this.status.length = result.length;
        }
        const changed: number[] = [];
        for (let i = 0; i < result.length; i++) {
          const item = result[i];
          if (!item || (Array.isArray(item) && item.length <= 0)) {
            continue;
          }
          this.status[i] = item;
          changed.push(i);
        }
        this._fetchingStatus && this.emit("status", this.status);
        this.emit("statusChange", changed);
      } catch (e) {
        if (e instanceof AbortError) {
          continue;
        }
        throw e;
      }
    }
  }

  stopFetchingStatus() {
    this._fetchingStatus = false;
  }
}
