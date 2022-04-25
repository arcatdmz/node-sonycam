import { SonyCamSpec } from "./SonyCamSpec";

export function findSonyCamUrl(spec: SonyCamSpec) {
  return (
    spec.device["av:X_ScalarWebAPI_DeviceInfo"][
      "av:X_ScalarWebAPI_ServiceList"
    ]["av:X_ScalarWebAPI_Service"].find(
      (service) => service["av:X_ScalarWebAPI_ServiceType"] === "camera"
    )["av:X_ScalarWebAPI_ActionList_URL"] + "/camera"
  );
}
