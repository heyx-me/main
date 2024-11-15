"use client";

import type { Application } from "@/lib/app-provider";
import React, { useContext, useMemo } from "react";
import { useStore, type StoreApi, type UseBoundStore } from "zustand";
import { createChatStore, type ChatContext, type ChatState } from "./chat";

export function ChatProvider({
	app,
	messages,
	children,
}: React.PropsWithChildren<ChatState & { app: Application }>) {
	const store = useMemo(
		() => {
			return createChatStore(app, { messages })
		},
		[app, messages],
	);

	return (
		<storeContext.Provider value={store}>
			{children}
		</storeContext.Provider>
	);
}

export function useChatStore() {
	const store = useContext(storeContext)
	if (!store) {
		throw new Error("useChatStore must be used within a ChatProvider");
	}
	return useStore(store)
}

const storeContext = React.createContext<UseBoundStore<StoreApi<ChatContext>> | null>(null);
