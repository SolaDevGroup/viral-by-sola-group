import { setErrorMessage, setShowError } from "@/store/slices/AuthConfig";
import { store } from "../store";
export const ToastMessage = (message, type = "text") => {
  if (typeof message === "string") {
    store.dispatch(setShowError(true));
    store.dispatch(setErrorMessage(message));
  }
};
