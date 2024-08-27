 /**
   * Corrected priority checks and used getPriority correctly in the sorting and filtering.
   * Should move getPriority outside of the WalletPage component to avoid re-creating it on each render.
   */
 export const getPriority = (blockchain: string): number => {
    switch (blockchain) {
      case "Osmosis":
        return 100;
      case "Ethereum":
        return 50;
      case "Arbitrum":
        return 30;
      case "Zilliqa":
      case "Neo":
        return 20;
      default:
        return -99;
    }
  };