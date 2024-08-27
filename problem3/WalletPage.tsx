import React, { useEffect, useMemo, useState } from "react";
import { useWalletBalances } from "./hooks/useWalletBalances";
import { makeStyles } from "@material-ui/core/styles";
import { getPriority } from "./utils";
import { priceURL } from "./constants";
import WalletRow from "./components/WalletRow/WalletRow";

interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: string; // Missing in the original code
}

// create style using makeStyles from Material-UI
const useStyles = makeStyles({
  row: {
    // define row styles
  },
});

interface TokenPrice {
  currency: string;
  price: number;
  date: Date;
}

// 2. Implement the Datasource class so that it can retrieve the prices required.
class Datasource {
  private url: string;

  constructor(url: string) {
    this.url = url;
  }

  // async get price data
  async getPrices(): Promise<TokenPrice[]> {
    try {
      const response = await fetch(this.url);
      if (!response.ok) {
        throw new Error("Failed to fetch roken prices");
      }
      return response.json();
    } catch (error) {
      throw new Error("Failed to fetch token prices: " + error.message);
    }
  }
}

// Fix the WalletPageProp add children to the interface
interface WalletPageProps {
  children?: React.ReactNode;
}

const WalletPage: React.FC<WalletPageProps> = (props: WalletPageProps) => {
  const { children, ...rest } = props;
  const balances = useWalletBalances(); // add custom hook to get wallet balances
  const classes = useStyles(); // create styles using makeStyles
  const [prices, setPrices] = useState<TokenPrice[]>([]); // Fix TokenPrice type

  useEffect(() => {
    const datasource = new Datasource(priceURL);
    datasource
      .getPrices()
      .then(setPrices)
      .catch((error) => {
        // fix console.err(error); to console.error(error);
        console.error(error);
      });
  }, []);

 
  // The sortedBalances array is created using useMemo to avoid redundant calculations and re-renders.
  const sortedBalances = useMemo(() => {
    return balances
      .filter((balance: WalletBalance) => {
        const balancePriority = getPriority(balance.blockchain);
        return balancePriority > -99 && balance.amount > 0; // filter out balances with negative priority or zero amount
      })
      .sort((lhs: WalletBalance, rhs: WalletBalance) => {
        return getPriority(rhs.blockchain) - getPriority(lhs.blockchain);
      });
  }, [balances]); // fix redundant dependency prices


  // 3. The formattedBalances array is created using map on sortedBalances to add a formatted property to each balance.
  // But we can format the balances directly in the WalletRow component to avoid redundant calculations.
  // the sortedBalances array is sorted based on the priority of each balance's blockchain it should be memoized to avoid redundant calculations and re-renders
  const rows = useMemo(() => {
    return sortedBalances.map((balance: WalletBalance, index: number) => {
      const tokenPrice: number = prices.find(
        (price: TokenPrice) => price.currency === balance.currency
      );
      const usdValue = tokenPrice ? tokenPrice * balance.amount : 0;
      return (
        <WalletRow
          className={classes.row}
          key={`${balance.currency}-${index}`} // Better unique key
          amount={balance.amount}
          usdValue={usdValue.toFixed(2)}
          formattedAmount={balance.amount.toFixed(2)} // should change number decimal places depending on the currency, e.g. 2 for USD, 8 for BTC etc.
        />
      );
    });
  }, [sortedBalances, prices]);

  return <div {...rest}>{rows}</div>;
};

export default WalletPage;
