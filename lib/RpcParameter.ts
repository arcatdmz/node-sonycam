export type RpcParameter =
  | {
      [key: string]: string;
    }
  | string
  | string[]
  | number
  | boolean;
