"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import MobileNav from "../../components/MobileNav";
import { supabase } from "../../lib/supabase";

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [files, setFiles] = useState<any[]>([]);
  const [userEmail, setUserEmail] = useState("");
  const [selectedImage, setSelectedImage] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [search, setSearch] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const userName = userEmail ? userEmail.split("@")[0] : "";

  function isImageFile(url: string) {
    const lowerUrl = url.toLowerCase();

    return (
      lowerUrl.includes(".jpg") ||
      lowerUrl.includes(".jpeg") ||
      lowerUrl.includes(".png") ||
      lowerUrl.includes(".webp") ||
      lowerUrl.includes(".gif")
    );
  }

  function getFileName(url: string) {
    return decodeURIComponent(url.split("/").pop() || "Open File");
  }

  async function fetchEvents() {
    const { data } = await supabase.from("events").select("*");
    setEvents(data || []);
  }

  async function logout() {
    await supabase.auth.signOut();
    localStorage.removeItem("userEmail");
    window.location.href = "/";
  }

  async function deleteEvent(id: string) {
    if (!confirm("Delete this event?")) return;

    const { data, error } = await supabase
      .from("events")
      .delete()
      .eq("id", id)
      .select();

    if (error || !data || data.length === 0) {
      alert("Delete failed. You can delete only your own event.");
      return;
    }

    alert("Event deleted");
    fetchEvents();
  }

  async function addEvent() {
    if (!title || !description || !date || !location || files.length === 0) {
      alert("Please fill all fields and choose at least one file");
      return;
    }

    setIsAdding(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Please login first");
      setIsAdding(false);
      return;
    }

    const uploadedUrls = await Promise.all(
      files.map(async (file) => {
        const fileName = `${Date.now()}-${file.name}`;

        const { error: uploadError } = await supabase.storage
          .from("post-images")
          .upload(fileName, file);

        if (uploadError) {
          throw uploadError;
        }

        return supabase.storage
          .from("post-images")
          .getPublicUrl(fileName).data.publicUrl;
      })
    ).catch((error) => {
      console.log(error);
      alert("File upload failed");
      setIsAdding(false);
      return null;
    });

    if (!uploadedUrls) return;

    const { error } = await supabase.from("events").insert([
      {
        title: title.trim(),
        description: description.trim(),
        date: date.trim(),
        location: location.trim(),
        image_urls: uploadedUrls,
        user_id: user.id,
      },
    ]);

    if (error) {
      alert("Error adding event");
    } else {
      alert("Event added successfully");

      setTitle("");
      setDescription("");
      setDate("");
      setLocation("");
      setFiles([]);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      fetchEvents();
    }

    setIsAdding(false);
  }

  useEffect(() => {
    const savedEmail = localStorage.getItem("userEmail");

    if (savedEmail) {
      setUserEmail(savedEmail);
    }

    async function checkAuth() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/";
        return;
      }

      setUserEmail(user.email || "");
      localStorage.setItem("userEmail", user.email || "");

      fetchEvents();
    }

    checkAuth();
  }, []);

  const filteredEvents = events.filter((event) => {
    return (
      event.title?.toLowerCase().includes(search.toLowerCase()) ||
      event.description?.toLowerCase().includes(search.toLowerCase()) ||
      event.location?.toLowerCase().includes(search.toLowerCase()) ||
      event.date?.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="min-h-screen grid lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:flex flex-col justify-between border-r border-white/10 bg-black p-6">
          <div>
            <div className="flex items-center gap-3 mb-10">
              <div className="h-12 w-12 rounded-2xl bg-purple-600 flex items-center justify-center text-2xl font-black">
                C
              </div>

              <div>
                <h1 className="text-xl font-bold">Campus Circle</h1>
                <p className="text-xs text-gray-400">Student network</p>
              </div>
            </div>

            <nav className="space-y-3">
              <Link href="/home" className="block rounded-2xl px-5 py-4 text-gray-300">
                🏠 Lost & Found
              </Link>

              <Link href="/notes" className="block rounded-2xl px-5 py-4 text-gray-300">
                📄 Notes
              </Link>

              <Link
                href="/events"
                className="block rounded-2xl bg-purple-600/30 border border-purple-400/30 px-5 py-4 font-semibold"
              >
                📅 Events
              </Link>

              <Link href="/marketplace" className="block rounded-2xl px-5 py-4 text-gray-300">
                🛒 Marketplace
              </Link>
            </nav>
          </div>

          <button
            onClick={logout}
            className="w-full rounded-2xl bg-red-500/15 border border-red-500/30 text-red-200 px-5 py-4"
          >
            Logout
          </button>
        </aside>

        <section className="p-5 md:p-8 lg:p-10">
          <MobileNav active="events" logout={logout} />

          <header className="mb-10">
            {userName && (
              <p className="text-purple-300 mb-3 text-lg">
                Hello, {userName} 👋
              </p>
            )}

            <h2 className="text-4xl md:text-6xl font-black leading-tight">
              Campus
              <br />
              <span className="text-purple-400">
                Events Dashboard
              </span>
            </h2>

            <p className="text-gray-400 mt-4 max-w-2xl text-lg">
              Explore and share campus events, workshops, hackathons, and meetups.
            </p>
          </header>

          <div className="grid xl:grid-cols-[1fr_430px] gap-8">
            <section>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
                <div>
                  <h3 className="text-2xl font-bold">Upcoming Events</h3>

                  <p className="text-sm text-gray-500">
                    Showing {filteredEvents.length} of {events.length} events
                  </p>
                </div>

                <input
                  className="w-full md:w-80 px-4 py-3 rounded-2xl bg-zinc-900 border border-white/10 text-white placeholder:text-gray-500 outline-none"
                  placeholder="Search events..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="space-y-5">
                {filteredEvents.map((event) => (
                  <div
                    key={event.id}
                    className="rounded-3xl border border-white/10 bg-zinc-900 p-5"
                  >
                    {event.image_urls && event.image_urls.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5">
                        {event.image_urls.map((url: string, index: number) =>
                          isImageFile(url) ? (
                            <img
                              key={index}
                              src={url}
                              onClick={() => setSelectedImage(url)}
                              className="w-full h-36 object-cover rounded-2xl cursor-pointer"
                            />
                          ) : (
                            <a
                              key={index}
                              href={url}
                              target="_blank"
                              className="h-36 rounded-2xl bg-black border border-white/10 flex flex-col items-center justify-center text-center p-4"
                            >
                              <span className="text-3xl mb-2">📄</span>

                              <span className="text-sm text-gray-300 line-clamp-2">
                                {getFileName(url)}
                              </span>
                            </a>
                          )
                        )}
                      </div>
                    )}

                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <span className="inline-block px-4 py-1 rounded-full text-sm font-semibold mb-3 bg-purple-500/20 text-purple-300">
                          📅 {event.date}
                        </span>

                        <h4 className="text-2xl font-bold">
                          {event.title}
                        </h4>

                        <p className="text-gray-400 mt-2">
                          {event.description}
                        </p>

                        <p className="text-gray-500 mt-3">
                          📍 {event.location}
                        </p>
                      </div>

                      <button
                        onClick={() => deleteEvent(event.id)}
                        className="rounded-lg bg-red-500/10 border border-red-500/20 text-red-200 px-3 py-1.5 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <aside className="rounded-3xl border border-white/10 bg-zinc-900 p-6 h-fit sticky top-8">
              <h3 className="text-2xl font-bold mb-2">
                Add Event
              </h3>

              <div className="space-y-4">
                <input
                  className="w-full p-4 rounded-2xl bg-black border border-white/10 text-white placeholder:text-gray-500 outline-none"
                  placeholder="Event title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />

                <textarea
                  className="w-full p-4 rounded-2xl bg-black border border-white/10 text-white placeholder:text-gray-500 outline-none"
                  placeholder="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />

                <input
                  className="w-full p-4 rounded-2xl bg-black border border-white/10 text-white placeholder:text-gray-500 outline-none"
                  placeholder="Date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />

                <input
                  className="w-full p-4 rounded-2xl bg-black border border-white/10 text-white placeholder:text-gray-500 outline-none"
                  placeholder="Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />

                <div className="rounded-2xl border border-dashed border-purple-400/40 bg-black p-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={(e) =>
                      setFiles(Array.from(e.target.files || []))
                    }
                  />
                </div>

                <button
                  onClick={addEvent}
                  disabled={isAdding}
                  className="w-full bg-purple-600 text-white px-6 py-4 rounded-2xl font-bold disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isAdding ? "Adding..." : "Add Event"}
                </button>
              </div>
            </aside>
          </div>
        </section>
      </div>

      {selectedImage && (
        <div
          onClick={() => setSelectedImage("")}
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-6"
        >
          <img
            src={selectedImage}
            className="max-w-full max-h-full rounded-2xl"
          />

          <button
            onClick={() => setSelectedImage("")}
            className="absolute top-6 right-6 text-white text-3xl"
          >
            ✕
          </button>
        </div>
      )}
    </main>
  );
}