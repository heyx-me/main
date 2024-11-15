// import { supabase } from "@/lib/supabase";
import Chat from "./chat/page";

export default async function Home() {
	// const { data: apps } = await supabase.from("apps").select();

	return (
		<Chat messages={[{
			content: [{ text: "Hey, world!" }],
		}]}/>
	);
}
