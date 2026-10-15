import crypto from "node:crypto";
import fs from 'node:fs';


try{
    const caminhoArquivo = process.argv[2];

    if(!caminhoArquivo){
        throw new Error("Path not defined");
    }

    const conteudo = fs.readFileSync(caminhoArquivo)
    const tamanho = conteudo.length;
    const cabecalho = `blob ${tamanho}\0`
    const cabecalhoBuffer = Buffer.from(cabecalho);
    const objetoCompleto = Buffer.concat([cabecalhoBuffer, conteudo]);

    const hash = crypto.createHash('sha1').update(objetoCompleto).digest('hex');

    console.log(hash);


}

catch(error){
    console.log(error.message);
}