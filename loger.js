import dotenv from "dotenv";
import pino from "pino";

dotenv.config();

const isPretty = process.env.PRETTY_LOGGING === "true";

let loger;

if (isPretty) {
  const prettyTransport = pino.transport({
    target: "pino-pretty",
    options: {
      colorize: true,
      translateTime: "HH:MM:ss",
    },
  });

  loger = pino(prettyTransport);
} else {
  loger = pino(); // стандартне логування в JSON
}

loger.info("Server started");

export default loger;
