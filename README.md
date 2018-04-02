# Crawler

Web Crawler created with Node.js and [Puppeteer](https://github.com/GoogleChrome/puppeteer) to get data from [Empiricus](https://www.empiricus.com.br/conteudo/newsletters) newsletter.

### Prerequisites

To run this code you need to have **Node.js** and **npm** installed.

### Installing

After cloning this repository, inside the /crawler folder, run:

```
$ npm install
```

### Usage

Run:

```
$ node index.js
```

### License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

### Work in progress

* Reduce the number of times that *evaluate* method is used
* Change *for loop* codes for *recursion*, in order to end the code execution properly, instead of using *process.exit()* on line 53
