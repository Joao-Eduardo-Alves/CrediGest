import { toast } from "react-toastify";

const toastService = {
  success: (message) =>
    toast.success(message, {
      position: "top-center",
      autoClose: 3000,
      hideProgressBar: true,
    }),
  error: (message) =>
    toast.error(message, {
      position: "top-center",
      autoClose: 3000,
      hideProgressBar: true,
    }),
  warning: (message) =>
    toast.warning(message, {
      position: "top-center",
      autoClose: 3000,
      hideProgressBar: true,
    }),
  info: (message) =>
    toast.info(message, {
      position: "top-center",
      autoClose: 3000,
      hideProgressBar: true,
    }),
};

export default toastService;
