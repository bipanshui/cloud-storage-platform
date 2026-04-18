import PropTypes from "prop-types";
import clsx from "clsx";
import { HiCheck } from "react-icons/hi2";

const COLORS = [
  { name: "default", value: null, bg: "bg-neutral-100", border: "border-neutral-300" },
  { name: "blue", value: "#3B82F6", bg: "bg-blue-100", border: "border-blue-300" },
  { name: "green", value: "#22C55E", bg: "bg-green-100", border: "border-green-300" },
  { name: "red", value: "#EF4444", bg: "bg-red-100", border: "border-red-300" },
  { name: "yellow", value: "#EAB308", bg: "bg-yellow-100", border: "border-yellow-300" },
  { name: "purple", value: "#A855F7", bg: "bg-purple-100", border: "border-purple-300" },
  { name: "pink", value: "#EC4899", bg: "bg-pink-100", border: "border-pink-300" },
  { name: "orange", value: "#F97316", bg: "bg-orange-100", border: "border-orange-300" },
];

function FolderColorPicker({ selectedColor, onSelect }) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {COLORS.map((color) => (
        <button
          key={color.name}
          type="button"
          onClick={() => onSelect(color.value)}
          className={clsx(
            "flex h-8 w-8 items-center justify-center rounded-lg border-2 transition",
            color.bg,
            color.border,
            selectedColor === color.value || selectedColor === color.value?.toLowerCase()
              ? "border-neutral-900"
              : "border-transparent"
          )}
        >
          {(selectedColor === color.value || selectedColor === color.value?.toLowerCase()) && (
            <HiCheck className="h-4 w-4 text-neutral-900" />
          )}
        </button>
      ))}
    </div>
  );
}

FolderColorPicker.propTypes = {
  selectedColor: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
};

export default FolderColorPicker;