"use client";

import { useEffect } from "react";
import { useChatStore } from "./ChatProvider";
import { useAppContext } from "@/lib/app-provider";

export function ChatMessages() {
	const { app } = useAppContext();
	const { messages, subscribeToMessages } = useChatStore();

	useEffect(() => {
		if (!app) {
			return;
		}

		const sub = subscribeToMessages();

		return () => {
			sub.unsubscribe();
		};
	}, [subscribeToMessages, app]);

	return (
		<div>
			{messages?.map((message, key) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
				<div key={key}>
					{message.content?.map(({ text }, key) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
						<div key={key}>{text}</div>
					))}
				</div>
			))}
		</div>
	);
}
