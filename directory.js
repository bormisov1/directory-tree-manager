export default class Directory {
  constructor(name) {
    this.name = name;
    this.children = {};
  }

  create(path) {
    Directory.#validatePath(path);

    const names = path.split('/');
    let currentDir = this;
    for (let i = 0; i < names.length; i++) {
      const name = names[i];
      if (i === names.length - 1) {
        if (currentDir.children[name]) {
          throw new Error(`Cannot create ${path} - ${name} already exists`);
        }
        const newDir = new Directory(name);
        currentDir.children[name] = newDir;
        return newDir;
      } else {
        if (!currentDir.children[name]) {
          currentDir.children[name] = new Directory(name);
        }
        currentDir = currentDir.children[name];
      }
    }
  }

  move(sourcePath, targetPath) {
    Directory.#validateMovingPaths(sourcePath, targetPath);

    const sourceNames = sourcePath.split('/');
    const targetNames = targetPath.split('/');
    let sourceDir = this;
    let targetDir = this;
    for (let i = 0; i < sourceNames.length - 1; i++) {
      const name = sourceNames[i];
      if (!sourceDir.children[name]) {
        throw new Error(`Cannot move ${sourcePath} - ${name} does not exist`);
      }
      sourceDir = sourceDir.children[name];
    }
    for (let i = 0; i < targetNames.length - 1; i++) {
      const name = targetNames[i];
      if (!targetDir.children[name]) {
        throw new Error(`Cannot move to ${targetPath} - ${name} does not exist`);
      }
      targetDir = targetDir.children[name];
    }
    const sourceName = sourceNames[sourceNames.length - 1];
    const targetName = targetNames[targetNames.length - 1];
    if (!sourceDir.children[sourceName]) {
      throw new Error(`Cannot move ${sourcePath} - ${sourceName} does not exist`);
    }
    if (!targetDir.children[targetName]) {
      throw new Error(`Cannot move to ${targetPath} - ${targetName} does not exist`);
    }
    targetDir.children[targetName].children = targetDir.children[targetName].children || [];
    targetDir.children[targetName].children[sourceName] = sourceDir.children[sourceName];
    delete sourceDir.children[sourceName];
  }

  delete(path) {
    Directory.#validatePath(path);

    const names = path.split('/');
    let currentDir = this;
    for (let i = 0; i < names.length - 1; i++) {
      const name = names[i];
      if (!currentDir.children[name]) {
        throw new Error(`Cannot delete ${path} - ${name} does not exist`);
      }
      currentDir = currentDir.children[name];
    }
    const lastDir = names[names.length - 1];
    if (!currentDir.children[lastDir]) {
      throw new Error(`Cannot delete ${path} - ${lastDir} does not exist`);
    }
    delete currentDir.children[lastDir];
  }

  list() {
    const result = [];

    const stack = [{ dir: this, indent: '' }];
    while (stack.length > 0) {
      const { dir, indent } = stack.pop();
      const isRoot = dir.name === 'root';
      if (!isRoot) {
        result.push(`${indent}${dir.name}`);
      }
      Object.entries(dir.children).sort((a, b) => -a[0].localeCompare(b[0])).forEach(([name, child]) => {
        stack.push({ dir: child, indent: indent + (isRoot ? '' : ' ') });
      });
    }

    return result.join('\n');
  }

  getLeafPaths() {
    const leafPaths = [];
    const stack = [{ dir: this, path: '' }];
    while (stack.length > 0) {
      const { dir, path } = stack.pop();
      let currentPath = '';
      if (dir.name !== 'root') {
        currentPath = [path, dir.name].filter(el => el).join('/');
      }
      if (Object.keys(dir.children).length === 0) {
        leafPaths.push(currentPath);
      }
      for (const childName in dir.children) {
        stack.push({ dir: dir.children[childName], path: currentPath });
      }
    }

    return leafPaths.sort();
  }

  static #validatePath(path) {
    if (path.includes('//') || path.startsWith('/') || path.endsWith('/')) {
      throw new Error(`Bad path ${path}`);
    }
  }

  static #validateMovingPaths(sourcePath, targetPath) {
    Directory.#validatePath(sourcePath);
    Directory.#validatePath(targetPath);
    if (targetPath.startsWith(sourcePath)) {
      throw new Error(`Bad paths ${sourcePath}, ${targetPath}`);
    }
  }
}
