import { TokenPrice } from "@/interfaces";
import { useMemo, useState } from "react";
import TokenImage from "../TokenImage/TokenImage";

interface SelectTokenModalProps {
  tokens: TokenPrice[];
  blockedTokens?: TokenPrice[];
  title: string;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (token: TokenPrice) => void;
}

const SelectTokenModal: React.FC<SelectTokenModalProps> = ({
  tokens,
  blockedTokens,
  title,
  isOpen,
  onClose,
  onSelect,
}) => {
  const [search, setSearch] = useState<string>("");

  const filteredTokens = useMemo(() => {
    if (!tokens) return [];
    // filter out blocked tokens
    const nTokens = tokens.filter(
      (token: TokenPrice) =>
        !blockedTokens?.some((t) => t.currency === token.currency)
    );
    // filter by search
    return nTokens.filter((token: TokenPrice) =>
      token.currency.toLowerCase().includes(search.toLowerCase())
    );
  }, [tokens, blockedTokens, search]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    // avoid default behavior
    e.preventDefault();
    setSearch(e.target.value);
  };

  const handleSelectToken = (token: TokenPrice) => {
    onSelect(token);
    setSearch("");
  };

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-1 ${
        isOpen ? "" : "hidden"
      }`}
    >
      <div className="bg-white rounded-xl w-96">
        <div className="flex items-center p-3 px-4 justify-between">
          <p className="text-lg font-bold text-black">{title}</p>
          <img
            className="hover:bg-gray-50 cursor-pointer"
            src={"/assets/icons/close.svg"}
            onClick={onClose}
          />
        </div>
        <div className="flex border border-gray-300 bg-gray-100 rounded-lg p-2 mx-4 my-2">
          <img src={"/assets/icons/search.svg"} alt="arrow-down" sizes="20px" />
          <input
            type="text"
            placeholder="Search name or paste address"
            onChange={handleInput}
            className="w-full text-black text-xs outline-none bg-inherit ml-2"
          />
        </div>
        <div className="flex flex-col mt-2">
          <p className="text-sm text-gray-500 mt-2 mx-4">Popular Tokens</p>
          <div className="flex flex-col mt-2 h-96 overflow-y-auto">
            {filteredTokens.map((token: TokenPrice, index: number) => (
              <div
                key={`${token.currency}-${index}`}
                className="flex items-center px-4 py-2 mt-2 hover:bg-gray-200 cursor-pointer"
                onClick={() => handleSelectToken(token)}
              >
                <TokenImage currency={token.currency} size={32} />
                <div className="flex flex-col ml-2">
                  <p className="text-gray-900 ml-1">{token.currency}</p>
                  <p className="text-gray-500 text-xs ml-1">{token.currency}</p>
                </div>
              </div>
            ))}
            {filteredTokens.length === 0 && (
              <p className="text-gray-500 text-sm text-center mt-4">
                No tokens found
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectTokenModal;
