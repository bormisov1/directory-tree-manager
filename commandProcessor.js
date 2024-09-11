import fs from 'fs';
import readline from 'readline';

const STATE_RECONSTRUCTION_FILE = process.env.STATE_RECONSTRUCTION_FILE || 'state';

export default class CommandProcessor {
  constructor(directory) {
    this.root = directory;
  }

  processCommand(command) {
    const [cmd, ...args] = command.split(' ');

    switch (cmd.toUpperCase()) {
      case 'CREATE':
        if (args.length !== 1) {
          console.error('Usage: CREATE <directory_name>');
          return;
        }
        try {
          this.root.create(args[0]);
        } catch (error) {
          console.error(error.message);
        }
        break;
      case 'MOVE':
        if (args.length !== 2) {
          console.error('Usage: MOVE <source_directory> <target_directory>');
          return;
        }
        try {
          this.root.move(args[0], args[1]);
        } catch (error) {
          console.error(error.message);
        }
        break;
      case 'DELETE':
        if (args.length !== 1) {
          console.error('Usage: DELETE <directory_name>');
          return;
        }
        try {
          this.root.delete(args[0]);
        } catch (error) {
          console.error(error.message);
        }
        break;
      case 'LIST':
        console.log(this.root.list());
        break;
      case '':
        break;
      default:
        console.error('Unknown command');
    }
  }

  start() {
    const argv = process.argv.slice(2);

    if (argv.length > 0) {
      if (!fs.existsSync(argv[0])) {
        return console.error(`${argv[0]} does not exist`)
      }
      const fileStream = fs.createReadStream(argv[0]);
      this.processInput(fileStream);
    }
    // uncomment to have hardcoded input
    // this.processInput(Readable.from([`
    //   CREATE a/b/c
    //   MOVE a/b a/b/c
    //   LIST
    // `]))
    this.processInput(process.stdin, () => {
      this.#saveState();
      console.log(`State saved to ${STATE_RECONSTRUCTION_FILE} file`)
    });
  }

  processInput(inputStream, closeHandler) {
    const rl = readline.createInterface({
      input: inputStream,
      output: process.stdout,
      terminal: false
    });
    rl.setPrompt('');
    rl.prompt();
    rl.on('line', (command) => {
      this.processCommand(command.trim());
      rl.prompt();
    });
    if (closeHandler !== undefined) {
      rl.on('close', closeHandler);
    }
  }

  #saveState() {
    try {
      const stateReconstructionCommands = this.root.getLeafPaths().map(path => `CREATE ${path}`);
      const stateReconstructionFile = stateReconstructionCommands.join('\n') + '\n';
      fs.writeFileSync(STATE_RECONSTRUCTION_FILE, stateReconstructionFile);
    } catch (error) {
      console.error('Error saving state:', error);
    }
  }
}
