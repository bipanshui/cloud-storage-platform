import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useFile } from "@/hooks/useFile";
import { fileService } from "@/services/fileService";
import { formatBytes } from "@/utils/helpers";
import FileGrid from "@/components/files/FileGrid";
import UploadButton from "@/components/files/UploadButton";
import toast from "react-hot-toast";

function DashboardPage() {
  const { user } = useAuth();
  const { fetchFiles, storageInfo } = useFile();
  const [recentFiles, setRecentFiles] = useState([]);
  const [starredFiles, setStarredFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [recentRes, starredRes] = await Promise.all([
        fileService.getRecentFiles(),
        fileService.getStarredFiles(),
      ]);
      setRecentFiles(recentRes.data.data.files || []);
      setStarredFiles(starredRes.data.data.files || []);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const usage = user?.storageLimit 
    ? Math.round((user.storageUsed / user.storageLimit) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-neutral-200 bg-white p-6">
        <h1 className="text-2xl font-semibold text-neutral-900">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Your cloud storage workspace
        </p>

        <div className="mt-6 max-w-sm rounded-lg bg-neutral-50 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Storage usage</span>
            <span>{usage}% used</span>
          </div>
          <div className="mt-2 h-1.5 rounded-full bg-neutral-200">
            <div className={`h-1.5 rounded-full bg-neutral-900 ${
              usage < 25 ? "w-1/4" :
              usage < 50 ? "w-1/2" :
              usage < 75 ? "w-3/4" : "w-full"
            }`} />
          </div>
          <p className="mt-2 text-sm text-neutral-500">
            {formatBytes(user?.storageUsed || 0)} of {formatBytes(user?.storageLimit || 0)}
          </p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-neutral-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-neutral-900">Recent Files</h2>
          </div>
          {recentFiles.length === 0 && !isLoading ? (
            <p className="mt-4 text-sm text-neutral-500">No recent files</p>
          ) : (
            <div className="mt-4 space-y-3">
              {recentFiles.slice(0, 5).map((file) => (
                <div key={file.id} className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded bg-neutral-100" />
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm text-neutral-900">{file.name}</p>
                    <p className="text-xs text-neutral-500">{formatBytes(file.size)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-neutral-900">Starred</h2>
          </div>
          {starredFiles.length === 0 && !isLoading ? (
            <p className="mt-4 text-sm text-neutral-500">No starred files</p>
          ) : (
            <div className="mt-4 space-y-3">
              {starredFiles.slice(0, 5).map((file) => (
                <div key={file.id} className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded bg-neutral-100" />
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm text-neutral-900">{file.name}</p>
                    <p className="text-xs text-neutral-500">{formatBytes(file.size)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="rounded-lg border border-dashed border-neutral-300 bg-white p-6 text-sm text-neutral-500">
        <div className="flex items-center gap-2 text-neutral-900">
          <span className="font-medium">Quick upload</span>
        </div>
        <p className="mt-2">
          Drag and drop files here or click the upload button to add files to your storage.
        </p>
        <div className="mt-4">
          <UploadButton />
        </div>
      </section>
    </div>
  );
}

export default DashboardPage;