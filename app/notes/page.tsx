"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function NotesPage() {
  const [notes, setNotes] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<any[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  async function fetchNotes() {
    const { data } = await supabase.from("notes").select("*");
    setNotes(data || []);
  }

  async function logout() {
    await supabase.auth.signOut();
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
      alert("Delete failed. Check RLS policy.");
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

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Please login first");
      return;
    }

    const uploadedUrls: string[] = [];

    for (const file of files) {
      const fileName = `${Date.now()}-${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("post-images")
        .upload(fileName, file);

      if (uploadError) {
        alert("File upload failed");
        return;
      }

      const fileUrl = supabase.storage
        .from("post-images")
        .getPublicUrl(fileName).data.publicUrl;

      uploadedUrls.push(fileUrl);
    }

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

      fetchNotes();
    }

    checkAuth();
  }, []);

  return (
    <main className="min-h-screen bg-black text-white px-6 md:px-16 py-10">
      <nav className="flex flex-wrap gap-4 mb-10 items-center">
        <a href="/home" className="bg-zinc-800 text-white px-5 py-3 rounded-xl">
          Lost & Found
        </a>

        <a href="/notes" className="bg-white text-black px-5 py-3 rounded-xl">
          Notes
        </a>

        <a href="/events" className="bg-zinc-800 text-white px-5 py-3 rounded-xl">
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

      <h1 className="text-5xl font-bold mb-10">
        Notes Sharing
      </h1>

      <div className="bg-zinc-900 p-8 rounded-3xl mb-12 max-w-2xl border border-zinc-800 shadow-xl">
        <h2 className="text-2xl font-bold mb-4">
          Add Note
        </h2>

        <input
          className="w-full p-3 mb-4 rounded-xl bg-white text-black"
          placeholder="Note title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          className="w-full p-3 mb-4 rounded-xl bg-white text-black"
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />

        <textarea
          className="w-full p-3 mb-4 rounded-xl bg-white text-black"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="mb-6">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={(e) => setFiles(Array.from(e.target.files || []))}
          />

          {files.length > 0 && (
            <div className="mt-3 space-y-2">
              {files.map((file, index) => (
                <div key={index} className="flex items-center gap-3">
                  <p className="text-gray-300 text-sm">
                    {file.name}
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      const updated = files.filter((_, i) => i !== index);
                      setFiles(updated);

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
          onClick={addNote}
          className="bg-white text-black px-6 py-3 rounded-xl font-semibold"
        >
          Add Note
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {notes.map((note) => (
          <div
            key={note.id}
            className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800 shadow-lg"
          >
            <p className="text-blue-400 mb-2 font-semibold">
              {note.subject}
            </p>

            <h2 className="text-2xl font-bold">
              {note.title}
            </h2>

            <p className="text-gray-400 mt-2">
              {note.description}
            </p>

            {note.file_urls && note.file_urls.length > 0 && (
              <div className="mt-4 space-y-2">
                {note.file_urls.map((url: string, index: number) => (
                  <a
                    key={index}
                    href={url}
                    target="_blank"
                    className="block bg-white text-black px-5 py-3 rounded-xl font-semibold"
                  >
                    Open File {index + 1}
                  </a>
                ))}
              </div>
            )}

            <button
              onClick={() => deleteNote(note.id)}
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded-xl"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}