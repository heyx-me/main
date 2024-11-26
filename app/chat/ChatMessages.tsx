"use client";

import { useAppContext } from "@/lib/app-provider";

export function ChatMessages() {
  const { messages } = useAppContext({
    subscribeToMessages: true,
  });

  return (
    <div>
      {messages?.map((message, key) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
        <div key={key}>
          {(message.content as Content[])?.map(({ text }, key) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
            <div key={key}>{text}</div>
          ))}
        </div>
      ))}
    </div>
  );
}

export type Content = {
  text: string;
};
