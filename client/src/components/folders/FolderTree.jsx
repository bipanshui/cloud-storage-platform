import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import { HiFolder, HiChevronRight, HiChevronDown } from "react-icons/hi2";
import { folderService } from "@/services/folderService";

const colorMap = {
  null: "text-neutral-500",
  "#3B82F6": "text-blue-500",
  "#22C55E": "text-green-500",
  "#EF4444": "text-red-500",
  "#EAB308": "text-yellow-500",
  "#A855F7": "text-purple-500",
  "#EC4899": "text-pink-500",
  "#F97316": "text-orange-500",
};

function FolderTree({ 
  selectedId, 
  onSelect, 
  disabledIds = [],
  currentFolderId = null 
}) {
  const [tree, setTree] = useState([]);
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTree();
  }, []);

  const fetchTree = async () => {
    setIsLoading(true);
    try {
      const response = await folderService.getFolderTree();
      setTree(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch folder tree:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleExpand = (folderId) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  const isDisabled = (folderId) => {
    return disabledIds.includes(folderId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-neutral-900 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <button
        onClick={() => onSelect(null)}
        disabled={isDisabled(null)}
        className={clsx(
          "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition",
          selectedId === null
            ? "bg-neutral-100 text-neutral-900 font-medium"
            : "text-neutral-700 hover:bg-neutral-50",
          isDisabled(null) && "opacity-50 cursor-not-allowed"
        )}
      >
        <HiFolder className="h-5 w-5" />
        <span>My Drive</span>
      </button>

      {tree.map((folder) => (
        <FolderTreeNode
          key={folder.id}
          folder={folder}
          level={0}
          selectedId={selectedId}
          onSelect={onSelect}
          isDisabled={isDisabled}
          expandedIds={expandedIds}
          toggleExpand={toggleExpand}
          currentFolderId={currentFolderId}
        />
      ))}
    </div>
  );
}

function FolderTreeNode({ 
  folder, 
  level, 
  selectedId, 
  onSelect, 
  isDisabled, 
  expandedIds, 
  toggleExpand,
  currentFolderId 
}) {
  const hasChildren = folder.children && folder.children.length > 0;
  const isExpanded = expandedIds.has(folder.id);
  const isCurrentFolder = folder.id === currentFolderId;

  return (
    <div className="ml-4">
      <div className="flex items-center">
        {hasChildren ? (
          <button
            onClick={() => toggleExpand(folder.id)}
            className="flex h-5 w-5 items-center justify-center text-neutral-400 hover:text-neutral-600"
          >
            {isExpanded ? (
              <HiChevronDown className="h-4 w-4" />
            ) : (
              <HiChevronRight className="h-4 w-4" />
            )}
          </button>
        ) : (
          <span className="h-5 w-5" />
        )}

        <button
          onClick={() => !isDisabled(folder.id) && onSelect(folder.id)}
          disabled={isDisabled(folder.id)}
          className={clsx(
            "flex flex-1 items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition",
            selectedId === folder.id
              ? "bg-neutral-100 text-neutral-900 font-medium"
              : "text-neutral-700 hover:bg-neutral-50",
            isDisabled(folder.id) && "opacity-50 cursor-not-allowed"
          )}
        >
          <HiFolder className={clsx("h-4 w-4", colorMap[folder.color] || colorMap.null)} />
          <span className="truncate">{folder.name}</span>
        </button>
      </div>

      {hasChildren && isExpanded && (
        <div>
          {folder.children.map((child) => (
            <FolderTreeNode
              key={child.id}
              folder={child}
              level={level + 1}
              selectedId={selectedId}
              onSelect={onSelect}
              isDisabled={isDisabled}
              expandedIds={expandedIds}
              toggleExpand={toggleExpand}
              currentFolderId={currentFolderId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

FolderTree.propTypes = {
  selectedId: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
  disabledIds: PropTypes.arrayOf(PropTypes.string),
  currentFolderId: PropTypes.string,
};

export default FolderTree;