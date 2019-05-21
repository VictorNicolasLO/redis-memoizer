export interface ClientOpts {
  host?: string;
  port?: number;
  path?: string;
  url?: string;
  parser?: string;
  string_numbers?: boolean;
  return_buffers?: boolean;
  detect_buffers?: boolean;
  socket_keepalive?: boolean;
  socket_initialdelay?: number;
  no_ready_check?: boolean;
  enable_offline_queue?: boolean;
  retry_max_delay?: number;
  connect_timeout?: number;
  max_attempts?: number;
  retry_unfulfilled_commands?: boolean;
  auth_pass?: string;
  password?: string;
  db?: string | number;
  family?: string;
  rename_commands?: { [command: string]: string } | null;
  tls?: any;
  prefix?: string;
}

export declare interface MemoOptions {
  duration?: number;
  name: string;
  createId: Function;
}

export declare interface ForgetOptions {
  name: string;
  createId: Function;
}

export type TypeDescription = 'memo' | 'forget';

export declare interface DescriptionOption {
  action: TypeDescription;
  name?: string;
  duration?: number;
  createId: Function;
}

export declare interface ObjectDescription {
  [option: string]: DescriptionOption | Array<DescriptionOption>;
}

export declare class RedisMemo {
  redisClient: any;
  redisClientAsync: any;
  constructor(redisConnection: ClientOpts);

  memo(fn: Function, options: MemoOptions);

  forget(fn, options: ForgetOptions);

  fromObject(obj: any, ObjectDescription: ObjectDescription);
  createObjectMemoizer(description: any);
}

export declare function memo(
  createId: Function,
  duration?: number,
  name?: string,
): DescriptionOption;

export declare function forget(
  name: string,
  createId?: Function,
): DescriptionOption;

export declare interface DescriptionActions {
  memo: (createId: Function, duration?: number, name?: string) => {};
  forget: (name: string, createId?: Function) => {};
}
