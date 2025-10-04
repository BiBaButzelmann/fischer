declare module "stockfish.wasm" {
  interface StockfishInstance {
    addMessageListener: (callback: (message: string) => void) => void;
    postMessage: (message: string) => void;
  }

  function Stockfish(): Promise<StockfishInstance>;
  export default Stockfish;
}

declare global {
  interface Window {
    Stockfish: () => Promise<{
      addMessageListener: (callback: (message: string) => void) => void;
      postMessage: (message: string) => void;
    }>;
  }
}