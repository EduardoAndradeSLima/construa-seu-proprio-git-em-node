# Construa seu Git em Node.js (Mini-Git)

Decidi criar este projeto do zero para entender na prática como o Git funciona por baixo dos panos. Em vez de usar comandos prontos sem saber o que está acontecendo, implementei a estrutura interna de arquivos, hashes e commits usando apenas **JavaScript e os módulos nativos do Node.js**, sem instalar nenhuma biblioteca externa.

O resultado é uma CLI compatível com o próprio Git oficial: os objetos e commits criados aqui podem ser lidos normalmente pelo comando `git log` do seu terminal.

## O que foi implementado

- **`init`**: Cria a estrutura da pasta `.git` (`objects`, `refs/heads`, arquivo `HEAD` e `config`).
- **`hash-object`**: Lê um arquivo, calcula o hash SHA-1 compatível com o Git e salva como um objeto do tipo `blob` compactado com `zlib`.
- **`cat-file`**: Lê qualquer objeto do repositório a partir do seu hash e descompacta o conteúdo na tela.
- **`write-tree`**: Varre as pastas e arquivos do projeto de forma recursiva e gera os objetos de árvore (`tree`), mantendo a hierarquia de diretórios.
- **`ls-tree`**: Lista o conteúdo de um objeto de árvore, mostrando arquivos, subpastas e hashes.
- **`commit-tree`**: Monta um objeto de commit oficial com apontamento para a árvore, autor, data, fuso horário e commit pai.
- **`commit`**: Faz o processo completo de uma vez só: gera a árvore atual, cria o commit e atualiza a branch atual (ex: `refs/heads/main`).
- **`log`**: Percorre o histórico de commits de trás para frente usando os ponteiros de `parent` e exibe o histórico no terminal.

## Tecnologias utilizadas

- **Node.js** (versão 18+)
- **ES Modules** (`import` / `export`)
- Módulos nativos (zero dependências):
  - `node:fs` (leitura e escrita de arquivos e diretórios)
  - `node:path` (manipulação de caminhos)
  - `node:crypto` (cálculo de hashes SHA-1)
  - `node:zlib` (compressão e descompressão com deflate/inflate)

## Como testar

Clone o repositório e rode os comandos diretamente com o Node:

```bash
# 1. Inicializar o repositório
node src/cli.js init

# 2. Criar ou calcular o hash de um arquivo (blob)
node src/cli.js hash-object -w arquivo.txt

# 3. Ler o conteúdo de um objeto pelo hash
node src/cli.js cat-file -p <hash>

# 4. Criar um commit com mensagem
node src/cli.js commit -m "Meu primeiro commit"

# 5. Ver o histórico de commits
node src/cli.js log

# 6. Listar o que tem dentro de uma árvore
node src/cli.js ls-tree --name-only <hash-da-arvore>
```

Se quiser usar o comando `mini-git` direto no terminal em qualquer pasta:

```bash
npm link
mini-git init
mini-git commit -m "Commit usando o comando global"
mini-git log
```

---

Projeto desenvolvido para estudo prático de sistemas de controle de versão e estruturas de dados.
