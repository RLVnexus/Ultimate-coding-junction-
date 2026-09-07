import { get, set } from 'idb-keyval';

export type FileSystemMode = 'virtual' | 'local';

export async function verifyPermission(fileHandle: FileSystemHandle, readWrite: boolean = true) {
  const options = { mode: readWrite ? 'readwrite' : 'read' } as FileSystemHandlePermissionDescriptor;
  
  if ((await fileHandle.queryPermission(options)) === 'granted') {
    return true;
  }
  
  if ((await fileHandle.requestPermission(options)) === 'granted') {
    return true;
  }
  
  return false;
}

export async function loadDirectoryFiles(dirHandle: FileSystemDirectoryHandle, path = ''): Promise<Record<string, string>> {
  let files: Record<string, string> = {};
  
  for await (const entry of (dirHandle as any).values()) {
    const entryPath = path + entry.name;
    
    if (entry.kind === 'file') {
      try {
        const file = await entry.getFile();
        const text = await file.text();
        files[entryPath] = text;
      } catch (e) {
        console.warn(`Could not read ${entryPath}`, e);
      }
    } else if (entry.kind === 'directory') {
      // Don't read node_modules or .git recursively to avoid freezing
      if (entry.name !== 'node_modules' && entry.name !== '.git') {
        const subFiles = await loadDirectoryFiles(entry, entryPath + '/');
        files = { ...files, ...subFiles };
      }
    }
  }
  
  return files;
}

export async function saveFileToLocal(dirHandle: FileSystemDirectoryHandle, path: string, content: string) {
  try {
    const parts = path.split('/');
    const fileName = parts.pop()!;
    let currentDir = dirHandle;
    
    // Traverse/create directories
    for (const part of parts) {
      currentDir = await currentDir.getDirectoryHandle(part, { create: true });
    }
    
    // Create/write file
    const fileHandle = await currentDir.getFileHandle(fileName, { create: true });
    const writable = await (fileHandle as any).createWritable();
    await writable.write(content);
    await writable.close();
  } catch (e) {
    console.error('Failed to save file locally', e);
    throw e;
  }
}
