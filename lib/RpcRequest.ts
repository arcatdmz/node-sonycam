import { RpcParameter } from "./RpcParameter";

export interface RpcRequest {
  id: number;
  version: string;
  method: string;
  params: RpcParameter[];
}
