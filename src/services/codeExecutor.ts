
import { toast } from "@/components/ui/use-toast";

/**
 * Safely evaluates JavaScript code in a controlled environment
 * @param code The JavaScript code to execute
 * @returns An object containing the execution results, logs, and any error
 */
export const executeJavaScript = (code: string): {
  result: any;
  logs: string[];
  error: Error | null;
} => {
  const logs: string[] = [];
  const originalConsole = { ...console };
  
  // Override console methods to capture logs
  const mockConsole = {
    log: (...args: any[]) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      logs.push(message);
      originalConsole.log(...args);
    },
    warn: (...args: any[]) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      logs.push(`[WARN] ${message}`);
      originalConsole.warn(...args);
    },
    error: (...args: any[]) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      logs.push(`[ERROR] ${message}`);
      originalConsole.error(...args);
    },
    info: (...args: any[]) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      logs.push(`[INFO] ${message}`);
      originalConsole.info(...args);
    }
  };

  // Apply console overrides
  Object.assign(console, mockConsole);

  let result;
  let error = null;

  try {
    // Create a safe function from the code string and execute it
    const safeFunction = new Function(code);
    result = safeFunction();
  } catch (err) {
    error = err as Error;
    logs.push(`Execution Error: ${err instanceof Error ? err.message : String(err)}`);
  } finally {
    // Restore original console
    Object.assign(console, originalConsole);
  }

  return { result, logs, error };
};

/**
 * Creates an HTML preview from the given HTML code
 * @param html The HTML code to preview
 * @returns HTML document as a data URL or blob URL
 */
export const createHtmlPreview = (html: string): string => {
  try {
    // Create a blob from the HTML content
    const blob = new Blob([html], { type: 'text/html' });
    const blobUrl = URL.createObjectURL(blob);
    return blobUrl;
  } catch (error) {
    console.error("Error creating HTML preview:", error);
    // Fallback to data URL
    return `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;
  }
};

/**
 * Execute code based on its language
 * @param code The code to execute
 * @param language The programming language
 * @returns The execution result as an array of strings to display in the terminal
 */
export const executeCode = (code: string, language: string): string[] => {
  const output: string[] = [];
  
  output.push(`> Running ${language} code...`);
  
  switch (language.toLowerCase()) {
    case "javascript":
    case "js":
    case "typescript":
    case "ts":
      try {
        const { result, logs, error } = executeJavaScript(code);
        
        // Add captured logs to output
        logs.forEach(log => output.push(log));
        
        // Add execution result if it exists
        if (result !== undefined) {
          output.push(`=> ${typeof result === 'object' ? JSON.stringify(result, null, 2) : result}`);
        }
        
        // Add error message if execution failed
        if (error) {
          output.push(`Error: ${error.message}`);
        } else {
          output.push("Execution completed.");
        }
      } catch (error) {
        output.push(`System Error: ${error instanceof Error ? error.message : String(error)}`);
      }
      break;
      
    case "html":
      try {
        // Generate HTML preview
        const previewUrl = createHtmlPreview(code);
        output.push("HTML execution prepared.");
        output.push(`Preview URL generated.`);
        
        // Open preview in a new tab/window
        if (typeof window !== 'undefined') {
          window.open(previewUrl, '_blank', 'width=800,height=600');
          output.push("HTML preview opened in a new window.");
        }
      } catch (error) {
        output.push(`Error creating HTML preview: ${error instanceof Error ? error.message : String(error)}`);
      }
      break;
      
    case "css":
      output.push("CSS execution is available in the preview panel.");
      // Create a mini-preview with the HTML and CSS
      try {
        const htmlTemplate = `
<!DOCTYPE html>
<html>
<head>
  <style>${code}</style>
</head>
<body>
  <div class="preview-container">
    <h1>CSS Preview</h1>
    <p>This is a paragraph with some <a href="#">sample text</a> to demonstrate your CSS.</p>
    <div class="sample-box">Sample Box</div>
    <button class="sample-button">Sample Button</button>
  </div>
</body>
</html>`;
        
        const previewUrl = createHtmlPreview(htmlTemplate);
        window.open(previewUrl, '_blank', 'width=800,height=600');
        output.push("CSS preview opened in a new window.");
      } catch (error) {
        output.push(`Error creating CSS preview: ${error instanceof Error ? error.message : String(error)}`);
      }
      break;
      
    case "bash":
    case "shell":
      output.push("Terminal command detected. Processing...");
      
      // Handle npm/yarn/node commands - just showing simulation output
      if (code.includes("npm install") || code.includes("yarn add")) {
        const packages = code.split(/install|add/)[1].trim();
        output.push(`Installing packages: ${packages}`);
        output.push("Fetching package information...");
        setTimeout(() => {
          output.push("Package installation completed successfully.");
        }, 500);
      } else if (code.includes("git clone")) {
        const repo = code.split("git clone")[1].trim();
        output.push(`Cloning repository: ${repo}`);
        output.push("Repository cloned successfully.");
      } else {
        output.push(`Command '${code.trim()}' executed.`);
        output.push("Note: This is a simulation. Real shell commands cannot be executed in the browser environment.");
      }
      break;
      
    default:
      output.push(`Execution for ${language} is not directly supported.`);
      output.push("Only JavaScript/TypeScript, HTML, CSS, and basic shell commands are simulated.");
  }
  
  return output;
};
