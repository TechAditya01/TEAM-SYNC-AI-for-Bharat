const toObjectUrl = (file) => {
  if (!file) return null;
  return URL.createObjectURL(file);
};

export const uploadImage = async (file) => toObjectUrl(file);
export const uploadVideo = async (file) => toObjectUrl(file);
export const uploadAudio = async (file) => toObjectUrl(file);
