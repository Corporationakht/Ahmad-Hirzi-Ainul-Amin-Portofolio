import { useState, useEffect } from "react";
import { auth, loginWithGoogle, logout, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  doc,
  updateDoc,
  deleteDoc
} from "firebase/firestore";

export default function ChatRoom() {
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  // Cek login
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  // Ambil pesan real-time
  useEffect(() => {
    const q = query(collection(db, "messages"), orderBy("createdAt"));
    const unsub = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  // Kirim pesan
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    await addDoc(collection(db, "messages"), {
      text: message,
      uid: user.uid,
      displayName: user.displayName,
      photoURL: user.photoURL,
      createdAt: serverTimestamp()
    });
    setMessage("");
  };

  // Update pesan
  const handleEditClick = (msg) => {
    setEditingId(msg.id);
    setEditText(msg.text);
  };

  const saveEdit = async (id) => {
    if (!editText.trim()) return;
    const msgRef = doc(db, "messages", id);
    await updateDoc(msgRef, {
      text: editText,
      updatedAt: serverTimestamp()
    });
    setEditingId(null);
    setEditText("");
  };

  // Hapus pesan
  const handleDelete = async (id) => {
    if (window.confirm("Yakin ingin menghapus pesan ini?")) {
      await deleteDoc(doc(db, "messages", id));
    }
  };

  return (
    <div className="bg-zinc-900 border border-gray-700 p-6 rounded-xl shadow-lg max-w-xl mx-auto mt-5">
      <h2 className="text-2xl font-bold text-center mb-4 text-white">💬 Chat Room</h2>

      {/* Header user */}
      {user && (
        <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-3">
          <div className="flex items-center gap-3">
            <img src={user.photoURL} alt="avatar" className="w-10 h-10 rounded-full" />
            <span className="text-white font-semibold">{user.displayName}</span>
          </div>
          <button
            onClick={logout}
            className="bg-red-600 px-4 py-1 rounded-full text-white hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      )}

      {/* Area pesan */}
      <div className="h-72 overflow-y-auto border border-gray-700 p-3 rounded-lg bg-zinc-800 mb-4 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2 ${msg.uid === user?.uid ? "justify-end" : "justify-start"}`}
          >
            {msg.uid !== user?.uid && (
              <img
                src={msg.photoURL || "https://via.placeholder.com/40"}
                alt="avatar"
                className="w-8 h-8 rounded-full"
              />
            )}
            <div
              className={`p-3 rounded-lg max-w-[75%] ${
                msg.uid === user?.uid
                  ? "bg-blue-500 text-white"
                  : "bg-gray-700 text-white"
              }`}
            >
              <div className="text-xs opacity-70 mb-1 flex justify-between items-center">
                <span>{msg.displayName}</span>
                {msg.uid === user?.uid && (
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEditClick(msg)}
                      className="text-white opacity-60 hover:opacity-100 transition-opacity p-1"
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(msg.id)}
                      className="text-red-300 hover:text-red-500 transition-colors p-1"
                      title="Hapus"
                    >
                      🗑️
                    </button>
                  </div>
                )}
              </div>
              
              {editingId === msg.id ? (
                <div className="flex flex-col gap-2 mt-1">
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="p-1 rounded bg-blue-600 text-white border border-blue-400 focus:outline-none"
                  />
                  <div className="flex gap-2 text-xs justify-end">
                    <button onClick={() => setEditingId(null)} className="hover:underline">Batal</button>
                    <button onClick={() => saveEdit(msg.id)} className="font-bold hover:underline">Simpan</button>
                  </div>
                </div>
              ) : (
                <div>
                  {msg.text}
                  {msg.updatedAt && <span className="text-[10px] opacity-60 ml-2">(diedit)</span>}
                </div>
              )}
            </div>
            {msg.uid === user?.uid && (
              <img
                src={msg.photoURL || "https://via.placeholder.com/40"}
                alt="avatar"
                className="w-8 h-8 rounded-full"
              />
            )}
          </div>
        ))}
      </div>

      {/* Form login / kirim pesan */}
      {user ? (
        <form onSubmit={sendMessage} className="flex gap-2 flex-wrap sm:flex-nowrap w-full">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ketik pesan..."
            className="flex-1 min-w-0 p-2 rounded-lg bg-zinc-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-green-600 px-4 py-2 rounded-lg text-white hover:bg-green-700 w-full sm:w-auto"
          >
            Send
          </button>
        </form>
      ) : (
        <div className="flex flex-col items-center justify-center gap-4">
          <button
            onClick={loginWithGoogle}
            className="flex items-center gap-3 bg-white text-gray-800 px-5 py-2 rounded-full shadow hover:bg-gray-200 transition"
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google logo"
              className="w-5 h-5"
            />
            Login with Google
          </button>
          <p className="text-sm text-gray-400">Login untuk mengirim pesan</p>
        </div>
      )}
    </div>
  );
}
