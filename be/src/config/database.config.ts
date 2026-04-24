import { TypeOrmModuleOptions } from '@nestjs/typeorm'

export const getDatabaseConfig = (): TypeOrmModuleOptions => {
  const isTest = process.env.NODE_ENV === 'test'
  const url = isTest ? process.env.DATABASE_URL_TEST : process.env.DATABASE_URL

  return {
    type: 'postgres',
    url,
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: isTest,
    dropSchema: isTest,
    logging: process.env.NODE_ENV === 'development',
  }
}
