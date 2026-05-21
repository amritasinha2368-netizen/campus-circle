export default function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-black text-white relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_20%,#7c3aed55,transparent_28%),radial-gradient(circle_at_100%_85%,#ec489955,transparent_30%)]" />
      <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-purple-600 blur-3xl opacity-40" />
      <div className="absolute -bottom-32 -right-32 h-[28rem] w-[28rem] rounded-full bg-pink-600 blur-3xl opacity-40" />

      <nav className="relative z-10 flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-3 text-2xl font-bold">
          <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            C
          </div>
          <span>Campus Circle</span>
        </div>

        <div className="flex gap-4">
          <a
            href="/login"
            className="border border-white/20 px-6 py-3 rounded-xl font-semibold hover:bg-white/10 transition"
          >
            Log in
          </a>

          <a
            href="/signup"
            className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 rounded-xl font-semibold hover:scale-105 transition"
          >
            Sign up
          </a>
        </div>
      </nav>

      <section className="relative z-10 min-h-[80vh] flex flex-col items-center justify-center text-center px-6">
        <div className="mb-8 rounded-full border border-purple-400/40 bg-purple-500/10 px-6 py-2 text-purple-200 backdrop-blur">
          ✨ Built for campus life
        </div>

        <h1 className="text-7xl md:text-8xl font-black tracking-tight leading-none mb-8">
          Campus
          <br />
          <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-orange-300 bg-clip-text text-transparent">
            Circle
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-gray-300 max-w-3xl leading-relaxed mb-10">
          One place for students to share notes, find lost items, discover
          events, and buy or sell campus essentials.
        </p>

        <div className="flex flex-col sm:flex-row gap-5 mb-10">
          <a
            href="/login"
            className="bg-white text-black px-12 py-4 rounded-2xl text-lg font-bold hover:scale-105 transition shadow-2xl"
          >
            Log in
          </a>

          <a
            href="/signup"
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-12 py-4 rounded-2xl text-lg font-bold hover:scale-105 transition shadow-2xl"
          >
            Create Account
          </a>
        </div>

        <p className="text-gray-400 text-lg">
          Lost & Found <span className="text-purple-400 mx-3">•</span>
          Notes <span className="text-purple-400 mx-3">•</span>
          Events <span className="text-purple-400 mx-3">•</span>
          Marketplace
        </p>
         </section>
    </main>
  );
}
      