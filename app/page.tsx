import { AppProvider } from "@/lib/app-provider";
import Chat from "./chat/Chat";
import { randomUUID } from "crypto";

export default async function Home() {
  return (
    <AppProvider
      value={{
        messages: [
          {
            id: randomUUID(),
            app_id: null,
            created_at: new Date().toISOString(),
            content: [{ text: "Hey, world!" }],
          },
        ],
      }}
    >
      <Chat />
    </AppProvider>
  );
}
