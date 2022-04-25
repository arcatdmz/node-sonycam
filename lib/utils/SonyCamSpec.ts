import { SonyCamDeviceServiceListItem } from "./SonyCamDeviceServiceListItem";
import { SonyCamServiceListItem } from "./SonyCamServiceListItem";

export interface SonyCamSpec {
  specVersion: {
    major: number;
    minor: number;
  };
  device: {
    deviceType: number;
    friendlyName: string;
    manufacturer: string;
    manufacturerURL: string;
    modelDescription: string;
    modelName: string;
    UDN: string;
    serviceList: {
      service: SonyCamServiceListItem[];
    };
    "av:X_ScalarWebAPI_DeviceInfo": {
      "av:X_ScalarWebAPI_Version": string;
      "av:X_ScalarWebAPI_ServiceList": {
        "av:X_ScalarWebAPI_Service": SonyCamDeviceServiceListItem[];
      };
      "av:X_ScalarWebAPI_ImagingDevice": {
        "av:X_ScalarWebAPI_LiveView_URL": string;
        "av:X_ScalarWebAPI_DefaultFunction": string;
      };
    };
  };
}
