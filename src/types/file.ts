export type FileCreationType = {
  public_id: string;
  resource_type: string;
  originalname: string;
  size: number;
  folderId: number | null;
  userId: number;
};

export type FileResourceType = "image" | "video" | "raw";
