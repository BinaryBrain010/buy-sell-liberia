import { UserStatus } from "./user-status";
import { ProductThumbnail } from "./product-thumbnail";
import BuySellLoader from "@/components/loader/BuySellLoader";

interface ChatHeaderProps {
  chat: any;
  otherUserName: string;
  productTitle: string;
  isOtherUserOnline: boolean;
  messageCount: number;
}

export const ChatHeader = ({
  chat,
  otherUserName,
  productTitle,
  isOtherUserOnline,
  messageCount,
}: ChatHeaderProps) => {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800 p-3 sm:p-4 rounded-xl mb-3 sm:mb-4 border border-blue-100 dark:border-gray-700">
      <div className="flex items-center gap-3">
        <ProductThumbnail product={chat.product} size="sm" />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              {otherUserName}
            </h3>
            <UserStatus isOnline={isOtherUserOnline} />
            {otherUserName === "Loading..." && (
              <BuySellLoader
                variant="inline"
                size={14}
                hideLabel
                label="Loading user"
              />
            )}
          </div>
          <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
            {productTitle}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {messageCount} message{messageCount !== 1 ? "s" : ""}
          </p>
        </div>
      </div>
    </div>
  );
};
