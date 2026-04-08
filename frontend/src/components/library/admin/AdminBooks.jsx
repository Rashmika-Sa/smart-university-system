import React, { useEffect, useState } from 'react';
import { getAllBooksAdmin, createBook, updateBook, deleteBook } from '../../../api/libraryApi';
import { Spinner } from '../LibraryUI';
import toast from 'react-hot-toast';

const CATEGORIES = ['Computing','Business','Engineering','Law','Research','E-Book'];

const emptyBook = {
  title: '', author: '', isbn: '', category: 'Computing',
  totalCopies: 1, availableCopies: 1, description: '', ebookUrl: '', status: 'active',
};

const AdminBooks = () => {
  const [books,    setBooks]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing,  setEditing]  = useState(null);
  const [form,     setForm]     = useState(emptyBook);
  const [search,   setSearch]   = useState('');

  const load = () => {
    getAllBooksAdmin().then(r => setBooks(r.data)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = books.filter(b =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.author.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => { setForm(emptyBook); setEditing(null); setShowForm(true); };
  const openEdit   = (book) => { setForm(book); setEditing(book._id); setShowForm(true); };

  const handleDelete = async (id) => {
    if (!confirm('Delete this book?')) return;
    try { await deleteBook(id); setBooks(prev => prev.filter(b => b._id !== id)); toast.success('Book deleted'); }
    catch (err) { toast.error(err.response?.data?.msg || 'Failed'); }
  };

  const handleSubmit = async () => {
    if (!form.title || !form.author || !form.isbn) return toast.error('Title, author and ISBN required');
    try {
      if (editing) {
        const res = await updateBook(editing, form);
        setBooks(prev => prev.map(b => b._id === editing ? res.data : b));
        toast.success('Book updated');
      } else {
        const res = await createBook(form);
        setBooks(prev => [...prev, res.data]);
        toast.success('Book created');
      }
      setShowForm(false);
    } catch (err) { toast.error(err.response?.data?.msg || 'Failed'); }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Book Management</h2>
          <p className="text-sm text-slate-500 mt-1">Add, edit and manage the library catalogue</p>
        </div>
        <button onClick={openCreate}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition">
          + Add Book
        </button>
      </div>

      <input type="text" placeholder="Search by title or author..."
        value={search} onChange={e => setSearch(e.target.value)}
        className="w-full md:w-72 border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
      />

      {loading ? <Spinner /> : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
              <tr>
                {['Title','Author','Category','Copies','Status','Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(book => (
                <tr key={book._id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-slate-800 max-w-[180px] truncate">{book.title}</td>
                  <td className="px-4 py-3 text-slate-600">{book.author}</td>
                  <td className="px-4 py-3">
                    <span className="bg-indigo-50 text-indigo-600 text-xs font-semibold px-2 py-0.5 rounded-full">{book.category}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    <span className={book.availableCopies === 0 ? 'text-red-500 font-semibold' : ''}>
                      {book.availableCopies}
                    </span>/{book.totalCopies}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${book.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                      {book.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 space-x-3">
                    <button onClick={() => openEdit(book)} className="text-indigo-600 hover:underline text-xs font-semibold">Edit</button>
                    <button onClick={() => handleDelete(book._id)} className="text-red-500 hover:underline text-xs font-semibold">Delete</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">No books found.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-lg font-bold text-slate-800">{editing ? 'Edit Book' : 'Add New Book'}</h3>
                <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Title *</label>
                  <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Book title"
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Author *</label>
                    <input value={form.author} onChange={e => setForm({...form, author: e.target.value})} placeholder="Author"
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">ISBN *</label>
                    <input value={form.isbn} onChange={e => setForm({...form, isbn: e.target.value})} placeholder="978-..."
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                    <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                    <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Total Copies</label>
                    <input type="number" min="1" value={form.totalCopies}
                      onChange={e => setForm({...form, totalCopies: parseInt(e.target.value)})}
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Available Copies</label>
                    <input type="number" min="0" value={form.availableCopies}
                      onChange={e => setForm({...form, availableCopies: parseInt(e.target.value)})}
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                  <textarea rows={2} value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                    placeholder="Short description..."
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                {form.category === 'E-Book' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">E-Book URL</label>
                    <input value={form.ebookUrl} onChange={e => setForm({...form, ebookUrl: e.target.value})} placeholder="https://..."
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                )}
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowForm(false)}
                  className="flex-1 border border-slate-300 text-slate-700 font-semibold py-2.5 rounded-xl text-sm hover:bg-slate-50 transition">
                  Cancel
                </button>
                <button onClick={handleSubmit}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-xl text-sm transition">
                  {editing ? 'Update Book' : 'Create Book'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBooks;