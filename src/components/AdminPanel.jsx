import { useState, useEffect } from "react";
import { db, storage, ADMIN_EMAIL, auth, loginWithGoogle, logout } from "../firebase";
import {
  collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { onAuthStateChanged } from "firebase/auth";

const AdminPanel = ({ isOpen, onClose }) => {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({ title: "", subtitle: "", fullDescription: "", url: "", borderColor: "#3B82F6" });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Listen auth
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  // Listen projects
  useEffect(() => {
    const q = query(collection(db, "projects"), orderBy("createdAt", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      setProjects(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const isAdmin = user?.email === ADMIN_EMAIL;

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (err) {
      setError("Gagal login: " + err.message);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const uploadImage = async (file) => {
    const fileName = `projects/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, fileName);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  };

  const resetForm = () => {
    setForm({ title: "", subtitle: "", fullDescription: "", url: "", borderColor: "#3B82F6" });
    setImageFile(null);
    setImagePreview(null);
    setEditingId(null);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.fullDescription || !form.url) {
      setError("Nama, Deskripsi, dan Link wajib diisi!");
      return;
    }
    if (!editingId && !imageFile) {
      setError("Screenshot wajib diupload untuk project baru!");
      return;
    }

    setLoading(true);
    setError("");

    try {
      let imageUrl = editingId ? projects.find(p => p.id === editingId)?.image : null;

      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const projectData = {
        title: form.title,
        subtitle: form.subtitle || form.title,
        fullDescription: form.fullDescription,
        url: form.url,
        image: imageUrl,
        borderColor: form.borderColor,
        gradient: `linear-gradient(145deg, ${form.borderColor}, #000)`,
      };

      if (editingId) {
        await updateDoc(doc(db, "projects", editingId), projectData);
      } else {
        await addDoc(collection(db, "projects"), {
          ...projectData,
          createdAt: serverTimestamp(),
        });
      }

      resetForm();
    } catch (err) {
      setError("Gagal menyimpan: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (project) => {
    setForm({
      title: project.title,
      subtitle: project.subtitle,
      fullDescription: project.fullDescription,
      url: project.url,
      borderColor: project.borderColor || "#3B82F6",
    });
    setImagePreview(project.image);
    setEditingId(project.id);
  };

  const handleDelete = async (project) => {
    if (!window.confirm(`Hapus project "${project.title}"?`)) return;

    try {
      // Hapus gambar dari Storage jika ada
      if (project.image && project.image.includes("firebase")) {
        try {
          const imageRef = ref(storage, project.image);
          await deleteObject(imageRef);
        } catch { /* ignore if image doesn't exist */ }
      }
      await deleteDoc(doc(db, "projects", project.id));
    } catch (err) {
      setError("Gagal menghapus: " + err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] overflow-y-auto">
      <div className="max-w-3xl mx-auto p-6 mt-4 mb-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">🔒 Admin Panel</h1>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white text-3xl font-light transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Login section */}
        {!user ? (
          <div className="bg-zinc-800 rounded-xl p-8 text-center">
            <p className="text-zinc-400 mb-4">Login sebagai admin untuk mengelola project</p>
            <button
              onClick={handleLogin}
              className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-3 rounded-full font-semibold transition-colors"
            >
              Login dengan Google
            </button>
          </div>
        ) : !isAdmin ? (
          <div className="bg-red-900/30 border border-red-500/50 rounded-xl p-8 text-center">
            <p className="text-red-400 text-lg font-semibold mb-2">⛔ Akses Ditolak</p>
            <p className="text-zinc-400 mb-4">Akun <strong>{user.email}</strong> bukan admin.</p>
            <button
              onClick={() => { logout(); onClose(); }}
              className="bg-zinc-700 hover:bg-zinc-600 text-white px-6 py-3 rounded-full transition-colors"
            >
              Logout & Kembali
            </button>
          </div>
        ) : (
          <>
            {/* Admin Info */}
            <div className="flex items-center justify-between bg-zinc-800/50 rounded-xl p-4 mb-6 border border-violet-500/30">
              <div className="flex items-center gap-3">
                <img src={user.photoURL} alt="" className="w-10 h-10 rounded-full" />
                <div>
                  <p className="text-white font-semibold text-sm">{user.displayName}</p>
                  <p className="text-zinc-400 text-xs">{user.email}</p>
                </div>
              </div>
              <button
                onClick={() => { logout(); onClose(); }}
                className="text-zinc-400 hover:text-red-400 text-sm transition-colors"
              >
                Logout
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-900/30 border border-red-500/50 text-red-400 p-3 rounded-lg mb-4 text-sm">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-zinc-800 rounded-xl p-6 mb-6 border border-zinc-700">
              <h2 className="text-lg font-bold text-white mb-4">
                {editingId ? "✏️ Edit Project" : "➕ Tambah Project Baru"}
              </h2>

              <div className="flex flex-col gap-4">
                {/* Image upload */}
                <div>
                  <label className="text-zinc-300 text-sm font-semibold mb-1 block">Screenshot Website *</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full bg-zinc-700 text-white rounded-lg p-2 text-sm file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:bg-violet-600 file:text-white file:font-semibold file:text-sm file:cursor-pointer"
                  />
                  {imagePreview && (
                    <img src={imagePreview} alt="Preview" className="mt-2 w-full h-40 object-cover rounded-lg border border-zinc-600" />
                  )}
                </div>

                {/* Title */}
                <div>
                  <label className="text-zinc-300 text-sm font-semibold mb-1 block">Nama Project *</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Contoh: AI Mahasiswa — Ilmi Connect"
                    className="w-full bg-zinc-700 text-white rounded-lg p-3 text-sm border border-zinc-600 focus:border-violet-500 focus:outline-none"
                  />
                </div>

                {/* Subtitle */}
                <div>
                  <label className="text-zinc-300 text-sm font-semibold mb-1 block">Subtitle (opsional)</label>
                  <input
                    type="text"
                    value={form.subtitle}
                    onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                    placeholder="Deskripsi singkat..."
                    className="w-full bg-zinc-700 text-white rounded-lg p-3 text-sm border border-zinc-600 focus:border-violet-500 focus:outline-none"
                  />
                </div>

                {/* Full Description */}
                <div>
                  <label className="text-zinc-300 text-sm font-semibold mb-1 block">Deskripsi Lengkap *</label>
                  <textarea
                    value={form.fullDescription}
                    onChange={(e) => setForm({ ...form, fullDescription: e.target.value })}
                    placeholder="Jelaskan project Anda secara detail..."
                    rows={4}
                    className="w-full bg-zinc-700 text-white rounded-lg p-3 text-sm border border-zinc-600 focus:border-violet-500 focus:outline-none resize-none"
                  />
                </div>

                {/* URL */}
                <div>
                  <label className="text-zinc-300 text-sm font-semibold mb-1 block">Link Website *</label>
                  <input
                    type="url"
                    value={form.url}
                    onChange={(e) => setForm({ ...form, url: e.target.value })}
                    placeholder="https://www.contoh.com"
                    className="w-full bg-zinc-700 text-white rounded-lg p-3 text-sm border border-zinc-600 focus:border-violet-500 focus:outline-none"
                  />
                </div>

                {/* Color */}
                <div>
                  <label className="text-zinc-300 text-sm font-semibold mb-1 block">Warna Aksen</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={form.borderColor}
                      onChange={(e) => setForm({ ...form, borderColor: e.target.value })}
                      className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent"
                    />
                    <span className="text-zinc-400 text-sm">{form.borderColor}</span>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 mt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-violet-600 hover:bg-violet-700 disabled:bg-zinc-600 text-white py-3 rounded-full font-semibold transition-colors"
                  >
                    {loading ? "Menyimpan..." : editingId ? "💾 Simpan Perubahan" : "➕ Tambah Project"}
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="bg-zinc-700 hover:bg-zinc-600 text-white px-6 py-3 rounded-full transition-colors"
                    >
                      Batal
                    </button>
                  )}
                </div>
              </div>
            </form>

            {/* Project List */}
            <div>
              <h2 className="text-lg font-bold text-white mb-4">📂 Daftar Project ({projects.length})</h2>
              {projects.length === 0 ? (
                <p className="text-zinc-500 text-center py-8">Belum ada project. Tambahkan yang pertama!</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {projects.map((project) => (
                    <div key={project.id} className="bg-zinc-800 rounded-xl p-4 border border-zinc-700 flex items-center gap-4">
                      <img
                        src={project.image}
                        alt={project.title}
                        className="w-20 h-14 object-cover rounded-lg flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold text-sm truncate">{project.title}</h3>
                        <p className="text-zinc-400 text-xs truncate">{project.url}</p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleEdit(project)}
                          className="bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 p-2 rounded-lg text-sm transition-colors"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(project)}
                          className="bg-red-600/20 hover:bg-red-600/40 text-red-400 p-2 rounded-lg text-sm transition-colors"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
