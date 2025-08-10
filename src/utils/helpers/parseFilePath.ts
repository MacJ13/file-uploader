import path from "path";

export const parseFilePath = (fpath: string) => {
  const fileDir = path.dirname(fpath);
  const fileExt = path.extname(fpath);

  return { fileDir, fileExt };
};
