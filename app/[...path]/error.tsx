"use client"
export default function error({ error }: {
    error: Error & { digest?: string }
    reset: () => void
  }) {
    return <div className="h-full flex flex-col items-center justify-center">
        {error.message}
    </div>
}