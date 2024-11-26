"use client"

import React from "react";

export type Language = 'en' | 'he';

export const context = React.createContext<{ language: Language, setLanguage: (language: Language) => void }>({ language: 'en', setLanguage: () => {} });

export function useLanguage() {
    return React.useContext(context);
}


export function LangProvider({ lang, children }: { lang: Language, children: React.ReactNode }) {
    const [language, setLanguage] = React.useState<Language>(lang || 'en');

    async function handleLanguageChange(newLanguage: Language) {
        const response = await fetch('/api/language', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ language: newLanguage }),
        });
          
        if (response.ok) {
            setLanguage(newLanguage);
        }
    }
    


    return <context.Provider value={{ language, setLanguage: handleLanguageChange }}>{children}</context.Provider>;
}