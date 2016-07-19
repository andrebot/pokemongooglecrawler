'use strict';

const { EventEmitter } = require('events');
const fs = require('fs');
const request = require('request');
const cheerio = require('cheerio');

class FileQueue extends EventEmitter {

  constructor (source, paginas) {
    super();

    this.queue = [];
    this.paginas = paginas;
    //Conador de requests para sincronizar o final de downloads de imagens de cada pagina
    this.requestsFeitos = 0;
    // Clonando o Array
    this._source = source.slice(0);

    //Hookando os eventos
    this.init();

    //Dados iniciais na nossa queue
    this.pushItemsToQueue(this._source);
  }

  init () {
    //Caso nossa queue esteja vazia temos que popula-la mais uma vez
    this.on('queue-empty', () => {
      this.pushItemsToQueue(this._source);
      this.nextDownload();
    });

    //Acabou!
    this.on('finished', function () {
      console.log('Imagens baixadas com sucesso!');
    });
  }

  nextDownload() {
    if (this.queue.length <= 0) {
      //Nada para pesquisar
      this.emit('finished');
    } else {
      //Retiramos o ultimo pokemon
      let pokemon = this.queue.pop();
      //Resetamos a contagem
      this.requestsFeitos = 0;

      //Cria a pasta dele se ela não existe
      //CUIDADO: provavelmente você tem que deletar as pastas se você quiser rodar de novo
      //         esse código. Ou então retirar os nomes dos pokemons que você já baixou do
      //         arquivo de entrada 
      if (!fs.existsSync(pokemon)){
        fs.mkdirSync(pokemon);
      }

      for (let pagina = 0; pagina <= this.paginas; pagina++) {
        //cria o URL
        let url = this.makeUrl(pokemon, pagina);
        //Logs
        console.log(`Procurando por ${pokemon} na pagina ${pagina + 1} de ${this.paginas + 1}`);
        console.log(`URL do Google: ${url}`);
        console.log('Baixando...');

        //Baixa a pagina de busca do google
        request(url, (error, response, body) => {
          if (error) {
            console.log('DEU MERDA NO POKEMON ${pokemon}!!!!');
            console.log(error);
          } else {
            //Cria um JQuery cabuloso do body da response
            let $ = cheerio.load(body);
            let imagens = $(`img[alt*='${pokemon}']`);
            let qntyImagens = imagens.length;

            //Pega todas as imagens que tem a ver com o pokemon desejado
            imagens.each((index, element) => {
              //Faz o download da imagem
              this.download($(element).attr('src'), pokemon, index, qntyImagens, pagina);
            });
          }
        });
      }
    }
  }

  makeUrl (pokemon, pagina) {
    //Template para busca das imagens
    return `http://images.google.com/search?q=${pokemon}+pokemon&start=${pagina}&sout=1&tbm=isch`;
  }

  pushItemsToQueue (source) {
    while(this.queue.length < 10) {
      if (source.length > 0) {
        this.queue.push(source.pop());
      } else {
        break;
      }
    }
  }

  download (uri, pokemon, index, qntyImagens, pagina) {
    request.head(uri, (err, res, body) => {
      //Filtro a extensão da imagem antes
      let type = res.headers['content-type'];
      let imageExtension = type.split('/')[1];
      let fileStream = fs.createWriteStream(`${pokemon}/${pokemon + index}.${imageExtension}`);

      console.log(`Baixando imagem número ${index} do pokemon ${pokemon}`);

      //Preparando os eventos do nosso file streamer
      //Quando o fluxo de dados terminar, eu começo o próximo
      fileStream.on('close', () => {
        //Isso aqui só funciona porque o Node executa como uma thread só, não há concorrencia.
        this.requestsFeitos++;
        if (this.requestsFeitos === qntyImagens - 1) {
          console.log(`As imagens do pokemon ${pokemon} na pagina ${pagina + 1} foram baixadas com sucesso!`);

          if (this.queue.length === 0) {
            if (this.isSourceEmpty()) {
              this.emit('finished');
            } else {
              this.emit('queue-empty');
            }
          } else {
            this.nextDownload();
          }
        }
      }).on('error', function (error) {
        console.log('Houve um erro!!');
        console.log(error);

        request.unpipe(fileStream);
        fileStream.end();
      });

      //Download da imagem
      request(uri).pipe(fileStream);
    });
  }

  isSourceEmpty () {
    return this._source.length <= 0;
  }
}

module.exports = FileQueue;
