import { useState, useCallback, useRef } from "react";
import { toast } from "sonner";

export interface FileContent {
  path: string;
  content: string;
}

export interface CodebaseData {
  files: FileContent[];
  repoName: string;
  source: "github" | "local" | "demo";
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  codeBlock?: {
    language: string;
    code: string;
    filename?: string;
  };
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export function useCodebaseAnalysis() {
  const [codebase, setCodebase] = useState<CodebaseData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeMode, setActiveMode] = useState("overview");
  const folderInputRef = useRef<HTMLInputElement | null>(null);

  const formatCodebaseForAnalysis = useCallback((data: CodebaseData): string => {
    return data.files
      .map((f) => `=== ${f.path} ===\n${f.content}`)
      .join("\n\n");
  }, []);

  const fetchGitHubRepo = useCallback(async (url: string): Promise<CodebaseData> => {
    const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) {
      throw new Error("Invalid GitHub URL. Please use format: https://github.com/owner/repo");
    }

    const [, owner, repo] = match;
    const repoName = `${owner}/${repo.replace(/\.git$/, "")}`;

    toast.info("Fetching repository structure...");

    // Fetch repo tree
    const treeResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo.replace(/\.git$/, "")}/git/trees/main?recursive=1`
    );

    if (!treeResponse.ok) {
      // Try master branch if main fails
      const masterResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo.replace(/\.git$/, "")}/git/trees/master?recursive=1`
      );
      if (!masterResponse.ok) {
        throw new Error("Failed to fetch repository. Check if the URL is correct and the repo is public.");
      }
      const masterData = await masterResponse.json();
      return await fetchFilesFromTree(masterData, owner, repo.replace(/\.git$/, ""), repoName);
    }

    const treeData = await treeResponse.json();
    return await fetchFilesFromTree(treeData, owner, repo.replace(/\.git$/, ""), repoName);
  }, []);

  const fetchFilesFromTree = async (
    treeData: { tree: Array<{ path: string; type: string }> },
    owner: string,
    repo: string,
    repoName: string
  ): Promise<CodebaseData> => {
    const codeExtensions = [
      ".ts", ".tsx", ".js", ".jsx", ".py", ".java", ".go", ".rs",
      ".css", ".scss", ".html", ".json", ".md", ".yaml", ".yml",
      ".toml", ".sql", ".graphql", ".vue", ".svelte"
    ];

    const ignorePaths = ["node_modules", "dist", "build", ".git", "vendor", "__pycache__"];

    const codeFiles = treeData.tree
      .filter((item) => {
        if (item.type !== "blob") return false;
        if (ignorePaths.some((p) => item.path.includes(p))) return false;
        return codeExtensions.some((ext) => item.path.endsWith(ext));
      })
      .slice(0, 50); // Limit to 50 files for performance

    toast.info(`Found ${codeFiles.length} code files. Downloading...`);

    const files: FileContent[] = [];
    for (const file of codeFiles) {
      try {
        const contentResponse = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/contents/${file.path}`
        );
        if (contentResponse.ok) {
          const contentData = await contentResponse.json();
          if (contentData.content) {
            const content = atob(contentData.content);
            files.push({ path: file.path, content });
          }
        }
      } catch (error) {
        console.warn(`Failed to fetch ${file.path}`);
      }
    }

    return { files, repoName, source: "github" };
  };

  const processFileList = useCallback(async (fileList: FileList): Promise<CodebaseData> => {
    const codeExtensions = [
      ".ts", ".tsx", ".js", ".jsx", ".py", ".java", ".go", ".rs",
      ".css", ".scss", ".html", ".json", ".md", ".yaml", ".yml"
    ];

    const ignorePaths = ["node_modules", "dist", "build", ".git", "vendor", "__pycache__"];

    const files: FileContent[] = [];
    let repoName = "local-project";

    toast.info(`Processing ${fileList.length} files...`);

    for (let i = 0; i < fileList.length && files.length < 50; i++) {
      const file = fileList[i];
      const relativePath = file.webkitRelativePath || file.name;
      
      // Get folder name from first file
      if (i === 0 && relativePath.includes('/')) {
        repoName = relativePath.split('/')[0];
      }

      // Skip ignored paths
      if (ignorePaths.some((p) => relativePath.includes(p))) continue;

      // Only process code files
      if (!codeExtensions.some((ext) => file.name.endsWith(ext))) continue;

      try {
        const content = await file.text();
        // Remove the root folder from path for cleaner display
        const cleanPath = relativePath.includes('/') 
          ? relativePath.split('/').slice(1).join('/') 
          : relativePath;
        files.push({ path: cleanPath, content });
      } catch (error) {
        console.warn(`Failed to read ${relativePath}`);
      }
    }

    if (files.length === 0) {
      throw new Error("No code files found in the selected folder");
    }

    toast.success(`Loaded ${files.length} files from ${repoName}`);
    return { files, repoName, source: "local" };
  }, []);

  const loadDemoProject = useCallback((): CodebaseData => {
    const demoFiles: FileContent[] = [
      {
        path: "src/App.tsx",
        content: `import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import { CartProvider } from './context/CartContext';

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<ProductList />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;`
      },
      {
        path: "src/context/CartContext.tsx",
        content: `import React, { createContext, useContext, useState, useEffect } from 'react';

interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartContextType {
  items: Product[];
  addToCart: (product: Product) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Product[]>(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (product: Product) => {
    setItems(prev => {
      const existing = prev.find(p => p.id === product.id);
      if (existing) {
        return prev.map(p => 
          p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setItems(prev => prev.filter(p => p.id !== id));
  };

  const clearCart = () => setItems([]);

  const total = items.reduce((sum, p) => sum + p.price * p.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, clearCart, total }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};`
      },
      {
        path: "src/hooks/useProducts.ts",
        content: `import { useState, useEffect } from 'react';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
  inStock: boolean;
}

const API_URL = 'https://api.example.com/products';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  return { products, loading, error };
}

export function useProduct(id: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const response = await fetch(\`\${API_URL}/\${id}\`);
        if (!response.ok) throw new Error('Product not found');
        const data = await response.json();
        setProduct(data);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id]);

  return { product, loading };
}`
      },
      {
        path: "src/components/Header.tsx",
        content: `import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Search } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Header() {
  const { items } = useCart();
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-indigo-600">
          ShopApp
        </Link>
        
        <div className="flex-1 max-w-lg mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>
        </div>

        <Link to="/cart" className="relative">
          <ShoppingCart className="w-6 h-6" />
          {itemCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {itemCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}`
      },
      {
        path: "package.json",
        content: `{
  "name": "react-ecommerce-app",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.0",
    "lucide-react": "^0.300.0",
    "tailwindcss": "^3.4.0"
  },
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}`
      }
    ];

    return { files: demoFiles, repoName: "react-ecommerce-app", source: "demo" };
  }, []);

  const analyzeWithAI = useCallback(async (mode: string, question?: string) => {
    if (!codebase) {
      toast.error("No codebase loaded. Please connect a repository first.");
      return;
    }

    setIsLoading(true);
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: question || getModeQuestion(mode),
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/analyze-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
        body: JSON.stringify({
          codebase: formatCodebaseForAnalysis(codebase),
          mode,
          question,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Analysis failed");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response stream");

      const decoder = new TextDecoder();
      let assistantContent = "";
      let assistantMessageId = (Date.now() + 1).toString();

      // Add initial assistant message
      setMessages((prev) => [
        ...prev,
        { id: assistantMessageId, role: "assistant", content: "" },
      ]);

      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMessageId ? { ...m, content: assistantContent } : m
                )
              );
            }
          } catch {
            // Incomplete JSON, wait for more data
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error(error instanceof Error ? error.message : "Analysis failed");
      setMessages((prev) =>
        prev.filter((m) => m.role !== "assistant" || m.content !== "")
      );
    } finally {
      setIsLoading(false);
    }
  }, [codebase, formatCodebaseForAnalysis]);

  const getModeQuestion = (mode: string): string => {
    const questions: Record<string, string> = {
      overview: "Give me a complete project overview",
      map: "Show me the project structure and how files connect",
      flow: "Explain the execution flow of this application",
      teach: "Teach me this project as if I built it for interview prep",
      ask: "I'm ready to ask questions about the codebase",
      interview: "Generate interview questions for this project",
      forgot: "I forgot everything - give me a quick refresher",
      complexity: "Identify complex areas and technical debt",
      impact: "Help me understand change impact analysis",
      resume: "Generate resume-ready content for this project",
    };
    return questions[mode] || "Analyze this codebase";
  };

  const connectRepo = useCallback(async (url: string) => {
    setIsLoading(true);
    try {
      const data = await fetchGitHubRepo(url);
      setCodebase(data);
      setMessages([]);
      toast.success(`Connected to ${data.repoName}`);
    } catch (error) {
      console.error("Error connecting to repo:", error);
      toast.error(error instanceof Error ? error.message : "Failed to connect to repository");
    } finally {
      setIsLoading(false);
    }
  }, [fetchGitHubRepo]);

  const uploadFolder = useCallback(() => {
    // Create hidden file input if it doesn't exist
    if (!folderInputRef.current) {
      const input = document.createElement('input');
      input.type = 'file';
      input.setAttribute('webkitdirectory', '');
      input.setAttribute('directory', '');
      input.multiple = true;
      input.style.display = 'none';
      
      input.addEventListener('change', async (e) => {
        const target = e.target as HTMLInputElement;
        const files = target.files;
        
        if (!files || files.length === 0) {
          toast.error("No files selected");
          return;
        }

        setIsLoading(true);
        try {
          const data = await processFileList(files);
          setCodebase(data);
          setMessages([]);
          toast.success(`Connected to ${data.repoName}`);
        } catch (error) {
          console.error("Error processing folder:", error);
          toast.error(error instanceof Error ? error.message : "Failed to process folder");
        } finally {
          setIsLoading(false);
          // Reset input for re-use
          target.value = '';
        }
      });
      
      document.body.appendChild(input);
      folderInputRef.current = input;
    }
    
    // Trigger file picker
    folderInputRef.current.click();
  }, [processFileList]);

  const loadDemo = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => {
      const data = loadDemoProject();
      setCodebase(data);
      setMessages([]);
      toast.success("Demo project loaded successfully!");
      setIsLoading(false);
    }, 500);
  }, [loadDemoProject]);

  const selectMode = useCallback((mode: string) => {
    setActiveMode(mode);
    if (codebase) {
      analyzeWithAI(mode);
    }
  }, [codebase, analyzeWithAI]);

  const askQuestion = useCallback((question: string) => {
    analyzeWithAI(activeMode, question);
  }, [activeMode, analyzeWithAI]);

  return {
    codebase,
    isLoading,
    messages,
    activeMode,
    connectRepo,
    uploadFolder,
    loadDemo,
    selectMode,
    askQuestion,
  };
}
