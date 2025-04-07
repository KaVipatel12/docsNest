import { toast } from "react-toastify";

export const isValidFolderName = (name) => {
  const trimmed = name.trim();
  const regex = /^[a-zA-Z0-9 _-]{3,30}$/;

  if (name !== trimmed) {
    toast.error("Folder name should not start or end with spaces.");
    return false;
  }

  if (!regex.test(name)) {
    toast.error(
      "Folder name must be 3-30 characters long and can only contain letters, numbers, spaces, hyphens (-), or underscores (_)."
    );
    return false;
  }

  if (/\s{2,}/.test(name)) {
    toast.error("Folder name should not contain consecutive spaces.");
    return false;
  }

  return true;
};
