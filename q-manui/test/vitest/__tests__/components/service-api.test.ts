import { describe, expect, it, vi } from 'vitest';

import * as api  from 'src/components/service-api';
import { ControlAction, ServiceModel, ShellResponse, WinRMPayload } from 'src/components/models';

const serviceData: ServiceModel = {
  acceptPause: false,
  acceptStop: true,
  caption: 'Adobe Acrobat Update Service',
  delayedAutoStart: false,
  description: 'Adobe Acrobat Updater keeps your Adobe software up to date.',
  desktopInteract: false,
  displayName: 'Adobe Acrobat Update Service',
  errorControl: 'Ignore',
  exitCode: 0,
  isSystemDriver: false,
  name: 'AdobeARMservice',
  pathName: '"C:|Program Files (x86)|Common Files|Adobe|ARM|1.0|armsvc.exe"',
  processId: 28976,
  serviceType: 'Own Process',
  startMode: 'Auto',
  startName: 'LocalSystem',
  started: true,
  state: 'Running',
  status: 'OK',
};

const shellResponse: ShellResponse = {
  stdout: 'Welcome to Microsoft',
  stderr: '',
  exitCode: 1,
};

vi.mock('axios', () => ({
  default: {
    create: () => ({
      interceptors: {
        request: { use: vi.fn(), eject: vi.fn() },
        response: { use: vi.fn(), eject: vi.fn() },
      },
      get: vi.fn((route) => {
        return Promise.resolve({ route: route, data: [] });
      }),
      post: vi.fn((route, data) => {
        if (route.endsWith('api/command')) {
          return Promise.resolve({ route: route, data: shellResponse, status: 200});
        }
        if (route.endsWith('api/service') && data.serviceName === 'noservice') {
          return Promise.resolve({ route: route, status: 500});
        }
        if(route.endsWith('api/service') && data.serviceName !== 'noservice') {
          return Promise.resolve({ route: route, data: serviceData, status: 200});
        }
        if(route.endsWith('api/exit')) {
          return Promise.resolve({ route: route, data: [], status: 200});
        }
      }),
      put: vi.fn((route, data) => {
        return Promise.resolve({ route: route, data: data });
      }),
      delete: vi.fn((route) => {
        return Promise.resolve({ route: route, data: [] });
      }),
    }),
  },
}));

describe('controlService', () => {
  it('should return the service model when the API call is successful', async () => {
    // Arrange
    const params: WinRMPayload = {
      username: 'user',
      password: '',
      hostname: 'fake1',
      port: 22,
      protocol: 'http',
     };
    const action: ControlAction = 'Start';
    const name = 'serviceName'; // provide the desired service name

    // Act
    const result = await api.controlService(params, action, name);

    // Assert
    expect(result).toBeDefined();
    expect(result).toEqual(serviceData);
    // Add more assertions based on the expected behavior of the function
  });

  it('should return undefined when the API call fails', async () => {
    // Arrange
    const params: WinRMPayload = {
      username: 'user',
      password: '',
      hostname: 'fake3',
      port: 22,
      protocol: 'http',
     };
    const action: ControlAction = 'Start';
    const name = 'noservice'; // provide the desired service name
    // Act
    const result = await api.controlService(params, action, name);

    // Assert
    expect(result).toBeUndefined();
    // Add more assertions based on the expected behavior of the function
  });
});

describe('execCommand', () => {
  it('should return the shell response when the API call is successful', async () => {
    // Arrange
    const params: WinRMPayload = {
      username: 'user',
      password: '',
      hostname: 'fake4',
      port: 22,
      protocol: 'http',
    };
    const command = 'test command';
    const isPowerShell = true;

    // Act
    const result = await api.execCommand(params, command, isPowerShell);

    // Assert
    // Add assertions based on the expected behavior of the function
    expect(result).toBeDefined();
    expect(result).toEqual(shellResponse);
    // Add more assertions based on the expected behavior of the function
  });
});

describe('exitApp', () => {
  it('should not throw an exception', async () => {
    expect(async () => api.exitApp()).not.toThrow();
  });
});
