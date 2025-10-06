declare global {
  interface Window {
    Stockfish: () => Promise<{
      addMessageListener: (callback: (message: string) => void) => void;
      postMessage: (message: string) => void;
    }>;
  }
}

export {};