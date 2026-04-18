import {
  HiClock,
  HiHome,
  HiOutlineFolder,
  HiOutlineStar,
  HiOutlineTrash,
} from "react-icons/hi2";

export const APP_NAME = "CloudVault";
export const APP_TAGLINE = "Secure. Fast. Accessible.";
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const NAV_ITEMS = [
  { label: "My Drive", to: "/dashboard", icon: HiHome },
  { label: "All Files", to: "/files", icon: HiOutlineFolder },
  { label: "Recent", to: "/recent", icon: HiClock },
  { label: "Starred", to: "/starred", icon: HiOutlineStar },
  { label: "Trash", to: "/trash", icon: HiOutlineTrash },
];