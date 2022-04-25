export interface SonyCamLiveviewHeaders {
  commonHeader: {
    startByte: 0xff;
    payloadType: number;
    frameNumber: number;
    timestamp: number;
  };
  payloadHeader: {
    payloadHeader: 0x24356879;
    payloadDataSize: number;
    paddingSize: number;
  };
}
