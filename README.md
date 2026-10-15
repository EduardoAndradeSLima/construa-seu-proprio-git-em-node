Construa seu Git em Node.js

Este projeto tem como objetivo recriar as principais funcionalidades do Git utilizando JavaScript e Node.js, para entender como um sistema de controle de versão funciona internamente.

Estou desenvolvendo tudo gradualmente, estudando desde a manipulação de arquivos até o armazenamento de objetos, commits e branches.

## Tecnologias
- JavaScript
- Node.js
- Módulos nativos: fs, path e crypto

## Funcionalidades

- [x] Inicialização de repositórios (`init`)
- [x] Cálculo experimental de hashes SHA-1 compatíveis com objetos blob do Git
- [ ] Armazenamento de objetos compactados
- [ ] Leitura de objetos (`cat-file`)
- [ ] Preparação de arquivos (`add`)
- [ ] Criação de commits (`commit`)
- [ ] Histórico (`log`)
- [ ] Branches e checkout
- [ ] Merge

## Como executar

É necessário ter o Node.js instalado.

Para inicializar um repositório de testes, entre em uma pasta de teste e execute:

```bash
node ../src/cli.js init
```

O programa criará a estrutura básica da pasta `.git`.


Projeto em desenvolvimento.
