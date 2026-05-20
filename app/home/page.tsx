"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function Home() {
  const [posts, setPosts] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("Lost");
  const [location, setLocation] = useState("");
  const [images, setImages] = useState<any[]>([]);
  const [userEmail, setUserEmail] = useState("");
  const [selectedImage, setSelectedImage] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  async function fetchPosts() {
    const { data, error } = await supabase.from("posts").select("*");

    if (error) {
      console.log(error);
    } else {
      setPosts(data || []);
    }
  }

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  async function deletePost(id: string) {
    if (!confirm("Are you sure you want to delete this post?")) return;

    const { data, error } = await supabase
      .from("posts")
      .delete()
      .eq("id", id)
      .select();

    if (error || !data || data.length === 0) {
      alert("Delete failed. Check RLS policy.");
      return;
    }

    alert("Post deleted");
    fetchPosts();
  }

  async function addPost() {
    if (!title || !description || !location || images.length === 0) {
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

    const { error } = await supabase.from("posts").insert([
      {
        title: title.trim(),
        description: description.trim(),
        type,
        location: location.trim(),
        image_urls: uploadedUrls,
        user_id: user.id,
      },
    ]);

    if (error) {
      alert("Error adding post");
    } else {
      alert("Post added successfully");
      setTitle("");
      setDescription("");
      setLocation("");
      setType("Lost");
      setImages([]);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      fetchPosts();
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

      setUserEmail(user.email || "");
      fetchPosts();
    }

    checkAuth();
  }, []);

  return (
    <main className="min-h-screen bg-black text-white px-6 md:px-16 py-10">
      <nav className="flex flex-wrap gap-4 mb-10 items-center">
        <a href="/home" className="bg-white text-black px-5 py-3 rounded-xl">
          Lost & Found
        </a>

        <a href="/notes" className="bg-zinc-800 text-white px-5 py-3 rounded-xl">
          Notes
        </a>

        <a href="/events" className="bg-zinc-800 text-white px-5 py-3 rounded-xl">
          Events
        </a>

        <a href="/marketplace" className="bg-zinc-800 text-white px-5 py-3 rounded-xl">
          Marketplace
        </a>

        <button onClick={logout} className="bg-red-500 text-white px-5 py-3 rounded-xl">
          Logout
        </button>
      </nav>

      <h1 className="text-6xl font-extrabold mb-6 tracking-tight">
        Campus Circle
      </h1>

      {userEmail && (
        <p className="text-gray-400 mb-8">
          Logged in as {userEmail}
        </p>
      )}

      <div className="bg-zinc-900 p-8 rounded-3xl mb-12 max-w-2xl border border-zinc-800 shadow-xl">
        <h2 className="text-3xl font-bold mb-6">
          Add Lost & Found Post
        </h2>

        <input
          className="w-full p-4 mb-4 rounded-xl bg-white text-black"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          className="w-full p-4 mb-4 rounded-xl bg-white text-black"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <select
          className="w-full p-4 mb-4 rounded-xl bg-white text-black"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="Lost">Lost</option>
          <option value="Found">Found</option>
        </select>

        <input
          className="w-full p-4 mb-4 rounded-xl bg-white text-black"
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
                  <p className="text-gray-300 text-sm">
                    {image.name}
                  </p>

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
          onClick={addPost}
          className="bg-white text-black px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition"
        >
          Add Post
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {posts.map((post) => (
          <div
            key={post.id}
            className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800 shadow-lg"
          >
            {post.image_urls && post.image_urls.length > 0 && (
              <div className="grid grid-cols-2 gap-3 mb-4">
                {post.image_urls.map((url: string, index: number) => (
                  <img
                    key={index}
                    src={url}
                    onClick={() => setSelectedImage(url)}
                    className="w-full h-40 object-cover rounded-xl cursor-pointer"
                  />
                ))}
              </div>
            )}

            <p className="text-green-400 mb-2 font-semibold">
              {post.type}
            </p>

            <h2 className="text-2xl font-bold">
              {post.title}
            </h2>

            <p className="text-gray-400 mt-2">
              {post.description}
            </p>

            <p className="text-gray-500 mt-2">
              📍 {post.location}
            </p>

            <button
              onClick={() => deletePost(post.id)}
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