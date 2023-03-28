const fs = require('fs/promises');
const path = require('path');
const { spawnSync } = require('child_process');

const ALPHABET_SIZE = 26;

class TrieNode {
  _isWordEnd;

  _children;

  constructor() {
    this._isWordEnd = false;
    this._children = new Array(ALPHABET_SIZE).fill(null);
  }

  isWordEnd() {
    return this._isWordEnd;
  }

  children() {
    return this._children;
  }

  setIsWordEnd(value) {
    this._isWordEnd = value;
  }
}

// function testTrieNode() {
//   const tn = new TrieNode();
//   tn.setIsWordEnd(true);
//   console.log(tn.children());
// }

// testTrieNode();

class Trie {
  _root;

  constructor() {
    this._root = new TrieNode();
  }

  insert(key) {
    let curr = this._root;
    for (let i = 0, n = key.length; i < n; i += 1) {
      const aLetterCharCode = 'a'.charCodeAt(0);
      const index = key.charCodeAt(i) - aLetterCharCode;
      if (curr.children()[index] === null) {
        curr.children()[index] = new TrieNode();
      }

      curr = curr.children()[index];
    }
    curr.setIsWordEnd(true);
  }

  search(key) {
    let curr = this._root;
    for (let i = 0, n = key.length; i < n; i += 1) {
      const aLetterCharCode = 'a'.charCodeAt(0);
      const index = key.charCodeAt(i) - aLetterCharCode;
      if (curr.children()[index] === null) {
        return false;
      }

      curr = curr.children()[index];
    }
    return curr.isWordEnd();
  }

  toDotString() {
    const dotStrObj = {
      nodeDotStr: '',
      edgeDotStr: '',
    };

    let i = 0;
    const traverse = (startNode, obj) => {
      const visited = [];
      const queue = [];
      queue.push([startNode, -1, null]);
      // eslint-disable-next-line no-param-reassign
      obj.nodeDotStr += ` ${0} [label="#"];\n`;
      while (queue.length > 0) {
        const [node, pi, char] = queue.shift();
        if (!visited.includes(node)) {
          visited.push(node);
          /* eslint-disable no-param-reassign */
          if (i > 0) obj.nodeDotStr += `  ${i} [label="${char}"];\n`;
          if (pi >= 0) obj.edgeDotStr += `  ${pi} -- ${i};\n`;
          /* eslint-enable no-param-reassign */

          for (let j = 0, n = node.children().length; j < n; j += 1) {
            const aLetterCharCode = 'a'.charCodeAt(0);
            const child = node.children()[j];
            if (child !== null) {
              const char = String.fromCharCode(aLetterCharCode + j);
              queue.push([child, i, char]);
            }
          }
          i += 1;
        }
      }
    };
    // console.log(dotStrObj);
    traverse(this._root, dotStrObj);

    const dotStr = `graph G {\n  node[shape=circle]\n\n${dotStrObj.nodeDotStr}\n${dotStrObj.edgeDotStr}}`;
    return dotStr;
  }

  async createGraph() {
    const fileBaseName = '01-trie';

    const imgFileName = `${fileBaseName}.png`;
    const imgFileDir = path.resolve(__dirname, '../img');
    const imgFilePath = path.join(imgFileDir, imgFileName);

    const dotFileName = `${fileBaseName}.dot`;
    const dotFileDir = path.resolve(__dirname, '../dot');
    const dotFilePath = path.join(dotFileDir, dotFileName);

    const dotFileData = this.toDotString();

    let dotFileHandler;
    try {
      dotFileHandler = await fs.open(dotFilePath, 'w');
      await dotFileHandler.writeFile(dotFileData, 'ascii');
      spawnSync('dot', ['-Tpng', dotFilePath, '-o', imgFilePath]);
    } catch (err) {
      console.error(err);
    } finally {
      dotFileHandler?.close();
    }
  }
}

async function testTrie() {
  const t = new Trie();
  t.insert('hai');
  t.insert('hail');
  t.insert('hat');
  t.insert('hard');
  t.insert('hand');
  t.insert('at');
  t.insert('zombie');
  t.insert('beast');
  console.log(t.search('hand'));
  // console.log(t._root?.children()?.[7]?.children()?.[7]?.children()?.[7]);
  console.log('\n\n');
  t.createGraph();
}

testTrie();
