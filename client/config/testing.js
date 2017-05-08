'use strict';

// Stub out console.log
// console.log = function () {};
// console.error = function() {};
Object.defineProperty(window, "matchMedia", {
  value: jest.fn(() => ({
    addListener: () => {},
    removeListener: () => {},
    matches: true,
  })),
});
