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
export async function discoverSonyDevice(): Promise<string> {
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
      client.on("message", (message) => {
        const location = /LOCATION: (.*)/.exec(message.toString())[1];
        client.close();
        resolve(location);
      });
      client.on("error", (err) => {
        client.close();
        reject(err);
      });
      client.send(
        mSearchMessage,
        0,
        mSearchMessage.length,
        SSDP_PORT,
        SSDP_ADDRESS
      );
    } catch (error) {
      reject(error);
    }
  });
}
