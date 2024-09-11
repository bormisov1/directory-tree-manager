# directory-tree-manager

### Как запускать

- `npm i`
- `npm start` открыть CLI режим
- `npm start some_input` исполнить команды в файле `./some_input` и открыть CLI режим с состоянием после этих команд
- `npm test` запускает тесты

### Ещё

- `Ctrl+D` сохраняет команды `CREATE`, воспроизводящие текущее состояние, в файл указанный в `STATE_RECONSTRUCTION_FILE` env (файл _"state"_ по умолчанию).
- `npm start state` позволяет вернуться к предыдущей коллекции каталогов, если `STATE_RECONSTRUCTION_FILE` не был указан и был EOF (Ctrl+D) в конце предыдущей сессии.
