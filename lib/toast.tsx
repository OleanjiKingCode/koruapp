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
  success: "border-green-500",
  error: "border-red-500",
  warning: "border-orange-500",
  info: "border-blue-500",
  loading: "border-green-500",
};

const iconColors: Record<ToastType, string> = {
  success: "text-green-500",
  error: "text-red-500",
  warning: "text-orange-500",
  info: "text-blue-500",
  loading: "text-green-500",
};

const icons: Record<ToastType, React.ReactNode> = {
  success: <LuCircleCheck size={20} />,
  error: <LuCircleX size={20} />,
  warning: <LuTriangleAlert size={20} />,
  info: <LuInfo size={20} />,
  loading: <LuLoaderCircle size={20} className="animate-spin" />,
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
      className={`flex items-center gap-3 rounded-xl border ${borderColors[type]} bg-[#110d1b] px-4 py-3 text-white shadow-xl min-w-[320px]`}
    >
      <span className={`shrink-0 ${iconColors[type]}`}>{icons[type]}</span>
      <p
        className="flex-1 text-sm font-medium"
        style={{ fontFamily: "var(--font-quicksand)" }}
      >
        {message}
      </p>
      <button
        onClick={() => sonnerToast.dismiss(id)}
        className="shrink-0 text-white/40 hover:text-white transition-colors cursor-pointer"
      >
        <LuX size={16} />
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
