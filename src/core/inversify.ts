import { AsyncContainerModule, interfaces } from 'inversify';
import DatabaseClient from '@core/database-client';
import TYPES from '@enums/types.enum';
import glob from 'glob';
import path from 'path';
import { GetRepository, MikroORM } from '@mikro-orm/core';
import { EntityRepository, PostgreSqlDriver, SqlEntityManager } from '@mikro-orm/postgresql';
import { Client as MinioClient } from 'minio';
import { minioConfig } from '@config';
import chalk from 'chalk';

export const bindings = new AsyncContainerModule(async (bind): Promise<void> => {
  const databaseClient: DatabaseClient = new DatabaseClient();
  const connection = await databaseClient.connect();
  if (connection) {
    bind<MikroORM<PostgreSqlDriver>>(
      TYPES.DATABASE_CONNECTION
    ).toConstantValue(connection);
    const em = connection.em;
    bind<SqlEntityManager<PostgreSqlDriver>>(TYPES.ENTITY_MANAGER).toConstantValue(em);
  }
  await bindRepositories(bind, connection);
  await bindControllers(bind);
  await initMinio(bind);
});

const bindControllers = async (bind: interfaces.Bind) => {
  const controllers = await new Promise((resolve, _) => {
    glob(
      path.join(
        path.dirname(__dirname),
        '/controller/**/*.controller.{ts,js}'
      ),
      (_, files) => {
        resolve(files);
      }
    );
  }).then(async (files: string[]) => {
    const controllers = await Promise.all(
      files.map((f) => import(f.replace(__dirname, '.')))
    );
    return controllers.map((c) => c.default);
  });
  controllers.forEach((c) => bind(c).toSelf());
}
const initMinio = async (bind: interfaces.Bind) => {
  try {
    const minio: MinioClient = new MinioClient(minioConfig);
    bind<MinioClient>(TYPES.MINIO_INSTANCE).toConstantValue(minio)
  } catch (error) {
    process.stdout.write(chalk.redBright(`${(error as Error).message}\n`));
  }
}
const bindEntityToRepository = <T extends object, U>(
  bind: interfaces.Bind,
  bindingName: string,
  connection: MikroORM<PostgreSqlDriver>,
  entity: { new (...args: string[] & U) : T }
): void => {
  bind<GetRepository<T, EntityRepository<T>>>(bindingName)
    .toDynamicValue((): GetRepository<T, EntityRepository<T>> => {
      const repo = connection.em.getRepository<T>(entity);
      return repo;
    })
    .inRequestScope();
}
const bindRepositories = async (bind: interfaces.Bind, connection: MikroORM<PostgreSqlDriver>) => {
  const entities = await new Promise((resolve, _) => {
    glob(
      path.join(
        path.dirname(__dirname),
        '/entity/**/*.entity.{ts,js}'
      ),
      (_, files) => {
        resolve(files);
      }
    );
  }).then(async (files: string[]) => {
    const entities = await Promise.all(
      files.map((f) => import(f.replace(__dirname, '.')))
    );
    return entities.map((c) => c.default);
  });
  entities.forEach((entity) => {
    if (entity) {
      const binding = `${entity.name}Repository`;
      bindEntityToRepository(bind, binding, connection, entity);
    }
  });
}