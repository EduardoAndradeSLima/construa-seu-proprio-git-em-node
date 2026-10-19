import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib"


function init() {
    const diretorioAtual = process.cwd();
    const caminhoGit = path.join(diretorioAtual, ".git");
    const pastas = ["objects", "objects/info", "objects/pack", "refs", "refs/heads", "refs/tags"];

    for (const pasta of pastas) {
        const caminhoCompleto = path.join(caminhoGit, pasta);

        if (fs.existsSync(caminhoCompleto)) {
            console.log(`A pasta já existe: ${pasta}`)
        }
        else {
            fs.mkdirSync(caminhoCompleto, { recursive: true })
            console.log(`A pasta foi criada: ${pasta}`)
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
    }
    else {
        fs.writeFileSync(caminhoHEAD, "ref: refs/heads/main\n")
        console.log(`O arquivo foi criado com êxito: ${caminhoHEAD}`);
    }
    if (fs.existsSync(caminhoConfig)) {
        console.log(`O arquivo já existe:${caminhoConfig}`);
    }
    else {
        fs.writeFileSync(caminhoConfig, conteudoConfig);
        console.log(`O arquivo foi criado com êxito: ${caminhoConfig}`);
    }

    console.log("Repositório inicializado!")
}

function catFile(hash) {
    const prefixo = hash.slice(0, 2)
    const restante = hash.slice(2)

    const diretorioAtual = process.cwd()
    const caminhoArquivo = path.join(diretorioAtual, ".git", "objects", prefixo, restante)

    const objetoCompactado = fs.readFileSync(caminhoArquivo);

    const objetoDescompactado = zlib.inflateSync(objetoCompactado)

    const indiceIdentificador = objetoDescompactado.indexOf(0)

    const cabecalho = objetoDescompactado.subarray(0, indiceIdentificador)
    const conteudo = objetoDescompactado.subarray(indiceIdentificador + 1)

    const cabecalhoTexto = cabecalho.toString("utf-8")
    const partes = cabecalhoTexto.split(" ")

    const tipo = partes[0];
    const tamanhoDeclarado = Number(partes[1]);
    const tamanhoReal = conteudo.length

    if (tamanhoDeclarado !== tamanhoReal) {
        throw new Error("Objeto corrompido");
    }

    process.stdout.write(conteudo);


}


try {

    const [, , comando] = process.argv;

    if (comando === "init") {
        init();
    }

    else if (comando === "cat-file") {
        const [, , , opcao, hash] = process.argv;



        if (opcao === "-p") {
            if (hash === undefined) {
                throw new Error("Hash não informado")

            }

            catFile(hash)
        }
        else {
            throw new Error("Opção inválida");
        }
    }

    else if (comando === undefined) {
        console.log("Digite um comando!")
    }
    else {
        console.log(`O comando '${comando}' não é reconhecido`)
    }
}
catch (error) {
    console.log(error.message)
    process.exitCode = 1;
}