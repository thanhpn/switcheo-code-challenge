import { Inter } from "next/font/google";
import { SwapState, TokenPrice } from "@/interfaces";
import { useEffect, useMemo, useState } from "react";
import SelectTokenModal from "@/components/SelectTokenModal/SelectTokenModal";
import TokenSwapInput, {
  TokenSide,
} from "@/components/TokenSwapInput/TokenSwapInput";
import {
  DEFAULT_DEADLINE,
  DEFAULT_SLIPPAGE_TOLERANCE,
  TOKEN_PRICE_API,
} from "@/constants";
import { sleep, random } from "@/utils";
import SwappButton from "@/components/SwapButton/SwappButton";
import SwapTab, { SwapTabInfo } from "@/components/SwapTab/SwapTab";
import SwappSettingModal from "@/components/SwapSettingModal/SwappSettingModal";
import ConfirmSwapModal from "@/components/ConfirmSwapModal/ConfirmSwapModal";

const inter = Inter({ subsets: ["latin"] });

interface SwapPricePair {
  fromToken?: TokenPrice;
  toToken?: TokenPrice;
  fromAmount?: string;
  toAmount?: string;
  fromBalance: number;
  toBalance: number;
}

enum WalletState {
  CONNECTTING,
  CONNECTED,
  DISCONNECTED,
}

const InitSwapTabs = [
  {
    id: "swap",
    title: "Swap",
    active: true,
  },
  {
    id: "limit",
    title: "Limit",
    active: false,
  },
  {
    id: "send",
    title: "Send",
    active: false,
  },
  {
    id: "buy",
    title: "Buy",
    active: false,
  },
];

const SwapPage = () => {
  const [walletState, setWalletState] = useState<WalletState>(
    WalletState.DISCONNECTED
  );
  const [swapState, setSwapState] = useState<SwapState>(SwapState.IDLE);
  const [tokenPrices, setTokenPrices] = useState<TokenPrice[]>([]);
  const [swapTokenPair, setSwapTokenPair] = useState<SwapPricePair>({
    fromBalance: 10,
    toBalance: 20,
  });
  const [slippage, setSlippage] = useState<number>(DEFAULT_SLIPPAGE_TOLERANCE);
  const [tabs, setTabs] =
    useState<{ id: string; title: string; active: boolean }[]>(InitSwapTabs);

  const [isShowSelectToken, setIsShowSelectToken] = useState<boolean>(false);
  const [isShowSettingModal, setIsShowSettingModal] = useState<boolean>(false);
  const [isShowConfirmSwapModal, setIsShowConfirmSwapModal] =
    useState<boolean>(false);

  const getTokenPrices = async () => {
    try {
      const response = await fetch(TOKEN_PRICE_API);
      const tokenPrices = await response.json();
      // filter duplicate token
      const uniqueTokenPrices = tokenPrices.filter(
        (token: TokenPrice, index: number, self: TokenPrice[]) =>
          index === self.findIndex((t) => t.currency === token.currency)
      );
      // filter token with price > 0
      uniqueTokenPrices.filter((token: TokenPrice) => token.price > 0);

      setTokenPrices(uniqueTokenPrices);
    } catch (error) {
      console.error("Error fetching token prices", error);
    }
  };

  useEffect(() => {
    getTokenPrices();
  }, []);

  // auto reload token price and calculate to amount every 10s
  useEffect(() => {
    const interval = setInterval(async () => {
      await getTokenPrices();
      if (swapTokenPair.fromToken && swapTokenPair.toToken) {
        const toAmount = convertToAmount(
          swapTokenPair.fromAmount,
          swapTokenPair.fromToken,
          swapTokenPair.toToken
        );
        setSwapTokenPair({ ...swapTokenPair, toAmount });
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [swapTokenPair]);

  const handleCloseSelectToken = () => {
    setIsShowSelectToken(false);
  };
  // handle select token from list
  const handleSelectToken = (token: TokenPrice) => {
    let fromToken = swapTokenPair.fromToken;
    let toToken = swapTokenPair.toToken;
    if (
      swapState === SwapState.SELECT_FROM_TOKEN ||
      swapState === SwapState.IDLE
    ) {
      if (
        swapTokenPair.toToken &&
        swapTokenPair.toToken.currency === token.currency
      ) {
        toToken = undefined;
        fromToken = token;
      } else {
        fromToken = token;
      }
      setSwapState(SwapState.SELECT_TO_TOKEN);
    } else {
      if (
        swapTokenPair.fromToken &&
        swapTokenPair.fromToken.currency === token.currency
      ) {
        fromToken = undefined;
        toToken = token;
      } else {
        toToken = token;
      }
      setSwapState(SwapState.SWAP);
    }

    let toAmount = swapTokenPair.toAmount;
    let fromAmount = swapTokenPair.fromAmount;

    if (fromToken && toToken && swapTokenPair.fromAmount) {
      // convert from amount to to amount if user have selected both from and to token
      toAmount = convertToAmount(swapTokenPair.fromAmount, fromToken, toToken);
    } else if (!fromToken || !toToken) {
      // reset to amount if user have not selected both from and to token
      toAmount = "";
    } else if (fromToken && toToken && toAmount) {
      // convert to amount to from amount if user have selected both from and to token and to amount
      fromAmount = convertToAmount(toAmount, toToken, fromToken);
    }


    setSwapTokenPair({
      ...swapTokenPair,
      toToken,
      fromToken,
      fromAmount,
      toAmount,
    });
    handleCloseSelectToken();
  };

  const convertToAmount = (
    amount?: string,
    from?: TokenPrice,
    to?: TokenPrice
  ) => {
    const amountValue = parseFloat(amount || "0");
    if (from && to && amount) {
      const valueUSD = amountValue * from.price;
      const toAmount = valueUSD / to.price;
      return toAmount.toString();
    }
    return "";
  };
  // convert from amount to to amount
  const handleInputAmount = (amount: string, side: TokenSide) => {
    setSwapState(SwapState.CALCULATING);
    if (side === TokenSide.FROM) {
      const toAmount = convertToAmount(
        amount,
        swapTokenPair.fromToken,
        swapTokenPair.toToken
      );
      setSwapTokenPair({ ...swapTokenPair, fromAmount: amount, toAmount });
    } else {
      const fromAmount = convertToAmount(
        amount,
        swapTokenPair.toToken,
        swapTokenPair.fromToken
      );
      setSwapTokenPair({ ...swapTokenPair, fromAmount, toAmount: amount });
    }
    setSwapState(SwapState.SWAP);
  };

  const handleSwapInputArrow = () => {
    let toAmount = swapTokenPair.fromAmount;

    if (swapTokenPair.toToken && swapTokenPair.fromToken) {
      toAmount = convertToAmount(
        swapTokenPair.toAmount,
        swapTokenPair.toToken,
        swapTokenPair.fromToken
      );
    }
    setSwapTokenPair({
      fromToken: swapTokenPair.toToken,
      toToken: swapTokenPair.fromToken,
      fromAmount: swapTokenPair.toAmount,
      toAmount: toAmount,
      fromBalance: swapTokenPair.toBalance,
      toBalance: swapTokenPair.fromBalance,
    });
  };

  const handleConnectWallet = async () => {
    try {
      // call library to connect wallet
      setWalletState(WalletState.CONNECTTING);
      await sleep(2000);
      // check wallet network same as app network
      // set wallet state to connected
      setWalletState(WalletState.CONNECTED);
      // alert user wallet connected
      alert("Wallet connected");
    } catch (error) {
      console.error("Error connecting wallet", error);
      setWalletState(WalletState.DISCONNECTED);
    }
  };

  const handleButtonSwap = async () => {
    if (walletState === WalletState.DISCONNECTED) {
      await handleConnectWallet();
      return;
    }
    setSwapState(SwapState.CONFIRM_SWAP);
    setIsShowConfirmSwapModal(true);
  };

  const handleSwapToken = async () => {
    setSwapState(SwapState.SWAPPING);
    await sleep(2000);
    if (random(0, 1) === 0) {
      setSwapState(SwapState.SWAP_FAILED);
      return;
    } else {
      setSwapState(SwapState.SWAP_SUCCESS);
    }
    // update balance
    const balance =
      swapTokenPair.fromBalance - parseFloat(swapTokenPair.fromAmount!);
    setSwapTokenPair({
      ...swapTokenPair,
      fromBalance: balance,
      toBalance: swapTokenPair.toBalance + parseFloat(swapTokenPair.toAmount!),
    });
  };

  const handleCloseConfirmSwap = () => {
    setIsShowConfirmSwapModal(false);
    // reset swap state
    setSwapState(SwapState.SWAP);
  };

  // button title base on current state and balance
  const buttonTitle = useMemo(() => {
    // user have to connect wallet first
    if (walletState === WalletState.DISCONNECTED) {
      return "Connect Wallet";
    } else if (walletState === WalletState.CONNECTTING) {
      return "Connecting...";
    }

    // check to token valid
    if (!swapTokenPair.fromToken) {
      return "Select from token";
    } else if (!swapTokenPair.toToken) {
      return "Select to token";
    }

    // check amount is valid
    if (
      !swapTokenPair.fromAmount ||
      parseFloat(swapTokenPair.fromAmount) <= 0
    ) {
      return "Enter an amount";
    }

    // check user have enough balance
    if (
      swapTokenPair.fromToken &&
      swapTokenPair.fromAmount &&
      parseFloat(swapTokenPair.fromAmount) > swapTokenPair.fromBalance
    ) {
      return `Insufficient ${swapTokenPair.fromToken?.currency} balance`;
    }

    switch (swapState) {
      case SwapState.IDLE:
        return "";
      case SwapState.CALCULATING:
        return "Calculating";
      case SwapState.SELECT_FROM_TOKEN:
        return "Select from token";
      case SwapState.SELECT_TO_TOKEN:
        return "Select to token";
      case SwapState.SWAP:
        return "Swap";
      case SwapState.CONFIRM_SWAP:
        return "Confirm Swap";
      case SwapState.SWAPPING:
        return "Swapping";
      case SwapState.SWAP_SUCCESS:
        return "Swapped";
      case SwapState.SWAP_FAILED:
        return "Swap Failed";
      default:
        return "";
    }
  }, [walletState, swapState, swapTokenPair]);

  // check if user can swap token or not base on current state and balance
  const canSwap = useMemo(() => {
    if (walletState === WalletState.DISCONNECTED) {
      return true;
    }
    // check if user have enough balance
    if (
      swapTokenPair.fromAmount &&
      parseFloat(swapTokenPair.fromAmount) > swapTokenPair.fromBalance
    ) {
      return false;
    }
    // check calculate to amount done
    if (!swapTokenPair.toAmount || !swapTokenPair.fromAmount) {
      return false;
    }
    // check if user have selected both from and to token
    if (!swapTokenPair.fromToken || !swapTokenPair.toToken) {
      return false;
    }

    // check if user is swapping
    if (
      swapState === SwapState.SWAPPING ||
      swapState === SwapState.CONFIRM_SWAP
    ) {
      return false;
    }

    return true;
  }, [swapTokenPair, walletState, swapState]);

  const handleChangeTab = (tab: SwapTabInfo) => {
    // update new active tab
    const newTabs = tabs.map((t) => {
      if (t.id === tab.id) {
        return { ...t, active: true };
      } else {
        return { ...t, active: false };
      }
    });
    setTabs(newTabs);
  };

  const handleSettingSlippage = () => {
    // open modal to set slippage
    setIsShowSettingModal(!isShowSettingModal);
  };

  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-center p-4 bg-white ${inter.className}`}
    >
      <div className="max-w-[550px] items-center justify-center font-mono flex-col">
        <p className="flex w-full justify-center font-bold text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl text-center text-black ">
          Swap anytime, anywhere.
        </p>
        <div className="flex w-full items-center justify-between mt-5">
          <div className="flex items-center">
            {tabs.map((tab) => (
              <SwapTab key={tab.id} tab={tab} onClick={handleChangeTab} />
            ))}
          </div>
          <div
            className={`flex h-9 items-center justify-center cursor-pointer rounded-2xl px-2 mr-3 ${
              slippage > DEFAULT_SLIPPAGE_TOLERANCE ? "bg-yellow-100" : ""
            }`}
            onClick={handleSettingSlippage}
          >
            {slippage > DEFAULT_SLIPPAGE_TOLERANCE && (
              <p className="text-yellow-500 mr-2 text-xs">{`${slippage}% slippage`}</p>
            )}
            <img
              src="/assets/icons/settings.svg"
              alt="settings"
              className="w-7 h-7 fill-slate-400"
            />
          </div>
        </div>
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 p-1 mt-2 bg-white">
          <TokenSwapInput
            title="Sell"
            amount={swapTokenPair.fromAmount}
            decimals={18}
            token={swapTokenPair.fromToken}
            maxAmount={swapTokenPair.fromBalance}
            balance={swapTokenPair.fromBalance}
            side={TokenSide.FROM}
            disable={swapState === SwapState.SWAPPING}
            onInputChange={handleInputAmount}
            setIsShowSelectToken={setIsShowSelectToken}
            onOpenSelectTokenModal={() =>
              setSwapState(SwapState.SELECT_FROM_TOKEN)
            }
          />
          <div
            className="absolute left-1/2 transform -translate-x-1/2 bg-gray-100 rounded-2xl p-4 border-2 border-white cursor-pointer hover:bg-gray-200"
            onClick={handleSwapInputArrow}
          >
            <img
              src="/assets/icons/arrow-down.svg"
              alt="swap"
              className="w-4 h-4 cursor-pointer"
            />
          </div>
          <TokenSwapInput
            title="Buy"
            amount={swapTokenPair.toAmount}
            decimals={18}
            token={swapTokenPair.toToken}
            maxAmount={swapTokenPair.toBalance}
            balance={swapTokenPair.toBalance}
            side={TokenSide.TO}
            disable={swapState === SwapState.SWAPPING}
            onInputChange={handleInputAmount}
            setIsShowSelectToken={setIsShowSelectToken}
            onOpenSelectTokenModal={() =>
              setSwapState(SwapState.SELECT_TO_TOKEN)
            }
          />
        </div>
        {isShowSelectToken && (
          <SelectTokenModal
            tokens={tokenPrices}
            blockedTokens={[]}
            title={
              swapState === SwapState.SELECT_FROM_TOKEN
                ? "Select from token"
                : "Select to token"
            }
            isOpen={isShowSelectToken}
            onClose={handleCloseSelectToken}
            onSelect={handleSelectToken}
          />
        )}
        {isShowSettingModal && (
          <SwappSettingModal
            transactionDeadline={DEFAULT_DEADLINE}
            slippageTolerance={slippage}
            isOpen={isShowSettingModal}
            onClose={handleSettingSlippage}
            onConfirm={(transactionDeadline, slippageTolerance) => {
              setSlippage(slippageTolerance);
              handleSettingSlippage();
            }}
          />
        )}
        {isShowConfirmSwapModal && (
          <ConfirmSwapModal
            isOpen={isShowConfirmSwapModal}
            onClose={handleCloseConfirmSwap}
            onConfirm={handleSwapToken}
            fromToken={swapTokenPair.fromToken!}
            toToken={swapTokenPair.toToken!}
            fromAmount={parseFloat(swapTokenPair.fromAmount!)}
            toAmount={parseFloat(swapTokenPair.toAmount!)}
            status={swapState}
          />
        )}
        <SwappButton
          title={buttonTitle}
          onClick={handleButtonSwap}
          disable={!canSwap}
        />
        {swapTokenPair.toToken &&
          swapTokenPair.fromToken &&
          swapTokenPair?.fromAmount &&
          swapTokenPair?.toAmount && (
            <div className="flex w-full items-center justify-start mt-5">
              <p className="text-gray-900 text-sm text-left">{`1 ${
                swapTokenPair.toToken?.currency
              } = ${
                parseFloat(swapTokenPair?.fromAmount) /
                parseFloat(swapTokenPair?.toAmount)
              } ${swapTokenPair.fromToken?.currency}`}</p>
            </div>
          )}
      </div>
    </main>
  );
};

export default SwapPage;
