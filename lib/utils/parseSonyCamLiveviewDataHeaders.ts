import { SonyCamLiveviewCommonHeaderSize } from "./SonyCamLiveviewCommonHeaderSize";
import { SonyCamLiveviewHeaders } from "./SonyCamLiveviewHeaders";

export function parseSonyCamLiveviewDataHeaders(
  buffer: Buffer
): SonyCamLiveviewHeaders {
  const startByte = buffer.readUInt8(0) as 0xff;
  const payloadType = buffer.readUInt8(1);
  const frameNumber = buffer.readUint16BE(2);
  const timestamp = buffer.readUint32BE(4);

  const payloadHeader = buffer.readUint32BE(
    SonyCamLiveviewCommonHeaderSize
  ) as 0x24356879;
  const payloadDataSize =
    buffer.readUInt8(SonyCamLiveviewCommonHeaderSize + 4) * 0x10000 +
    buffer.readUInt16BE(SonyCamLiveviewCommonHeaderSize + 5);
  const paddingSize = buffer.readUInt8(SonyCamLiveviewCommonHeaderSize + 7);

  return {
    commonHeader: {
      startByte,
      payloadType,
      frameNumber,
      timestamp,
    },
    payloadHeader: {
      payloadHeader,
      payloadDataSize,
      paddingSize,
    },
  };
}
