
import { useEffect, useRef } from 'react';
import Editor, { Monaco } from '@monaco-editor/react';
import { editor } from 'monaco-editor';

interface CodeEditorProps {
  code: string;
  onChange: (value: string) => void;
  language?: string;
  onCursorPositionChange?: (line: number, column: number) => void;
  readOnly?: boolean;
}

const CodeEditor = ({ 
  code, 
  onChange, 
  language = "javascript",
  onCursorPositionChange,
  readOnly = false
}: CodeEditorProps) => {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);

  useEffect(() => {
    // Set up event listener for cursor position
    if (editorRef.current && onCursorPositionChange) {
      const disposable = editorRef.current.onDidChangeCursorPosition(e => {
        onCursorPositionChange(e.position.lineNumber - 1, e.position.column - 1);
      });
      
      return () => {
        disposable.dispose();
      };
    }
  }, [editorRef.current, onCursorPositionChange]);

  const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    
    // Set up editor options
    editor.updateOptions({
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      fontFamily: "'JetBrains Mono', 'SF Mono', 'Fira Code', monospace",
      fontLigatures: true,
      automaticLayout: true,
      wordWrap: 'on',
      lineNumbers: 'on',
      tabSize: 2,
      renderLineHighlight: 'all',
      scrollbar: {
        vertical: 'auto',
        horizontal: 'auto',
        verticalScrollbarSize: 10,
        horizontalScrollbarSize: 10,
        alwaysConsumeMouseWheel: false
      },
      readOnly: readOnly
    });

    // Focus editor
    setTimeout(() => {
      editor.focus();
    }, 100);
  };

  const getLanguageForMonaco = (lang: string) => {
    const languageMap: { [key: string]: string } = {
      'javascript': 'javascript',
      'typescript': 'typescript',
      'html': 'html',
      'css': 'css',
      'json': 'json',
      'markdown': 'markdown',
      'text': 'plaintext',
      'python': 'python',
      'java': 'java',
      'c': 'c',
      'cpp': 'cpp',
      'csharp': 'csharp',
      'go': 'go',
      'ruby': 'ruby',
      'php': 'php',
      'shell': 'shell',
      'sql': 'sql',
      'xml': 'xml',
      'yaml': 'yaml'
    };
    
    return languageMap[lang.toLowerCase()] || 'plaintext';
  };
  
  return (
    <div className="w-full h-full">
      <Editor
        height="100%"
        defaultValue={code}
        value={code}
        language={getLanguageForMonaco(language)}
        onChange={(value) => onChange(value || '')}
        onMount={handleEditorDidMount}
        options={{
          theme: 'vs-dark',
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          fontFamily: "'JetBrains Mono', 'SF Mono', 'Fira Code', monospace",
          fontSize: 14,
          lineHeight: 20,
          fontWeight: '400',
          readOnly: readOnly
        }}
        className="editor-container"
      />
    </div>
  );
};

export default CodeEditor;
