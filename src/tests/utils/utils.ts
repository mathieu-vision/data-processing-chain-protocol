export const _yellow = (value: string) => {
  return `\x1b[93m${value}\x1b[37m`;
};
export const _green = (value: string) => {
  return `\x1b[32m${value}\x1b[37m`;
};
export const _object = (data: any) => {
  return `\x1b[90m${JSON.stringify(data, null, 2)}\x1b[37m`;
};
