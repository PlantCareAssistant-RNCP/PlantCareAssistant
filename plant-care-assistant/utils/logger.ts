import pino from 'pino';

const isDev = process.env.NODE_ENV !== 'production';
const logLevel = process.env.LOG_LEVEL || (isDev ? 'debug' : 'info');

const logger = pino({
  level: logLevel,
//   transport: isDev
//     ? {
//         target: 'pino-pretty', 
//         options: {
//           colorize: true,
//           translateTime: 'SYS:standard',
//           ignore: 'pid,hostname', 
//         },
//       }
    // : undefined, 
  base: undefined,
  formatters: {
    level: (label) => {
        return { level: label};
    },
  },
});

export default logger;
