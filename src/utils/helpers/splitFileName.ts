export const splitFileName = (name: string) => {
  const splittedFileName = name.split(".");

  const fileName = splittedFileName[0];
  const fileExtension = splittedFileName[1];

  return { fileName, fileExtension };
};
