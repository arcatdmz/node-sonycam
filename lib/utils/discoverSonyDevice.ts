import dgram from "dgram";

const SONY_API = "schemas-sony-com:service:ScalarWebAPI:1",
  SSDP_ADDRESS = "239.255.255.250",
  SSDP_PORT = 1900;

/**
 * Discover Sony devices supporting SSDP.
 *
 * @returns UPnP Device Description location (url)
 * @see {@link https://developer.sony.com/develop/audio-control-api/hardware-overview/discovery-process}
 */
export async function discoverSonyDevice(timeout?: number): Promise<string> {
  if (!timeout || timeout < 0) {
    timeout = 2000;
  }
  return new Promise<string>(function (resolve, reject) {
    try {
      const mSearchMessage = Buffer.from(
        "M-SEARCH * HTTP/1.1\r\n" +
          `HOST:${SSDP_ADDRESS}:${SSDP_PORT}\r\n` +
          'MAN:"ssdp:discover"\r\n' +
          "MX:1\r\n" +
          `ST:urn:${SONY_API}\r\n` +
          "\r\n"
      );
      const client = dgram.createSocket("udp4");
      let resolved = false;
      client.on("message", (message) => {
        if (resolved) {
          return;
        }
        const location = /LOCATION: (.*)/.exec(message.toString())[1];
        client.close();
        resolved = true;
        resolve(location);
      });
      client.on("error", (err) => {
        if (resolved) {
          return;
        }
        client.close();
        resolved = true;
        reject(err);
      });
      client.send(
        mSearchMessage,
        0,
        mSearchMessage.length,
        SSDP_PORT,
        SSDP_ADDRESS
      );
      setTimeout(() => {
        if (resolved) {
          return;
        }
        client.removeAllListeners();
        resolved = true;
        reject(new Error("Service discovery timeout"));
      }, timeout);
    } catch (error) {
      reject(error);
    }
  });
}
