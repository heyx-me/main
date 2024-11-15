"use client";

import { useEffect } from "react";
import { useChatStore } from "./ChatProvider";

export function ChatMessages() {
	const { messages, subscribeToMessages } = useChatStore();

	useEffect(() => {
		const sub = subscribeToMessages();

		return () => {
			sub.unsubscribe()
		}
	}	, [subscribeToMessages]);

	return (
		<div>
			{messages?.map((message, key) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
				<div key={key}>
					{message.content.map(({ text }, key) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
						<div key={key}>{text}</div>
					))}
				</div>
			))}
		</div>
	);
}
