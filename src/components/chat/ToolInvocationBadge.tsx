"use client";

import { Loader2, FilePlus, Pencil, Eye, Trash2, FileText } from "lucide-react";
import type { ToolInvocation } from "ai";

interface ToolInvocationBadgeProps {
  toolInvocation: ToolInvocation;
}

// Extract the last path segment as the display file name
function getFileName(path: string): string {
  return path.split("/").pop() || path;
}

// Map tool name + args to a human-readable action label
function getLabel(toolName: string, args: Record<string, unknown>): string {
  if (toolName === "str_replace_editor") {
    switch (args.command) {
      case "create":     return `Creating ${getFileName(args.path as string)}`;
      case "str_replace":
      case "insert":     return `Editing ${getFileName(args.path as string)}`;
      case "view":       return `Viewing ${getFileName(args.path as string)}`;
    }
  }
  if (toolName === "file_manager") {
    switch (args.command) {
      case "rename": return `Renaming ${getFileName(args.path as string)}`;
      case "delete": return `Deleting ${getFileName(args.path as string)}`;
    }
  }
  return toolName;
}

// Pick an icon that matches the operation
function getIcon(toolName: string, args: Record<string, unknown>) {
  const cls = "w-3.5 h-3.5 text-neutral-500 flex-shrink-0";
  if (toolName === "str_replace_editor") {
    switch (args.command) {
      case "create":                 return <FilePlus className={cls} />;
      case "str_replace":
      case "insert":                 return <Pencil className={cls} />;
      case "view":                   return <Eye className={cls} />;
    }
  }
  if (toolName === "file_manager") {
    switch (args.command) {
      case "rename":                 return <FileText className={cls} />;
      case "delete":                 return <Trash2 className={cls} />;
    }
  }
  return <FileText className={cls} />;
}

export function ToolInvocationBadge({ toolInvocation }: ToolInvocationBadgeProps) {
  const isDone = toolInvocation.state === "result";
  const label = getLabel(toolInvocation.toolName, toolInvocation.args ?? {});
  const icon = getIcon(toolInvocation.toolName, toolInvocation.args ?? {});

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs border border-neutral-200">
      {isDone ? (
        <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600 flex-shrink-0" />
      )}
      {icon}
      <span className="text-neutral-700">{label}</span>
    </div>
  );
}
