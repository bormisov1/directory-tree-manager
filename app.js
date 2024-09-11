import Directory from './directory.js';
import CommandProcessor from './commandProcessor.js';

const root = new Directory('root');
const processor = new CommandProcessor(root);

processor.start();
