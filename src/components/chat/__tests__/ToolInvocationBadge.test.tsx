import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolInvocationBadge } from "../ToolInvocationBadge";
import type { ToolInvocation } from "ai";

afterEach(() => {
  cleanup();
});

function makeInvocation(
  toolName: string,
  args: Record<string, unknown>,
  state: ToolInvocation["state"] = "call"
): ToolInvocation {
  return { state, toolCallId: "test-id", toolName, args } as ToolInvocation;
}

// str_replace_editor labels
test("shows 'Creating <file>' for str_replace_editor create", () => {
  render(<ToolInvocationBadge toolInvocation={makeInvocation("str_replace_editor", { command: "create", path: "/components/Button.tsx" })} />);
  expect(screen.getByText("Creating Button.tsx")).toBeDefined();
});

test("shows 'Editing <file>' for str_replace_editor str_replace", () => {
  render(<ToolInvocationBadge toolInvocation={makeInvocation("str_replace_editor", { command: "str_replace", path: "/App.jsx" })} />);
  expect(screen.getByText("Editing App.jsx")).toBeDefined();
});

test("shows 'Editing <file>' for str_replace_editor insert", () => {
  render(<ToolInvocationBadge toolInvocation={makeInvocation("str_replace_editor", { command: "insert", path: "/App.jsx" })} />);
  expect(screen.getByText("Editing App.jsx")).toBeDefined();
});

test("shows 'Viewing <file>' for str_replace_editor view", () => {
  render(<ToolInvocationBadge toolInvocation={makeInvocation("str_replace_editor", { command: "view", path: "/index.ts" })} />);
  expect(screen.getByText("Viewing index.ts")).toBeDefined();
});

// file_manager labels
test("shows 'Renaming <file>' for file_manager rename", () => {
  render(<ToolInvocationBadge toolInvocation={makeInvocation("file_manager", { command: "rename", path: "/old.tsx", new_path: "/new.tsx" })} />);
  expect(screen.getByText("Renaming old.tsx")).toBeDefined();
});

test("shows 'Deleting <file>' for file_manager delete", () => {
  render(<ToolInvocationBadge toolInvocation={makeInvocation("file_manager", { command: "delete", path: "/unused.tsx" })} />);
  expect(screen.getByText("Deleting unused.tsx")).toBeDefined();
});

// Unknown tool falls back to tool name
test("falls back to tool name for unknown tools", () => {
  render(<ToolInvocationBadge toolInvocation={makeInvocation("unknown_tool", {})} />);
  expect(screen.getByText("unknown_tool")).toBeDefined();
});

// State-based status indicator
test("shows spinner when state is 'call'", () => {
  const { container } = render(<ToolInvocationBadge toolInvocation={makeInvocation("str_replace_editor", { command: "create", path: "/App.jsx" }, "call")} />);
  // Spinner has animate-spin class
  expect(container.querySelector(".animate-spin")).toBeTruthy();
});

test("shows green dot when state is 'result'", () => {
  const { container } = render(<ToolInvocationBadge toolInvocation={makeInvocation("str_replace_editor", { command: "create", path: "/App.jsx" }, "result") as ToolInvocation} />);
  expect(container.querySelector(".bg-emerald-500")).toBeTruthy();
  expect(container.querySelector(".animate-spin")).toBeFalsy();
});

// Nested path — only filename shown
test("extracts filename from nested path", () => {
  render(<ToolInvocationBadge toolInvocation={makeInvocation("str_replace_editor", { command: "create", path: "/src/components/ui/Card.tsx" })} />);
  expect(screen.getByText("Creating Card.tsx")).toBeDefined();
});
