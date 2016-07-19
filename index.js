'use strict';

//Imports
const fs = require('fs');
const FileQueue = require('./fileQueue');

//Preparando o arquivo de entrada para ser lido
const readLine = require('readline').createInterface({
  input: fs.createReadStream('pokemons.txt')
});

//Array que vai conter os nomes dos pokemons que estão dentro do arquivo de entrada
let pokemons = [];
//Número de páginas que o crawler vai buscar por pokemon (Default: 0. Isso quer dizer a primeira)
let paginas = 0;
//Nosso coordenador de download de arquivos
let fileQueue;

function crawler () {
  let fileQueue = new FileQueue(pokemons, paginas);

  //Inicia nossos downloads
  fileQueue.nextDownload();
}

//Handler que vai ler cada linha do arquivo de entrada e guardar as info no Array Pokemons
readLine.on('line', function (line) {
  pokemons.push(line);
});

//Assim que terminar a leitura eu faço o crawler
readLine.on('close', crawler);
