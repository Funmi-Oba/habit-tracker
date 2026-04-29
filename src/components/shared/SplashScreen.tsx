export default function SplashScreen() {
  return (
    <div
      data-testid="splash-screen"
      className="flex flex-col items-center justify-center min-h-screen bg-indigo-600"
    >
      <h1 className="text-4xl font-bold tracking-tight text-white">
        Habit Tracker
      </h1>
      <p className="mt-2 text-sm text-indigo-200">Build better habits daily</p>
    </div>
  )
}