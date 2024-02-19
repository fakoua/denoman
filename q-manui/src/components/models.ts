export interface Todo {
  id: number;
  content: string;
}

export interface Meta {
  totalCount: number;
}

export interface ServiceModel {
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
}

export type SystemModel = {
  caption: string;
  csName: string;
  memory: string;
  osArchitecture: string;
  processorName: string;
};

export type DependenciesModel = {
  antecedent: string;
  dependent: string;
};

export type TreeNodeDeps = {
  caption: string;
  name: string;
  lazy: boolean;
  icon: string;
  state: string;
};

export type ControlAction = 'Start' | 'Stop' | 'Suspend' | 'Resume' | 'Restart';

export type WinRMPayload = {
  username: string;
  password: string;
  hostname: string;
  port: number;
  protocol: string;
};

export type ServiceStatusModel = {
  running?: number;
  stopped?: number;
  automatic?: number;
  manual?: number;
  total?: number;
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

export type ShellResponse = {
  stdout: string,
  stderr: string,
  exitCode: number,
  state?: string,
  error?: {
      reason?: string,
      message?: string
  }
};
