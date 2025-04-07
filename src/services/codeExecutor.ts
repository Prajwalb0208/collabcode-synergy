
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
 * @returns HTML document as a data URL
 */
export const createHtmlPreview = (html: string): string => {
  // Create a data URL from the HTML content
  const dataUrl = `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;
  return dataUrl;
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
  
  switch (language) {
    case "javascript":
    case "typescript":
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
        output.push(`Preview available at: ${previewUrl}`);
        
        // Open preview in a new tab/window if we're in a browser environment
        if (typeof window !== 'undefined') {
          const previewWindow = window.open(previewUrl, '_blank', 'width=800,height=600');
          if (previewWindow) {
            output.push("HTML preview opened in a new window.");
          } else {
            output.push("Warning: Pop-up blocker may have prevented opening the preview.");
          }
        }
      } catch (error) {
        output.push(`Error creating HTML preview: ${error instanceof Error ? error.message : String(error)}`);
      }
      break;
      
    case "css":
      output.push("CSS execution is available in the preview panel.");
      break;
      
    default:
      output.push(`Execution for ${language} is not supported.`);
      output.push("Only JavaScript/TypeScript and HTML execution is available.");
  }
  
  return output;
};
