
export const arrayToUint8Array = (array) => {
  const len = array.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = array[i];
  }
  return bytes;
};