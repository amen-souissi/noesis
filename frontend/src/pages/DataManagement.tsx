import { useEffect, useState, useCallback, useRef } from "react";
import {
  Upload,
  FileText,
  FileCode,
  File,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Loader2,
  AlertCircle,
  Eye,
  HardDrive,
  Hash,
  Layers,
} from "lucide-react";
import {
  getDataFiles,
  uploadFile,
  deleteFile,
  toggleFile,
  getCorpus,
} from "@/api/data";
import type { TrainingData, Corpus } from "@/types/config";

function fileIcon(fileType: string) {
  if (fileType === "txt" || fileType === "text") return FileText;
  if (fileType === "json" || fileType === "csv" || fileType === "jsonl")
    return FileCode;
  return File;
}

function formatFileSize(bytes: number): string {
  if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(1)} MB`;
  if (bytes >= 1e3) return `${(bytes / 1e3).toFixed(1)} KB`;
  return `${bytes} B`;
}

export default function DataManagement() {
  const [files, setFiles] = useState<TrainingData[]>([]);
  const [corpus, setCorpus] = useState<Corpus | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = useCallback(async () => {
    try {
      const [filesRes, corpusRes] = await Promise.all([
        getDataFiles(),
        getCorpus(),
      ]);
      setFiles(filesRes.data.results);
      setCorpus(corpusRes.data);
    } catch {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleUpload(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      for (let i = 0; i < fileList.length; i++) {
        await uploadFile(fileList[i]);
      }
      await fetchData();
    } catch {
      setError("Failed to upload one or more files");
    } finally {
      setUploading(false);
    }
  }

  async function handleToggle(id: string) {
    try {
      const res = await toggleFile(id);
      setFiles((prev) => prev.map((f) => (f.id === id ? res.data : f)));
      // Refresh corpus since active files changed
      const corpusRes = await getCorpus();
      setCorpus(corpusRes.data);
    } catch {
      setError("Failed to toggle file");
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteFile(id);
      setFiles((prev) => prev.filter((f) => f.id !== id));
      const corpusRes = await getCorpus();
      setCorpus(corpusRes.data);
    } catch {
      setError("Failed to delete file");
    }
  }

  function handleDrag(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleUpload(e.dataTransfer.files);
  }

  const activeFiles = files.filter((f) => f.is_active);
  const totalSize = files.reduce((acc, f) => acc + f.file_size, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Data Management</h1>
          <p className="text-gray-400 mt-1">
            Upload training data and manage your corpus
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="text-sm">{error}</span>
            <button
              className="ml-auto text-xs underline"
              onClick={() => setError(null)}
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Upload + File List */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upload Zone */}
            <div
              className={`card p-8 border-2 border-dashed transition-colors cursor-pointer ${
                dragActive
                  ? "border-blue-500 bg-blue-500/5"
                  : "border-gray-700 hover:border-gray-600"
              }`}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                multiple
                accept=".txt,.json,.csv,.jsonl,.md,.py,.html"
                onChange={(e) => handleUpload(e.target.files)}
              />
              <div className="text-center">
                {uploading ? (
                  <>
                    <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-3" />
                    <p className="text-sm text-gray-300">Uploading...</p>
                  </>
                ) : (
                  <>
                    <Upload
                      className={`w-10 h-10 mx-auto mb-3 ${
                        dragActive ? "text-blue-400" : "text-gray-500"
                      }`}
                    />
                    <p className="text-sm text-gray-300 mb-1">
                      Drag & drop files here, or click to browse
                    </p>
                    <p className="text-xs text-gray-500">
                      Supports .txt, .json, .csv, .jsonl, .md, .py, .html
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* File List */}
            <div className="card">
              <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                  Uploaded Files ({files.length})
                </h2>
                <span className="text-xs text-gray-500">
                  {activeFiles.length} active / {formatFileSize(totalSize)}{" "}
                  total
                </span>
              </div>
              {files.length === 0 ? (
                <div className="p-8 text-center">
                  <HardDrive className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">
                    No files uploaded yet. Drop files above to get started.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-800">
                  {files.map((file) => {
                    const Icon = fileIcon(file.file_type);
                    return (
                      <div
                        key={file.id}
                        className={`flex items-center gap-3 px-4 py-3 transition ${
                          file.is_active ? "" : "opacity-50"
                        }`}
                      >
                        <Icon className="w-5 h-5 text-gray-400 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white truncate">
                            {file.original_filename}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(file.file_size)} &middot;{" "}
                            {file.char_count.toLocaleString()} chars &middot;{" "}
                            {file.file_type.toUpperCase()}
                          </p>
                        </div>
                        <button
                          className="p-1.5 rounded-md hover:bg-gray-800 transition"
                          onClick={() => handleToggle(file.id)}
                          title={file.is_active ? "Deactivate" : "Activate"}
                        >
                          {file.is_active ? (
                            <ToggleRight className="w-5 h-5 text-green-400" />
                          ) : (
                            <ToggleLeft className="w-5 h-5 text-gray-600" />
                          )}
                        </button>
                        <button
                          className="p-1.5 rounded-md hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition"
                          onClick={() => handleDelete(file.id)}
                          title="Delete file"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Corpus Preview */}
          <div className="space-y-4">
            <div className="card p-5">
              <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">
                Merged Corpus Stats
              </h2>
              {corpus ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                      <Layers className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                      <p className="text-lg font-bold text-white">
                        {corpus.file_count}
                      </p>
                      <p className="text-[11px] text-gray-500">Active Files</p>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                      <FileText className="w-4 h-4 text-green-400 mx-auto mb-1" />
                      <p className="text-lg font-bold text-white">
                        {corpus.total_chars.toLocaleString()}
                      </p>
                      <p className="text-[11px] text-gray-500">Total Chars</p>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-3 text-center col-span-2">
                      <Hash className="w-4 h-4 text-purple-400 mx-auto mb-1" />
                      <p className="text-lg font-bold text-white">
                        {corpus.unique_chars}
                      </p>
                      <p className="text-[11px] text-gray-500">
                        Unique Characters
                      </p>
                    </div>
                  </div>

                  <button
                    className="btn-secondary w-full flex items-center justify-center gap-2 text-sm"
                    onClick={() => setShowPreview(!showPreview)}
                  >
                    <Eye className="w-4 h-4" />
                    {showPreview ? "Hide Preview" : "Show Preview"}
                  </button>
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  No active data to build corpus
                </p>
              )}
            </div>

            {/* Corpus Text Preview */}
            {showPreview && corpus && corpus.text && (
              <div className="card p-4">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Corpus Preview (first 2000 chars)
                </h3>
                <div className="bg-black rounded-lg p-3 max-h-96 overflow-y-auto">
                  <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono leading-relaxed">
                    {corpus.text.slice(0, 2000)}
                    {corpus.text.length > 2000 && (
                      <span className="text-gray-600">
                        {"\n"}... (
                        {(corpus.text.length - 2000).toLocaleString()} more
                        characters)
                      </span>
                    )}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
