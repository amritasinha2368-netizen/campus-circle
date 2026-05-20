"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function MarketplacePage() {
  const [items, setItems] = useState<any[]>([]);
  const [itemName, setItemName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [contact, setContact] = useState("");
  const [images, setImages] = useState<any[]>([]);
  const [selectedImage, setSelectedImage] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  async function fetchItems() {
    const { data } = await supabase.from("marketplace").select("*");
    setItems(data || []);
  }

  async function logout() {
    await supabase.auth.signOut();
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
      alert("Delete failed. Check RLS policy.");
      return;
    }

    alert("Item deleted");
    fetchItems();
  }

  async function addItem() {
    if (!itemName || !price || !description || !contact || images.length === 0) {
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
      setImages([]);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      fetchItems();
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

      fetchItems();
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

        <a href="/events" className="bg-zinc-800 text-white px-5 py-3 rounded-xl">
          Events
        </a>

        <a href="/marketplace" className="bg-white text-black px-5 py-3 rounded-xl">
          Marketplace
        </a>

        <button
          onClick={logout}
          className="bg-red-500 text-white px-5 py-3 rounded-xl"
        >
          Logout
        </button>
      </nav>

      <h1 className="text-5xl font-bold mb-10">Marketplace</h1>

      <div className="bg-zinc-900 p-8 rounded-3xl mb-12 max-w-2xl border border-zinc-800 shadow-xl">
        <h2 className="text-2xl font-bold mb-4">
          Sell Hostel Item
        </h2>

        <input
          className="w-full p-3 mb-4 rounded-xl bg-white text-black"
          placeholder="Item name"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
        />

        <input
          className="w-full p-3 mb-4 rounded-xl bg-white text-black"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        <textarea
          className="w-full p-3 mb-4 rounded-xl bg-white text-black"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <input
          className="w-full p-3 mb-4 rounded-xl bg-white text-black"
          placeholder="Contact"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
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
          onClick={addItem}
          className="bg-white text-black px-6 py-3 rounded-xl font-semibold"
        >
          Add Item
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800 shadow-lg"
          >
            {item.image_urls && item.image_urls.length > 0 && (
              <div className="grid grid-cols-2 gap-3 mb-4">
                {item.image_urls.map((url: string, index: number) => (
                  <img
                    key={index}
                    src={url}
                    onClick={() => setSelectedImage(url)}
                    className="w-full h-40 object-cover rounded-xl cursor-pointer"
                  />
                ))}
              </div>
            )}

            <p className="text-yellow-400 mb-2 font-semibold">
              ₹ {item.price}
            </p>

            <h2 className="text-2xl font-bold">
              {item.item_name}
            </h2>

            <p className="text-gray-400 mt-2">
              {item.description}
            </p>

            <p className="text-gray-500 mt-2">
              📞 {item.contact}
            </p>

            <button
              onClick={() => deleteItem(item.id)}
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