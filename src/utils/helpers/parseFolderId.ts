export const parseFolderId = (param?: string): number | null => {
  return param && !isNaN(+param) ? +param : null;
};
