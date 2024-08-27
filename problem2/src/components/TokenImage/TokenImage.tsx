import { images } from "@/assets";

interface TokenImageProps {
  currency?: string;
  size: number;
}

const TokenImage: React.FC<TokenImageProps> = ({ currency, size }) => {
  const tokenImage = currency
    ? images[currency]
      ? images[currency]
      : images["AAVE"]
    : images["AAVE"];
  return (
    <div className="flex items-center">
      <img src={tokenImage} alt={currency} width={size} height={size} />
    </div>
  );
};

export default TokenImage;
