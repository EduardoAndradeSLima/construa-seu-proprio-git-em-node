import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

function init(){
    const diretorioAtual = process.cwd();
    const caminhoGit = path.join(diretorioAtual, ".git");
    const pastas = ["objects", "objects/info", "objects/pack", "refs", "refs/heads", "refs/tags"];

    for(const pasta of pastas){
        const caminhoCompleto = path.join(caminhoGit, pasta);

        if(fs.existsSync(caminhoCompleto)){
            console.log(`A pasta já existe: ${pasta}`)
        }
        else{
            fs.mkdirSync(caminhoCompleto, {recursive:true})
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

const [ , , comando] = process.argv;
    
if(comando === "init"){
    init();
}
else {
    console.log(`O comando '${comando}' não é reconhecido`)
}
