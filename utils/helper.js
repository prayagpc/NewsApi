import { supportedMimes } from "../config/filesystem.js";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";
export const imageValidator = (size, mime) => {
  if (byesToMB(size) > 2) {
    return "Imaze size must be less than 2 MB";
  } else if (!supportedMimes.includes(mime)) {
    return "Image must be type of jpeg,png....";
  }
  return null;
};

export const byesToMB = (bytes) => {
  return bytes / (1024 * 1024);
};

export const generateUniqueName = () => {
  return uuidv4();
};

export const getImageUrl = (imgName) => {
  return `${process.env.APP_URl}/images/${imgName}`;
};

export const removeImage = (imagename) => {
  // const path = process.cwd() + "/public/image/" + imagename;
  const pathe = path.join(process.cwd(), "public", "images", imagename);
  if (fs.existsSync(pathe)) {
    fs.unlinkSync(pathe);
  }
};

export const uploadImage = (image) => {
  const imgExt = image?.name.split(".");
  const imageName = generateUniqueName() + "." + imgExt[1];
  //   console.log(imageName);

  const uploadpath = process.cwd() + "/public/images/" + imageName;
  //   console.log(uploadpath);

  image.mv(uploadpath, (err) => {
    if (err) {
      throw err;
    }
  });
  return imageName;
};
