import { ToastMessage } from "./ToastMessage";
import { endPoints } from "../services/ENV";
import axios from "axios";

export const uploadAndGetUrl = async (file) => {
  try {
    const formData = new FormData();
    formData.append("image", {
      uri: file?.path || file?.fileCopyUri || file?.uri || "",
      type: file?.type || "image/jpeg",
      name: file?.name || "photo.jpg",
    });
    const res = await axios.post(
      // `${endPoints.BASE_URL}upload-image`,
      `https://move.sola-group.ch/api/upload-image`,
      // "http://192.168.18.74:2000/api/upload-image",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return res?.data?.image;
  } catch (err) {
    console.log("================err", err?.response?.data || err);
    ToastMessage(
      err?.response?.data?.message || "Something failed! Please try again",
      "error"
    );
  }
};

export const uploadFileGetUrl = async (file, filetype = "application/pdf") => {
  try {
    const formData = new FormData();

    formData.append("file", {
      uri: file?.localUri,
      type: filetype,
      name: file?.name || "file",
    });

    const res = await axios.post(
      `https://move.sola-group.ch/api/upload-file`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    console.log("file Upload res====>", res.data);

    return res?.data;
  } catch (err) {
    console.log("Error:", err.response?.data || err.message);
    ToastMessage("Upload Again");
  }
};
