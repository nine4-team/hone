export const authStorage = {
  getItem(key: string) {
    return globalThis.localStorage?.getItem(key) ?? null;
  },
  setItem(key: string, value: string) {
    globalThis.localStorage?.setItem(key, value);
  },
  removeItem(key: string) {
    globalThis.localStorage?.removeItem(key);
  },
};
