import { ParentFolderDetail } from "../../types/folder";

// export const getRedirectUrlForFolder = (parentFolder: ParentFolderDetail) => {
//   const params = parentFolder ? parentFolder.id : "all";

//   return `/folder/${params}`;
// };

export const getRedirectUrlForFolder = (parentFolderId: number | null) => {
  const params = parentFolderId ? parentFolderId : "all";

  return `/folder/${params}`;
};
