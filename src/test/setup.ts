import "@testing-library/jest-dom";

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => { },
    removeListener: () => { },
    addEventListener: () => { },
    removeEventListener: () => { },
    dispatchEvent: () => { },
  }),
});

let uuidCounter = 0;
Object.defineProperty(window.crypto, "randomUUID", {
  writable: true,
  value: () => `mocked-uuid-${uuidCounter++}`,
});
