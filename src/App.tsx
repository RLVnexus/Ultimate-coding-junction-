import React, { useState, useEffect, useRef, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { io, Socket } from 'socket.io-client';
import {  Folder,
  FileCode,
  FileJson,
  FileImage,
  FileText,
  Search,
  GitBranch,
  Play,
  Settings,
  X,
  Plus,
  Terminal as TerminalIcon,
  Layout,
  RefreshCw,
  Save,
  Laptop
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { SplashScreen } from './components/SplashScreen';
import { SetupScreen } from './components/SetupScreen';
import { loadDirectoryFiles, saveFileToLocal, FileSystemMode } from './lib/fileSystem';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type FileSystem = Record<string, string>;

export default function App() {
  const [files, setFiles] = useState<FileSystem>({});
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [openFiles, setOpenFiles] = useState<string[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);
  const [activeTab, setActiveTab] = useState<'explorer' | 'search' | 'git'>('explorer');
  const [terminalOutput, setTerminalOutput] = useState<string[]>([
    '$ Welcome to Cloud Code Editor',
    '$ Type commands here...'
  ]);
  const [terminalInput, setTerminalInput] = useState('');
  const [saveStatus, setSaveStatus] = useState<string>('');
  const [monacoInstance, setMonacoInstance] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);
  
  const [showSplash, setShowSplash] = useState(true);
  const [setupComplete, setSetupComplete] = useState(false);
  const [fileSystemMode, setFileSystemMode] = useState<FileSystemMode>('virtual');
  const [dirHandle, setDirHandle] = useState<any>(null);
  
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [newFileModal, setNewFileModal] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFileTemplate, setNewFileTemplate] = useState('none');
  const [flutterAppName, setFlutterAppName] = useState('myapp');
  const [flutterPackageName, setFlutterPackageName] = useState('com.example.myapp');
  const [emulatorMode, setEmulatorMode] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const triggerSave = useCallback(() => {
    setSaveStatus('Saving...');
    setTimeout(() => {
      setSaveStatus('Saved');
      setTimeout(() => setSaveStatus(''), 2000);
    }, 400);
  }, []);

  const editorRef = useRef<any>(null);

  // Initialize socket and fetch initial files
  useEffect(() => {
    if (!setupComplete) return;

    const newSocket = io(window.location.origin);
    setSocket(newSocket);

    if (fileSystemMode === 'local' && dirHandle) {
      loadDirectoryFiles(dirHandle).then(data => {
        setFiles(data);
        const fileNames = Object.keys(data);
        if (fileNames.length > 0) {
          const mainFile = 'index.html' in data ? 'index.html' : fileNames[0];
          setActiveFile(mainFile);
          setOpenFiles([mainFile]);
        }
      }).catch(console.warn);
    } else {
      fetch('/api/files')
        .then(res => res.json())
        .then(data => {
          setFiles(data);
          const fileNames = Object.keys(data);
          if (fileNames.length > 0) {
            setActiveFile('index.html' in data ? 'index.html' : fileNames[0]);
            setOpenFiles(['index.html' in data ? 'index.html' : fileNames[0]]);
          }
        })
        .catch(console.warn);
    }

    newSocket.on('fs-update', (newFiles: FileSystem) => {
      if (fileSystemMode === 'virtual') setFiles(newFiles);
    });

    newSocket.on('doc-change', (data: { path: string; content: string }) => {
      if (fileSystemMode === 'virtual') {
        setFiles(prev => ({ ...prev, [data.path]: data.content }));
      }
    });

    newSocket.on('file-create', (data: { path: string; content: string }) => {
      if (fileSystemMode === 'virtual') {
        setFiles(prev => ({ ...prev, [data.path]: data.content }));
      }
    });

    newSocket.on('file-delete', (data: { path: string }) => {
      if (fileSystemMode === 'virtual') {
        setFiles(prev => {
          const newFiles = { ...prev };
          delete newFiles[data.path];
          return newFiles;
        });
      }
    });

    return () => {
      newSocket.close();
    };
  }, [setupComplete, fileSystemMode, dirHandle]);

  // AI Autocomplete setup
  useEffect(() => {
    if (!monacoInstance) return;

    const provider = monacoInstance.languages.registerInlineCompletionsProvider('*', {
      provideInlineCompletions: (model, position, context, token) => {
        return new Promise(async (resolve) => {
          try {
            if (context.triggerKind !== monacoInstance.languages.InlineCompletionTriggerKind.Invoke && 
                context.triggerKind !== monacoInstance.languages.InlineCompletionTriggerKind.Automatic) {
              return resolve({ items: [] });
            }

            const textUntilPosition = model.getValueInRange({
              startLineNumber: 1,
              startColumn: 1,
              endLineNumber: position.lineNumber,
              endColumn: position.column
            });
            
            const textAfterPosition = model.getValueInRange({
              startLineNumber: position.lineNumber,
              startColumn: position.column,
              endLineNumber: model.getLineCount(),
              endColumn: model.getLineMaxColumn(model.getLineCount())
            });

            // Wait 500ms before triggering the API to debounce fast typing
            await new Promise(r => setTimeout(r, 500));
            if (token.isCancellationRequested) {
              return resolve({ items: [] });
            }

            const abortController = new AbortController();
            token.onCancellationRequested(() => {
              abortController.abort();
              resolve({ items: [] });
            });

            const res = await fetch('/api/autocomplete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                code: model.getValue(),
                language: model.getLanguageId(),
                line: position.lineNumber,
                column: position.column,
                prefix: textUntilPosition,
                suffix: textAfterPosition
              }),
              signal: abortController.signal
            });
            
            if (token.isCancellationRequested) {
              return resolve({ items: [] });
            }
            
            const data = await res.json();
            if (data.suggestion && !token.isCancellationRequested) {
              return resolve({
                items: [{
                  insertText: data.suggestion,
                  range: new monacoInstance.Range(position.lineNumber, position.column, position.lineNumber, position.column)
                }]
              });
            }
            resolve({ items: [] });
          } catch (e) {
            resolve({ items: [] });
          }
        });
      },
      freeInlineCompletions: () => {}
    });

    const htmlSnippetsProvider = monacoInstance.languages.registerCompletionItemProvider('html', {
      provideCompletionItems: () => {
        const suggestions = [
          {
            label: 'h1',
            kind: monacoInstance.languages.CompletionItemKind.Snippet,
            insertText: '<h1>${1}</h1>',
            insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Heading 1',
          },
          {
            label: 'h2',
            kind: monacoInstance.languages.CompletionItemKind.Snippet,
            insertText: '<h2>${1}</h2>',
            insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Heading 2',
          },
          {
            label: 'p',
            kind: monacoInstance.languages.CompletionItemKind.Snippet,
            insertText: '<p>${1}</p>',
            insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Paragraph',
          },
          {
            label: 'div',
            kind: monacoInstance.languages.CompletionItemKind.Snippet,
            insertText: '<div>\n  ${1}\n</div>',
            insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Div container',
          },
          {
            label: 'video',
            kind: monacoInstance.languages.CompletionItemKind.Snippet,
            insertText: '<video width="${1:320}" height="${2:240}" controls>\n  <source src="${3:movie.mp4}" type="video/mp4">\n  Your browser does not support the video tag.\n</video>',
            insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'HTML5 Video player setup',
          },
          {
            label: 'img',
            kind: monacoInstance.languages.CompletionItemKind.Snippet,
            insertText: '<img src="${1:image.jpg}" alt="${2:description}">',
            insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Image tag',
          },
          {
            label: 'html5',
            kind: monacoInstance.languages.CompletionItemKind.Snippet,
            insertText: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>${1:Document}</title>\n</head>\n<body>\n  ${2}\n</body>\n</html>',
            insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'HTML5 Boilerplate',
          }
        ];
        return { suggestions };
      }
    });

    // We can also configure basic HTML behavior for Monaco
    monacoInstance.languages.html.htmlDefaults.setOptions({
      format: {
        wrapLineLength: 120,
        unformatted: 'wbr'
      }
    });

    return () => {
      provider.dispose();
      htmlSnippetsProvider.dispose();
    };
  }, [monacoInstance]);

  const saveTimerRef = useRef<any>(null);

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined && activeFile) {
      setFiles(prev => ({ ...prev, [activeFile]: value }));
      
      if (fileSystemMode === 'local' && dirHandle) {
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(() => {
          saveFileToLocal(dirHandle, activeFile, value).catch(console.warn);
        }, 500); // 500ms debounce
      } else if (socket) {
        socket.emit('doc-change', { path: activeFile, content: value });
      }
    }
  };

  const handleOpenFile = (path: string) => {
    if (!openFiles.includes(path)) {
      setOpenFiles([...openFiles, path]);
    }
    setActiveFile(path);
  };

  const handleCloseFile = (path: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newOpenFiles = openFiles.filter(f => f !== path);
    setOpenFiles(newOpenFiles);
    if (activeFile === path) {
      setActiveFile(newOpenFiles.length > 0 ? newOpenFiles[newOpenFiles.length - 1] : null);
    }
  };

  const createNewFile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newFileTemplate === 'flutter') {
      if (flutterAppName.trim() && flutterPackageName.trim()) {
        const app = flutterAppName.trim();
        const pkg = flutterPackageName.trim();
        
        const flutterFiles = {
          [`${app}/lib/main.dart`]: `import 'package:flutter/material.dart';\n\nvoid main() {\n  runApp(const MyApp());\n}\n\nclass MyApp extends StatelessWidget {\n  const MyApp({super.key});\n\n  @override\n  Widget build(BuildContext context) {\n    return MaterialApp(\n      title: '${app}',\n      home: Scaffold(\n        appBar: AppBar(title: const Text('Flutter App: ${app}')),\n        body: const Center(child: Text('Welcome to Flutter!\\nPackage: ${pkg}')),\n      ),\n    );\n  }\n}`,
          [`${app}/pubspec.yaml`]: `name: ${app}\ndescription: A new Flutter project.\n\npublish_to: 'none'\nversion: 1.0.0+1\n\nenvironment:\n  sdk: '>=3.0.0 <4.0.0'\n\ndependencies:\n  flutter:\n    sdk: flutter\n`,
          [`${app}/android/app/src/main/AndroidManifest.xml`]: `<manifest xmlns:android="http://schemas.android.com/apk/res/android"\n    package="${pkg}">\n</manifest>`,
          [`${app}/README.md`]: `# ${app}\n\nA new Flutter project.\n`
        };

        const newFiles = { ...files, ...flutterFiles };
        setFiles(newFiles);
        handleOpenFile(`${app}/lib/main.dart`);
        
        if (fileSystemMode === 'local' && dirHandle) {
          try {
            for (const [p, c] of Object.entries(flutterFiles)) {
              await saveFileToLocal(dirHandle, p, c);
            }
          } catch (err) {
            console.warn('Failed to save flutter template files locally', err);
          }
        } else if (socket) {
          Object.entries(flutterFiles).forEach(([p, c]) => {
            socket.emit('file-create', { path: p, content: c });
          });
        }
        
        setNewFileModal(false);
        setNewFileName('');
        setNewFileTemplate('none');
      }
      return;
    }

    if (newFileName.trim()) {
      let name = newFileName.trim();
      let content = '';

      switch (newFileTemplate) {
        case 'html':
          content = '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>Document</title>\n</head>\n<body>\n  <h1>Hello World</h1>\n</body>\n</html>';
          if (!name.endsWith('.html')) name += '.html';
          break;
        case 'css':
          content = '* {\n  margin: 0;\n  padding: 0;\n  box-sizing: border-box;\n}\n\nbody {\n  font-family: sans-serif;\n}';
          if (!name.endsWith('.css')) name += '.css';
          break;
        case 'js':
          content = 'console.log("Hello from JavaScript");';
          if (!name.endsWith('.js')) name += '.js';
          break;
        case 'python':
          content = 'print("Hello from Python")';
          if (!name.endsWith('.py')) name += '.py';
          break;
        case 'java':
          content = 'public class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello World");\n  }\n}';
          if (!name.endsWith('.java')) name += '.java';
          break;
        case 'c':
          content = '#include <stdio.h>\n\nint main() {\n  printf("Hello World\\n");\n  return 0;\n}';
          if (!name.endsWith('.c')) name += '.c';
          break;
        case 'csharp':
          content = 'using System;\n\nclass Program {\n  static void Main() {\n    Console.WriteLine("Hello World");\n  }\n}';
          if (!name.endsWith('.cs')) name += '.cs';
          break;
        default:
          content = '';
      }

      if (!files[name]) {
        const newFiles = { ...files, [name]: content };
        setFiles(newFiles);
        handleOpenFile(name);
        
        if (fileSystemMode === 'local' && dirHandle) {
          try {
            await saveFileToLocal(dirHandle, name, content);
          } catch (err) {
            console.warn('Failed to save new file locally', err);
          }
        } else if (socket) {
          socket.emit('file-create', { path: name, content });
        }
        
        setNewFileModal(false);
        setNewFileName('');
        setNewFileTemplate('none');
      }
    }
  };

  const getLanguage = (path: string) => {
    const ext = path.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'js':
      case 'jsx': return 'javascript';
      case 'ts':
      case 'tsx': return 'typescript';
      case 'html': return 'html';
      case 'css': return 'css';
      case 'json': return 'json';
      case 'md': return 'markdown';
      case 'py': return 'python';
      case 'java': return 'java';
      case 'c': return 'c';
      case 'cpp': return 'cpp';
      case 'cs': return 'csharp';
      case 'dart': return 'dart';
      default: return 'plaintext';
    }
  };

  const getIconForFile = (path: string) => {
    const ext = path.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'js':
      case 'ts':
      case 'jsx':
      case 'tsx': return <FileCode className="w-4 h-4 text-yellow-400" />;
      case 'html': return <FileCode className="w-4 h-4 text-orange-500" />;
      case 'css': return <FileCode className="w-4 h-4 text-blue-400" />;
      case 'json': return <FileJson className="w-4 h-4 text-green-400" />;
      case 'py': return <FileCode className="w-4 h-4 text-blue-500" />;
      case 'java': return <FileCode className="w-4 h-4 text-red-500" />;
      case 'cs': return <FileCode className="w-4 h-4 text-purple-500" />;
      case 'c':
      case 'cpp': return <FileCode className="w-4 h-4 text-blue-600" />;
      case 'dart': return <FileCode className="w-4 h-4 text-cyan-400" />;
      case 'png':
      case 'jpg':
      case 'svg': return <FileImage className="w-4 h-4 text-purple-400" />;
      default: return <FileText className="w-4 h-4 text-gray-400" />;
    }
  };

  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalInput.trim()) return;
    
    setTerminalOutput(prev => [...prev, `$ ${terminalInput}`]);
    
    // Simulate terminal commands
    if (terminalInput === 'clear') {
      setTerminalOutput([]);
    } else if (terminalInput === 'ls') {
      setTerminalOutput(prev => [...prev, Object.keys(files).join('  ')]);
    } else if (terminalInput.startsWith('node ')) {
      const file = terminalInput.split(' ')[1];
      if (files[file]) {
        try {
          // eslint-disable-next-line no-eval
          let logOutput: string[] = [];
          const origLog = console.log;
          console.log = (...args) => { logOutput.push(args.join(' ')) };
          eval(files[file]);
          console.log = origLog;
          setTerminalOutput(prev => [...prev, ...logOutput]);
        } catch (err: any) {
          setTerminalOutput(prev => [...prev, `Error: ${err.message}`]);
        }
      } else {
        setTerminalOutput(prev => [...prev, `node: cannot open ${file}: No such file or directory`]);
      }
    } else {
      setTerminalOutput(prev => [...prev, `bash: ${terminalInput.split(' ')[0]}: command not found`]);
    }
    
    setTerminalInput('');
  };

  const handleTabClick = (tab: 'explorer' | 'search' | 'git') => {
    if (activeTab === tab) {
      setSidebarVisible(!sidebarVisible);
    } else {
      setActiveTab(tab);
      setSidebarVisible(true);
    }
  };

  const handleRunCode = async () => {
    if (!activeFile) return;
    setIsRunning(true);
    setShowTerminal(true);
    setTerminalOutput(prev => [...prev, `\n> Executing ${activeFile}...`]);
    
    try {
      const res = await fetch('/api/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: activeFile, content: files[activeFile] })
      });
      const data = await res.json();
      
      if (data.output) {
        setTerminalOutput(prev => [...prev, ...data.output.split('\n')]);
      }
      if (data.error) {
        setTerminalOutput(prev => [...prev, `Error: ${data.error}`]);
      }
    } catch (e: any) {
      setTerminalOutput(prev => [...prev, `Failed to run code: ${e.message}`]);
    } finally {
      setIsRunning(false);
    }
  };

  const renderPreview = () => {
    if (activeFile?.endsWith('.dart')) {
      const flutterCode = files[activeFile] || '';
      return (
        <div className="flex flex-col h-full bg-[#1e1e1e]">
          <div className="flex items-center justify-between px-4 h-9 bg-[#252526] border-b border-[#333] text-sm text-gray-300">
            <div className="flex items-center gap-2">
              <Layout className="w-4 h-4" />
              <span>Flutter Web Sandbox (DartPad)</span>
            </div>
            <button onClick={() => setShowPreview(false)} className="hover:text-white"><X className="w-4 h-4" /></button>
          </div>
          <iframe
            key={`dartpad-${activeFile}`}
            title="dartpad"
            src={`https://dartpad.dev/embed-flutter.html?theme=dark`}
            className="w-full flex-1 border-none bg-white"
            sandbox="allow-scripts allow-same-origin allow-popups"
            onLoad={(e) => {
              const iframe = e.target as HTMLIFrameElement;
              setTimeout(() => {
                iframe.contentWindow?.postMessage({
                  sourceCode: { 'main.dart': flutterCode },
                  type: 'sourceCode'
                }, '*');
              }, 1500); // Wait for dartpad to fully load before sending message
            }}
          />
        </div>
      );
    }

    const html = files['index.html'] || '';
    const css = files['style.css'] || '';
    const js = files['script.js'] || '';

    // Inject CSS and JS into HTML
    let srcDoc = html;
    if (css) {
      srcDoc = srcDoc.replace('</head>', `<style>${css}</style></head>`);
    }
    if (js) {
      srcDoc = srcDoc.replace('</body>', `<script>${js}</script></body>`);
    }

    return (
      <div className="w-full h-full bg-white flex flex-col">
        <div className="bg-gray-800 p-2 flex items-center justify-between text-gray-300 text-sm">
          <div className="flex items-center gap-2">
            <Layout className="w-4 h-4" />
            <span>Live Preview</span>
            <button 
              onClick={() => setEmulatorMode(!emulatorMode)} 
              className={cn("ml-4 px-2 py-0.5 rounded text-xs", emulatorMode ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300")}
            >
              Mobile Emulator
            </button>
          </div>
          <button onClick={() => setShowPreview(false)} className="hover:text-white"><X className="w-4 h-4" /></button>
        </div>
        <div className={cn("flex-1 bg-gray-900 flex items-center justify-center overflow-hidden", !emulatorMode && "bg-white")}>
          <div className={cn(
            "relative transition-all duration-300 ease-in-out bg-white",
            emulatorMode 
              ? "w-[375px] h-[812px] rounded-[40px] border-[8px] border-gray-800 shadow-2xl overflow-hidden shrink-0 transform scale-[0.85] md:scale-90"
              : "w-full h-full"
          )}>
            {emulatorMode && (
              <div className="absolute top-0 inset-x-0 h-6 bg-gray-800 flex justify-center rounded-t-3xl z-10">
                <div className="w-32 h-4 bg-black rounded-b-xl"></div>
              </div>
            )}
            <iframe
              title="preview"
              srcDoc={srcDoc}
              className={cn("w-full h-full border-none", emulatorMode && "pt-6")}
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen w-full bg-[#1e1e1e] text-[#cccccc] font-sans overflow-hidden">
      
      <SplashScreen isVisible={showSplash} />
      
      {!showSplash && !setupComplete && (
        <SetupScreen 
          onComplete={(mode, handle) => {
            setFileSystemMode(mode);
            setDirHandle(handle);
            setSetupComplete(true);
          }} 
        />
      )}

      {/* New File Modal */}
      {newFileModal && (
        <div className="fixed inset-0 z-40 bg-black/50 flex items-center justify-center">
          <div className="bg-[#252526] border border-[#333] p-6 rounded-lg w-96 shadow-2xl">
            <h3 className="text-lg font-semibold text-white mb-4">Create New File</h3>
            <form onSubmit={createNewFile}>
              <div className="mb-6">
                <label className="block text-xs text-gray-400 mb-1">Template</label>
                <select 
                  value={newFileTemplate}
                  onChange={(e) => setNewFileTemplate(e.target.value)}
                  className="w-full bg-[#3c3c3c] text-white px-3 py-2 rounded border border-transparent focus:border-blue-500 outline-none"
                >
                  <option value="none">None (Empty)</option>
                  <option value="html">HTML Boilerplate</option>
                  <option value="css">CSS Reset</option>
                  <option value="js">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="c">C</option>
                  <option value="csharp">C#</option>
                  <option value="flutter">Flutter (Dart)</option>
                </select>
              </div>
              
              {newFileTemplate === 'flutter' ? (
                <>
                  <div className="mb-4">
                    <label className="block text-xs text-gray-400 mb-1">App Name</label>
                    <input 
                      type="text" 
                      value={flutterAppName}
                      onChange={(e) => setFlutterAppName(e.target.value)}
                      placeholder="e.g., myapp"
                      className="w-full bg-[#3c3c3c] text-white px-3 py-2 rounded border border-transparent focus:border-blue-500 outline-none"
                      autoFocus
                    />
                  </div>
                  <div className="mb-6">
                    <label className="block text-xs text-gray-400 mb-1">Package Name</label>
                    <input 
                      type="text" 
                      value={flutterPackageName}
                      onChange={(e) => setFlutterPackageName(e.target.value)}
                      placeholder="e.g., com.example.myapp"
                      className="w-full bg-[#3c3c3c] text-white px-3 py-2 rounded border border-transparent focus:border-blue-500 outline-none"
                    />
                  </div>
                </>
              ) : (
                <div className="mb-6">
                  <label className="block text-xs text-gray-400 mb-1">File Name (without extension)</label>
                  <input 
                    type="text" 
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    placeholder="e.g., main"
                    className="w-full bg-[#3c3c3c] text-white px-3 py-2 rounded border border-transparent focus:border-blue-500 outline-none"
                    autoFocus
                  />
                  {newFileName && newFileTemplate !== 'none' && (
                    <p className="text-xs text-gray-500 mt-2">
                      Will create: <span className="text-blue-400">{newFileName}.{newFileTemplate === 'python' ? 'py' : newFileTemplate === 'java' ? 'java' : newFileTemplate === 'c' ? 'c' : newFileTemplate === 'csharp' ? 'cs' : newFileTemplate}</span>
                    </p>
                  )}
                </div>
              )}
              <div className="flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => setNewFileModal(false)}
                  className="px-4 py-2 text-sm text-gray-300 hover:text-white"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded"
                >
                  Create File
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Activity Bar */}
      <div className="w-12 bg-[#333333] flex flex-col items-center py-4 border-r border-[#252526] shrink-0">
        <button 
          onClick={() => handleTabClick('explorer')}
          className={cn("p-3 mb-2 rounded-lg hover:text-white", activeTab === 'explorer' ? "text-white relative" : "text-gray-400")}
        >
          {activeTab === 'explorer' && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-blue-500" />}
          <Folder className="w-6 h-6" strokeWidth={1.5} />
        </button>
        <button 
          onClick={() => handleTabClick('search')}
          className={cn("p-3 mb-2 rounded-lg hover:text-white", activeTab === 'search' ? "text-white relative" : "text-gray-400")}
        >
          {activeTab === 'search' && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-blue-500" />}
          <Search className="w-6 h-6" strokeWidth={1.5} />
        </button>
        <button 
          onClick={() => handleTabClick('git')}
          className={cn("p-3 mb-2 rounded-lg hover:text-white", activeTab === 'git' ? "text-white relative" : "text-gray-400")}
        >
          {activeTab === 'git' && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-blue-500" />}
          <GitBranch className="w-6 h-6" strokeWidth={1.5} />
        </button>
        <div className="mt-auto flex flex-col items-center">
          <button className="p-3 text-gray-400 hover:text-white"><Settings className="w-6 h-6" strokeWidth={1.5} /></button>
        </div>
      </div>

      {/* Sidebar (Explorer) */}
      {sidebarVisible && (
      <div className="w-64 bg-[#252526] border-r border-[#1e1e1e] flex flex-col shrink-0">
        <div className="p-3 text-xs font-semibold tracking-wider uppercase text-gray-400 flex justify-between items-center">
          <span>{activeTab === 'explorer' ? 'Explorer' : activeTab === 'search' ? 'Search' : 'Source Control'}</span>
          {activeTab === 'explorer' && (
            <div className="flex gap-1">
              <button onClick={() => setNewFileModal(true)} className="hover:bg-gray-700 p-1 rounded" title="New File">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
        
        {activeTab === 'explorer' && (
          <div className="flex-1 overflow-y-auto flex flex-col">
            <div className="px-2 py-1 flex items-center gap-1 text-sm font-bold bg-[#37373d]">
              <Folder className="w-4 h-4 text-blue-400" fill="currentColor" />
              <span>WORKSPACE</span>
            </div>
            <div className="py-1 flex-1">
              {Object.keys(files).sort().map(file => (
                <div
                  key={file}
                  onClick={() => handleOpenFile(file)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-1 cursor-pointer text-sm",
                    activeFile === file ? "bg-[#37373d] text-white" : "hover:bg-[#2a2d2e] text-gray-300"
                  )}
                >
                  {getIconForFile(file)}
                  <span className="truncate">{file}</span>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-[#333333]">
              <button 
                onClick={() => setNewFileModal(true)} 
                className="w-full flex items-center justify-center gap-2 py-1.5 bg-[#37373d] hover:bg-[#4d4d54] text-white text-sm rounded-md transition-colors"
              >
                <Plus className="w-4 h-4" /> New File
              </button>
            </div>
          </div>
        )}
      </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#1e1e1e]">
        {/* Editor Header / Tabs */}
        <div className="h-9 bg-[#2d2d2d] flex overflow-x-auto">
          {openFiles.map(file => (
            <div
              key={file}
              onClick={() => handleOpenFile(file)}
              className={cn(
                "flex items-center gap-2 px-3 min-w-[120px] max-w-[200px] border-r border-[#1e1e1e] border-t-2 cursor-pointer group",
                activeFile === file ? "bg-[#1e1e1e] border-t-blue-500 text-white" : "bg-[#2d2d2d] border-t-transparent text-gray-400 hover:bg-[#1e1e1e]"
              )}
            >
              {getIconForFile(file)}
              <span className="truncate flex-1 text-sm">{file}</span>
              <button 
                onClick={(e) => handleCloseFile(file, e)}
                className="opacity-0 group-hover:opacity-100 hover:bg-gray-600 rounded p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>

        {/* Editor / Preview Split */}
        <div className="flex-1 flex min-h-0 relative">
          {activeFile ? (
            <div className={cn("h-full", showPreview ? "w-1/2 border-r border-gray-700" : "w-full")}>
              <Editor
                height="100%"
                language={getLanguage(activeFile)}
                theme="vs-dark"
                value={files[activeFile] || ''}
                onChange={handleEditorChange}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  wordWrap: 'on',
                  inlineSuggest: { enabled: true },
                  suggest: { preview: true },
                  formatOnPaste: true,
                  padding: { top: 16 },
                  autoClosingBrackets: 'always',
                  autoClosingQuotes: 'always',
                  formatOnType: true
                }}
                onMount={(editor, monacoArgs) => {
                  editorRef.current = editor;
                  setMonacoInstance(monacoArgs);
                  editor.addCommand(monacoArgs.KeyMod.CtrlCmd | monacoArgs.KeyCode.KeyS, () => {
                    triggerSave();
                  });
                }}
              />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <Layout className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p>Select a file to start coding</p>
              </div>
            </div>
          )}

          {showPreview && (
            <div className="w-1/2 h-full">
              {renderPreview()}
            </div>
          )}

          {/* Action Toolbar overlay */}
          <div className="absolute top-4 right-4 flex gap-2">
            {saveStatus && (
              <div className="bg-[#007acc] text-white px-3 py-1.5 rounded-md text-sm flex items-center shadow-lg transition-opacity duration-300">
                {saveStatus}
              </div>
            )}
            <button
              onClick={triggerSave}
              className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded-md text-sm flex items-center gap-2 shadow-lg"
              title="Save (Ctrl+S)"
            >
               <Save className="w-4 h-4" /> Save
            </button>
            <button
              onClick={handleRunCode}
              disabled={isRunning}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm flex items-center gap-2 shadow-lg transition-colors",
                isRunning ? "bg-gray-600 cursor-not-allowed" : "bg-green-600 hover:bg-green-700 text-white"
              )}
            >
              <Play className="w-4 h-4" /> {isRunning ? 'Running...' : 'Run Code'}
            </button>
            {!showPreview && (
              <button 
                onClick={() => setShowPreview(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-sm flex items-center gap-2 shadow-lg"
              >
                <Play className="w-4 h-4" /> Live Preview
              </button>
            )}
          </div>
        </div>

        {/* Bottom Panel (Terminal) */}
        {showTerminal && (
          <div className="h-64 bg-[#1e1e1e] border-t border-[#333333] flex flex-col shrink-0">
            <div className="flex border-b border-[#333333] px-4">
              <button className="px-4 py-2 border-b-2 border-blue-500 text-white text-sm uppercase">Terminal</button>
              <div className="flex-1" />
              <button onClick={() => setShowTerminal(false)} className="p-2 hover:bg-gray-800 text-gray-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 font-mono text-sm">
              {terminalOutput.map((line, i) => (
                <div key={i} className="text-gray-300">{line}</div>
              ))}
              <form onSubmit={handleTerminalSubmit} className="flex mt-2">
                <span className="text-green-400 mr-2">$</span>
                <input
                  type="text"
                  value={terminalInput}
                  onChange={(e) => setTerminalInput(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-gray-300 font-mono"
                  autoFocus
                />
              </form>
            </div>
          </div>
        )}

        {/* Status Bar */}
        <div className="h-6 bg-[#007acc] text-white flex items-center px-3 text-xs shrink-0">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 hover:bg-white/20 px-1 rounded cursor-pointer">
              <GitBranch className="w-3 h-3" /> main
            </span>
            <span className="hover:bg-white/20 px-1 rounded cursor-pointer flex items-center gap-1" onClick={() => fetch('/api/files').then(r => r.json()).then(setFiles).catch(console.warn)}>
               <RefreshCw className="w-3 h-3" /> Sync
            </span>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 hover:bg-white/20 px-1 rounded cursor-pointer" onClick={() => setShowTerminal(!showTerminal)}>
              <TerminalIcon className="w-3 h-3" /> Terminal
            </span>
            <span className="hover:bg-white/20 px-1 rounded cursor-pointer">
              {activeFile ? getLanguage(activeFile) : ''}
            </span>
            <span>Cloud Code Editor</span>
          </div>
        </div>

      </div>
    </div>
  );
}
