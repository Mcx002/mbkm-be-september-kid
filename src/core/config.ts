interface IConfiguration {
  readonly NODE_ENV: "production" | "development";
  readonly APP_PORT: number;
  readonly APP_STATIC_PATH: string;
  readonly APP_ROOT_PATH: string;
  readonly APP_KEY: string;
  readonly APP_HKEY_EXPIRED: number;
  readonly JWT_SECRET: string;
  readonly JWT_ISSUER: string;
  readonly JWT_EXPIRED: number;
  readonly LOG_DIR: string;
  readonly DB_HOST: string;
  readonly DB_PORT: number;
  readonly DB_NAME: string;
  readonly DB_USERNAME: string;
  readonly DB_PASSWORD: string;
  readonly DB_MIN_POOL: number;
  readonly DB_MAX_POOL: number;
  readonly DB_IDLE_TIMEOUT: number;
  readonly DB_CONNECTION_TIMEOUT: number;
  readonly MINIO_ENDPOINT: string;
  readonly MINIO_PORT: number;
  readonly MINIO_USE_SSL: boolean;
  readonly MINIO_ACCESS_KEY: string;
  readonly MINIO_SECRET_KEY: string;
  readonly MINIO_BUCKET_NAME: string;
  readonly MINIO_EXPIRED: number;
}
export class Config {
  private readonly _configurations: IConfiguration;
  constructor(configurations: IConfiguration) {
    this._configurations = configurations;
  }
  get<K extends keyof IConfiguration>(key: K): IConfiguration[K] {
    if (typeof this._configurations[key] === "undefined")
      throw new Error(`Config with ${key} not found.`);
    return this._configurations[key];
  }
  getOrDefault<
    T extends number | string | boolean,
    K extends keyof IConfiguration
  >(
    key: K,
    defaultValue: T
  ): T extends boolean ? boolean : T extends string ? string : number {
    if (!this._configurations[key]) return defaultValue as any;
    return this._configurations[key] as any;
  }
}
export class Configuration {
  private static _config: Config = null;
  static instance() {
    if (this._config == null) {
      this._config = new Config({
        NODE_ENV:
          process.env.NODE_ENV == "development" ? "development" : "production",
        APP_PORT: Number(process.env.APP_PORT),
        APP_ROOT_PATH: process.env.APP_ROOT_PATH,
        APP_STATIC_PATH: process.env.APP_STATIC_PATH,
        APP_HKEY_EXPIRED: Number(process.env.APP_HKEY_EXPIRED),
        APP_KEY: process.env.APP_KEY,
        DB_CONNECTION_TIMEOUT: Number(
          process.env.DB_CONNECTION_TIMEOUT || 60000
        ),
        DB_HOST: process.env.DB_HOST,
        DB_IDLE_TIMEOUT: Number(process.env.DB_IDLE_TIMEOUT || 1800000),
        DB_MAX_POOL: Number(process.env.DB_MAX_POOL || 10),
        DB_MIN_POOL: Number(process.env.DB_MIN_POOL || 5),
        DB_NAME: process.env.DB_NAME,
        DB_PASSWORD: process.env.DB_PASSWORD,
        DB_PORT: Number(process.env.DB_PORT || 5432),
        DB_USERNAME: process.env.DB_USERNAME,
        JWT_EXPIRED: Number(process.env.JWT_EXPIRED || 3600),
        JWT_ISSUER: process.env.JWT_ISSUER,
        JWT_SECRET: process.env.JWT_SECRET,
        LOG_DIR: process.env.LOG_DIR,
        MINIO_ACCESS_KEY: process.env.MINIO_ACCESS_KEY,
        MINIO_BUCKET_NAME: process.env.MINIO_BUCKET_NAME || "bucket",
        MINIO_ENDPOINT: process.env.MINIO_ENDPOINT,
        MINIO_EXPIRED: Number(process.env.MINIO_EXPIRED || 7200),
        MINIO_PORT: Number(process.env.MINIO_PORT || 9090),
        MINIO_SECRET_KEY: process.env.MINIO_SECRET_KEY,
        MINIO_USE_SSL: process.env.MINIO_USE_SSL == "true",
      });
    }
    return this._config;
  }
}
