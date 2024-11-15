import type { Application } from "@/lib/app-provider";
import { supabase } from "@/lib/supabase";
import { ChatInput } from "../components/chat/ChatInput";
import { ChatMessages } from "../components/chat/ChatMessages";
import { ChatProvider } from "../components/chat/ChatProvider";


export default async function Chat({ app } : { app: Application }) {

    const { data: messages } = await supabase.from("messages").select().match({ app_id: app.id })

    return <ChatProvider app={app} messages={messages}>
        <div className="h-full flex flex-col items-center justify-center p-3">
            <div className="md:max-w-[600px] w-full flex flex-col p-3 border rounded-xl h-full md:max-h-[500px]">

                <div className="flex-1">
                    <ChatMessages />
                </div>

                <ChatInput />
              
            </div>
        </div>
    </ChatProvider>

}

