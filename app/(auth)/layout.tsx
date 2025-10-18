export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <main className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-lg">
        <header className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Strat Plan</h1>
          <p className="mt-2 text-sm text-gray-600">Strategic Planning System</p>
        </header>
        {children}
      </main>
    </div>
  )
}
