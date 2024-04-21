export type IPatch = {
  patchId: string,
  shouldRun: (currentVersion: string) => boolean,
  alwaysRun: boolean,
  run(): Promise<any>,
}
