"use client";

import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/language-provider";
import { AnimatePresence, motion } from "framer-motion";
import { Languages, Loader2, PlusCircle, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { ListInfo, state$, store$ } from "./store";
import { observer, useSelector } from "@legendapp/state/react";
import React, { useEffect } from "react";

const translations = {
  en: {
    myLists: "My Lists",
    newList: "New List",
    created: "Created",
  },
  he: {
    myLists: "הרשימות שלי",
    newList: "רשימה חדשה",
    created: "נוצר ב",
  },
};

const ListsPage = observer(() => {
  const router = useRouter();
  const [isInitializing, setIsInitializing] = React.useState(true);
  const [lists, setLists] = React.useState<ListInfo[]>(store$.lists.get());
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = async () => {
    const newLanguage = language === "en" ? "he" : "en";
    setLanguage(newLanguage);
  };

  const createNewList = () => {
    const newList: ListInfo = {
      id: crypto.randomUUID(),
      title: "",
      createdAt: Date.now(),
    };
    store$.set({
      lists: [...(lists || []), newList]
    });
    setLists((prev) => [...(prev || []), newList]);
    router.push(`/list/${newList.id}`);
  };

  const deleteList = (id: string) => {
    store$.set({
      lists: lists.filter((list) => list.id !== id)
    });
    setLists((prev) => prev.filter((list) => list.id !== id));
  };

  useEffect(() => {
    setIsInitializing(false);
  }, [])

  if (isInitializing) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm text-muted-foreground">Loading your lists...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-full flex flex-col items-center p-6"
      dir={language === "he" ? "rtl" : "ltr"}
    >
      <div className="w-full max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            {translations[language].myLists}
          </h1>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={toggleLanguage}>
              <Languages className="h-4 w-4" />
            </Button>
            <Button onClick={createNewList}>
              <PlusCircle className="mr-2 h-4 w-4" />
              {translations[language].newList}
            </Button>
          </div>
        </div>

        <div className="grid gap-4">
          <AnimatePresence initial={false}>
            {lists?.map((list) => (
              <motion.div
                key={list.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center justify-between p-4 border rounded-lg hover:border-gray-400 transition-colors"
              >
                <button
                  className="flex-1 text-left"
                  onClick={() => router.push(`/list/${list.id}`)}
                  style={{ textAlign: language === "he" ? "right" : "left" }}
                >
                  <h2 className="font-medium">{list.title}</h2>
                  <p className="text-sm text-gray-500">
                    {translations[language].created}{" "}
                    {new Date(list.createdAt).toLocaleDateString()}
                  </p>
                </button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteList(list.id)}
                  className={`text-gray-400 hover:text-red-500 hover:bg-red-50 ${
                    language === "he" ? "mr-4" : "ml-4"
                  }`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
})

export default ListsPage;
