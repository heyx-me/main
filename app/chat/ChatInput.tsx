"use client";

import { SendIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useAppContext } from "@/lib/app-provider";

export function ChatInput() {
  const { addMessage } = useAppContext();

  const [text, setText] = useState("");

  return (
    <div className="flex w-full relative">
      <Input
        value={text}
        name="input"
        autoComplete="off"
        className="w-full pr-12 rounded-full bg-muted/40"
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && text) {
            handleSend();
          }
        }}
      />
      <div>
        <Button
          size="icon"
          variant="ghost"
          disabled={!text}
          onClick={() => {
            handleSend();
          }}
          className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
        >
          <SendIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  function handleSend() {
    addMessage(text);
    setText("");
  }
}
