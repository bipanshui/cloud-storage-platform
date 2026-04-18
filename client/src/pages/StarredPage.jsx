import { useEffect, useState } from "react";
import { useFile } from "@/hooks/useFile";
import { fileService } from "@/services/fileService";
import FileGrid from "@/components/files/FileGrid";
import FileList from "@/components/files/FileList";
import UploadProgress from "@/components/files/UploadProgress";
import toast from "react-hot-toast";

function StarredPage() {
  const { viewMode, fetchFiles } = useFile();
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStarredFiles();
  }, [viewMode]);

  const fetchStarredFiles = async () => {
    setIsLoading(true);
    try {
      const response = await fileService.getStarredFiles();
      setFiles(response.data.data.files || []);
    } catch (error) {
      toast.error("Failed to load starred files");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Starred</h1>
          <p className="mt-1 text-sm text-neutral-500">Your starred files and folders</p>
        </div>
      </div>

      {viewMode === "grid" ? <FileGrid /> : <FileList />}
      <UploadProgress />
    </div>
  );
}

export default StarredPage;