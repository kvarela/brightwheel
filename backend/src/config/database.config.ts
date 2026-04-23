import { TypeOrmModuleOptions } from '@nestjs/typeorm'

export const getDatabaseConfig = (): TypeOrmModuleOptions => ({
  type: 'postgres',
  url: process.env.DATABASE_URL ?? 'postgres://postgres:postgres@localhost:5432/brightwheel',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: process.env.NODE_ENV !== 'production',
  dropSchema: process.env.NODE_ENV === 'test',
  logging: process.env.NODE_ENV === 'development',
})
