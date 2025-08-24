export const replaceSubstring = (
  path: string,
  oldWord: string,
  newWord: string
) => {
  const newReplacedPath = path.replace(oldWord, newWord);

  return newReplacedPath;
};
