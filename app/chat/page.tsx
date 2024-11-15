import type { Application } from "@/lib/app-provider";
import { supabase } from "@/lib/supabase";
import { ChatInput } from "./ChatInput";
import { ChatMessages } from "./ChatMessages";
import { ChatProvider } from "./ChatProvider";
import type { Message } from "./chat";


export default async function Chat({ app, messages: msgs } : { app?: Application, messages?: Message[] }) {

    const { data: messages } = await (() => {
        if (app) {
            return supabase.from("messages").select().match({'app_id': app.id})
        }

        return { data: msgs || [] }
        
    })()

    return <ChatProvider app={app} messages={messages}>
        <div className="h-full flex flex-col items-center justify-center p-3">
            <div className="md:max-w-[600px] w-full flex flex-col p-3 border rounded-xl h-full md:max-h-[500px]">

                <div className="flex-1 overflow-y-auto">
                    <ChatMessages />
                </div>

                <ChatInput />
              
            </div>
        </div>
    </ChatProvider>

}

