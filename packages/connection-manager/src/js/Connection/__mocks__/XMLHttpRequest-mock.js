const xhrMockClass = () => ({
  open: jest.fn(),
  setRequestHeader: jest.fn(),
  send: jest.fn(),
  addEventListener: jest.fn()
});

window.XMLHttpRequest = jest.fn().mockImplementation(xhrMockClass);
