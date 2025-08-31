export class URLLinkHelper {
  static getFolderUrl(folderId: string | number | null | undefined) {
    return folderId ? `/folder/${folderId}` : "/folder/all";
  }

  static getRedirectUrl(id: string | number | null) {
    return id ? `/folder/${id}` : "/file/all";
  }

  static getRedirectFolderURL(id: string | number) {
    return `/folder/${id}`;
  }
}
