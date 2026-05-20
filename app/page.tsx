export default function LandingPage() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6">

      <h1 className="text-7xl font-extrabold mb-6">
        Campus Circle
      </h1>

      <p className="text-gray-400 text-xl mb-10 text-center max-w-2xl">
        Your all-in-one campus platform for Lost & Found,
        Notes sharing, Events and Marketplace.
      </p>

      <div className="flex gap-6">

        <a
          href="/login"
          className="bg-white text-black px-8 py-4 rounded-2xl text-lg font-semibold"
        >
          Login
        </a>

        <a
          href="/signup"
          className="bg-zinc-800 text-white px-8 py-4 rounded-2xl text-lg font-semibold"
        >
          Sign Up
        </a>
        </div>

    </main>
  );
}

     