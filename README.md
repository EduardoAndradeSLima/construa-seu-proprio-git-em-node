# mini-git

Implementação em Node.js das operações internas do Git (blobs, árvores e commits).

O projeto manipula arquivos, calcula hashes SHA-1 e comprime objetos com `zlib`, gerando estruturas compatíveis diretamente com o Git oficial (os commits criados podem ser lidos normalmente pelo `git log`).

## Comandos

- `init`: Inicializa o repositório criando a estrutura da pasta `.git`, referências e arquivo `HEAD`.
- `hash-object -w <arquivo>`: Calcula o hash SHA-1 de um arquivo e salva o objeto blob compactado.
- `cat-file -p <hash>`: Descompacta e exibe o conteúdo de um objeto pelo hash.
- `write-tree`: Varre o diretório e monta recursivamente os objetos de árvore (`tree`).
- `ls-tree [--name-only] <hash>`: Lista os arquivos e subpastas de uma árvore.
- `commit-tree <tree-hash> [-p <parent-hash>] -m <msg>`: Cria o objeto de commit com autor, data e referência ao commit pai.
- `commit -m <mensagem>`: Executa o fluxo completo (grava a árvore, cria o commit e atualiza o branch atual).
- `log`: Exibe o histórico de commits percorrendo a cadeia de referências.

## Tecnologias

- Node.js (módulos nativos: `fs`, `path`, `crypto`, `zlib`)
- JavaScript (ES Modules)

## Uso

```bash
# Inicializar
node src/cli.js init

# Criar e salvar um blob
node src/cli.js hash-object -w arquivo.txt

# Inspecionar objeto
node src/cli.js cat-file -p <hash>

# Criar commit
node src/cli.js commit -m "primeiro commit"

# Ver histórico
node src/cli.js log

# Listar arquivos de uma árvore
node src/cli.js ls-tree --name-only <hash-da-arvore>
```

Para usar o comando `mini-git` globalmente no terminal:

```bash
npm link
mini-git init
mini-git commit -m "commit global"
mini-git log
```
