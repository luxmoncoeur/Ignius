"use client";
import { CircleCheckIcon, InfoIcon, Loader2Icon, OctagonXIcon, TriangleAlertIcon, } from "lucide-react";
import useTheme from "@/lib/useTheme";
import { Toaster as Sonner } from "sonner";
const Toaster = ({ ...props }) => {
    const [theme] = useTheme();
    return (<Sonner theme={theme || "light"} className="toaster group tw" icons={{
            success: <CircleCheckIcon className="size-4"/>,
            info: <InfoIcon className="size-4"/>,
            warning: <TriangleAlertIcon className="size-4"/>,
            error: <OctagonXIcon className="size-4"/>,
            loading: <Loader2Icon className="size-4 animate-spin"/>,
        }} style={{
            "--normal-bg": "var(--surface)",
            "--normal-text": "var(--ink)",
            "--normal-border": "var(--line)",
            "--border-radius": "0.875rem",
        }} {...props}/>);
};
export { Toaster };
