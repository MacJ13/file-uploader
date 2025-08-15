export const normalizeFolderName = (folder: string) => {
  return folder
    .replace(/\\/g, "/") // zamienia backslash na slash
    .replace(/\s+/g, "_"); // zamienia spacje na podkreślenia
};
