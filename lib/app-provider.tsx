"use client"

import * as React from "react"

const appContext = React.createContext<AppContext | null>(null)

export function useAppContext() {
  const context = React.useContext(appContext)
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider")
  }
  return context
}

export function AppProvider({ app, children }: React.PropsWithChildren<{ app: Application }>) {
  return <appContext.Provider value={{ app }}>{children}</appContext.Provider>
}

type AppContext = {
  app: Application
}


export type Application = {
  id: number
}