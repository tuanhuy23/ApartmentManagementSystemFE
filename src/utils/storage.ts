export const storage = {
    set: (key: string, value: unknown) => localStorage.setItem(key, JSON.stringify(value)),
    get: (key: string) => {
      const val = localStorage.getItem(key);
      return val ? JSON.parse(val) : null;
    },
    remove: (key: string) => localStorage.removeItem(key),
  };