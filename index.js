'use strict';

//Imports
const cheerio = require('cheerio');
const request = require('request');
const fs = require('fs');

//Preparando o arquivo de entrada para ser lido
const readLine = require('readline').createInterface({
  input: fs.createReadStream('pokemons.txt')
});

//Array que vai conter os nomes dos pokemons que estão dentro do arquivo de entrada
let pokemons = [];
//Número de páginas que o crawler vai buscar por pokemon (Default: 0. Isso quer dizer a primeira)
let paginas = 0;

//Função que faz o download das imagens
function download (uri, filename, pokemon) {
  request.head(uri, function(err, res, body){
    //Filtro a extensão da imagem antes
    let type = res.headers['content-type'];
    let imageExtension = type.split('/')[1];

    //Download da imagem
    request(uri).pipe(fs.createWriteStream(`${pokemon}/${filename}.${imageExtension}`));
  });
}

function makeUrl (pokemon, pagina) {
  //Template para busca das imagens
  return `http://images.google.com/search?q=${pokemon}+pokemon&start=${pagina}&sout=1&tbm=isch`;
}

function crawler () {
  let pokemonsLength = pokemons.length;

  for (let index = 0; index < pokemonsLength; index++) {
    //Pega o pokemon
    let pokemon = pokemons[index];

    //Cria a pasta dele se ela não existe
    //CUIDADO: provavelmente você tem que deletar as pastas se você quiser rodar de novo
    //         esse código. Ou então retirar os nomes dos pokemons que você já baixou do
    //         arquivo de entrada 
    if (!fs.existsSync(pokemon)){
      fs.mkdirSync(pokemon);
    }

    //Visita cada pagina da procura do pokemon desejado
    for (let pagina = 0; pagina <= paginas; pagina++) {
      //cria o URL
      let url = makeUrl(pokemon, pagina);
      //Logs
      console.log(`Procurando por ${pokemon} na pagina ${pagina + 1} de ${paginas + 1}`);
      console.log(`URL do Google: ${url}`);
      console.log('Baixando...');

      //Baixa a pagina de busca do google
      request(url, function(error, response, body) {
        if (error) {
          console.log('DEU MERDA NO POKEMON ${pokemon}!!!! Não vou logar o erro');
        } else {
          //Cria um JQuery cabuloso do body da response
          let $ = cheerio.load(body);

          //Pega todas as imagens que tem a ver com o pokemon desejado
          $(`img[alt*='${pokemon}']`).each(function (index, element) {
            //Faz o download da imagem
            download($(element).attr('src'), pokemon + index, pokemon);
          });

          console.log(`As imagens do pokemon ${pokemon} na pagina ${pagina + 1} foram baixadas com sucesso!`);
        }
      });
    }
  }
}

//Handler que vai ler cada linha do arquivo de entrada e guardar as info no Array Pokemons
readLine.on('line', function (line) {
  pokemons.push(line);
});

//Assim que terminar a leitura eu faço o crawler
readLine.on('close', crawler);
