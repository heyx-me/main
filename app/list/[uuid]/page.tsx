"use client";

import type React from "react";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useParams } from "next/navigation";
import type { ListInfo } from "../page";

const translations = {
  en: {
    listTitle: "My List",
    addTodo: "Add a new item",
    add: "Add",
    listTitlePlaceholder: "List Title",
  },
  he: {
    listTitle: "הרשימה שלי",
    addTodo: "הוסף רשומה חדשה",
    add: "הוסף",
    listTitlePlaceholder: "כותרת הרשימה",
  },
};

interface Todo {
  id: number;
  text: string;
  done: boolean;
  category: string;
}

type StorageValue = Todo[] | ListInfo[] | string;

const storage = {
  get: <T extends StorageValue>(key: string, defaultValue: T): T => {
    if (typeof window === "undefined") return defaultValue;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  },
  set: (key: string, value: StorageValue): void => {
    if (typeof window !== "undefined") {
      localStorage.setItem(key, JSON.stringify(value));
    }
  },
};

const ListPage = () => {
  const params = useParams();

  const storageKeys = {
    todos: `todos-${params.uuid}`,
    globalLists: "lists",
  };

  const getListTitle = useCallback(() => {
    const lists = storage.get<ListInfo[]>(storageKeys.globalLists, []);
    return lists.find(({ id }) => id === params.uuid)?.title || "";
  }, [params.uuid, storageKeys.globalLists]);

  const [language, setLanguage] = useState<"en" | "he">("en");
  const [todos, setTodos] = useState<Todo[]>(
    storage.get(storageKeys.todos, [])
  );
  const [newTodo, setNewTodo] = useState("");
  const [listTitle, setListTitle] = useState(getListTitle());
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Add effect for language initialization
  useEffect(() => {
    const storedLanguage = localStorage.getItem("language") as "en" | "he";
    setLanguage(storedLanguage || "en");
  }, []);

  // Combine initialization effects
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (typeof window !== "undefined") {
      setTodos(storage.get(storageKeys.todos, []));
      setListTitle(getListTitle());
      setIsInitializing(false);
    }
  }, [getListTitle, params.uuid, storageKeys.todos]);

  // Update the global lists storage when title changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    const lists = storage.get<ListInfo[]>(storageKeys.globalLists, []);
    const listIndex = lists.findIndex(({ id }) => id === params.uuid);
    if (listIndex === -1) return;
    lists[listIndex].title = listTitle;
    storage.set(storageKeys.globalLists, lists);
  }, [listTitle, params.uuid, storageKeys.globalLists]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(
    () => storage.set(storageKeys.todos, todos),
    [todos, params.uuid, storageKeys.todos]
  );

  const predictCategory = async (text: string, listTitle: string) => {
    const prompt = `Based on the todo list title "${listTitle}", categorize this item: "${text}".
    If this is a shopping list:
    - For food items, use: 🥛 for dairy, 🥩 for meat, 🥖 for bakery, 🥫 for canned goods, 🥬 for produce
    - For non-food items, use: 🧹 for cleaning, 🧴 for personal care
    
    Respond with only an emoji.
    Examples: 
    - 🥛 for milk, yogurt, cheese
    - 🥬 for fruits and vegetables
    - 🧹 for household supplies`;

    const prediction = await getCompletion(prompt);
    return prediction.trim();
  };

  const extractItems = async (text: string) => {
    const prompt = `Extract individual items from this text. Return them as a JSON array of strings.
    Examples:
    Input: "milk, bread and eggs"
    Output: ["milk", "bread", "eggs"]
    
    Input: "I need tomatoes also get some milk"
    Output: ["tomatoes", "milk"]
    
    Now extract from this text: "${text}"`;

    const result = await getCompletion(prompt);
    try {
      return JSON.parse(result) as string[];
    } catch (error) {
      console.error("Failed to parse items:", error);
      return [text];
    }
  };

  const addTodo = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (newTodo.trim() === "" || isLoading) return;

    setIsLoading(true);
    try {
      const items = await extractItems(newTodo);
      const newTodos = await Promise.all(
        items.map(async (item) => {
          const categoryPrediction = await predictCategory(item, listTitle);
          return {
            id: Date.now() + Math.random(),
            text: item,
            done: false,
            category: categoryPrediction,
          };
        })
      );
      setTodos((prevTodos) => [...prevTodos, ...newTodos]);
      setNewTodo("");
    } catch (error) {
      console.error("Failed to process items:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeTodo = (id: number) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const toggleTodo = (id: number) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, done: !todo.done } : todo
      )
    );
  };

  const editTodo = (id: number, newText: string) => {
    setTodos(
      todos.map((todo) => (todo.id === id ? { ...todo, text: newText } : todo))
    );
  };

  if (isInitializing) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm text-muted-foreground">Loading your list...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col items-center justify-center p-3">
      <div className="md:max-w-[600px] w-full flex flex-col p-3 border rounded-xl h-full md:max-h-[500px]">
        <div className="flex justify-between items-center mb-4">
          <Input
            type="text"
            value={listTitle}
            onChange={(e) => setListTitle(e.target.value)}
            className="text-xl font-semibold bg-transparent border-none focus-visible:ring-0 p-0"
            placeholder={translations[language].listTitlePlaceholder}
            dir={language === "he" ? "rtl" : "ltr"}
          />
        </div>
        <div className="flex-1 overflow-y-auto">
          <ul className="space-y-2" dir={language === "he" ? "rtl" : "ltr"}>
            <AnimatePresence initial={false}>
              {[...todos]
                .sort((a, b) => {
                  if (a.done === b.done) return 0;
                  if (a.done !== b.done) return a.done ? 1 : -1;
                  return a.category.localeCompare(b.category);
                })
                .map((todo) => (
                  <motion.li
                    key={todo.id}
                    layout="position"
                    layoutId={todo.id.toString()}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{
                      opacity: 0,
                      y: -10,
                      transition: {
                        duration: 0.2,
                      },
                    }}
                    className="flex items-center gap-2"
                  >
                    <div className={"flex items-center gap-2 w-full"}>
                      <Checkbox
                        checked={todo.done}
                        onCheckedChange={() => toggleTodo(todo.id)}
                      />
                      <motion.div
                        animate={{ scale: todo.done ? 0.98 : 1 }}
                        className="flex-1"
                      >
                        <div
                          className={`flex items-center gap-2 ${
                            todo.done ? "text-gray-400 line-through" : ""
                          }`}
                        >
                          <span className="text-sm whitespace-nowrap">
                            {todo.category}
                          </span>
                          <Input
                            type="text"
                            value={todo.text}
                            onChange={(e) => editTodo(todo.id, e.target.value)}
                            className="flex-1"
                            dir={language === "he" ? "rtl" : "ltr"}
                          />
                        </div>
                      </motion.div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeTodo(todo.id)}
                        className="text-gray-400 hover:text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.li>
                ))}
            </AnimatePresence>
          </ul>
        </div>

        <form
          onSubmit={addTodo}
          className="flex gap-2 mt-4"
          dir={language === "he" ? "rtl" : "ltr"}
        >
          <div className="flex-1">
            <label htmlFor="newTodo" className="sr-only">
              {translations[language].addTodo}
            </label>
            <Input
              id="newTodo"
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTodo()}
              placeholder={translations[language].addTodo}
              autoComplete="off"
              aria-label={translations[language].addTodo}
              disabled={isLoading}
              dir={language === "he" ? "rtl" : "ltr"}
            />
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              translations[language].add
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

function getCompletion(prompt: string) {
  return fetch("/api/completion", {
    method: "POST",
    body: JSON.stringify({
      prompt,
    }),
  })
    .then((r) => r.json())
    .then((j) => j.text);
}

export default ListPage;
