import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../AuthContext';
import api from '../api';
import Navbar from '../components/Navbar';
import { Upload, FileText, Image, Video, File, Share2, Trash2, Download } from 'lucide-react';

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [shareEmail, setShareEmail] = useState('');
  const [activeShareModal, setActiveShareModal] = useState(null);
  const [fileFilter, setFileFilter] = useState('all');
  const [filesError, setFilesError] = useState('');

  const fetchFiles = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await api.get('/api/files', config);
      setFiles(data);
      setFilesError('');
    } catch (error) {
      setFilesError(error.response?.data?.message || 'Could not load files. Check your connection and try again.');
    }
  };

  const visibleFiles = files.filter((file) => {
    const isSharedWithMe = file.owner?._id !== user._id;
    if (fileFilter === 'shared') return isSharedWithMe;
    if (fileFilter === 'mine') return !isSharedWithMe;
    return true;
  });

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'multipart/form-data',
        },
      };
      await api.post('/api/files/upload', formData, config);
      setSelectedFile(null);
      fetchFiles();
    } catch (err) {
      alert(err.response?.data?.message || 'Upload failed');
    }
  };

  const handleDelete = async (id) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await api.delete(`/api/files/${id}`, config);
      fetchFiles();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleShare = async (id) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await api.post(`/api/files/${id}/share`, { email: shareEmail }, config);
      setShareEmail('');
      setActiveShareModal(null);
      alert('File shared successfully!');
      fetchFiles();
    } catch (err) {
      alert(err.response?.data?.message || 'Share failed');
    }
  };

  const getIcon = (category) => {
    switch (category) {
      case 'image': return <Image className="w-6 h-6 text-emerald-400" />;
      case 'video': return <Video className="w-6 h-6 text-purple-400" />;
      case 'document': return <FileText className="w-6 h-6 text-blue-400" />;
      default: return <File className="w-6 h-6 text-slate-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Upload Box */}
        <form onSubmit={handleUpload} className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <input
            type="file"
            onChange={(e) => setSelectedFile(e.target.files[0])}
            className="text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
          />
          <button type="submit" className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 px-5 py-2.5 rounded-lg text-sm font-semibold transition w-full sm:w-auto justify-center">
            <Upload className="w-4 h-4" /> Upload File
          </button>
        </form>

        {/* Files Grid */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-slate-200">Files</h2>
          <div className="flex gap-2" aria-label="File filter">
            {[
              ['all', 'All files'],
              ['mine', 'My files'],
              ['shared', 'Shared with me'],
            ].map(([filter, label]) => (
              <button
                key={filter}
                type="button"
                onClick={() => setFileFilter(filter)}
                aria-pressed={fileFilter === filter}
                className={`rounded px-3 py-2 text-sm ${fileFilter === filter ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        {filesError && <p className="mb-4 text-sm text-red-400" role="alert">{filesError}</p>}
        {!filesError && fileFilter === 'shared' && visibleFiles.length === 0 && (
          <p className="text-sm text-slate-400">No files have been shared with this account yet.</p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleFiles.map((file) => (
            <div key={file._id} className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col justify-between hover:border-slate-700 transition">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  {getIcon(file.category)}
                  <span className="font-semibold text-sm truncate w-48">{file.originalName}</span>
                </div>
                <div className="text-xs text-slate-400 space-y-1">
                  <p>Size: {(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                  <p>Owner: {file.owner.name} ({file.owner.email})</p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-800">
                <a
                  href={api.getUri({ url: file.path.replace(/\\/g, '/') })}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 text-slate-400 hover:text-white transition"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </a>

                {file.owner._id === user._id && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveShareModal(file._id)}
                      className="p-1.5 text-slate-400 hover:text-indigo-400 transition"
                      title="Share"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(file._id)}
                      className="p-1.5 text-slate-400 hover:text-red-400 transition"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Share Popover */}
              {activeShareModal === file._id && (
                <div className="mt-3 bg-slate-800 p-3 rounded-lg flex gap-2">
                  <input
                    type="email"
                    placeholder="User email to share..."
                    value={shareEmail}
                    onChange={(e) => setShareEmail(e.target.value)}
                    className="bg-slate-900 text-xs px-2 py-1 rounded border border-slate-700 w-full text-white"
                  />
                  <button onClick={() => handleShare(file._id)} className="bg-indigo-600 text-xs px-3 py-1 rounded font-semibold hover:bg-indigo-500">
                    Send
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}