import { HomeSplash } from "@/components/HomeSplash";

export default function HomePage() {
  return (
    <>
      <HomeSplash />
      <main className="min-h-screen bg-[#f4f5f7] text-stone-900">
        <div className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 py-16 text-center">
          <p className="text-sm font-semibold tracking-[0.2em] text-[#3b62ee] uppercase">
            Volmiq
          </p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">
            <span className="text-[#3b62ee]">Vol</span>
            <span className="text-[#7c5cff]">miq</span>
          </h1>
          <p className="mt-4 max-w-lg text-base font-medium tracking-[0.18em] text-stone-500 uppercase">
            <span className="text-[#3b62ee]">Your Voice.</span>{" "}
            <span className="text-[#7c5cff]">Your Community.</span>
          </p>
          <p className="mt-6 max-w-md text-stone-600">
            Real questions. Real answers. Canada-first communities for people
            who want practical help — not noise.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#browse"
              className="rounded-full bg-[#3b62ee] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#2f54d4]"
            >
              Browse communities
            </a>
            <a
              href="#join"
              className="rounded-full border border-stone-300 bg-white px-6 py-3 text-sm font-semibold text-stone-800 transition hover:border-[#3b62ee] hover:text-[#3b62ee]"
            >
              Join Volmiq
            </a>
          </div>
        </div>
      </main>
    </>
  );
}
