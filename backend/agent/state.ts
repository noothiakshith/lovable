import { Annotation, MessagesAnnotation } from "@langchain/langgraph";


export interface SandboxState {
  id: string;
  rootDir: "/home/user/app"; 
  previewUrl: string;
  isDevServerRunning: boolean;
}

export interface FileNode {
  path: string; // Relative to rootDir, e.g., "src/components/Header.tsx"
  type: "file" | "directory";
}

export const StateAnnotation = Annotation.Root({
  ...MessagesAnnotation.spec,


  sandbox: Annotation<SandboxState>({
    reducer: (prev, next) => ({ ...prev, ...next }),
    default: () => ({
      id: "",
      rootDir: "/home/user/app",
      previewUrl: "",
      isDevServerRunning: false,
    }),
  }),

  // 2. Folder Tracking (The "Crack"): Keeps track of the structure in the image
  // We initialize this with the folders already present in your sandbox
  directories: Annotation<string[]>({
    reducer: (prev, next) => Array.from(new Set([...prev, ...next])),
    default: () => ["node_modules", "public", "src", "src/assets"],
  }),

  // 3. File Registry: Mapping the specific Vite/React files seen in the image
  fileSystem: Annotation<FileNode[]>({
    reducer: (prev, next) => next,
    default: () => [
      { path: "package.json", type: "file" },
      { path: "vite.config.js", type: "file" },
      { path: "tailwind.config.js", type: "file" },
      { path: "src/App.jsx", type: "file" },
      { path: "src/main.jsx", type: "file" },
    ],
  }),

  // 4. Loop & Error Tracking
  errors: Annotation<string[]>({
    reducer: (prev, next) => [...prev, ...next],
    default: () => [],
  }),
  
  iterationCount: Annotation<number>({
    reducer: (prev, next) => prev + next,
    default: () => 0,
  }),

  currentPhase: Annotation<"planning" | "coding" | "linting" | "end"|"structure"|"review">({
    reducer: (prev, next) => next,
    default: () => "planning",
  }),
});

export type ProjectState = typeof StateAnnotation.State;