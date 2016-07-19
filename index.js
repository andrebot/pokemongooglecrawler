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
function download (uri, pokemon, index, qntyImagens) {
  request.head(uri, function(err, res, body){
    //Filtro a extensão da imagem antes
    let type = res.headers['content-type'];
    let imageExtension = type.split('/')[1];
    let fileStream = fs.createWriteStream(`${pokemon}/${pokemon + index}.${imageExtension}`);

    console.log(`Baixando imagem número ${index} do pokemon ${pokemon}`);

    fileStream.on('close', function () {
      if (index === qntyImagens - 1) {
        console.log(`As imagens do pokemon ${pokemon} na pagina ${index + 1} foram baixadas com sucesso!`);
      }
    }).on('error', function (error) {
      console.log('Houve um erro!!');
      console.log(error);

      request.unpipe(fileStream);
      fileStream.end();
    });

    //Download da imagem
    request(uri)
      .pipe(fileStream);
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
          let imagens = $(`img[alt*='${pokemon}']`);
          let qntyImagens = imagens.length;

          //Pega todas as imagens que tem a ver com o pokemon desejado
          imagens.each(function (index, element) {
            //Faz o download da imagem
            download($(element).attr('src'), pokemon, index, qntyImagens);
          });
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
