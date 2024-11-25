"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle, Trash2, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export interface ListInfo {
  id: string;
  title: string;
  createdAt: number;
}

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

const ListsPage = () => {
  const router = useRouter();
  const [lists, setLists] = useState<ListInfo[]>([]);
  const isInitialized = useRef(false);
  const [language, setLanguage] = useState<"en" | "he">("en");

  useEffect(() => {
    if (!isInitialized.current) {
      const storedLists = localStorage.getItem("lists");
      const storedLanguage = localStorage.getItem("language");
      if (storedLists) {
        try {
          const parsedLists = JSON.parse(storedLists);
          setLists(parsedLists);
        } catch (error) {
          console.error("Error parsing stored lists:", error);
        }
      }
      if (storedLanguage) {
        setLanguage(storedLanguage as "en" | "he");
      }
      isInitialized.current = true;
    }
  }, []);

  useEffect(() => {
    if (isInitialized.current) {
      localStorage.setItem("language", language);
    }
  }, [language]);

  const createNewList = () => {
    const newList: ListInfo = {
      id: crypto.randomUUID(),
      title: "",
      createdAt: Date.now(),
    };
    setLists((prev) => [...prev, newList]);
    localStorage.setItem("lists", JSON.stringify([...lists, newList]));
    router.push(`/list/${newList.id}`);
  };

  const deleteList = (id: string) => {
    setLists((prev) => prev.filter((list) => list.id !== id));
    localStorage.setItem(
      "lists",
      JSON.stringify(lists.filter((list) => list.id !== id))
    );
    // Clean up associated list data
    localStorage.removeItem(`todos-${id}`);
  };

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
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                setLanguage((lang) => (lang === "en" ? "he" : "en"))
              }
            >
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
            {lists.map((list) => (
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
};

export default ListsPage;
