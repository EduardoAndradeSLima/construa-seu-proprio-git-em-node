import crypto from "node:crypto";
import fs from 'node:fs';
import zlib from "node:zlib";
import path from "node:path";


try {
    const caminhoArquivo = process.argv[2];

    if (!caminhoArquivo) {
        throw new Error("Path not defined");
    }

    const conteudo = fs.readFileSync(caminhoArquivo)
    const tamanho = conteudo.length;
    const cabecalho = `blob ${tamanho}\0`
    const cabecalhoBuffer = Buffer.from(cabecalho);
    const objetoCompleto = Buffer.concat([cabecalhoBuffer, conteudo]);
    const objetoCompactado = zlib.deflateSync(objetoCompleto)

    console.log("Tamanho original:", objetoCompleto.length);
    console.log("Tamanho compactado:", objetoCompactado.length);

    const objetoDescompactado = zlib.inflateSync(objetoCompactado);
    
    console.log(
    "Dados preservados:",
    objetoDescompactado.equals(objetoCompleto)
);

    const hash = crypto.createHash('sha1').update(objetoCompleto).digest('hex');

    const prefixo = hash.slice(0, 2);
    const restante = hash.slice(2);

    const diretorioAtual = process.cwd();
    const caminhoGit = path.join(diretorioAtual, ".git")

    if(!fs.existsSync(caminhoGit)){
        throw new Error("Git não inicializado")
    }

    const caminhoPasta = path.join(caminhoGit, "objects", prefixo)
    const caminhoObjetoCompleto = path.join(caminhoPasta, restante)

    if(fs.existsSync(caminhoPasta)){
        console.log(`Pasta ${caminhoPasta} já existe`)
    }
    else{
        fs.mkdirSync(caminhoPasta, {recursive: true})
        console.log(`Pasta ${caminhoPasta} criada`)
    }

    if(fs.existsSync(caminhoObjetoCompleto)){
        console.log(`Arquivo ${caminhoObjetoCompleto} já existe`)
    }
    else{
        fs.writeFileSync(caminhoObjetoCompleto, objetoCompactado)
        console.log(`Arquivo ${caminhoObjetoCompleto} criado`)
    }



}

catch (error) {
    console.log(error.message);
}