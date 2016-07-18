Introduction
============

This is a very simpe crawler which I made to get all images from Google Image Search page.
It uses Node as a base. To get the page we use [require](https://www.npmjs.com/package/require)
and to crawl over the page we use [cheerio](https://github.com/cheeriojs/cheerio).

I'm using Node v6.3.0 to run this application.

Installing
==========

First install Node v6.3.0 into your machine. I recomend to use [NVM](https://github.com/creationix/nvm).

After installing Node, go to the root folder and execute this in your terminal:
`npm install`

Running
=======

After installing just run:
`npm start`

NOTES
=====

Keep in mind that we are using a file named **pokemons.txt** to find pokemon's names to be downloaded.
If you do not edit it, this app will download all pokemons in it! (there is 689 pokemons there). If 
you want to download less or more, please edit this file before executing this app.