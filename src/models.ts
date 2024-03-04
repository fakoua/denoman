export type ServiceModel = {
  acceptPause: boolean;
  acceptStop: boolean;
  caption: string;
  delayedAutoStart: boolean;
  description: string;
  desktopInteract: boolean;
  displayName: string;
  errorControl: string;
  exitCode: number;
  name: string;
  processId: number;
  serviceType: string;
  started: boolean;
  startMode: string;
  startName: string;
  state: string;
  status: string;
  pathName: string;
  isSystemDriver: boolean;
};

export type SystemModel = {
  caption: string;
  csName: string;
  osArchitecture: string;
  processorName: string;
  memory: string;
};

export type DependenciesModel = {
  antecedent: string;
  dependent: string;
};

export type DiskModel = {
  name: string;
  diskReadBytesPersec: number;
  diskWriteBytesPersec: number;
  percentDiskTime: number;
};

export type NetworkModel = {
  name: string;
  bytesReceivedPersec: number;
  bytesSentPersec: number;
  bytesTotalPersec: number;
};

export type PerfmonModel = {
  cpu: number;
  memory: {
    totalMemory: number;
    freeMemory: number;
  };
  disks: DiskModel[];
  networks: NetworkModel;
};

export type WinRMPayload = {
  username: string;
  password: string;
  hostname: string;
  port: number;
  protocol: string;
};

export type ProcessModel = {
  processName: string;
  id: number;
  cpu: number;
  ws: number;
  vm: number;
  startTime: string;
};

export type DeviceModel = {
  caption: string;
  description: string;
  status: string;
  manufacturer: string;
  class: string;
  id: number;
};

export type UserModel = {
  name: string;
  fullName: string;
  description: string;
  enabled: boolean;
  userMayChangePassword: boolean;
  passwordExpires: string;
  passwordRequired: boolean;
  passwordChangeableDate: string;
  lastLogon: string;
  passwordLastSet: string;
  groups?: string[];
};

export type GroupModel = {
  name: string;
  description: string;
  members?: string[];
};

export type UserGroups = {
  user: string;
  groups: string[];
};
