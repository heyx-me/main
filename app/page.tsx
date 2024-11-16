
import { AppProvider } from "@/lib/app-provider";
import { Chat } from "./chat/Chat";

export default async function Home() {

	return (
		<AppProvider value={{ 
			messages: [{
				content: [{ text: "Hey, world!" }],
			}]
		}}>
			<Chat />
		</AppProvider>
	);
}
