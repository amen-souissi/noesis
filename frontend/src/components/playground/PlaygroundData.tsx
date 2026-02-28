/**
 * Onglet Données du Playground.
 *
 * Gestion des fichiers d'entraînement par instance (config).
 * Chaque instance a ses propres données. L'utilisateur peut
 * activer/désactiver chaque fichier pour l'entraînement.
 *
 * @module components/playground/PlaygroundData
 */

import { useEffect, useState, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  Upload,
  FileText,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Loader2,
  AlertCircle,
  Eye,
  HardDrive,
  Hash,
  Layers,
  Info,
  BookOpen,
} from "lucide-react";
import {
  getDataFiles,
  uploadFile,
  deleteFile,
  getCorpus,
  loadSampleData,
  linkDataToConfig,
  unlinkDataFromConfig,
  toggleDataForConfig,
} from "@/api/data";
import { getConfig } from "@/api/config";
import type { TrainingData, Corpus } from "@/types/config";

interface DataLink {
  id: string;
  is_active: boolean;
}

interface Props {
  configId?: string | null;
  onDataChanged?: () => void | Promise<void>;
}

export default function PlaygroundData({ configId, onDataChanged }: Props) {
  const { t } = useTranslation("components");
  const [allFiles, setAllFiles] = useState<TrainingData[]>([]);
  const [dataLinks, setDataLinks] = useState<DataLink[]>([]);
  const [corpus, setCorpus] = useState<Corpus | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [loadingSample, setLoadingSample] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Map of dataId → is_active for quick lookup
  const linkMap = new Map(dataLinks.map((l) => [l.id, l.is_active]));
  const linkedIds = new Set(dataLinks.map((l) => l.id));

  const loadData = useCallback(async () => {
    try {
      const [fRes, cRes] = await Promise.all([
        getDataFiles(),
        getCorpus(configId ?? undefined),
      ]);
      setAllFiles(fRes.data.results);
      setCorpus(cRes.data);
      // Fetch fresh links directly from config API
      if (configId) {
        const cfgRes = await getConfig(configId);
        setDataLinks(cfgRes.data.training_data_links ?? []);
      }
    } catch {
      setError(t("playground.data.loadError"));
    } finally {
      setLoading(false);
    }
  }, [configId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Show only files linked to this config
  const configFiles = allFiles.filter((f) => linkedIds.has(f.id));

  async function handleToggleActive(dataId: string) {
    if (!configId) return;
    try {
      await toggleDataForConfig(configId, dataId);
      await onDataChanged?.();
      await loadData();
    } catch {
      setError(t("playground.data.toggleError"));
    }
  }

  async function handleUpload(file: File) {
    setUploading(true);
    setError(null);
    try {
      await uploadFile(file, undefined, configId ?? undefined);
      await onDataChanged?.();
      await loadData();
    } catch {
      setError(t("playground.data.uploadError"));
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  }

  async function handleDelete(id: string) {
    try {
      await deleteFile(id);
      await onDataChanged?.();
      await loadData();
    } catch {
      /* ignore */
    }
  }

  async function handleRemoveFromConfig(dataId: string) {
    if (!configId) return;
    try {
      await unlinkDataFromConfig(configId, dataId);
      await onDataChanged?.();
      await loadData();
    } catch {
      /* ignore */
    }
  }

  async function handleLoadSample() {
    setLoadingSample(true);
    setError(null);
    try {
      const res = await loadSampleData();
      // Auto-link the sample data to this config
      if (configId && res.data?.id) {
        await linkDataToConfig(configId, res.data.id);
        await onDataChanged?.();
      }
      await loadData();
    } catch {
      setError(t("playground.data.sampleError"));
    } finally {
      setLoadingSample(false);
    }
  }

  function formatSize(bytes: number): string {
    if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(1)} MB`;
    if (bytes >= 1e3) return `${(bytes / 1e3).toFixed(1)} KB`;
    return `${bytes} B`;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-primary-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Contexte éducatif */}
      <div className="bg-amber-900/20 border border-amber-800/30 rounded-lg p-4 text-sm text-amber-200">
        <BookOpen className="w-4 h-4 inline mr-2" />
        {t("playground.data.educationalContext")}
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-800/30 rounded-lg p-3 text-sm text-red-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Zone d'upload + liste de fichiers */}
        <div className="lg:col-span-2 space-y-4">
          {/* Bouton données d'exemple */}
          <button
            onClick={handleLoadSample}
            disabled={loadingSample || !configId}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-900/30 border border-primary-700/50 rounded-lg text-primary-300 hover:bg-primary-900/50 transition-colors text-sm font-medium disabled:opacity-50"
          >
            {loadingSample ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <BookOpen className="w-4 h-4" />
            )}
            {t("playground.data.loadSampleButton")}
          </button>

          {/* Drag & Drop zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              dragOver
                ? "border-primary-400 bg-primary-900/20"
                : "border-gray-700 hover:border-gray-600"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".txt,.json,.csv,.jsonl"
              onChange={(e) =>
                e.target.files?.[0] && handleUpload(e.target.files[0])
              }
            />
            {uploading ? (
              <Loader2 className="w-8 h-8 mx-auto animate-spin text-primary-400" />
            ) : (
              <>
                <Upload className="w-8 h-8 mx-auto text-gray-500 mb-2" />
                <p className="text-gray-400">
                  {t("playground.data.dragDropText")}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {t("playground.data.fileTypes")}
                </p>
              </>
            )}
          </div>

          {/* Liste de fichiers de cette instance */}
          {configFiles.length === 0 ? (
            <div className="text-center text-gray-500 py-6">
              <Info className="w-6 h-6 mx-auto mb-2 opacity-50" />
              <p>{t("playground.data.noFiles")}</p>
              <p className="text-xs mt-1">{t("playground.data.noFilesHint")}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {configFiles.map((f) => {
                const isActive = linkMap.get(f.id) ?? false;
                return (
                  <div
                    key={f.id}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                      isActive
                        ? "bg-green-900/10 border-green-800/30"
                        : "bg-gray-800/50 border-gray-800"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <FileText
                        className={`w-5 h-5 ${isActive ? "text-green-400" : "text-gray-500"}`}
                      />
                      <div>
                        <p className="text-sm text-gray-200">{f.name}</p>
                        <p className="text-xs text-gray-500">
                          {formatSize(f.file_size)} ·{" "}
                          {f.char_count?.toLocaleString() ?? "?"}{" "}
                          {t("playground.data.characters")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleActive(f.id)}
                        className="p-1 rounded hover:bg-gray-700 transition-colors"
                        title={
                          isActive
                            ? t("playground.data.disableForTraining")
                            : t("playground.data.enableForTraining")
                        }
                      >
                        {isActive ? (
                          <ToggleRight className="w-5 h-5 text-green-400" />
                        ) : (
                          <ToggleLeft className="w-5 h-5 text-gray-600" />
                        )}
                      </button>
                      <button
                        onClick={() => handleRemoveFromConfig(f.id)}
                        className="p-1 rounded hover:bg-gray-700 text-red-400 hover:text-red-300 transition-colors"
                        title={t("playground.data.removeFromInstance")}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Statistiques corpus */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
            {t("playground.data.activeCorpus")}
          </h3>

          {corpus && corpus.file_count > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-3">
                <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-800">
                  <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                    <Layers className="w-3 h-3" />{" "}
                    {t("playground.data.activeFiles")}
                  </div>
                  <p className="text-xl font-bold text-white">
                    {corpus.file_count}
                  </p>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-800">
                  <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                    <HardDrive className="w-3 h-3" />{" "}
                    {t("playground.data.charactersLabel")}
                  </div>
                  <p className="text-xl font-bold text-white">
                    {corpus.total_chars?.toLocaleString()}
                  </p>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-800">
                  <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                    <Hash className="w-3 h-3" />{" "}
                    {t("playground.data.uniqueChars")}
                  </div>
                  <p className="text-xl font-bold text-white">
                    {corpus.unique_chars}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {t("playground.data.vocabSize")}
                  </p>
                </div>
              </div>

              {/* Aperçu */}
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="btn-secondary text-xs w-full flex items-center justify-center gap-1"
              >
                <Eye className="w-3 h-3" />{" "}
                {showPreview
                  ? t("playground.data.hidePreview")
                  : t("playground.data.showCorpus")}
              </button>

              {showPreview && corpus.text && (
                <div className="bg-gray-900 rounded-lg p-3 border border-gray-800 max-h-64 overflow-y-auto">
                  <pre className="text-xs text-gray-400 whitespace-pre-wrap font-mono">
                    {corpus.text.slice(0, 2000)}
                  </pre>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-500">
              {t("playground.data.noActiveData")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
