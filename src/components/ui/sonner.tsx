"use client";

import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-[#19202e] group-[.toaster]:border-2 group-[.toaster]:border-[#19202e] group-[.toaster]:shadow-[4px_4px_0px_#19202e] group-[.toaster]:rounded-2xl group-[.toaster]:font-sans group-[.toaster]:p-4",
          title: "group-[.toast]:font-serif group-[.toast]:font-bold group-[.toast]:text-sm group-[.toast]:text-[#19202e]",
          description: "group-[.toast]:text-[#4a3b35] group-[.toast]:text-xs group-[.toast]:mt-0.5",
          actionButton:
            "group-[.toast]:bg-[#c85a32] group-[.toast]:text-white group-[.toast]:border group-[.toast]:border-[#19202e] group-[.toast]:rounded-xl group-[.toast]:font-bold group-[.toast]:text-xs group-[.toast]:px-3 group-[.toast]:py-1.5 hover:group-[.toast]:bg-[#b04b25]",
          cancelButton:
            "group-[.toast]:bg-[#f3ede9] group-[.toast]:text-[#19202e] group-[.toast]:border group-[.toast]:border-[#19202e] group-[.toast]:rounded-xl group-[.toast]:text-xs",
          error:
            "group-[.toast]:bg-[#fff5f5] group-[.toast]:border-2 group-[.toast]:border-[#ba1a1a] group-[.toast]:text-[#7a1212]",
          success:
            "group-[.toast]:bg-[#f4fbf4] group-[.toast]:border-2 group-[.toast]:border-[#19202e] group-[.toast]:text-[#1e4620]",
          warning:
            "group-[.toast]:bg-[#fef9ee] group-[.toast]:border-2 group-[.toast]:border-[#19202e] group-[.toast]:text-[#854f00]",
          info:
            "group-[.toast]:bg-[#fef8f4] group-[.toast]:border-2 group-[.toast]:border-[#19202e] group-[.toast]:text-[#19202e]",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
