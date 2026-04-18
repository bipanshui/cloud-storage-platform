import { useEffect, useState } from "react";
import { useFile } from "@/hooks/useFile";
import { fileService } from "@/services/fileService";
import FileGrid from "@/components/files/FileGrid";
import FileList from "@/components/files/FileList";
import UploadProgress from "@/components/files/UploadProgress";
import toast from "react-hot-toast";

function RecentPage() {
  const { viewMode } = useFile();
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRecentFiles();
  }, [viewMode]);

  const fetchRecentFiles = async () => {
    setIsLoading(true);
    try {
      const response = await fileService.getRecentFiles();
      setFiles(response.data.data.files || []);
    } catch (error) {
      toast.error("Failed to load recent files");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Recent</h1>
          <p className="mt-1 text-sm text-neutral-500">Files you've recently accessed</p>
        </div>
      </div>

      {files.length === 0 && !isLoading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="rounded-full bg-neutral-100 p-6">
            <svg
              className="h-12 w-12 text-neutral-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-medium text-neutral-900">No recent files</h3>
          <p className="mt-2 text-center text-sm text-neutral-500">
            Files you access will appear here
          </p>
        </div>
      ) : (
        <>
          {viewMode === "grid" ? <FileGrid /> : <FileList />}
        </>
      )}
      <UploadProgress />
    </div>
  );
}

export default RecentPage;