"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

export default function NotesPage() {
  const [notes, setNotes] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<any[]>([]);
  const [userEmail, setUserEmail] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [search, setSearch] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const userName = userEmail ? userEmail.split("@")[0] : "";

  function getFileName(url: string) {
    return decodeURIComponent(url.split("/").pop() || "Open File");
  }

  async function fetchNotes() {
    const { data } = await supabase.from("notes").select("*");
    setNotes(data || []);
  }

  async function logout() {
    await supabase.auth.signOut();
    localStorage.removeItem("userEmail");
    window.location.href = "/";
  }

  async function deleteNote(id: string) {
    if (!confirm("Delete this note?")) return;

    const { data, error } = await supabase
      .from("notes")
      .delete()
      .eq("id", id)
      .select();

    if (error || !data || data.length === 0) {
      alert("Delete failed. You can delete only your own note.");
      return;
    }

    alert("Note deleted");
    fetchNotes();
  }

  async function addNote() {
    if (!title || !subject || !description || files.length === 0) {
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

    const { error } = await supabase.from("notes").insert([
      {
        title: title.trim(),
        subject: subject.trim(),
        description: description.trim(),
        file_urls: uploadedUrls,
        user_id: user.id,
      },
    ]);

    if (error) {
      alert("Error adding note");
    } else {
      alert("Note added successfully");

      setTitle("");
      setSubject("");
      setDescription("");
      setFiles([]);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      fetchNotes();
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

      fetchNotes();
    }

    checkAuth();
  }, []);

  const filteredNotes = notes.filter((note) => {
    return (
      note.title?.toLowerCase().includes(search.toLowerCase()) ||
      note.description?.toLowerCase().includes(search.toLowerCase()) ||
      note.subject?.toLowerCase().includes(search.toLowerCase())
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
              <Link
                href="/home"
                className="block rounded-2xl px-5 py-4 text-gray-300"
              >
                🏠 Lost & Found
              </Link>

              <Link
                href="/notes"
                className="block rounded-2xl bg-purple-600/30 border border-purple-400/30 px-5 py-4 font-semibold"
              >
                📄 Notes
              </Link>

              <Link
                href="/events"
                className="block rounded-2xl px-5 py-4 text-gray-300"
              >
                📅 Events
              </Link>

              <Link
                href="/marketplace"
                className="block rounded-2xl px-5 py-4 text-gray-300"
              >
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
          <header className="mb-10">
            {userName && (
              <p className="text-purple-300 mb-3 text-lg">
                Hello, {userName} 👋
              </p>
            )}

            <h2 className="text-4xl md:text-6xl font-black leading-tight">
              Notes
              <br />
              <span className="text-purple-400">
                Sharing Dashboard
              </span>
            </h2>
          </header>

          <div className="grid xl:grid-cols-[1fr_430px] gap-8">
            <section>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
                <div>
                  <h3 className="text-2xl font-bold">Shared Notes</h3>
                </div>

                <input
                  className="w-full md:w-80 px-4 py-3 rounded-2xl bg-zinc-900 border border-white/10 text-white placeholder:text-gray-500 outline-none"
                  placeholder="Search notes..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="space-y-5">
                {filteredNotes.map((note) => (
                  <div
                    key={note.id}
                    className="rounded-3xl border border-white/10 bg-zinc-900 p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex-1">
                        <span className="inline-block px-4 py-1 rounded-full text-sm font-semibold mb-3 bg-blue-500/20 text-blue-300">
                          📘 {note.subject}
                        </span>

                        <h4 className="text-2xl font-bold">
                          {note.title}
                        </h4>

                        <p className="text-gray-400 mt-2">
                          {note.description}
                        </p>

                        {note.file_urls && note.file_urls.length > 0 && (
                          <div className="mt-5 grid sm:grid-cols-2 gap-3">
                            {note.file_urls.map(
                              (url: string, index: number) => (
                                <a
                                  key={index}
                                  href={url}
                                  target="_blank"
                                  className="rounded-2xl bg-black border border-white/10 p-4 flex items-center gap-3"
                                >
                                  <span className="text-2xl">📄</span>

                                  <div className="min-w-0">
                                    <p className="text-sm font-semibold">
                                      Open File {index + 1}
                                    </p>

                                    <p className="text-xs text-gray-500 truncate">
                                      {getFileName(url)}
                                    </p>
                                  </div>
                                </a>
                              )
                            )}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => deleteNote(note.id)}
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
              <h3 className="text-2xl font-bold mb-2">Add Note</h3>

              <div className="space-y-4">
                <input
                  className="w-full p-4 rounded-2xl bg-black border border-white/10 text-white placeholder:text-gray-500 outline-none"
                  placeholder="Note title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />

                <input
                  className="w-full p-4 rounded-2xl bg-black border border-white/10 text-white placeholder:text-gray-500 outline-none"
                  placeholder="Subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />

                <textarea
                  className="w-full p-4 rounded-2xl bg-black border border-white/10 text-white placeholder:text-gray-500 outline-none"
                  placeholder="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
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
                  onClick={addNote}
                  disabled={isAdding}
                  className="w-full bg-purple-600 text-white px-6 py-4 rounded-2xl font-bold disabled:opacity-60"
                >
                  {isAdding ? "Adding..." : "Add Note"}
                </button>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}