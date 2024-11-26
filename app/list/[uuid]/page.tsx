"use client";

import type React from "react";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { store$, type ListInfo } from "../store";
import { useLanguage } from "@/lib/language-provider";
import { observer } from "@legendapp/state/react";

const translations = {
  en: {
    listTitle: "My List",
    addTodo: "Add a new item",
    add: "Add",
    listTitlePlaceholder: "List Title",
    clearAll: "Clear All",
    clearConfirm: "Are you sure you want to clear all items?",
    askAssistant: "Ask me to add items or help organize your list...",
  },
  he: {
    listTitle: "הרשימה שלי",
    addTodo: "הוסף רשומה חדשה",
    add: "הוסף",
    listTitlePlaceholder: "כותרת הרשימה",
    clearAll: "נקה הכל",
    clearConfirm: "האם אתה בטוח שברצונך למחוק את כל הפריטים?",
    askAssistant: "בקש ממני להוסיף פריטים או לעזור לארגן את הרשימה שלך...",
  },
};

const DEFAULT_CATEGORY = "📝"; // Add this after translations object

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

const ListPage = observer(() => {
  const params = useParams();
  const { toast } = useToast();

  const storageKeys = {
    todos: `todos-${params.uuid}`,
    globalLists: "lists",
  };

  const getListTitle = useCallback(() => {
    const lists = store$.lists.get();
    return lists?.find(({ id }) => id === params.uuid)?.title || "";
  }, [params.uuid, storageKeys.globalLists]);

  const updateListTitle = useCallback(
    (title: string) => {
      const lists = store$.lists.get();
      const listIndex = lists?.findIndex(({ id }) => id === params.uuid);
      if (listIndex === -1 || typeof listIndex === "undefined") return;
      setListTitle(title);
      
        store$.set({ lists: lists.map((list, index) => {
            if (index === listIndex) {
                return { ...list, title };
            }
            return list;
        })
        });
    },
    [params.uuid, storageKeys.globalLists]
  );

  const { language } = useLanguage();
  const [todos, setTodos] = useState<Todo[]>(
    storage.get(storageKeys.todos, [])
  );
  const [newTodo, setNewTodo] = useState("");
  const [listTitle, setListTitle] = useState(getListTitle());
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [directInputId, setDirectInputId] = useState<number | null>(null);
  const [directInputValue, setDirectInputValue] = useState('');  // Add this state

  // Combine initialization effects
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (typeof window !== "undefined") {
      setTodos(storage.get(storageKeys.todos, []));
      setIsInitializing(false);
    }
  }, [params.uuid, storageKeys.todos]);

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
    // Add validation for the prediction
    const trimmed = prediction.trim();
    if (trimmed.length > 2 || !trimmed.match(/\p{Emoji}/u)) {
      return DEFAULT_CATEGORY;
    }
    return trimmed;
  };

  const getCurrentItems = () => {
    return todos.map((todo) => todo.text).join(", ");
  };

  const extractItems = async (text: string, listTitle: string) => {
    const currentItems = getCurrentItems();
    const prompt = `Create a list of individual items from this text, considering this is a list titled "${listTitle}". If the text includes phrases like "add more items" or "add to the list", suggest relevant items that fit the list title and aren't already in the list. Return result as a JSON array of strings.

Current list items: ${currentItems}

Examples:
Input: "milk, bread and eggs" (list: "Groceries", empty list)
Output: ["milk", "bread", "eggs"]

Input: "add more items" (list: "Groceries", current: milk, bread)
Output: ["eggs", "cheese", "butter"]

Input: "add more" (list: "Office Supplies", current: paper, pens)
Output: ["stapler", "sticky notes", "paper clips"]

Create a list of items based on the following text: "${text}"

Your answer should include ONLY a valid JSON array of strings in the same language as the title and other items.`;

    const result = await getCompletion(prompt);
    try {
      return JSON.parse(result) as string[];
    } catch {
      toast({
        title: "Invalid response format",
        description: (
          <div className="mt-2">
            <p className="mb-2">
              I couldn&apos;t parse the response as JSON. Here&apos;s what I
              received:
            </p>
            <pre className="bg-secondary p-2 rounded-md text-xs overflow-auto whitespace-pre-wrap">
              {result}
            </pre>
          </div>
        ),
        variant: "destructive",
        duration: Infinity, // Keep toast open indefinitely
      });
      throw new Error("JSON parse failed");
    }
  };

  const addTodo = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (newTodo.trim() === "" || isLoading) return;

    setIsLoading(true);
    try {
      const items = await extractItems(newTodo, listTitle);
      const newTodos = await Promise.all(
        items.map(async (item) => {
          const categoryPrediction = await predictCategory(item, listTitle);
          return {
            id: Date.now() + Math.random(),
            text: item,
            done: false,
            category: categoryPrediction || DEFAULT_CATEGORY, // Use default if prediction fails
          };
        })
      );
      setTodos((prevTodos) => [...prevTodos, ...newTodos]);
      setNewTodo("");
    } catch (error) {
      console.error("Failed to process items:", error);
      // Don't clear the input on parse error so user can try again
      if (!(error instanceof Error && error.message === "JSON parse failed")) {
        setNewTodo("");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDirectInput = (text: string) => {
    setDirectInputValue(text);  // Update input value state
    if (!directInputId && text) {
      // Create new todo on first keystroke
      const newId = Date.now() + Math.random();
      setDirectInputId(newId);
      setTodos(prev => [...prev, {
        id: newId,
        text,
        done: false,
        category: DEFAULT_CATEGORY
      }]);
    } else if (directInputId) {
      // Update existing todo
      setTodos(prev => prev.map(todo =>
        todo.id === directInputId ? { ...todo, text } : todo
      ));
    }
  };

  const finishDirectInput = () => {
    if (directInputValue.trim() === '') {
      // Remove empty todos
      setTodos(prev => prev.filter(todo => todo.id !== directInputId));
    }
    setDirectInputId(null);
    setDirectInputValue('');  // Reset input value
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

  const clearAllTodos = () => {
    if (window.confirm(translations[language].clearConfirm)) {
      setTodos([]);
    }
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
            onChange={(e) => updateListTitle(e.target.value)}
            className="text-xl font-semibold bg-transparent border-none focus-visible:ring-0 p-0"
            placeholder={translations[language].listTitlePlaceholder}
            dir={language === "he" ? "rtl" : "ltr"}
          />
          {todos.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllTodos}
              className="text-gray-400 hover:text-red-500 hover:bg-red-50"
            >
              {translations[language].clearAll}
            </Button>
          )}
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
          {/* Add direct input below list */}
          <div className="flex items-center gap-2 mt-2">
            <Checkbox disabled checked={false} style={{ visibility: 'hidden' }}/>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm whitespace-nowrap">{DEFAULT_CATEGORY}</span>
                <Input
                  type="text"
                  className="flex-1"
                  dir={language === "he" ? "rtl" : "ltr"}
                  placeholder={translations[language].addTodo}
                  value={directInputValue}  // Use controlled input value
                  onChange={(e) => handleDirectInput(e.target.value)}
                  onBlur={() => finishDirectInput()}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      finishDirectInput();
                    }
                  }}
                />
              </div>
            </div>
            <div className="w-9" /> {/* Spacer for alignment */}
          </div>
        </div>

        <form
          onSubmit={addTodo}
          className="flex mt-4 relative"
          dir={language === "he" ? "rtl" : "ltr"}
        >
          <Input
            id="newTodo"
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTodo()}
            placeholder={translations[language].askAssistant}
            autoComplete="off"
            aria-label={translations[language].askAssistant}
            disabled={isLoading}
            dir={language === "he" ? "rtl" : "ltr"}
            className="pr-12 rounded-full bg-muted/40" // Add these classes
          />
          <Button 
            type="submit" 
            size="icon"
            variant="ghost"
            disabled={isLoading}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-transparent"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
});

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
