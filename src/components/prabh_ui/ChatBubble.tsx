// src/components/prabh_ui/ChatBubble.tsx
'use client';

export default function ChatBubble({ from, text, timestamp }: { from: "user" | "prabh"; text: string; timestamp?: string }) {
  const isUser = from === "user";
  return (
    <div className={`flex w-full mb-3 ${isUser ? "justify-end" : "justify-start"}`}>
      <div className="flex items-end gap-2 max-w-[80%]">
        {/* Optional: Avatar for Prabh */}
        {/* {!isUser && <UserCircle className="h-8 w-8 text-prabh-secondary flex-shrink-0" />} */}
        <div
          className={`px-4 py-3 rounded-xl text-sm font-body shadow-card dark:shadow-dark_card ${
            isUser
              ? "bg-akshu-blue text-akshu-white rounded-tr-none"
              : "bg-prabh-surface text-prabh-text border border-prabh-secondary dark:bg-dark_prabh-surface dark:text-dark_prabh-text dark:border-dark_prabh-secondary rounded-tl-none"
          }`}
        >
          <p className="whitespace-pre-wrap">{text}</p>
          {timestamp && (
            <p className={`text-xs mt-1 ${isUser ? 'text-akshu-white/70 text-right' : 'text-prabh-muted dark:text-dark_prabh-muted/70 text-right'}`}>
              {timestamp}
            </p>
          )}
        </div>
         {/* Optional: Avatar for User */}
        {/* {isUser && <UserCircle className="h-8 w-8 text-akshu-saffron flex-shrink-0" />} */}
      </div>
    </div>
  );
}
