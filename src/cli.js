#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import crypto from "node:crypto";

function init() {
    const diretorioAtual = process.cwd();
    const caminhoGit = path.join(diretorioAtual, ".git");
    const pastas = ["objects", "objects/info", "objects/pack", "refs", "refs/heads", "refs/tags"];

    for (const pasta of pastas) {
        const caminhoCompleto = path.join(caminhoGit, pasta);

        if (fs.existsSync(caminhoCompleto)) {
            console.log(`A pasta já existe: ${pasta}`);
        } else {
            fs.mkdirSync(caminhoCompleto, { recursive: true });
            console.log(`A pasta foi criada: ${pasta}`);
        }
    }

    const caminhoHEAD = path.join(caminhoGit, "HEAD");
    const caminhoConfig = path.join(caminhoGit, "config");
    const conteudoConfig =
        "[core]\n" +
        "\trepositoryformatversion = 0\n" +
        "\tbare = false\n";

    if (fs.existsSync(caminhoHEAD)) {
        console.log(`O arquivo já existe: ${caminhoHEAD}`);
    } else {
        fs.writeFileSync(caminhoHEAD, "ref: refs/heads/main\n");
        console.log(`O arquivo foi criado com êxito: ${caminhoHEAD}`);
    }

    if (fs.existsSync(caminhoConfig)) {
        console.log(`O arquivo já existe: ${caminhoConfig}`);
    } else {
        fs.writeFileSync(caminhoConfig, conteudoConfig);
        console.log(`O arquivo foi criado com êxito: ${caminhoConfig}`);
    }

    console.log("Repositório inicializado!");
}

function lerObjeto(hash) {
    const prefixo = hash.slice(0, 2);
    const restante = hash.slice(2);
    const caminho = path.join(process.cwd(), ".git", "objects", prefixo, restante);

    if (!fs.existsSync(caminho)) {
        throw new Error(`Objeto não encontrado: ${hash}`);
    }

    const dados = zlib.inflateSync(fs.readFileSync(caminho));
    const idx = dados.indexOf(0);
    const cabecalhoTexto = dados.subarray(0, idx).toString("utf-8");
    const [tipo, tamanhoStr] = cabecalhoTexto.split(" ");

    return {
        tipo,
        tamanho: Number(tamanhoStr),
        conteudo: dados.subarray(idx + 1)
    };
}

function salvarObjeto(tipo, conteudoBuffer) {
    const cabecalho = Buffer.from(`${tipo} ${conteudoBuffer.length}\0`);
    const objetoCompleto = Buffer.concat([cabecalho, conteudoBuffer]);
    const hash = crypto.createHash("sha1").update(objetoCompleto).digest("hex");

    const prefixo = hash.slice(0, 2);
    const restante = hash.slice(2);
    const pastaObjeto = path.join(process.cwd(), ".git", "objects", prefixo);
    const arquivoObjeto = path.join(pastaObjeto, restante);

    if (!fs.existsSync(pastaObjeto)) {
        fs.mkdirSync(pastaObjeto, { recursive: true });
    }

    if (!fs.existsSync(arquivoObjeto)) {
        const compactado = zlib.deflateSync(objetoCompleto);
        fs.writeFileSync(arquivoObjeto, compactado);
    }

    return hash;
}

function catFile(hash) {
    const objeto = lerObjeto(hash);
    if (objeto.tamanho !== objeto.conteudo.length) {
        throw new Error("Objeto corrompido");
    }
    process.stdout.write(objeto.conteudo);
}

function hashObject(caminhoArquivo, salvarNoDisco = false) {
    const conteudo = fs.readFileSync(caminhoArquivo);
    const cabecalho = Buffer.from(`blob ${conteudo.length}\0`);
    const objetoCompleto = Buffer.concat([cabecalho, conteudo]);
    const hash = crypto.createHash("sha1").update(objetoCompleto).digest("hex");

    if (salvarNoDisco) {
        salvarObjeto("blob", conteudo);
    }

    return hash;
}

function lsTree(hash, nameOnly = false) {
    const objeto = lerObjeto(hash);
    if (objeto.tipo !== "tree") {
        throw new Error("Objeto não é uma árvore");
    }

    const buf = objeto.conteudo;
    let offset = 0;

    while (offset < buf.length) {
        const spaceIdx = buf.indexOf(32, offset);
        const nullIdx = buf.indexOf(0, spaceIdx);
        const modo = buf.subarray(offset, spaceIdx).toString("utf-8");
        const nome = buf.subarray(spaceIdx + 1, nullIdx).toString("utf-8");
        const shaBin = buf.subarray(nullIdx + 1, nullIdx + 21);
        const shaHex = shaBin.toString("hex");
        offset = nullIdx + 21;

        if (nameOnly) {
            console.log(nome);
        } else {
            const tipo = modo.startsWith("4") ? "tree" : "blob";
            console.log(`${modo.padStart(6, "0")} ${tipo} ${shaHex}\t${nome}`);
        }
    }
}

function writeTree(dir = process.cwd()) {
    const itens = fs.readdirSync(dir, { withFileTypes: true });
    const entradasValidas = itens.filter(item => {
        return item.name !== ".git" && item.name !== "node_modules" && item.name !== ".DS_Store";
    });

    entradasValidas.sort((a, b) => {
        const nomeA = a.isDirectory() ? a.name + "/" : a.name;
        const nomeB = b.isDirectory() ? b.name + "/" : b.name;
        return Buffer.from(nomeA).compare(Buffer.from(nomeB));
    });

    const buffersEntradas = [];

    for (const item of entradasValidas) {
        const caminhoCompleto = path.join(dir, item.name);
        if (item.isFile()) {
            const conteudo = fs.readFileSync(caminhoCompleto);
            const hash = salvarObjeto("blob", conteudo);
            const modo = "100644";
            const prefixoEntrada = Buffer.from(`${modo} ${item.name}\0`);
            const hashBinario = Buffer.from(hash, "hex");
            buffersEntradas.push(Buffer.concat([prefixoEntrada, hashBinario]));
        } else if (item.isDirectory()) {
            const hashSubTree = writeTree(caminhoCompleto);
            if (hashSubTree) {
                const modo = "40000";
                const prefixoEntrada = Buffer.from(`${modo} ${item.name}\0`);
                const hashBinario = Buffer.from(hashSubTree, "hex");
                buffersEntradas.push(Buffer.concat([prefixoEntrada, hashBinario]));
            }
        }
    }

    if (buffersEntradas.length === 0) {
        return null;
    }

    const conteudoTree = Buffer.concat(buffersEntradas);
    return salvarObjeto("tree", conteudoTree);
}

function obterIdentidade() {
    const nome = process.env.GIT_AUTHOR_NAME || "Eduardo Andrade";
    const email = process.env.GIT_AUTHOR_EMAIL || "limaeduardoans789@gmail.com";
    return `${nome} <${email}>`;
}

function obterCaminhoRefAtual() {
    const caminhoHEAD = path.join(process.cwd(), ".git", "HEAD");
    if (!fs.existsSync(caminhoHEAD)) {
        throw new Error("Repositório Git não inicializado");
    }
    const conteudoHEAD = fs.readFileSync(caminhoHEAD, "utf-8").trim();
    if (conteudoHEAD.startsWith("ref: ")) {
        return path.join(process.cwd(), ".git", conteudoHEAD.slice(5).trim());
    }
    return caminhoHEAD;
}

function commitTree(treeHash, parentHash, mensagem) {
    const autor = obterIdentidade();
    const timestamp = Math.floor(Date.now() / 1000);
    const offsetMin = new Date().getTimezoneOffset();
    const sinal = offsetMin > 0 ? "-" : "+";
    const absMin = Math.abs(offsetMin);
    const horas = String(Math.floor(absMin / 60)).padStart(2, "0");
    const minutos = String(absMin % 60).padStart(2, "0");
    const tz = `${sinal}${horas}${minutos}`;

    let corpo = `tree ${treeHash}\n`;
    if (parentHash) {
        corpo += `parent ${parentHash}\n`;
    }
    corpo += `author ${autor} ${timestamp} ${tz}\n`;
    corpo += `committer ${autor} ${timestamp} ${tz}\n\n`;
    corpo += `${mensagem.trim()}\n`;

    return salvarObjeto("commit", Buffer.from(corpo, "utf-8"));
}

function commit(mensagem) {
    const treeHash = writeTree();
    if (!treeHash) {
        throw new Error("Não há arquivos para commitar");
    }

    const refArquivo = obterCaminhoRefAtual();
    let parentHash = null;
    if (fs.existsSync(refArquivo)) {
        parentHash = fs.readFileSync(refArquivo, "utf-8").trim();
    }

    const commitHash = commitTree(treeHash, parentHash, mensagem);

    fs.mkdirSync(path.dirname(refArquivo), { recursive: true });
    fs.writeFileSync(refArquivo, `${commitHash}\n`);

    const caminhoHEAD = path.join(process.cwd(), ".git", "HEAD");
    const conteudoHEAD = fs.readFileSync(caminhoHEAD, "utf-8").trim();
    const branchNome = conteudoHEAD.startsWith("ref: refs/heads/") ? conteudoHEAD.slice(16).trim() : "HEAD";

    const tipoCommit = parentHash ? "" : "(root-commit) ";
    console.log(`[${branchNome} ${tipoCommit}${commitHash.slice(0, 7)}] ${mensagem}`);
}

function log() {
    const refArquivo = obterCaminhoRefAtual();
    if (!fs.existsSync(refArquivo)) {
        console.log("Nenhum commit encontrado no branch atual.");
        return;
    }

    let currentHash = fs.readFileSync(refArquivo, "utf-8").trim();

    while (currentHash) {
        const obj = lerObjeto(currentHash);
        if (obj.tipo !== "commit") {
            break;
        }

        const texto = obj.conteudo.toString("utf-8");
        const [metadados, ...msgParts] = texto.split("\n\n");
        const linhasMetadados = metadados.split("\n");
        const mensagem = msgParts.join("\n\n").trim();

        let parentHash = null;
        let autorInfo = "";
        let dataFormatada = "";

        for (const linha of linhasMetadados) {
            if (linha.startsWith("parent ")) {
                parentHash = linha.slice(7).trim();
            } else if (linha.startsWith("author ")) {
                const partes = linha.slice(7).trim().split(" ");
                const tz = partes.pop();
                const ts = partes.pop();
                autorInfo = partes.join(" ");
                const date = new Date(Number(ts) * 1000);
                dataFormatada = date.toUTCString();
            }
        }

        console.log(`\x1b[33mcommit ${currentHash}\x1b[0m`);
        console.log(`Author: ${autorInfo}`);
        console.log(`Date:   ${dataFormatada}\n`);
        for (const linhaMsg of mensagem.split("\n")) {
            console.log(`    ${linhaMsg}`);
        }
        console.log("");

        currentHash = parentHash;
    }
}

try {
    const [, , comando] = process.argv;

    if (comando === "init") {
        init();
    } else if (comando === "cat-file") {
        const [, , , opcao, hash] = process.argv;
        if (opcao === "-p") {
            if (!hash) {
                throw new Error("Hash não informado");
            }
            catFile(hash);
        } else {
            throw new Error("Opção inválida");
        }
    } else if (comando === "hash-object") {
        const args = process.argv.slice(3);
        const temFlagW = args.includes("-w");
        const arquivo = args.find(a => a !== "-w");
        if (!arquivo) {
            throw new Error("Caminho do arquivo não informado");
        }
        const hash = hashObject(arquivo, temFlagW);
        console.log(hash);
    } else if (comando === "ls-tree") {
        const args = process.argv.slice(3);
        const nameOnly = args.includes("--name-only");
        const hash = args.find(a => a !== "--name-only");
        if (!hash) {
            throw new Error("Hash não informado");
        }
        lsTree(hash, nameOnly);
    } else if (comando === "write-tree") {
        const hash = writeTree();
        if (!hash) {
            throw new Error("Nenhum arquivo encontrado para gerar a árvore");
        }
        console.log(hash);
    } else if (comando === "commit-tree") {
        const args = process.argv.slice(3);
        const treeHash = args[0];
        if (!treeHash) {
            throw new Error("Hash da árvore não informado");
        }
        let parentHash = null;
        let mensagem = "";
        for (let i = 1; i < args.length; i++) {
            if (args[i] === "-p" && args[i + 1]) {
                parentHash = args[i + 1];
                i++;
            } else if (args[i] === "-m" && args[i + 1]) {
                mensagem = args[i + 1];
                i++;
            }
        }
        if (!mensagem) {
            throw new Error("Mensagem de commit não informada");
        }
        const hash = commitTree(treeHash, parentHash, mensagem);
        console.log(hash);
    } else if (comando === "commit") {
        const args = process.argv.slice(3);
        const idxM = args.indexOf("-m");
        if (idxM === -1 || !args[idxM + 1]) {
            throw new Error("Informe a mensagem do commit com -m");
        }
        commit(args[idxM + 1]);
    } else if (comando === "log") {
        log();
    } else if (comando === undefined) {
        console.log("Digite um comando!");
    } else {
        console.log(`O comando '${comando}' não é reconhecido`);
    }
} catch (error) {
    console.log(error.message);
    process.exitCode = 1;
}
