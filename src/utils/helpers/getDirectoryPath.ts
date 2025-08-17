export const getDirectoryPath = (path: string) => {
  let tempPath = path.split("/");

  tempPath.pop();

  return tempPath.join("/");
};
