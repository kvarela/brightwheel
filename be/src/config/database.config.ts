import { TypeOrmModuleOptions } from '@nestjs/typeorm'

export const getDatabaseConfig = (): TypeOrmModuleOptions => {
  const url =
    process.env.NODE_ENV === 'test' ? process.env.DATABASE_URL_TEST : process.env.DATABASE_URL

  console.log({ url })

  return {
    type: 'postgres',
    url,
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: true,
    dropSchema: process.env.NODE_ENV === 'test',
    logging: process.env.NODE_ENV === 'development',
  }
}
