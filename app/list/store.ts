import { ObservablePersistLocalStorage } from "@legendapp/state/persist-plugins/local-storage";
import { syncObservable } from "@legendapp/state/sync";
import { observable, syncState } from "@legendapp/state";


export interface ListInfo {
  id: string;
  title: string;
  createdAt: number;
}

// Create observable store
export const store$ = observable({
  lists: [] as ListInfo[],
});

syncObservable(store$, {
  persist: {
    name: "lists",
    plugin: ObservablePersistLocalStorage,
  },
});

export const state$ = syncState(store$)
