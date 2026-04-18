import { useEffect, useState } from "react";
import { useFile } from "@/hooks/useFile";
import { fileService } from "@/services/fileService";
import FileGrid from "@/components/files/FileGrid";
import FileList from "@/components/files/FileList";
import UploadProgress from "@/components/files/UploadProgress";
import Button from "@/components/common/Button";
import toast from "react-hot-toast";

function TrashPage() {
  const { viewMode } = useFile();
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEmptying, setIsEmptying] = useState(false);

  useEffect(() => {
    fetchTrashFiles();
  }, [viewMode]);

  const fetchTrashFiles = async () => {
    setIsLoading(true);
    try {
      const response = await fileService.getTrashFiles();
      setFiles(response.data.data.files || []);
    } catch (error) {
      toast.error("Failed to load trash");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmptyTrash = async () => {
    if (!confirm("Are you sure you want to empty the trash? This action cannot be undone.")) {
      return;
    }

    setIsEmptying(true);
    try {
      await fileService.emptyTrash();
      toast.success("Trash emptied");
      fetchTrashFiles();
    } catch (error) {
      toast.error("Failed to empty trash");
    } finally {
      setIsEmptying(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Trash</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Items in trash are permanently deleted after 30 days
          </p>
        </div>
        {files.length > 0 && (
          <Button variant="danger" onClick={handleEmptyTrash} isLoading={isEmptying}>
            Empty Trash
          </Button>
        )}
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
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-medium text-neutral-900">Trash is empty</h3>
          <p className="mt-2 text-center text-sm text-neutral-500">
            Deleted files will appear here
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

export default TrashPage;