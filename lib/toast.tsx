import { toast as sonnerToast } from "sonner";
import {
  LuCircleCheck,
  LuCircleX,
  LuTriangleAlert,
  LuInfo,
  LuX,
  LuLoaderCircle,
} from "react-icons/lu";

type ToastType = "success" | "error" | "warning" | "info" | "loading";

const borderColors: Record<ToastType, string> = {
  success: "border-green-500/60",
  error: "border-red-500/60",
  warning: "border-orange-500/60",
  info: "border-blue-500/60",
  loading: "border-green-500/60",
};

const iconColors: Record<ToastType, string> = {
  success: "text-green-400",
  error: "text-red-400",
  warning: "text-orange-400",
  info: "text-blue-400",
  loading: "text-green-400",
};

const icons: Record<ToastType, React.ReactNode> = {
  success: <LuCircleCheck size={18} />,
  error: <LuCircleX size={18} />,
  warning: <LuTriangleAlert size={18} />,
  info: <LuInfo size={18} />,
  loading: <LuLoaderCircle size={18} className="animate-spin" />,
};

function ToastContent({
  id,
  type,
  message,
}: {
  id: string | number;
  type: ToastType;
  message: string;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-2xl border ${borderColors[type]} bg-[#110b1e] px-4 py-3 text-white shadow-2xl shadow-black/40 w-[350px] font-quicksand text-[12px]`}
    >
      <span className={`shrink-0 ${iconColors[type]}`}>{icons[type]}</span>
      <p className="flex-1 text-[12px] font-medium leading-snug font-quicksand m-0">
        {message}
      </p>
      <button
        onClick={() => sonnerToast.dismiss(id)}
        className="shrink-0 rounded-full p-1 text-white/30 hover:text-white/70 hover:bg-white/5 transition-all cursor-pointer bg-transparent border-none"
      >
        <LuX size={14} />
      </button>
    </div>
  );
}

function createToast(type: ToastType, message: string) {
  return sonnerToast.custom(
    (id) => <ToastContent id={id} type={type} message={message} />,
    {
      duration: type === "loading" ? Infinity : 4000,
    },
  );
}

export const toast = {
  success: (message: string) => createToast("success", message),
  error: (message: string) => createToast("error", message),
  warning: (message: string) => createToast("warning", message),
  info: (message: string) => createToast("info", message),
  loading: (message: string) => createToast("loading", message),
  dismiss: sonnerToast.dismiss,
};
