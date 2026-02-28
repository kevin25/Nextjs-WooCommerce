import pino from 'pino'

const isProduction = process.env.NODE_ENV === 'production'

const root = pino({
  level: process.env.LOG_LEVEL ?? (isProduction ? 'info' : 'debug'),
  ...(isProduction
    ? {}
    : {
        transport: {
          target: 'pino-pretty',
          options: { colorize: true },
        },
      }),
})

export function createLogger(name: string) {
  return root.child({ name })
}

export default root
