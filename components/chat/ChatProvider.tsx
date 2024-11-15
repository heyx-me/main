"use client";

import React, { useContext, useMemo, useState, type useReducer } from "react";
import { createChatStore, type ChatState, type ChatContext } from "./chat";
import { createStore, type StoreApi, useStore, type UseBoundStore } from "zustand";
import type { Application } from "@/lib/app-provider";

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

export function useChatStore<T>() {
	const store = useContext(storeContext)
	if (!store) {
		throw new Error("useChatStore must be used within a ChatProvider");
	}
	return useStore(store)
}

const storeContext = React.createContext<UseBoundStore<StoreApi<ChatContext>> | null>(null);
