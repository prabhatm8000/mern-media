import { handleMessageDate } from "../lib/handleDate";

interface ChatMessageDateBubbleProps {
    dateA: Date;
    dateB: Date;
    isLast: boolean;
}

const ChatMessageDateBubble = ({
    dateA,
    dateB,
    isLast,
}: ChatMessageDateBubbleProps) => {
    const date = handleMessageDate(new Date(dateA), new Date(dateB), {
        last: isLast,
    });
    return (
        <>
            {date.length > 0 && (
                <div className="flex justify-center my-4">
                    <span className="px-2 py-1 bg-whiteAlpha2 text-white3 text-sm rounded-lg">
                        {date}
                    </span>
                </div>
            )}
        </>
    );
};

export default ChatMessageDateBubble;
