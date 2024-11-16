
import { ChatInput } from "./ChatInput";
import { ChatMessages } from "./ChatMessages";

export default function Chat() {
    return <div className="h-full flex flex-col items-center justify-center p-3">
        <div className="md:max-w-[600px] w-full flex flex-col p-3 border rounded-xl h-full md:max-h-[500px]">

            <div className="flex-1 overflow-y-auto">
                <ChatMessages />
            </div>

            <ChatInput />
            
        </div>
    </div>

}

