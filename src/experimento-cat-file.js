
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib"

const hash = process.argv[2];

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

if(tamanhoDeclarado === tamanhoReal){
    console.log("Objeto Integro")
}
else{
    console.log("Objeto corrompido")
}
console.log("Tipo:", tipo);
console.log("Tamanho:", tamanhoDeclarado);
process.stdout.write(conteudo);



