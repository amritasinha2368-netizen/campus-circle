
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import MobileNav from "../../components/MobileNav";
import { supabase } from "../../lib/supabase";

export default function Home() {
  const [posts, setPosts] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("Lost");
  const [location, setLocation] = useState("");
  const [lastSeen, setLastSeen] = useState("");
  const [collectorName, setCollectorName] = useState("");
  const [reward, setReward] = useState("");
  const [files, setFiles] = useState<any[]>([]);
  const [userEmail, setUserEmail] = useState("");
  const [selectedImage, setSelectedImage] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

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

  async function fetchPosts() {
    const { data } = await supabase.from("posts").select("*");
    setPosts(data || []);
  }

  async function logout() {
    await supabase.auth.signOut();
    localStorage.removeItem("userEmail");
    window.location.href = "/";
  }

  async function uploadFile(file: any) {
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "-");

    const fileName = `${Date.now()}-${safeName}`;

    const { error } = await supabase.storage
      .from("post-images")
      .upload(fileName, file);

    if (error) {
      throw error;
    }

    return supabase.storage.from("post-images").getPublicUrl(fileName)
      .data.publicUrl;
  }

  async function addPost() {
    if (!title || !description || !location || files.length === 0) {
      alert("Please fill all required fields");
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

    try {
      const uploadedUrls = await Promise.all(
        files.map((file) => uploadFile(file))
      );

      const { error } = await supabase.from("posts").insert([
        {
          title: title.trim(),
          description: description.trim(),
          type,
          location: location.trim(),
          last_seen: lastSeen.trim(),
          collector_name: collectorName.trim(),
          reward: reward.trim(),
          image_urls: uploadedUrls,
          user_id: user.id,
        },
      ]);

      if (error) {
        console.log(error);
        alert("Error adding post");
      } else {
        alert("Post added successfully");

        setTitle("");
        setDescription("");
        setType("Lost");
        setLocation("");
        setLastSeen("");
        setCollectorName("");
        setReward("");
        setFiles([]);

        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }

        fetchPosts();
      }
    } catch (error) {
      console.log(error);
      alert("Upload failed");
    }

    setIsAdding(false);
  }

  async function deletePost(id: string) {
    if (!confirm("Delete this post?")) return;

    const { data, error } = await supabase
      .from("posts")
      .delete()
      .eq("id", id)
      .select();

    if (error || !data || data.length === 0) {
      alert("Delete failed");
      return;
    }

    fetchPosts();
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

      fetchPosts();
    }

    checkAuth();
  }, []);

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title?.toLowerCase().includes(search.toLowerCase()) ||
      post.description?.toLowerCase().includes(search.toLowerCase());

    const matchesFilter = filter === "All" || post.type === filter;

    return matchesSearch && matchesFilter;
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
                className="block rounded-2xl bg-purple-600/30 border border-purple-400/30 px-5 py-4 font-semibold"
              >
                🏠 Lost & Found
              </Link>

              <Link
                href="/notes"
                className="block rounded-2xl px-5 py-4 text-gray-300"
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
          <MobileNav active="home" logout={logout} />

          <header className="mb-10">
            {userName && (
              <p className="text-purple-300 mb-3 text-lg">
                Hello, {userName} 👋
              </p>
            )}

            <h2 className="text-4xl md:text-6xl font-black leading-tight">
              Lost & Found
              <br />
              <span className="text-purple-400">Campus Dashboard</span>
            </h2>

            <p className="text-gray-400 mt-4 max-w-2xl text-lg">
              Post lost or found items and help students reconnect with belongings.
            </p>
          </header>

          <div className="grid xl:grid-cols-[1fr_430px] gap-8">
            <section>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
                <div>
                  <h3 className="text-2xl font-bold">Recent Posts</h3>
                  <p className="text-sm text-gray-500">
                    Showing {filteredPosts.length} of {posts.length} posts
                  </p>
                </div>

                <input
                  className="w-full md:w-80 px-4 py-3 rounded-2xl bg-zinc-900 border border-white/10 text-white placeholder:text-gray-500 outline-none"
                  placeholder="Search items..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="flex gap-3 mb-6">
                <button
                  onClick={() => setFilter("All")}
                  className={`px-5 py-3 rounded-2xl ${filter === "All" ? "bg-purple-600" : "bg-zinc-900 border border-white/10"}`}
                >
                  All
                </button>

                <button
                  onClick={() => setFilter("Lost")}
                  className={`px-5 py-3 rounded-2xl ${filter === "Lost" ? "bg-purple-600" : "bg-zinc-900 border border-white/10"}`}
                >
                  Lost
                </button>

                <button
                  onClick={() => setFilter("Found")}
                  className={`px-5 py-3 rounded-2xl ${filter === "Found" ? "bg-purple-600" : "bg-zinc-900 border border-white/10"}`}
                >
                  Found
                </button>
              </div>

              <div className="space-y-5">
                {filteredPosts.map((post) => (
                  <div
                    key={post.id}
                    className="rounded-3xl border border-white/10 bg-zinc-900 p-5"
                  >
                    {post.image_urls && post.image_urls.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5">
                        {post.image_urls.map((url: string, index: number) =>
                          isImageFile(url) ? (
                            <img
                              key={index}
                              src={url}
                              onClick={() => setSelectedImage(url)}
                              className="w-full h-36 object-cover rounded-2xl cursor-pointer"
                              alt="Post"
                            />
                          ) : null
                        )}
                      </div>
                    )}

                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <span
                          className={`inline-block px-4 py-1 rounded-full text-sm font-semibold mb-3 ${
                            post.type === "Lost"
                              ? "bg-purple-500/20 text-purple-300"
                              : "bg-green-500/20 text-green-300"
                          }`}
                        >
                          {post.type}
                        </span>

                        <h4 className="text-2xl font-bold">
                          {post.title}
                        </h4>

                        <p className="text-gray-400 mt-2">
                          {post.description}
                        </p>

                        {post.last_seen && (
                          <p className="text-gray-500 mt-3">
                            📍 Last seen: {post.last_seen}
                          </p>
                        )}

                        <p className="text-gray-500 mt-3">
                          📦 Collect near: {post.location}
                        </p>

                        {post.collector_name && (
                          <p className="text-gray-500 mt-3">
                            👤 Finder: {post.collector_name}
                          </p>
                        )}

                        {post.reward && (
                          <p className="text-yellow-300 mt-3">
                            🎁 Reward: {post.reward}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => deletePost(post.id)}
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
              <h3 className="text-2xl font-bold mb-2">Add Post</h3>

              <p className="text-gray-400 mb-6">
                Add clear details so students can identify the item quickly.
              </p>

              <div className="space-y-4">
                <input
                  className="w-full p-4 rounded-2xl bg-black border border-white/10 text-white placeholder:text-gray-500 outline-none"
                  placeholder="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />

                <textarea
                  className="w-full p-4 rounded-2xl bg-black border border-white/10 text-white placeholder:text-gray-500 outline-none"
                  placeholder="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />

               <select
  className="w-full p-4 rounded-2xl bg-black text-white border border-white/10 outline-none appearance-none"
  value={type}
  onChange={(e) => setType(e.target.value)}
>
  <option value="Lost">Lost</option>
  <option value="Found">Found</option>
</select>

                <input
                  className="w-full p-4 rounded-2xl bg-black border border-white/10 text-white placeholder:text-gray-500 outline-none"
                  placeholder="Last seen location"
                  value={lastSeen}
                  onChange={(e) => setLastSeen(e.target.value)}
                />

                <input
                  className="w-full p-4 rounded-2xl bg-black border border-white/10 text-white placeholder:text-gray-500 outline-none"
                  placeholder="Collect it near"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />

                <input
                  className="w-full p-4 rounded-2xl bg-black border border-white/10 text-white placeholder:text-gray-500 outline-none"
                  placeholder="Finder name (optional)"
                  value={collectorName}
                  onChange={(e) => setCollectorName(e.target.value)}
                />

                <input
                  className="w-full p-4 rounded-2xl bg-black border border-white/10 text-white placeholder:text-gray-500 outline-none"
                  placeholder="Reward if returned (optional)"
                  value={reward}
                  onChange={(e) => setReward(e.target.value)}
                />

                <div className="rounded-2xl border border-dashed border-purple-400/40 bg-black p-4">
                  <p className="text-sm text-gray-400 mb-2">
                    Upload images/files
                  </p>

                  <input
  ref={fileInputRef}
  type="file"
  multiple
  accept="image/*,.pdf,.doc,.docx,.ppt,.pptx"
  onChange={(e) =>
    setFiles(Array.from(e.target.files || []))
  }
/>
                  {files.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {files.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between gap-3 rounded-xl bg-zinc-900 px-3 py-2"
                        >
                          <p className="text-gray-300 text-sm truncate">
                            {file.name}
                          </p>

                          <button
                            type="button"
                            onClick={() => {
                              const updated = files.filter(
                                (_, i) => i !== index
                              );

                              setFiles(updated);

                              if (
                                updated.length === 0 &&
                                fileInputRef.current
                              ) {
                                fileInputRef.current.value = "";
                              }
                            }}
                            className="text-gray-400 text-sm"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={addPost}
                  disabled={isAdding}
                  className="w-full bg-purple-600 text-white px-6 py-4 rounded-2xl font-bold disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isAdding ? "Adding..." : "Add Post"}
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
            alt="Preview"
          />
        </div>
         )}
    </main>
  );
}
      
