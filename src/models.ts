export type ServiceModel = {
    acceptPause: boolean,
    acceptStop: boolean,
    caption: string,
    delayedAutoStart: boolean,
    description: string,
    desktopInteract: boolean,
    displayName: string,
    errorControl: string,
    exitCode: number,
    name: string,
    processId: number,
    serviceType: string,
    started: boolean,
    startMode: string,
    startName: string,
    state: string,
    status: string,
    pathName: string,
    isSystemDriver: boolean,
}

export type SystemModel = {
    caption: string, 
    csName: string,
    osArchitecture: string,
    processorName: string,
    memory: string,
}

export type DependenciesModel = {
    antecedent: string,
    dependent: string,
}

export type WinRMPayload = {
    username: string,
    password: string,
    host: string,
    port: number, 
    protocol: string,
}