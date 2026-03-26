
import { useToastStore } from "../../store/toastStore.js";
import { X, Check, AlertCircle, AlertTriangle, Info } from "lucide-react";

export default function Toast({ toast }) {
  const { removeToast } = useToastStore();

  const bgColor = {
    success: "bg-green-50 dark:bg-green-900/30",
    error: "bg-red-50 dark:bg-red-900/30",
    warning: "bg-yellow-50 dark:bg-yellow-900/30",
    info: "bg-blue-50 dark:bg-blue-900/30",
  };

  const borderColor = {
    success: "border-green-200 dark:border-green-700",
    error: "border-red-200 dark:border-red-700",
    warning: "border-yellow-200 dark:border-yellow-700",
    info: "border-blue-200 dark:border-blue-700",
  };

  const textColor = {
    success: "text-green-800 dark:text-green-100",
    error: "text-red-800 dark:text-red-100",
    warning: "text-yellow-800 dark:text-yellow-100",
    info: "text-blue-800 dark:text-blue-100",
  };

  const iconColor = {
    success: "text-green-600 dark:text-green-400",
    error: "text-red-600 dark:text-red-400",
    warning: "text-yellow-600 dark:text-yellow-400",
    info: "text-blue-600 dark:text-blue-400",
  };

  const Icon = {
    success: Check,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  }[toast.type] || Info;

  return (
    <div
      className={`animate-slide-in-right max-w-sm rounded-lg border ${
        bgColor[toast.type]
      } ${borderColor[toast.type]} p-4 shadow-lg`}
    >
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconColor[toast.type]}`} />
        <div className="flex-1">
          <p className={`text-sm font-medium ${textColor[toast.type]}`}>
            {toast.message}
          </p>
        </div>
        <button
          onClick={() => removeToast(toast.id)}
          className={`text-xs font-semibold opacity-70 hover:opacity-100 ${textColor[toast.type]}`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
