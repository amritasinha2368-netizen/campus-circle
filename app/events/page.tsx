"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [images, setImages] = useState<any[]>([]);
  const [selectedImage, setSelectedImage] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  async function fetchEvents() {
    const { data } = await supabase.from("events").select("*");
    setEvents(data || []);
  }

  async function logout() {
    await supabase.auth.signOut();
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
      alert("Delete failed. Check RLS policy.");
      return;
    }

    alert("Event deleted");
    fetchEvents();
  }

  async function addEvent() {
    if (!title || !description || !date || !location || images.length === 0) {
      alert("Please fill all fields and choose at least one image");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Please login first");
      return;
    }

    const uploadedUrls: string[] = [];

    for (const image of images) {
      const fileName = `${Date.now()}-${image.name}`;

      const { error: uploadError } = await supabase.storage
        .from("post-images")
        .upload(fileName, image);

      if (uploadError) {
        alert("Image upload failed");
        return;
      }

      const imageUrl = supabase.storage
        .from("post-images")
        .getPublicUrl(fileName).data.publicUrl;

      uploadedUrls.push(imageUrl);
    }

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
      setImages([]);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      fetchEvents();
    }
  }

  useEffect(() => {
    async function checkAuth() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/";
        return;
      }

      fetchEvents();
    }

    checkAuth();
  }, []);

  return (
    <main className="min-h-screen bg-black text-white px-6 md:px-16 py-10">
      <nav className="flex flex-wrap gap-4 mb-10 items-center">
        <a href="/home" className="bg-zinc-800 text-white px-5 py-3 rounded-xl">
          Lost & Found
        </a>

        <a href="/notes" className="bg-zinc-800 text-white px-5 py-3 rounded-xl">
          Notes
        </a>

        <a href="/events" className="bg-white text-black px-5 py-3 rounded-xl">
          Events
        </a>

        <a href="/marketplace" className="bg-zinc-800 text-white px-5 py-3 rounded-xl">
          Marketplace
        </a>

        <button
          onClick={logout}
          className="bg-red-500 text-white px-5 py-3 rounded-xl"
        >
          Logout
        </button>
      </nav>

      <h1 className="text-5xl font-bold mb-10">Events</h1>

      <div className="bg-zinc-900 p-8 rounded-3xl mb-12 max-w-2xl border border-zinc-800 shadow-xl">
        <h2 className="text-2xl font-bold mb-4">Add Event</h2>

        <input
          className="w-full p-3 mb-4 rounded-xl bg-white text-black"
          placeholder="Event title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          className="w-full p-3 mb-4 rounded-xl bg-white text-black"
          placeholder="Event description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <input
          className="w-full p-3 mb-4 rounded-xl bg-white text-black"
          placeholder="Date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <input
          className="w-full p-3 mb-4 rounded-xl bg-white text-black"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

        <div className="mb-6">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={(e) => setImages(Array.from(e.target.files || []))}
          />

          {images.length > 0 && (
            <div className="mt-3 space-y-2">
              {images.map((image, index) => (
                <div key={index} className="flex items-center gap-3">
                  <p className="text-gray-300 text-sm">{image.name}</p>

                  <button
                    type="button"
                    onClick={() => {
                      const updated = images.filter((_, i) => i !== index);
                      setImages(updated);

                      if (updated.length === 0 && fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                    }}
                    className="text-gray-400 hover:text-white text-sm"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={addEvent}
          className="bg-white text-black px-6 py-3 rounded-xl font-semibold"
        >
          Add Event
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {events.map((event) => (
          <div
            key={event.id}
            className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800 shadow-lg"
          >
            {event.image_urls && event.image_urls.length > 0 && (
              <div className="grid grid-cols-2 gap-3 mb-4">
                {event.image_urls.map((url: string, index: number) => (
                  <img
                    key={index}
                    src={url}
                    onClick={() => setSelectedImage(url)}
                    className="w-full h-40 object-cover rounded-xl cursor-pointer"
                  />
                ))}
              </div>
            )}

            <p className="text-purple-400 mb-2 font-semibold">
              📅 {event.date}
            </p>

            <h2 className="text-2xl font-bold">{event.title}</h2>

            <p className="text-gray-400 mt-2">{event.description}</p>

            <p className="text-gray-500 mt-2">📍 {event.location}</p>

            <button
              onClick={() => deleteEvent(event.id)}
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded-xl"
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      {selectedImage && (
        <div
          onClick={() => setSelectedImage("")}
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6"
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