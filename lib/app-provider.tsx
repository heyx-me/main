"use client";

import * as React from "react";
import { supabase } from "./supabase";
import { create, useStore, type StoreApi, type UseBoundStore } from "zustand";
import { useMemo } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";

const appContext = React.createContext<UseBoundStore<StoreApi<AppState & AppActions>> | null>(null);

export function useAppContext({ subscribeToMessages }: { subscribeToMessages?: boolean } = {}) {
  const store = React.useContext(appContext)
  if (!store) {
    throw new Error("useAppContext must be used within a AppProvider");
  }
  return useRealtimeMessages(useStore(store), { off: !subscribeToMessages });
}

export function AppProvider({
	value,
	children,
}: React.PropsWithChildren<{ value?: AppState }>) {
	const [store] = React.useState(() => createStore(value));

	return <appContext.Provider value={store}>{children}</appContext.Provider>;
}

type AppState = {
	app?: Application;
	messages?: Message[] | null;
};

type AppActions = {
	addMessage: (text: string) => void;
	subscribeToMessages: () => RealtimeChannel;
}

export type Message = {
	content: {
		text: string;
	}[];
};

export type Application = {
	id: number;
};

export function createStore(state?: AppState) {
	const store = create<AppState & AppActions>((set) => {
		return {
			...state,
			addMessage: (text: string) => {
				const newMessage = {
					app_id: state?.app?.id || null,
					content: [{ text }],
				};

				if (state?.app) {
					send(newMessage);
				} else {
					set((state) => ({
						messages: [...(state.messages || []), newMessage],
					}));

					fetch("/api/completion", {
						method: "POST",
						body: JSON.stringify({
							prompt: text,
						}),
					}).then((response) => {
						response.json().then((json) => {
							set((state) => ({
								messages: [
									...(state.messages || []),
									{
										content: [{ text: json.text }],
									},
								],
							}));
						});
					});
				}
			},
			subscribeToMessages: () => {
				return supabase
					.channel("messages")
					.on(
						"postgres_changes",
						{
							event: "INSERT",
							schema: "public",
							table: "messages",
							filter: `app_id=eq.${state?.app?.id}`,
						},
						(payload) => {
							const newMessage = payload.new as Message;
							set((state) => ({
								messages: [...(state.messages || []), newMessage],
							}));
						},
					)
					.subscribe();
			},
		};
	});

	return store;
}

function send(newMessage: Message) {
	supabase
		.from("messages")
		.insert([newMessage])
		.then(() => {
			console.log("ok");
		});
}

export function useRealtimeMessages(ctx: AppState & AppActions, { off }: { off: boolean }) {
  
	const { app, subscribeToMessages } = ctx;

	React.useEffect(() => {
		if (!app || off) {
			return;
		}

		const sub = subscribeToMessages();

		return () => {
			sub.unsubscribe();
		};
	}, [subscribeToMessages, app, off]);

  return ctx
}