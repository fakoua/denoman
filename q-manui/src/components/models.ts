/**
 * Represents a service model.
 */
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

/**
 * Represents a system model.
 */
export type SystemModel = {
  caption: string;
  csName: string;
  memory: string;
  osArchitecture: string;
  processorName: string;
};

/**
 * Represents dependencies between services.
 */
export type DependenciesModel = {
  antecedent: string;
  dependent: string;
};

/**
 * Represents a tree node with dependencies.
 */
export type TreeNodeDeps = {
  caption: string;
  name: string;
  lazy: boolean;
  icon: string;
  state: string;
};

/**
 * Represents a control action for a service.
 */
export type ControlAction = 'Start' | 'Stop' | 'Suspend' | 'Resume' | 'Restart';

/**
 * Represents the payload for a WinRM connection.
 */
export type WinRMPayload = {
  username: string;
  password: string;
  hostname: string;
  port: number;
  protocol: string;
};

/**
 * Represents the status of services.
 */
export type ServiceStatusModel = {
  running?: number;
  stopped?: number;
  automatic?: number;
  manual?: number;
  total?: number;
};

/**
 * Represents disk information.
 */
export type DiskModel = {
  name: string;
  diskReadBytesPersec: number;
  diskWriteBytesPersec: number;
  percentDiskTime: number;
};

/**
 * Represents network information.
 */
export type NetworkModel = {
  name: string;
  bytesReceivedPersec: number;
  bytesSentPersec: number;
  bytesTotalPersec: number;
};

/**
 * Represents performance monitor information.
 */
export type PerfmonModel = {
  cpu: number;
  memory: {
    totalMemory: number;
    freeMemory: number;
  };
  disks: DiskModel[];
  networks: NetworkModel;
};

/**
 * Represents the response from a shell command execution.
 */
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

/**
 * Represents a process information.
 */
export type ProcessModel = {
  processName: string;
  id: number;
  cpu: number;
  ws: number;
  vm: number;
  startTime: string;
};

/**
 * Represents a parent process with its children processes.
 */
export type ParentProcessModel =  Omit<ProcessModel, 'id' | 'startTime' | 'vm'> & {
  children: ProcessModel[];
};

/**
 * Represents props for an expanded row.
 */
export type ExpandedRowProps = {
  expand: boolean;
  rowIndex: number;
};

export type DeviceModel = {
  caption: string;
  description: string;
  status: string;
  manufacturer: string;
  class: string;
  id: number;
}

export type TreeModel = {
  label : string,
  icon: string,
  id: string,
  color: string,
  children?: TreeModel[],
 }
