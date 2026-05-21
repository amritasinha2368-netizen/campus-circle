"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

export default function MarketplacePage() {
  const [items, setItems] = useState<any[]>([]);
  const [itemName, setItemName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [contact, setContact] = useState("");
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

  async function fetchItems() {
    const { data } = await supabase.from("marketplace").select("*");
    setItems(data || []);
  }

  async function logout() {
    await supabase.auth.signOut();
    localStorage.removeItem("userEmail");
    window.location.href = "/";
  }

  async function deleteItem(id: string) {
    if (!confirm("Delete this item?")) return;

    const { data, error } = await supabase
      .from("marketplace")
      .delete()
      .eq("id", id)
      .select();

    if (error || !data || data.length === 0) {
      alert("Delete failed. You can delete only your own item.");
      return;
    }

    alert("Item deleted");
    fetchItems();
  }

  async function addItem() {
    if (!itemName || !price || !description || !contact || files.length === 0) {
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

    const { error } = await supabase.from("marketplace").insert([
      {
        item_name: itemName.trim(),
        price: price.trim(),
        description: description.trim(),
        contact: contact.trim(),
        image_urls: uploadedUrls,
        user_id: user.id,
      },
    ]);

    if (error) {
      alert("Error adding item");
    } else {
      alert("Item added successfully");

      setItemName("");
      setPrice("");
      setDescription("");
      setContact("");
      setFiles([]);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      fetchItems();
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

      fetchItems();
    }

    checkAuth();
  }, []);

  const filteredItems = items.filter((item) => {
    return (
      item.item_name?.toLowerCase().includes(search.toLowerCase()) ||
      item.description?.toLowerCase().includes(search.toLowerCase()) ||
      item.price?.toLowerCase().includes(search.toLowerCase())
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
                className="block rounded-2xl bg-purple-600/30 border border-purple-400/30 px-5 py-4 font-semibold"
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
              Campus
              <br />
              <span className="text-purple-400">
                Marketplace
              </span>
            </h2>
          </header>

          <div className="grid xl:grid-cols-[1fr_430px] gap-8">
            <section>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
                <div>
                  <h3 className="text-2xl font-bold">Listed Items</h3>

                  <p className="text-sm text-gray-500">
                    Showing {filteredItems.length} of {items.length} items
                  </p>
                </div>

                <input
                  className="w-full md:w-80 px-4 py-3 rounded-2xl bg-zinc-900 border border-white/10 text-white placeholder:text-gray-500 outline-none"
                  placeholder="Search marketplace..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="space-y-5">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-3xl border border-white/10 bg-zinc-900 p-5"
                  >
                    {item.image_urls && item.image_urls.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5">
                        {item.image_urls.map((url: string, index: number) =>
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
                        <span className="inline-block px-4 py-1 rounded-full text-sm font-semibold mb-3 bg-yellow-500/20 text-yellow-300">
                          ₹ {item.price}
                        </span>

                        <h4 className="text-2xl font-bold">
                          {item.item_name}
                        </h4>

                        <p className="text-gray-400 mt-2">
                          {item.description}
                        </p>

                        <p className="text-gray-500 mt-3">
                          📞 {item.contact}
                        </p>
                      </div>

                      <button
                        onClick={() => deleteItem(item.id)}
                        className="rounded-lg bg-red-500/10 border border-red-500/20 text-red-200 px-3 py-1.5 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}

                {filteredItems.length === 0 && (
                  <div className="rounded-3xl border border-white/10 bg-zinc-900 p-8 text-center text-gray-400">
                    No matching items found.
                  </div>
                )}
              </div>
            </section>

            <aside className="rounded-3xl border border-white/10 bg-zinc-900 p-6 h-fit sticky top-8">
              <h3 className="text-2xl font-bold mb-2">
                Sell Item
              </h3>

              <div className="space-y-4">
                <input
                  className="w-full p-4 rounded-2xl bg-black border border-white/10 text-white placeholder:text-gray-500 outline-none"
                  placeholder="Item name"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                />

                <input
                  className="w-full p-4 rounded-2xl bg-black border border-white/10 text-white placeholder:text-gray-500 outline-none"
                  placeholder="Price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />

                <textarea
                  className="w-full p-4 rounded-2xl bg-black border border-white/10 text-white placeholder:text-gray-500 outline-none"
                  placeholder="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />

                <input
                  className="w-full p-4 rounded-2xl bg-black border border-white/10 text-white placeholder:text-gray-500 outline-none"
                  placeholder="Contact"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
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
                  onClick={addItem}
                  disabled={isAdding}
                  className="w-full bg-purple-600 text-white px-6 py-4 rounded-2xl font-bold disabled:opacity-60"
                >
                  {isAdding ? "Adding..." : "Add Item"}
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