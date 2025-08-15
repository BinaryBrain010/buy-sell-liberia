interface MessageBubbleProps {
  message: any;
  isOwn: boolean;
  formatDate: (date: Date) => string;
}

export const MessageBubble = ({
  message,
  isOwn,
  formatDate,
}: MessageBubbleProps) => {
  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-sm px-3 py-2 rounded-2xl shadow-sm ${
          isOwn
            ? "bg-blue-600 text-white rounded-br-md dark:bg-blue-500"
            : "bg-white border rounded-bl-md text-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
        }`}
      >
        <p className="text-sm leading-relaxed">{message.content}</p>
        <p
          className={`text-[11px] mt-1 ${
            isOwn ? "text-blue-100/90" : "text-gray-500 dark:text-gray-400"
          }`}
        >
          {formatDate(message.sentAt)}
        </p>
      </div>
    </div>
  );
};
