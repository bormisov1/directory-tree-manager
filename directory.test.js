import assert from 'assert';
import Directory from './directory.js';

describe('Directory class', () => {
  let root;

  beforeEach(() => {
    root = new Directory('root');
  });

  describe('Commands\' expected outcome', () => {
    it('should create a new directory', () => {
      const dir = root.create('test');
      assert.strictEqual(dir.name, 'test');
      assert.strictEqual(root.children['test'], dir);
    });

    it('should move a directory', () => {
      const dir1 = root.create('dir1');
      const dir2 = root.create('dir2');
      root.move('dir1', 'dir2');
      assert.strictEqual(dir2.children['dir1'], dir1);
    });

    it('should delete a directory', () => {
      root.create('test');
      assert.strictEqual(Object.keys(root.children).length, 1);
      root.delete('test');
      assert.strictEqual(Object.keys(root.children).length, 0);
    });

    it('should list directories correctly', () => {
      root.create('fruits');
      root.create('vegetables');
      root.create('grains');
      root.create('fruits/apples');
      root.create('fruits/apples/fuji');
      const res1 = root.list();
      root.create('grains/squash');
      root.move('grains/squash', 'vegetables');
      root.create('foods');
      root.move('grains', 'foods');
      root.move('fruits', 'foods');
      root.move('vegetables', 'foods');
      const res2 = root.list();
      root.delete('foods/fruits/apples');
      const res3 = root.list();

      assert.throws(
        () => root.delete('fruits'),
        new Error('Cannot delete fruits - fruits does not exist')
      );
      assert.strictEqual(res1, [
        'fruits',
        ' apples',
        '  fuji',
        'grains',
        'vegetables'
      ].join('\n'));
      assert.strictEqual(res2, [
        'foods',
        ' fruits',
        '  apples',
        '   fuji',
        ' grains',
        ' vegetables',
        '  squash'
      ].join('\n'));
      assert.strictEqual(res3, [
        'foods',
        ' fruits',
        ' grains',
        ' vegetables',
        '  squash'
      ].join('\n'));
    })
  });

  describe('Paths invalidation', () => {
    it('should throw an error when a directory is moved to its subdirectory', () => {
      root.create('dir1/dir2');
      assert.throws(
        () => root.move('dir1', 'dir1/dir2'),
        new Error('Bad paths dir1, dir1/dir2')
      );
    });

    it('should throw an error when a path has leading or trailing slashes or multiple in a row', () => {
      root.create('dir1');
      root.create('dir2');
      assert.throws(
        () => root.move('dir1/', 'dir2'),
        new Error('Bad path dir1/')
      );
      assert.throws(
        () => root.move('dir1', 'dir2/'),
        new Error('Bad path dir2/')
      );
      assert.throws(
        () => root.move('/dir1/', 'dir2'),
        new Error('Bad path /dir1/')
      );
      root.move('dir2', 'dir1');
      assert.throws(
        () => root.move('dir1//dir2', 'dir1'),
        new Error('Bad path dir1//dir2')
      );
      assert.throws(
        () => root.create('//'),
        new Error('Bad path //')
      );
      assert.throws(
        () => root.create('/a'),
        new Error('Bad path /a')
      );
      assert.throws(
        () => root.create('a/'),
        new Error('Bad path a/')
      );
    });
  });

  describe('Failing execution handling', () => {
    it('should throw an error when creating an existing directory', () => {
      root.create('existing/path');
      assert.throws(
        () => root.create('existing/path'),
        new Error('Cannot create existing/path - path already exists')
      );
    });

    it('should throw an error when moving a non-existent directory', () => {
      assert.throws(
        () => root.move('nonexistent/path', 'dir'),
        new Error('Cannot move nonexistent/path - nonexistent does not exist')
      );
    });

    it('should throw an error when deleting a non-existent directory', () => {
      assert.throws(
        () => root.delete('nonexistent/subdir'),
        new Error('Cannot delete nonexistent/subdir - nonexistent does not exist')
      );
    });
  })
});
