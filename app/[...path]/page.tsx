
import { supabase } from "@/lib/supabase"
import { notFound } from 'next/navigation'
import dynamic from 'next/dynamic';
import { AppProvider } from "@/lib/app-provider";

export default async function page({ params }: { params: Promise<{ path: string }> }) {
    const { path } = await params

    const { data: app } = await supabase.from("apps").select().eq('name', path).maybeSingle()

    if (!app) {
        notFound()
    }

    const { type } = { type: '' } // app.init[0]

    const Component = type && dynamic(() => import(`@/app/${type.toLowerCase()}/${type}.tsx`));

    if (!Component) {
      return <div className="h-full flex flex-col items-center justify-center">
          Error
      </div>
    }

    const { data: messages } = await supabase.from("messages").select().match({'app_id': app.id})

    return <AppProvider value={{ app, messages }}>
      <Component />
    </AppProvider>
}   
