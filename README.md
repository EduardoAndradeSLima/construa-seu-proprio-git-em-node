# Construa seu Git em Node.js

Este projeto recria as principais funcionalidades internas do Git utilizando JavaScript e Node.js puro (sem dependências externas), demonstrando como um sistema de controle de versão moderno funciona internamente por meio de objetos criptográficos (SHA-1), compressão (zlib) e estruturas de grafos/árvores acíclicas dirigidas (DAG).

## Tecnologias

- JavaScript (ES Modules)
- Node.js
- Módulos nativos: `node:fs`, `node:path`, `node:zlib` e `node:crypto`

## Funcionalidades Implementadas

- [x] Inicialização de repositórios (`init`)
- [x] Cálculo e armazenamento de blobs (`hash-object [-w]`)
- [x] Leitura e descompactação de objetos (`cat-file -p`)
- [x] Listagem de conteúdo de árvores (`ls-tree [--name-only]`)
- [x] Varrimento recursivo e gravação de árvores de diretórios (`write-tree`)
- [x] Criação de objetos de commit compatíveis com o Git (`commit-tree`)
- [x] Criação automatizada de commits e atualização de refs (`commit -m`)
- [x] Navegação e visualização do histórico de commits (`log`)

## Como Executar

Clone o repositório e teste os comandos diretamente com o Node.js:

```bash
# 1. Inicializar um novo repositório
node src/cli.js init

# 2. Gerar o hash de um arquivo e salvar no banco de objetos (.git/objects)
node src/cli.js hash-object -w arquivo.txt

# 3. Ler o conteúdo de um objeto pelo hash
node src/cli.js cat-file -p <hash>

# 4. Gravar a árvore completa de diretórios atual
node src/cli.js write-tree

# 5. Listar arquivos contidos em um objeto de árvore
node src/cli.js ls-tree --name-only <hash-da-arvore>

# 6. Criar um commit com mensagem
node src/cli.js commit -m "Meu primeiro commit no mini-git"

# 7. Visualizar o histórico de commits
node src/cli.js log
```

Também é possível registrar o comando globalmente no terminal:

```bash
npm link
mini-git init
mini-git commit -m "Commit usando o comando global"
mini-git log
```
