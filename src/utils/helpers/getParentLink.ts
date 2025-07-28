import { ParentFolderDetail } from "../../types/folder";

export const getParentLink = (parentFolder: ParentFolderDetail) => {
  return parentFolder ? `/folder/${parentFolder.id}` : "/folder/all";
};
