import React, { useState, useEffect } from 'react';
import { Book, Upload, Save, Trash2, AlertCircle, CheckCircle2, Loader, 
         ChevronDown, ChevronUp, FileText, Download } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

const HandbookManager = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchHandbooks = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/handbook', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch handbooks: ${response.status}`);
      }

      const data = await response.json();
      setFiles(data.files || []);
    } catch (err) {
      console.error('Error fetching handbooks:', err);
      setError('Failed to load handbooks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchHandbooks();
    }
  }, [isOpen]);

  const handleDrop = async (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  const handleFileInput = (e) => {
    const selectedFiles = Array.from(e.target.files);
    handleFiles(selectedFiles);
  };

  const handleFiles = async (fileList) => {
    try {
      setLoading(true);
      setError('');
      
      const pdfFiles = fileList.filter(file => file.type === 'application/pdf');
      
      if (pdfFiles.length === 0) {
        setError('Please upload PDF files only');
        return;
      }

      const formData = new FormData();
      pdfFiles.forEach(file => {
        formData.append('handbooks', file);
      });

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/handbook/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload files');
      }

      await fetchHandbooks();
      setSuccess('Handbook files uploaded successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error uploading files:', err);
      setError('Failed to upload handbook files');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (fileId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/handbook/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete file');
      }

      await fetchHandbooks();
      setSuccess('File deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error deleting file:', err);
      setError('Failed to delete file');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (fileId, filename) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/handbook/download/${fileId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to download file');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error downloading file:', err);
      setError('Failed to download handbook');
    }
  };

  return (
    <div className="bg-gray-900/50 rounded-xl border border-gray-800">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-800/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Book className="w-5 h-5 text-sky-400" />
          <div>
            <h3 className="font-medium text-white">Company Guidelines Handbook</h3>
            <p className="text-sm text-gray-400">
              Upload PDF files containing company guidelines
            </p>
          </div>
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {isOpen && (
        <div className="p-6 border-t border-gray-800">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-red-500">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-4 mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <p className="text-green-500">{success}</p>
            </div>
          )}

          {user?.isAdmin && (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center hover:border-sky-500 transition-colors mb-6"
            >
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-300 mb-2">Drag and drop PDF files here</p>
              <p className="text-gray-500 text-sm mb-4">or</p>
              <label className="inline-block">
                <input
                  type="file"
                  accept=".pdf"
                  multiple
                  onChange={handleFileInput}
                  className="hidden"
                />
                <span className="bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-500 transition-colors cursor-pointer">
                  Browse Files
                </span>
              </label>
            </div>
          )}

          {files.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-400 mb-3">Uploaded Files:</h4>
              {files.map((file) => (
                <div
                  key={file._id}
                  className="flex items-center justify-between bg-gray-800/50 rounded-lg p-3"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-sky-400" />
                    <span className="text-gray-300">{file.originalname}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDownload(file._id, file.originalname)}
                      className="text-gray-400 hover:text-sky-400 transition-colors"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    {user?.isAdmin && (
                      <button
                        onClick={() => handleDelete(file._id)}
                        className="text-gray-400 hover:text-red-400 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HandbookManager;