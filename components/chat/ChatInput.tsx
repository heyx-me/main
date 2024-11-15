"use client";

import { SendIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useChatStore } from "./ChatProvider";

export function ChatInput() {
	const { addMessage } = useChatStore();

	const [text, setText] = useState("");

	return (
		<div className="flex gap-2 w-full">
			<Input
				value={text}
				name="input"
				autoComplete="off"
				placeholder="Write something..."
				className="w-full"
				onChange={(e) => setText(e.target.value)}
				onKeyDown={(e) => {
					if (e.key === "Enter" && text) {
						handleSend()
					}
				}}
			/>
			<div>
				<Button
					size="icon"
					disabled={!text}
					onClick={() => {
						handleSend()
					}}
				>
					<SendIcon />
				</Button>
			</div>
		</div>
	);

	function handleSend() {
		addMessage(text);
		setText("");
	}
}
