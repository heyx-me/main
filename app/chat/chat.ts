import type { Application } from "@/lib/app-provider";
import { supabase } from "@/lib/supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { create } from "zustand";

export type Message = {
	app_id?: number | null;
	content: {
		text: string;
	}[];
};

export type ChatState = {
	messages: Message[] | null;
};

export type ChatMutations = {
	addMessage: (text: string) => void;
	subscribeToMessages: () => RealtimeChannel;
};

export type ChatContext = ChatState & ChatMutations;

export function createChatStore(state: ChatState, app?: Application) {
	const store = create<ChatContext>((set) => {
		return {
			...state,
			addMessage: (text: string) => {
				const newMessage = {
					app_id: app?.id || null,
					content: [{ text }],
				};

				if (app) {
					send(newMessage);
				} else {
					set((state) => ({
						messages: [...(state.messages || []), newMessage],
					}));
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
							filter: `app_id=eq.${app?.id}`,
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
