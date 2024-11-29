import { ObservablePersistLocalStorage } from "@legendapp/state/persist-plugins/local-storage";
import { syncObservable, configureSynced } from "@legendapp/state/sync";
import { observable, syncState } from "@legendapp/state";
import { syncedSupabase } from "@legendapp/state/sync-plugins/supabase";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";
import { Database } from "@/lib/database.types";

export const generateId = () => uuidv4();

export interface ListInfo {
  id: string;
  title: string;
  createdAt: number;
}

const customSynced = configureSynced(syncedSupabase, {
  // Use React Native Async Storage
  persist: {
    plugin: ObservablePersistLocalStorage,
  },
  generateId,
  supabase,
  // changesSince: "last-sync",
  fieldCreatedAt: "created_at",
  // fieldUpdatedAt: "updated_at",
  // Optionally enable soft deletes
  fieldDeleted: "deleted",
});

// Create observable store
export const store$ = observable({
  lists: [] as ListInfo[],
});

export const getItems = (app_id: string) =>
  observable(
    customSynced({
      supabase,
      collection: "messages",
      select: (from) => from.select("id,app_id,created_at,content,deleted"),
      filter: (select) => select.eq("app_id", app_id),
      actions: ["read", "create", "update", "delete"],
      // realtime: true,
      realtime: { schema: "public", filter: `app_id=eq.${app_id}` },
      // Persist data and pending changes locally
      persist: {
        name: "items",
        retrySync: true, // Persist pending changes and retry
        transform: {
          load: (data: []) =>
            Object.values(data)
              .filter(
                (item: Database["public"]["Tables"]["messages"]["Row"]) =>
                  item.app_id === app_id
              )
              .entries(),
        },
      },
      retry: {
        infinite: true, // Retry changes with exponential backoff
      },
    })
  );

syncObservable(store$, {
  persist: {
    name: "lists",
    plugin: ObservablePersistLocalStorage,
  },
});

export const state$ = syncState(store$);
