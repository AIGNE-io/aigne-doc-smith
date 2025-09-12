// Mock ChatModel for testing
export class MockChatModel {
  constructor(options = {}) {
    this.options = options;
  }

  process() {
    throw new Error("Method not implemented in test mock");
  }
}

export const loadModel = () => new MockChatModel();
