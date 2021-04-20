'use strict';

const {SERVER_COMMAND, DEFAULT_PORT, FILE_NAME, HttpCode, Message} = require(`../../constants`);
const chalk = require(`chalk`);
const http = require(`http`);
const fs = require(`fs`).promises;

const sendResponse = (res, statusCode, message) => {
  const template = `
      <!Doctype html>
        <html lang="ru">
        <head>
          <title>With love from Node</title>
        </head>
        <body>${message}</body>
      </html>
    `.trim();

  res.statusCode = statusCode;
  res.writeHead(statusCode, {
    'Content-Type': `text/html; charset=UTF-8`,
  });
  res.end(template);
};

const onClientConnect = async (req, res) => {
  switch (req.url) {
    case `/`:
      try {
        const fileContent = await fs.readFile(FILE_NAME);
        const mocks = JSON.parse(fileContent);
        const message = mocks.map((post) => `<li>${post.title}</li>`).join(``);
        sendResponse(res, HttpCode.OK, `<ul>${message}</ul>`);
      } catch (err) {
        sendResponse(res, HttpCode.NOT_FOUND, Message.NOT_FOUND);
      }

      break;

    default:
      sendResponse(res, HttpCode.NOT_FOUND, Message.NOT_FOUND);
      break;
  }
};

module.exports = {
  name: SERVER_COMMAND,
  run(args) {
    const [customPort] = args;
    const port = Number.parseInt(customPort, 10) || DEFAULT_PORT;

    http.createServer(onClientConnect)
      .listen(port)
      .on(`listening`, (err) => {
        if (err) {
          return console.error(chalk.red(Message.ERROR_CREATE_SERVER, err));
        }

        return console.info(chalk.green(`${Message.AWAITING_CONNECTIONS}${port}`));
      });
  }
};
