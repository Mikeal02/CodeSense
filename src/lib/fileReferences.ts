// Detects `path/to/file.ext[:LINE[-END]]` style references so the chat can
// linkify AI citations directly into the file viewer.

const REF_RE = /^([A-Za-z0-9_.\-/@$]+\.[A-Za-z0-9]{1,8})(?::(\d+)(?:-(\d+))?)?$/;

export interface ParsedRef {
  path: string;
  line?: number;
  endLine?: number;
}

export function parseRef(raw: string): ParsedRef | null {
  const trimmed = raw.trim().replace(/^`|`$/g, "");
  const m = trimmed.match(REF_RE);
  if (!m) return null;
  // Require at least one path segment or an obvious code extension
  const [, path, line, end] = m;
  if (!path.includes("/") && !/\.(tsx?|jsx?|py|go|rs|java|css|scss|md|json|yaml|yml|toml|sql|html|vue|svelte|rb|php|swift|kt|c|cpp|h)$/i.test(path)) {
    return null;
  }
  return {
    path,
    line: line ? parseInt(line, 10) : undefined,
    endLine: end ? parseInt(end, 10) : undefined,
  };
}

// Best-effort match against loaded files: exact, then suffix, then basename.
export function resolveRefPath(ref: string, files: { path: string }[]): string | null {
  const norm = ref.replace(/^\.?\//, "");
  const exact = files.find(f => f.path === norm || f.path === ref);
  if (exact) return exact.path;
  const suffix = files.find(f => f.path.endsWith("/" + norm) || f.path.endsWith(norm));
  if (suffix) return suffix.path;
  const base = norm.split("/").pop();
  if (!base) return null;
  const byName = files.find(f => f.path.split("/").pop() === base);
  return byName?.path ?? null;
}