import Scoreboard from "./scoreboard";

export default function Home() {
  return (
    <div className="flex flex-1 justify-center bg-zinc-100 px-4 py-10 font-sans dark:bg-black sm:px-8">
      <main className="flex w-full max-w-5xl flex-col gap-8">
        <header className="flex flex-col gap-1">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Darts 501
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Enter each dart separately, then submit the turn to pass to the
            other player.
          </p>
        </header>
        <Scoreboard />
      </main>
    </div>
  );
}
