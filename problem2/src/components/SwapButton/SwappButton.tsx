
interface SwappButtonProps {
    title: string;
    disable: boolean;
    onClick: () => void;
    }
const SwappButton: React.FC<SwappButtonProps> = ({ title, disable, onClick }) => {
    return (
        <div className="flex w-full justify-center mt-1">
        <button
            className={`w-full text-white px-4 py-5 rounded-2xl cursor-pointer ${disable ? "bg-gray-300" : "bg-pink-500"}`}
            onClick={onClick}
            disabled={disable}
        >
            {title}
        </button>
        </div>
    );
}

export default SwappButton;