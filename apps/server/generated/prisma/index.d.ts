
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model User
 * 
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>
/**
 * Model Account
 * 
 */
export type Account = $Result.DefaultSelection<Prisma.$AccountPayload>
/**
 * Model AccountInvitation
 * 
 */
export type AccountInvitation = $Result.DefaultSelection<Prisma.$AccountInvitationPayload>
/**
 * Model AccountUser
 * 
 */
export type AccountUser = $Result.DefaultSelection<Prisma.$AccountUserPayload>
/**
 * Model Category
 * 
 */
export type Category = $Result.DefaultSelection<Prisma.$CategoryPayload>
/**
 * Model Subcategory
 * 
 */
export type Subcategory = $Result.DefaultSelection<Prisma.$SubcategoryPayload>
/**
 * Model Expense
 * 
 */
export type Expense = $Result.DefaultSelection<Prisma.$ExpensePayload>

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Users
 * const users = await prisma.user.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Users
   * const users = await prisma.user.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.UserDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.account`: Exposes CRUD operations for the **Account** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Accounts
    * const accounts = await prisma.account.findMany()
    * ```
    */
  get account(): Prisma.AccountDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.accountInvitation`: Exposes CRUD operations for the **AccountInvitation** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more AccountInvitations
    * const accountInvitations = await prisma.accountInvitation.findMany()
    * ```
    */
  get accountInvitation(): Prisma.AccountInvitationDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.accountUser`: Exposes CRUD operations for the **AccountUser** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more AccountUsers
    * const accountUsers = await prisma.accountUser.findMany()
    * ```
    */
  get accountUser(): Prisma.AccountUserDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.category`: Exposes CRUD operations for the **Category** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Categories
    * const categories = await prisma.category.findMany()
    * ```
    */
  get category(): Prisma.CategoryDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.subcategory`: Exposes CRUD operations for the **Subcategory** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Subcategories
    * const subcategories = await prisma.subcategory.findMany()
    * ```
    */
  get subcategory(): Prisma.SubcategoryDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.expense`: Exposes CRUD operations for the **Expense** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Expenses
    * const expenses = await prisma.expense.findMany()
    * ```
    */
  get expense(): Prisma.ExpenseDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.19.2
   * Query Engine version: c2990dca591cba766e3b7ef5d9e8a84796e47ab7
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import Bytes = runtime.Bytes
  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    User: 'User',
    Account: 'Account',
    AccountInvitation: 'AccountInvitation',
    AccountUser: 'AccountUser',
    Category: 'Category',
    Subcategory: 'Subcategory',
    Expense: 'Expense'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "user" | "account" | "accountInvitation" | "accountUser" | "category" | "subcategory" | "expense"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      User: {
        payload: Prisma.$UserPayload<ExtArgs>
        fields: Prisma.UserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser>
          }
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserCountArgs<ExtArgs>
            result: $Utils.Optional<UserCountAggregateOutputType> | number
          }
        }
      }
      Account: {
        payload: Prisma.$AccountPayload<ExtArgs>
        fields: Prisma.AccountFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AccountFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AccountFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountPayload>
          }
          findFirst: {
            args: Prisma.AccountFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AccountFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountPayload>
          }
          findMany: {
            args: Prisma.AccountFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountPayload>[]
          }
          create: {
            args: Prisma.AccountCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountPayload>
          }
          createMany: {
            args: Prisma.AccountCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AccountCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountPayload>[]
          }
          delete: {
            args: Prisma.AccountDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountPayload>
          }
          update: {
            args: Prisma.AccountUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountPayload>
          }
          deleteMany: {
            args: Prisma.AccountDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AccountUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.AccountUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountPayload>[]
          }
          upsert: {
            args: Prisma.AccountUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountPayload>
          }
          aggregate: {
            args: Prisma.AccountAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAccount>
          }
          groupBy: {
            args: Prisma.AccountGroupByArgs<ExtArgs>
            result: $Utils.Optional<AccountGroupByOutputType>[]
          }
          count: {
            args: Prisma.AccountCountArgs<ExtArgs>
            result: $Utils.Optional<AccountCountAggregateOutputType> | number
          }
        }
      }
      AccountInvitation: {
        payload: Prisma.$AccountInvitationPayload<ExtArgs>
        fields: Prisma.AccountInvitationFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AccountInvitationFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountInvitationPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AccountInvitationFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountInvitationPayload>
          }
          findFirst: {
            args: Prisma.AccountInvitationFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountInvitationPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AccountInvitationFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountInvitationPayload>
          }
          findMany: {
            args: Prisma.AccountInvitationFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountInvitationPayload>[]
          }
          create: {
            args: Prisma.AccountInvitationCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountInvitationPayload>
          }
          createMany: {
            args: Prisma.AccountInvitationCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AccountInvitationCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountInvitationPayload>[]
          }
          delete: {
            args: Prisma.AccountInvitationDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountInvitationPayload>
          }
          update: {
            args: Prisma.AccountInvitationUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountInvitationPayload>
          }
          deleteMany: {
            args: Prisma.AccountInvitationDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AccountInvitationUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.AccountInvitationUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountInvitationPayload>[]
          }
          upsert: {
            args: Prisma.AccountInvitationUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountInvitationPayload>
          }
          aggregate: {
            args: Prisma.AccountInvitationAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAccountInvitation>
          }
          groupBy: {
            args: Prisma.AccountInvitationGroupByArgs<ExtArgs>
            result: $Utils.Optional<AccountInvitationGroupByOutputType>[]
          }
          count: {
            args: Prisma.AccountInvitationCountArgs<ExtArgs>
            result: $Utils.Optional<AccountInvitationCountAggregateOutputType> | number
          }
        }
      }
      AccountUser: {
        payload: Prisma.$AccountUserPayload<ExtArgs>
        fields: Prisma.AccountUserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AccountUserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountUserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AccountUserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountUserPayload>
          }
          findFirst: {
            args: Prisma.AccountUserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountUserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AccountUserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountUserPayload>
          }
          findMany: {
            args: Prisma.AccountUserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountUserPayload>[]
          }
          create: {
            args: Prisma.AccountUserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountUserPayload>
          }
          createMany: {
            args: Prisma.AccountUserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AccountUserCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountUserPayload>[]
          }
          delete: {
            args: Prisma.AccountUserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountUserPayload>
          }
          update: {
            args: Prisma.AccountUserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountUserPayload>
          }
          deleteMany: {
            args: Prisma.AccountUserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AccountUserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.AccountUserUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountUserPayload>[]
          }
          upsert: {
            args: Prisma.AccountUserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountUserPayload>
          }
          aggregate: {
            args: Prisma.AccountUserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAccountUser>
          }
          groupBy: {
            args: Prisma.AccountUserGroupByArgs<ExtArgs>
            result: $Utils.Optional<AccountUserGroupByOutputType>[]
          }
          count: {
            args: Prisma.AccountUserCountArgs<ExtArgs>
            result: $Utils.Optional<AccountUserCountAggregateOutputType> | number
          }
        }
      }
      Category: {
        payload: Prisma.$CategoryPayload<ExtArgs>
        fields: Prisma.CategoryFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CategoryFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CategoryPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CategoryFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CategoryPayload>
          }
          findFirst: {
            args: Prisma.CategoryFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CategoryPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CategoryFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CategoryPayload>
          }
          findMany: {
            args: Prisma.CategoryFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CategoryPayload>[]
          }
          create: {
            args: Prisma.CategoryCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CategoryPayload>
          }
          createMany: {
            args: Prisma.CategoryCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CategoryCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CategoryPayload>[]
          }
          delete: {
            args: Prisma.CategoryDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CategoryPayload>
          }
          update: {
            args: Prisma.CategoryUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CategoryPayload>
          }
          deleteMany: {
            args: Prisma.CategoryDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CategoryUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.CategoryUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CategoryPayload>[]
          }
          upsert: {
            args: Prisma.CategoryUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CategoryPayload>
          }
          aggregate: {
            args: Prisma.CategoryAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCategory>
          }
          groupBy: {
            args: Prisma.CategoryGroupByArgs<ExtArgs>
            result: $Utils.Optional<CategoryGroupByOutputType>[]
          }
          count: {
            args: Prisma.CategoryCountArgs<ExtArgs>
            result: $Utils.Optional<CategoryCountAggregateOutputType> | number
          }
        }
      }
      Subcategory: {
        payload: Prisma.$SubcategoryPayload<ExtArgs>
        fields: Prisma.SubcategoryFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SubcategoryFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SubcategoryPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SubcategoryFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SubcategoryPayload>
          }
          findFirst: {
            args: Prisma.SubcategoryFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SubcategoryPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SubcategoryFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SubcategoryPayload>
          }
          findMany: {
            args: Prisma.SubcategoryFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SubcategoryPayload>[]
          }
          create: {
            args: Prisma.SubcategoryCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SubcategoryPayload>
          }
          createMany: {
            args: Prisma.SubcategoryCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.SubcategoryCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SubcategoryPayload>[]
          }
          delete: {
            args: Prisma.SubcategoryDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SubcategoryPayload>
          }
          update: {
            args: Prisma.SubcategoryUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SubcategoryPayload>
          }
          deleteMany: {
            args: Prisma.SubcategoryDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SubcategoryUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.SubcategoryUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SubcategoryPayload>[]
          }
          upsert: {
            args: Prisma.SubcategoryUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SubcategoryPayload>
          }
          aggregate: {
            args: Prisma.SubcategoryAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSubcategory>
          }
          groupBy: {
            args: Prisma.SubcategoryGroupByArgs<ExtArgs>
            result: $Utils.Optional<SubcategoryGroupByOutputType>[]
          }
          count: {
            args: Prisma.SubcategoryCountArgs<ExtArgs>
            result: $Utils.Optional<SubcategoryCountAggregateOutputType> | number
          }
        }
      }
      Expense: {
        payload: Prisma.$ExpensePayload<ExtArgs>
        fields: Prisma.ExpenseFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ExpenseFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExpensePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ExpenseFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExpensePayload>
          }
          findFirst: {
            args: Prisma.ExpenseFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExpensePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ExpenseFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExpensePayload>
          }
          findMany: {
            args: Prisma.ExpenseFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExpensePayload>[]
          }
          create: {
            args: Prisma.ExpenseCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExpensePayload>
          }
          createMany: {
            args: Prisma.ExpenseCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ExpenseCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExpensePayload>[]
          }
          delete: {
            args: Prisma.ExpenseDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExpensePayload>
          }
          update: {
            args: Prisma.ExpenseUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExpensePayload>
          }
          deleteMany: {
            args: Prisma.ExpenseDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ExpenseUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ExpenseUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExpensePayload>[]
          }
          upsert: {
            args: Prisma.ExpenseUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExpensePayload>
          }
          aggregate: {
            args: Prisma.ExpenseAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateExpense>
          }
          groupBy: {
            args: Prisma.ExpenseGroupByArgs<ExtArgs>
            result: $Utils.Optional<ExpenseGroupByOutputType>[]
          }
          count: {
            args: Prisma.ExpenseCountArgs<ExtArgs>
            result: $Utils.Optional<ExpenseCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory | null
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    user?: UserOmit
    account?: AccountOmit
    accountInvitation?: AccountInvitationOmit
    accountUser?: AccountUserOmit
    category?: CategoryOmit
    subcategory?: SubcategoryOmit
    expense?: ExpenseOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type UserCountOutputType
   */

  export type UserCountOutputType = {
    ownedAccounts: number
    accounts: number
  }

  export type UserCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    ownedAccounts?: boolean | UserCountOutputTypeCountOwnedAccountsArgs
    accounts?: boolean | UserCountOutputTypeCountAccountsArgs
  }

  // Custom InputTypes
  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCountOutputType
     */
    select?: UserCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountOwnedAccountsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AccountWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountAccountsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AccountUserWhereInput
  }


  /**
   * Count Type AccountCountOutputType
   */

  export type AccountCountOutputType = {
    users: number
    categories: number
    expenses: number
    invitations: number
  }

  export type AccountCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    users?: boolean | AccountCountOutputTypeCountUsersArgs
    categories?: boolean | AccountCountOutputTypeCountCategoriesArgs
    expenses?: boolean | AccountCountOutputTypeCountExpensesArgs
    invitations?: boolean | AccountCountOutputTypeCountInvitationsArgs
  }

  // Custom InputTypes
  /**
   * AccountCountOutputType without action
   */
  export type AccountCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AccountCountOutputType
     */
    select?: AccountCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * AccountCountOutputType without action
   */
  export type AccountCountOutputTypeCountUsersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AccountUserWhereInput
  }

  /**
   * AccountCountOutputType without action
   */
  export type AccountCountOutputTypeCountCategoriesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CategoryWhereInput
  }

  /**
   * AccountCountOutputType without action
   */
  export type AccountCountOutputTypeCountExpensesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ExpenseWhereInput
  }

  /**
   * AccountCountOutputType without action
   */
  export type AccountCountOutputTypeCountInvitationsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AccountInvitationWhereInput
  }


  /**
   * Count Type CategoryCountOutputType
   */

  export type CategoryCountOutputType = {
    expenses: number
    subcategories: number
  }

  export type CategoryCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    expenses?: boolean | CategoryCountOutputTypeCountExpensesArgs
    subcategories?: boolean | CategoryCountOutputTypeCountSubcategoriesArgs
  }

  // Custom InputTypes
  /**
   * CategoryCountOutputType without action
   */
  export type CategoryCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CategoryCountOutputType
     */
    select?: CategoryCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * CategoryCountOutputType without action
   */
  export type CategoryCountOutputTypeCountExpensesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ExpenseWhereInput
  }

  /**
   * CategoryCountOutputType without action
   */
  export type CategoryCountOutputTypeCountSubcategoriesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SubcategoryWhereInput
  }


  /**
   * Models
   */

  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _avg: UserAvgAggregateOutputType | null
    _sum: UserSumAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserAvgAggregateOutputType = {
    id: number | null
  }

  export type UserSumAggregateOutputType = {
    id: bigint | null
  }

  export type UserMinAggregateOutputType = {
    id: bigint | null
    createdAt: Date | null
  }

  export type UserMaxAggregateOutputType = {
    id: bigint | null
    createdAt: Date | null
  }

  export type UserCountAggregateOutputType = {
    id: number
    createdAt: number
    _all: number
  }


  export type UserAvgAggregateInputType = {
    id?: true
  }

  export type UserSumAggregateInputType = {
    id?: true
  }

  export type UserMinAggregateInputType = {
    id?: true
    createdAt?: true
  }

  export type UserMaxAggregateInputType = {
    id?: true
    createdAt?: true
  }

  export type UserCountAggregateInputType = {
    id?: true
    createdAt?: true
    _all?: true
  }

  export type UserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Users
    **/
    _count?: true | UserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: UserAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: UserSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMaxAggregateInputType
  }

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>
  }




  export type UserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
    orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[]
    by: UserScalarFieldEnum[] | UserScalarFieldEnum
    having?: UserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCountAggregateInputType | true
    _avg?: UserAvgAggregateInputType
    _sum?: UserSumAggregateInputType
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }

  export type UserGroupByOutputType = {
    id: bigint
    createdAt: Date
    _count: UserCountAggregateOutputType | null
    _avg: UserAvgAggregateOutputType | null
    _sum: UserSumAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserGroupByOutputType[P]>
            : GetScalarType<T[P], UserGroupByOutputType[P]>
        }
      >
    >


  export type UserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    ownedAccounts?: boolean | User$ownedAccountsArgs<ExtArgs>
    accounts?: boolean | User$accountsArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectScalar = {
    id?: boolean
    createdAt?: boolean
  }

  export type UserOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "createdAt", ExtArgs["result"]["user"]>
  export type UserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    ownedAccounts?: boolean | User$ownedAccountsArgs<ExtArgs>
    accounts?: boolean | User$accountsArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type UserIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type UserIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User"
    objects: {
      ownedAccounts: Prisma.$AccountPayload<ExtArgs>[]
      accounts: Prisma.$AccountUserPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: bigint
      createdAt: Date
    }, ExtArgs["result"]["user"]>
    composites: {}
  }

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = $Result.GetResult<Prisma.$UserPayload, S>

  type UserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface UserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User'], meta: { name: 'User' } }
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserFindManyArgs>(args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     * 
     */
    create<T extends UserCreateArgs>(args: SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserCreateManyArgs>(args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Users and returns the data saved in the database.
     * @param {UserCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Users and only return the `id`
     * const userWithIdOnly = await prisma.user.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(args?: SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     * 
     */
    delete<T extends UserDeleteArgs>(args: SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserUpdateArgs>(args: SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserDeleteManyArgs>(args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserUpdateManyArgs>(args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users and returns the data updated in the database.
     * @param {UserUpdateManyAndReturnArgs} args - Arguments to update many Users.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Users and only return the `id`
     * const userWithIdOnly = await prisma.user.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UserUpdateManyAndReturnArgs>(args: SelectSubset<T, UserUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(args: SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the User model
   */
  readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    ownedAccounts<T extends User$ownedAccountsArgs<ExtArgs> = {}>(args?: Subset<T, User$ownedAccountsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    accounts<T extends User$accountsArgs<ExtArgs> = {}>(args?: Subset<T, User$accountsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AccountUserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the User model
   */
  interface UserFieldRefs {
    readonly id: FieldRef<"User", 'BigInt'>
    readonly createdAt: FieldRef<"User", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>
  }

  /**
   * User createMany
   */
  export type UserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
  }

  /**
   * User createManyAndReturn
   */
  export type UserCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
  }

  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User updateManyAndReturn
   */
  export type UserUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>
  }

  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to delete.
     */
    limit?: number
  }

  /**
   * User.ownedAccounts
   */
  export type User$ownedAccountsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInclude<ExtArgs> | null
    where?: AccountWhereInput
    orderBy?: AccountOrderByWithRelationInput | AccountOrderByWithRelationInput[]
    cursor?: AccountWhereUniqueInput
    take?: number
    skip?: number
    distinct?: AccountScalarFieldEnum | AccountScalarFieldEnum[]
  }

  /**
   * User.accounts
   */
  export type User$accountsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AccountUser
     */
    select?: AccountUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AccountUser
     */
    omit?: AccountUserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountUserInclude<ExtArgs> | null
    where?: AccountUserWhereInput
    orderBy?: AccountUserOrderByWithRelationInput | AccountUserOrderByWithRelationInput[]
    cursor?: AccountUserWhereUniqueInput
    take?: number
    skip?: number
    distinct?: AccountUserScalarFieldEnum | AccountUserScalarFieldEnum[]
  }

  /**
   * User without action
   */
  export type UserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
  }


  /**
   * Model Account
   */

  export type AggregateAccount = {
    _count: AccountCountAggregateOutputType | null
    _avg: AccountAvgAggregateOutputType | null
    _sum: AccountSumAggregateOutputType | null
    _min: AccountMinAggregateOutputType | null
    _max: AccountMaxAggregateOutputType | null
  }

  export type AccountAvgAggregateOutputType = {
    id: number | null
    ownerId: number | null
  }

  export type AccountSumAggregateOutputType = {
    id: number | null
    ownerId: bigint | null
  }

  export type AccountMinAggregateOutputType = {
    id: number | null
    name: string | null
    ownerId: bigint | null
    createdAt: Date | null
  }

  export type AccountMaxAggregateOutputType = {
    id: number | null
    name: string | null
    ownerId: bigint | null
    createdAt: Date | null
  }

  export type AccountCountAggregateOutputType = {
    id: number
    name: number
    ownerId: number
    createdAt: number
    _all: number
  }


  export type AccountAvgAggregateInputType = {
    id?: true
    ownerId?: true
  }

  export type AccountSumAggregateInputType = {
    id?: true
    ownerId?: true
  }

  export type AccountMinAggregateInputType = {
    id?: true
    name?: true
    ownerId?: true
    createdAt?: true
  }

  export type AccountMaxAggregateInputType = {
    id?: true
    name?: true
    ownerId?: true
    createdAt?: true
  }

  export type AccountCountAggregateInputType = {
    id?: true
    name?: true
    ownerId?: true
    createdAt?: true
    _all?: true
  }

  export type AccountAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Account to aggregate.
     */
    where?: AccountWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Accounts to fetch.
     */
    orderBy?: AccountOrderByWithRelationInput | AccountOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AccountWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Accounts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Accounts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Accounts
    **/
    _count?: true | AccountCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: AccountAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: AccountSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AccountMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AccountMaxAggregateInputType
  }

  export type GetAccountAggregateType<T extends AccountAggregateArgs> = {
        [P in keyof T & keyof AggregateAccount]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAccount[P]>
      : GetScalarType<T[P], AggregateAccount[P]>
  }




  export type AccountGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AccountWhereInput
    orderBy?: AccountOrderByWithAggregationInput | AccountOrderByWithAggregationInput[]
    by: AccountScalarFieldEnum[] | AccountScalarFieldEnum
    having?: AccountScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AccountCountAggregateInputType | true
    _avg?: AccountAvgAggregateInputType
    _sum?: AccountSumAggregateInputType
    _min?: AccountMinAggregateInputType
    _max?: AccountMaxAggregateInputType
  }

  export type AccountGroupByOutputType = {
    id: number
    name: string
    ownerId: bigint
    createdAt: Date
    _count: AccountCountAggregateOutputType | null
    _avg: AccountAvgAggregateOutputType | null
    _sum: AccountSumAggregateOutputType | null
    _min: AccountMinAggregateOutputType | null
    _max: AccountMaxAggregateOutputType | null
  }

  type GetAccountGroupByPayload<T extends AccountGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AccountGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AccountGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AccountGroupByOutputType[P]>
            : GetScalarType<T[P], AccountGroupByOutputType[P]>
        }
      >
    >


  export type AccountSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    ownerId?: boolean
    createdAt?: boolean
    owner?: boolean | UserDefaultArgs<ExtArgs>
    users?: boolean | Account$usersArgs<ExtArgs>
    categories?: boolean | Account$categoriesArgs<ExtArgs>
    expenses?: boolean | Account$expensesArgs<ExtArgs>
    invitations?: boolean | Account$invitationsArgs<ExtArgs>
    _count?: boolean | AccountCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["account"]>

  export type AccountSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    ownerId?: boolean
    createdAt?: boolean
    owner?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["account"]>

  export type AccountSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    ownerId?: boolean
    createdAt?: boolean
    owner?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["account"]>

  export type AccountSelectScalar = {
    id?: boolean
    name?: boolean
    ownerId?: boolean
    createdAt?: boolean
  }

  export type AccountOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "ownerId" | "createdAt", ExtArgs["result"]["account"]>
  export type AccountInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    owner?: boolean | UserDefaultArgs<ExtArgs>
    users?: boolean | Account$usersArgs<ExtArgs>
    categories?: boolean | Account$categoriesArgs<ExtArgs>
    expenses?: boolean | Account$expensesArgs<ExtArgs>
    invitations?: boolean | Account$invitationsArgs<ExtArgs>
    _count?: boolean | AccountCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type AccountIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    owner?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type AccountIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    owner?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $AccountPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Account"
    objects: {
      owner: Prisma.$UserPayload<ExtArgs>
      users: Prisma.$AccountUserPayload<ExtArgs>[]
      categories: Prisma.$CategoryPayload<ExtArgs>[]
      expenses: Prisma.$ExpensePayload<ExtArgs>[]
      invitations: Prisma.$AccountInvitationPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      name: string
      ownerId: bigint
      createdAt: Date
    }, ExtArgs["result"]["account"]>
    composites: {}
  }

  type AccountGetPayload<S extends boolean | null | undefined | AccountDefaultArgs> = $Result.GetResult<Prisma.$AccountPayload, S>

  type AccountCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<AccountFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: AccountCountAggregateInputType | true
    }

  export interface AccountDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Account'], meta: { name: 'Account' } }
    /**
     * Find zero or one Account that matches the filter.
     * @param {AccountFindUniqueArgs} args - Arguments to find a Account
     * @example
     * // Get one Account
     * const account = await prisma.account.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AccountFindUniqueArgs>(args: SelectSubset<T, AccountFindUniqueArgs<ExtArgs>>): Prisma__AccountClient<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Account that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AccountFindUniqueOrThrowArgs} args - Arguments to find a Account
     * @example
     * // Get one Account
     * const account = await prisma.account.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AccountFindUniqueOrThrowArgs>(args: SelectSubset<T, AccountFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AccountClient<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Account that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountFindFirstArgs} args - Arguments to find a Account
     * @example
     * // Get one Account
     * const account = await prisma.account.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AccountFindFirstArgs>(args?: SelectSubset<T, AccountFindFirstArgs<ExtArgs>>): Prisma__AccountClient<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Account that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountFindFirstOrThrowArgs} args - Arguments to find a Account
     * @example
     * // Get one Account
     * const account = await prisma.account.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AccountFindFirstOrThrowArgs>(args?: SelectSubset<T, AccountFindFirstOrThrowArgs<ExtArgs>>): Prisma__AccountClient<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Accounts that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Accounts
     * const accounts = await prisma.account.findMany()
     * 
     * // Get first 10 Accounts
     * const accounts = await prisma.account.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const accountWithIdOnly = await prisma.account.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AccountFindManyArgs>(args?: SelectSubset<T, AccountFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Account.
     * @param {AccountCreateArgs} args - Arguments to create a Account.
     * @example
     * // Create one Account
     * const Account = await prisma.account.create({
     *   data: {
     *     // ... data to create a Account
     *   }
     * })
     * 
     */
    create<T extends AccountCreateArgs>(args: SelectSubset<T, AccountCreateArgs<ExtArgs>>): Prisma__AccountClient<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Accounts.
     * @param {AccountCreateManyArgs} args - Arguments to create many Accounts.
     * @example
     * // Create many Accounts
     * const account = await prisma.account.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AccountCreateManyArgs>(args?: SelectSubset<T, AccountCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Accounts and returns the data saved in the database.
     * @param {AccountCreateManyAndReturnArgs} args - Arguments to create many Accounts.
     * @example
     * // Create many Accounts
     * const account = await prisma.account.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Accounts and only return the `id`
     * const accountWithIdOnly = await prisma.account.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AccountCreateManyAndReturnArgs>(args?: SelectSubset<T, AccountCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Account.
     * @param {AccountDeleteArgs} args - Arguments to delete one Account.
     * @example
     * // Delete one Account
     * const Account = await prisma.account.delete({
     *   where: {
     *     // ... filter to delete one Account
     *   }
     * })
     * 
     */
    delete<T extends AccountDeleteArgs>(args: SelectSubset<T, AccountDeleteArgs<ExtArgs>>): Prisma__AccountClient<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Account.
     * @param {AccountUpdateArgs} args - Arguments to update one Account.
     * @example
     * // Update one Account
     * const account = await prisma.account.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AccountUpdateArgs>(args: SelectSubset<T, AccountUpdateArgs<ExtArgs>>): Prisma__AccountClient<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Accounts.
     * @param {AccountDeleteManyArgs} args - Arguments to filter Accounts to delete.
     * @example
     * // Delete a few Accounts
     * const { count } = await prisma.account.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AccountDeleteManyArgs>(args?: SelectSubset<T, AccountDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Accounts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Accounts
     * const account = await prisma.account.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AccountUpdateManyArgs>(args: SelectSubset<T, AccountUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Accounts and returns the data updated in the database.
     * @param {AccountUpdateManyAndReturnArgs} args - Arguments to update many Accounts.
     * @example
     * // Update many Accounts
     * const account = await prisma.account.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Accounts and only return the `id`
     * const accountWithIdOnly = await prisma.account.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends AccountUpdateManyAndReturnArgs>(args: SelectSubset<T, AccountUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Account.
     * @param {AccountUpsertArgs} args - Arguments to update or create a Account.
     * @example
     * // Update or create a Account
     * const account = await prisma.account.upsert({
     *   create: {
     *     // ... data to create a Account
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Account we want to update
     *   }
     * })
     */
    upsert<T extends AccountUpsertArgs>(args: SelectSubset<T, AccountUpsertArgs<ExtArgs>>): Prisma__AccountClient<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Accounts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountCountArgs} args - Arguments to filter Accounts to count.
     * @example
     * // Count the number of Accounts
     * const count = await prisma.account.count({
     *   where: {
     *     // ... the filter for the Accounts we want to count
     *   }
     * })
    **/
    count<T extends AccountCountArgs>(
      args?: Subset<T, AccountCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AccountCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Account.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AccountAggregateArgs>(args: Subset<T, AccountAggregateArgs>): Prisma.PrismaPromise<GetAccountAggregateType<T>>

    /**
     * Group by Account.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AccountGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AccountGroupByArgs['orderBy'] }
        : { orderBy?: AccountGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AccountGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAccountGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Account model
   */
  readonly fields: AccountFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Account.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AccountClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    owner<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    users<T extends Account$usersArgs<ExtArgs> = {}>(args?: Subset<T, Account$usersArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AccountUserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    categories<T extends Account$categoriesArgs<ExtArgs> = {}>(args?: Subset<T, Account$categoriesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CategoryPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    expenses<T extends Account$expensesArgs<ExtArgs> = {}>(args?: Subset<T, Account$expensesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ExpensePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    invitations<T extends Account$invitationsArgs<ExtArgs> = {}>(args?: Subset<T, Account$invitationsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AccountInvitationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Account model
   */
  interface AccountFieldRefs {
    readonly id: FieldRef<"Account", 'Int'>
    readonly name: FieldRef<"Account", 'String'>
    readonly ownerId: FieldRef<"Account", 'BigInt'>
    readonly createdAt: FieldRef<"Account", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Account findUnique
   */
  export type AccountFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInclude<ExtArgs> | null
    /**
     * Filter, which Account to fetch.
     */
    where: AccountWhereUniqueInput
  }

  /**
   * Account findUniqueOrThrow
   */
  export type AccountFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInclude<ExtArgs> | null
    /**
     * Filter, which Account to fetch.
     */
    where: AccountWhereUniqueInput
  }

  /**
   * Account findFirst
   */
  export type AccountFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInclude<ExtArgs> | null
    /**
     * Filter, which Account to fetch.
     */
    where?: AccountWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Accounts to fetch.
     */
    orderBy?: AccountOrderByWithRelationInput | AccountOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Accounts.
     */
    cursor?: AccountWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Accounts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Accounts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Accounts.
     */
    distinct?: AccountScalarFieldEnum | AccountScalarFieldEnum[]
  }

  /**
   * Account findFirstOrThrow
   */
  export type AccountFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInclude<ExtArgs> | null
    /**
     * Filter, which Account to fetch.
     */
    where?: AccountWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Accounts to fetch.
     */
    orderBy?: AccountOrderByWithRelationInput | AccountOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Accounts.
     */
    cursor?: AccountWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Accounts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Accounts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Accounts.
     */
    distinct?: AccountScalarFieldEnum | AccountScalarFieldEnum[]
  }

  /**
   * Account findMany
   */
  export type AccountFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInclude<ExtArgs> | null
    /**
     * Filter, which Accounts to fetch.
     */
    where?: AccountWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Accounts to fetch.
     */
    orderBy?: AccountOrderByWithRelationInput | AccountOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Accounts.
     */
    cursor?: AccountWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Accounts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Accounts.
     */
    skip?: number
    distinct?: AccountScalarFieldEnum | AccountScalarFieldEnum[]
  }

  /**
   * Account create
   */
  export type AccountCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInclude<ExtArgs> | null
    /**
     * The data needed to create a Account.
     */
    data: XOR<AccountCreateInput, AccountUncheckedCreateInput>
  }

  /**
   * Account createMany
   */
  export type AccountCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Accounts.
     */
    data: AccountCreateManyInput | AccountCreateManyInput[]
  }

  /**
   * Account createManyAndReturn
   */
  export type AccountCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null
    /**
     * The data used to create many Accounts.
     */
    data: AccountCreateManyInput | AccountCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Account update
   */
  export type AccountUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInclude<ExtArgs> | null
    /**
     * The data needed to update a Account.
     */
    data: XOR<AccountUpdateInput, AccountUncheckedUpdateInput>
    /**
     * Choose, which Account to update.
     */
    where: AccountWhereUniqueInput
  }

  /**
   * Account updateMany
   */
  export type AccountUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Accounts.
     */
    data: XOR<AccountUpdateManyMutationInput, AccountUncheckedUpdateManyInput>
    /**
     * Filter which Accounts to update
     */
    where?: AccountWhereInput
    /**
     * Limit how many Accounts to update.
     */
    limit?: number
  }

  /**
   * Account updateManyAndReturn
   */
  export type AccountUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null
    /**
     * The data used to update Accounts.
     */
    data: XOR<AccountUpdateManyMutationInput, AccountUncheckedUpdateManyInput>
    /**
     * Filter which Accounts to update
     */
    where?: AccountWhereInput
    /**
     * Limit how many Accounts to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Account upsert
   */
  export type AccountUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInclude<ExtArgs> | null
    /**
     * The filter to search for the Account to update in case it exists.
     */
    where: AccountWhereUniqueInput
    /**
     * In case the Account found by the `where` argument doesn't exist, create a new Account with this data.
     */
    create: XOR<AccountCreateInput, AccountUncheckedCreateInput>
    /**
     * In case the Account was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AccountUpdateInput, AccountUncheckedUpdateInput>
  }

  /**
   * Account delete
   */
  export type AccountDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInclude<ExtArgs> | null
    /**
     * Filter which Account to delete.
     */
    where: AccountWhereUniqueInput
  }

  /**
   * Account deleteMany
   */
  export type AccountDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Accounts to delete
     */
    where?: AccountWhereInput
    /**
     * Limit how many Accounts to delete.
     */
    limit?: number
  }

  /**
   * Account.users
   */
  export type Account$usersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AccountUser
     */
    select?: AccountUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AccountUser
     */
    omit?: AccountUserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountUserInclude<ExtArgs> | null
    where?: AccountUserWhereInput
    orderBy?: AccountUserOrderByWithRelationInput | AccountUserOrderByWithRelationInput[]
    cursor?: AccountUserWhereUniqueInput
    take?: number
    skip?: number
    distinct?: AccountUserScalarFieldEnum | AccountUserScalarFieldEnum[]
  }

  /**
   * Account.categories
   */
  export type Account$categoriesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Category
     */
    select?: CategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Category
     */
    omit?: CategoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoryInclude<ExtArgs> | null
    where?: CategoryWhereInput
    orderBy?: CategoryOrderByWithRelationInput | CategoryOrderByWithRelationInput[]
    cursor?: CategoryWhereUniqueInput
    take?: number
    skip?: number
    distinct?: CategoryScalarFieldEnum | CategoryScalarFieldEnum[]
  }

  /**
   * Account.expenses
   */
  export type Account$expensesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Expense
     */
    select?: ExpenseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Expense
     */
    omit?: ExpenseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExpenseInclude<ExtArgs> | null
    where?: ExpenseWhereInput
    orderBy?: ExpenseOrderByWithRelationInput | ExpenseOrderByWithRelationInput[]
    cursor?: ExpenseWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ExpenseScalarFieldEnum | ExpenseScalarFieldEnum[]
  }

  /**
   * Account.invitations
   */
  export type Account$invitationsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AccountInvitation
     */
    select?: AccountInvitationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AccountInvitation
     */
    omit?: AccountInvitationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInvitationInclude<ExtArgs> | null
    where?: AccountInvitationWhereInput
    orderBy?: AccountInvitationOrderByWithRelationInput | AccountInvitationOrderByWithRelationInput[]
    cursor?: AccountInvitationWhereUniqueInput
    take?: number
    skip?: number
    distinct?: AccountInvitationScalarFieldEnum | AccountInvitationScalarFieldEnum[]
  }

  /**
   * Account without action
   */
  export type AccountDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInclude<ExtArgs> | null
  }


  /**
   * Model AccountInvitation
   */

  export type AggregateAccountInvitation = {
    _count: AccountInvitationCountAggregateOutputType | null
    _avg: AccountInvitationAvgAggregateOutputType | null
    _sum: AccountInvitationSumAggregateOutputType | null
    _min: AccountInvitationMinAggregateOutputType | null
    _max: AccountInvitationMaxAggregateOutputType | null
  }

  export type AccountInvitationAvgAggregateOutputType = {
    id: number | null
    accountId: number | null
    createdBy: number | null
    usedBy: number | null
  }

  export type AccountInvitationSumAggregateOutputType = {
    id: number | null
    accountId: number | null
    createdBy: bigint | null
    usedBy: bigint | null
  }

  export type AccountInvitationMinAggregateOutputType = {
    id: number | null
    code: string | null
    accountId: number | null
    createdBy: bigint | null
    expiresAt: Date | null
    usedAt: Date | null
    usedBy: bigint | null
  }

  export type AccountInvitationMaxAggregateOutputType = {
    id: number | null
    code: string | null
    accountId: number | null
    createdBy: bigint | null
    expiresAt: Date | null
    usedAt: Date | null
    usedBy: bigint | null
  }

  export type AccountInvitationCountAggregateOutputType = {
    id: number
    code: number
    accountId: number
    createdBy: number
    expiresAt: number
    usedAt: number
    usedBy: number
    _all: number
  }


  export type AccountInvitationAvgAggregateInputType = {
    id?: true
    accountId?: true
    createdBy?: true
    usedBy?: true
  }

  export type AccountInvitationSumAggregateInputType = {
    id?: true
    accountId?: true
    createdBy?: true
    usedBy?: true
  }

  export type AccountInvitationMinAggregateInputType = {
    id?: true
    code?: true
    accountId?: true
    createdBy?: true
    expiresAt?: true
    usedAt?: true
    usedBy?: true
  }

  export type AccountInvitationMaxAggregateInputType = {
    id?: true
    code?: true
    accountId?: true
    createdBy?: true
    expiresAt?: true
    usedAt?: true
    usedBy?: true
  }

  export type AccountInvitationCountAggregateInputType = {
    id?: true
    code?: true
    accountId?: true
    createdBy?: true
    expiresAt?: true
    usedAt?: true
    usedBy?: true
    _all?: true
  }

  export type AccountInvitationAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AccountInvitation to aggregate.
     */
    where?: AccountInvitationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AccountInvitations to fetch.
     */
    orderBy?: AccountInvitationOrderByWithRelationInput | AccountInvitationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AccountInvitationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AccountInvitations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AccountInvitations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned AccountInvitations
    **/
    _count?: true | AccountInvitationCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: AccountInvitationAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: AccountInvitationSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AccountInvitationMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AccountInvitationMaxAggregateInputType
  }

  export type GetAccountInvitationAggregateType<T extends AccountInvitationAggregateArgs> = {
        [P in keyof T & keyof AggregateAccountInvitation]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAccountInvitation[P]>
      : GetScalarType<T[P], AggregateAccountInvitation[P]>
  }




  export type AccountInvitationGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AccountInvitationWhereInput
    orderBy?: AccountInvitationOrderByWithAggregationInput | AccountInvitationOrderByWithAggregationInput[]
    by: AccountInvitationScalarFieldEnum[] | AccountInvitationScalarFieldEnum
    having?: AccountInvitationScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AccountInvitationCountAggregateInputType | true
    _avg?: AccountInvitationAvgAggregateInputType
    _sum?: AccountInvitationSumAggregateInputType
    _min?: AccountInvitationMinAggregateInputType
    _max?: AccountInvitationMaxAggregateInputType
  }

  export type AccountInvitationGroupByOutputType = {
    id: number
    code: string
    accountId: number
    createdBy: bigint
    expiresAt: Date
    usedAt: Date | null
    usedBy: bigint | null
    _count: AccountInvitationCountAggregateOutputType | null
    _avg: AccountInvitationAvgAggregateOutputType | null
    _sum: AccountInvitationSumAggregateOutputType | null
    _min: AccountInvitationMinAggregateOutputType | null
    _max: AccountInvitationMaxAggregateOutputType | null
  }

  type GetAccountInvitationGroupByPayload<T extends AccountInvitationGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AccountInvitationGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AccountInvitationGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AccountInvitationGroupByOutputType[P]>
            : GetScalarType<T[P], AccountInvitationGroupByOutputType[P]>
        }
      >
    >


  export type AccountInvitationSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    code?: boolean
    accountId?: boolean
    createdBy?: boolean
    expiresAt?: boolean
    usedAt?: boolean
    usedBy?: boolean
    account?: boolean | AccountDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["accountInvitation"]>

  export type AccountInvitationSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    code?: boolean
    accountId?: boolean
    createdBy?: boolean
    expiresAt?: boolean
    usedAt?: boolean
    usedBy?: boolean
    account?: boolean | AccountDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["accountInvitation"]>

  export type AccountInvitationSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    code?: boolean
    accountId?: boolean
    createdBy?: boolean
    expiresAt?: boolean
    usedAt?: boolean
    usedBy?: boolean
    account?: boolean | AccountDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["accountInvitation"]>

  export type AccountInvitationSelectScalar = {
    id?: boolean
    code?: boolean
    accountId?: boolean
    createdBy?: boolean
    expiresAt?: boolean
    usedAt?: boolean
    usedBy?: boolean
  }

  export type AccountInvitationOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "code" | "accountId" | "createdBy" | "expiresAt" | "usedAt" | "usedBy", ExtArgs["result"]["accountInvitation"]>
  export type AccountInvitationInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    account?: boolean | AccountDefaultArgs<ExtArgs>
  }
  export type AccountInvitationIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    account?: boolean | AccountDefaultArgs<ExtArgs>
  }
  export type AccountInvitationIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    account?: boolean | AccountDefaultArgs<ExtArgs>
  }

  export type $AccountInvitationPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "AccountInvitation"
    objects: {
      account: Prisma.$AccountPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      code: string
      accountId: number
      createdBy: bigint
      expiresAt: Date
      usedAt: Date | null
      usedBy: bigint | null
    }, ExtArgs["result"]["accountInvitation"]>
    composites: {}
  }

  type AccountInvitationGetPayload<S extends boolean | null | undefined | AccountInvitationDefaultArgs> = $Result.GetResult<Prisma.$AccountInvitationPayload, S>

  type AccountInvitationCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<AccountInvitationFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: AccountInvitationCountAggregateInputType | true
    }

  export interface AccountInvitationDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['AccountInvitation'], meta: { name: 'AccountInvitation' } }
    /**
     * Find zero or one AccountInvitation that matches the filter.
     * @param {AccountInvitationFindUniqueArgs} args - Arguments to find a AccountInvitation
     * @example
     * // Get one AccountInvitation
     * const accountInvitation = await prisma.accountInvitation.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AccountInvitationFindUniqueArgs>(args: SelectSubset<T, AccountInvitationFindUniqueArgs<ExtArgs>>): Prisma__AccountInvitationClient<$Result.GetResult<Prisma.$AccountInvitationPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one AccountInvitation that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AccountInvitationFindUniqueOrThrowArgs} args - Arguments to find a AccountInvitation
     * @example
     * // Get one AccountInvitation
     * const accountInvitation = await prisma.accountInvitation.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AccountInvitationFindUniqueOrThrowArgs>(args: SelectSubset<T, AccountInvitationFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AccountInvitationClient<$Result.GetResult<Prisma.$AccountInvitationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AccountInvitation that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountInvitationFindFirstArgs} args - Arguments to find a AccountInvitation
     * @example
     * // Get one AccountInvitation
     * const accountInvitation = await prisma.accountInvitation.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AccountInvitationFindFirstArgs>(args?: SelectSubset<T, AccountInvitationFindFirstArgs<ExtArgs>>): Prisma__AccountInvitationClient<$Result.GetResult<Prisma.$AccountInvitationPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AccountInvitation that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountInvitationFindFirstOrThrowArgs} args - Arguments to find a AccountInvitation
     * @example
     * // Get one AccountInvitation
     * const accountInvitation = await prisma.accountInvitation.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AccountInvitationFindFirstOrThrowArgs>(args?: SelectSubset<T, AccountInvitationFindFirstOrThrowArgs<ExtArgs>>): Prisma__AccountInvitationClient<$Result.GetResult<Prisma.$AccountInvitationPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more AccountInvitations that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountInvitationFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AccountInvitations
     * const accountInvitations = await prisma.accountInvitation.findMany()
     * 
     * // Get first 10 AccountInvitations
     * const accountInvitations = await prisma.accountInvitation.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const accountInvitationWithIdOnly = await prisma.accountInvitation.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AccountInvitationFindManyArgs>(args?: SelectSubset<T, AccountInvitationFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AccountInvitationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a AccountInvitation.
     * @param {AccountInvitationCreateArgs} args - Arguments to create a AccountInvitation.
     * @example
     * // Create one AccountInvitation
     * const AccountInvitation = await prisma.accountInvitation.create({
     *   data: {
     *     // ... data to create a AccountInvitation
     *   }
     * })
     * 
     */
    create<T extends AccountInvitationCreateArgs>(args: SelectSubset<T, AccountInvitationCreateArgs<ExtArgs>>): Prisma__AccountInvitationClient<$Result.GetResult<Prisma.$AccountInvitationPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many AccountInvitations.
     * @param {AccountInvitationCreateManyArgs} args - Arguments to create many AccountInvitations.
     * @example
     * // Create many AccountInvitations
     * const accountInvitation = await prisma.accountInvitation.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AccountInvitationCreateManyArgs>(args?: SelectSubset<T, AccountInvitationCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many AccountInvitations and returns the data saved in the database.
     * @param {AccountInvitationCreateManyAndReturnArgs} args - Arguments to create many AccountInvitations.
     * @example
     * // Create many AccountInvitations
     * const accountInvitation = await prisma.accountInvitation.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many AccountInvitations and only return the `id`
     * const accountInvitationWithIdOnly = await prisma.accountInvitation.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AccountInvitationCreateManyAndReturnArgs>(args?: SelectSubset<T, AccountInvitationCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AccountInvitationPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a AccountInvitation.
     * @param {AccountInvitationDeleteArgs} args - Arguments to delete one AccountInvitation.
     * @example
     * // Delete one AccountInvitation
     * const AccountInvitation = await prisma.accountInvitation.delete({
     *   where: {
     *     // ... filter to delete one AccountInvitation
     *   }
     * })
     * 
     */
    delete<T extends AccountInvitationDeleteArgs>(args: SelectSubset<T, AccountInvitationDeleteArgs<ExtArgs>>): Prisma__AccountInvitationClient<$Result.GetResult<Prisma.$AccountInvitationPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one AccountInvitation.
     * @param {AccountInvitationUpdateArgs} args - Arguments to update one AccountInvitation.
     * @example
     * // Update one AccountInvitation
     * const accountInvitation = await prisma.accountInvitation.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AccountInvitationUpdateArgs>(args: SelectSubset<T, AccountInvitationUpdateArgs<ExtArgs>>): Prisma__AccountInvitationClient<$Result.GetResult<Prisma.$AccountInvitationPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more AccountInvitations.
     * @param {AccountInvitationDeleteManyArgs} args - Arguments to filter AccountInvitations to delete.
     * @example
     * // Delete a few AccountInvitations
     * const { count } = await prisma.accountInvitation.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AccountInvitationDeleteManyArgs>(args?: SelectSubset<T, AccountInvitationDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AccountInvitations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountInvitationUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many AccountInvitations
     * const accountInvitation = await prisma.accountInvitation.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AccountInvitationUpdateManyArgs>(args: SelectSubset<T, AccountInvitationUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AccountInvitations and returns the data updated in the database.
     * @param {AccountInvitationUpdateManyAndReturnArgs} args - Arguments to update many AccountInvitations.
     * @example
     * // Update many AccountInvitations
     * const accountInvitation = await prisma.accountInvitation.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more AccountInvitations and only return the `id`
     * const accountInvitationWithIdOnly = await prisma.accountInvitation.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends AccountInvitationUpdateManyAndReturnArgs>(args: SelectSubset<T, AccountInvitationUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AccountInvitationPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one AccountInvitation.
     * @param {AccountInvitationUpsertArgs} args - Arguments to update or create a AccountInvitation.
     * @example
     * // Update or create a AccountInvitation
     * const accountInvitation = await prisma.accountInvitation.upsert({
     *   create: {
     *     // ... data to create a AccountInvitation
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the AccountInvitation we want to update
     *   }
     * })
     */
    upsert<T extends AccountInvitationUpsertArgs>(args: SelectSubset<T, AccountInvitationUpsertArgs<ExtArgs>>): Prisma__AccountInvitationClient<$Result.GetResult<Prisma.$AccountInvitationPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of AccountInvitations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountInvitationCountArgs} args - Arguments to filter AccountInvitations to count.
     * @example
     * // Count the number of AccountInvitations
     * const count = await prisma.accountInvitation.count({
     *   where: {
     *     // ... the filter for the AccountInvitations we want to count
     *   }
     * })
    **/
    count<T extends AccountInvitationCountArgs>(
      args?: Subset<T, AccountInvitationCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AccountInvitationCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a AccountInvitation.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountInvitationAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AccountInvitationAggregateArgs>(args: Subset<T, AccountInvitationAggregateArgs>): Prisma.PrismaPromise<GetAccountInvitationAggregateType<T>>

    /**
     * Group by AccountInvitation.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountInvitationGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AccountInvitationGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AccountInvitationGroupByArgs['orderBy'] }
        : { orderBy?: AccountInvitationGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AccountInvitationGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAccountInvitationGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the AccountInvitation model
   */
  readonly fields: AccountInvitationFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for AccountInvitation.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AccountInvitationClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    account<T extends AccountDefaultArgs<ExtArgs> = {}>(args?: Subset<T, AccountDefaultArgs<ExtArgs>>): Prisma__AccountClient<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the AccountInvitation model
   */
  interface AccountInvitationFieldRefs {
    readonly id: FieldRef<"AccountInvitation", 'Int'>
    readonly code: FieldRef<"AccountInvitation", 'String'>
    readonly accountId: FieldRef<"AccountInvitation", 'Int'>
    readonly createdBy: FieldRef<"AccountInvitation", 'BigInt'>
    readonly expiresAt: FieldRef<"AccountInvitation", 'DateTime'>
    readonly usedAt: FieldRef<"AccountInvitation", 'DateTime'>
    readonly usedBy: FieldRef<"AccountInvitation", 'BigInt'>
  }
    

  // Custom InputTypes
  /**
   * AccountInvitation findUnique
   */
  export type AccountInvitationFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AccountInvitation
     */
    select?: AccountInvitationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AccountInvitation
     */
    omit?: AccountInvitationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInvitationInclude<ExtArgs> | null
    /**
     * Filter, which AccountInvitation to fetch.
     */
    where: AccountInvitationWhereUniqueInput
  }

  /**
   * AccountInvitation findUniqueOrThrow
   */
  export type AccountInvitationFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AccountInvitation
     */
    select?: AccountInvitationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AccountInvitation
     */
    omit?: AccountInvitationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInvitationInclude<ExtArgs> | null
    /**
     * Filter, which AccountInvitation to fetch.
     */
    where: AccountInvitationWhereUniqueInput
  }

  /**
   * AccountInvitation findFirst
   */
  export type AccountInvitationFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AccountInvitation
     */
    select?: AccountInvitationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AccountInvitation
     */
    omit?: AccountInvitationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInvitationInclude<ExtArgs> | null
    /**
     * Filter, which AccountInvitation to fetch.
     */
    where?: AccountInvitationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AccountInvitations to fetch.
     */
    orderBy?: AccountInvitationOrderByWithRelationInput | AccountInvitationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AccountInvitations.
     */
    cursor?: AccountInvitationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AccountInvitations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AccountInvitations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AccountInvitations.
     */
    distinct?: AccountInvitationScalarFieldEnum | AccountInvitationScalarFieldEnum[]
  }

  /**
   * AccountInvitation findFirstOrThrow
   */
  export type AccountInvitationFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AccountInvitation
     */
    select?: AccountInvitationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AccountInvitation
     */
    omit?: AccountInvitationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInvitationInclude<ExtArgs> | null
    /**
     * Filter, which AccountInvitation to fetch.
     */
    where?: AccountInvitationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AccountInvitations to fetch.
     */
    orderBy?: AccountInvitationOrderByWithRelationInput | AccountInvitationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AccountInvitations.
     */
    cursor?: AccountInvitationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AccountInvitations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AccountInvitations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AccountInvitations.
     */
    distinct?: AccountInvitationScalarFieldEnum | AccountInvitationScalarFieldEnum[]
  }

  /**
   * AccountInvitation findMany
   */
  export type AccountInvitationFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AccountInvitation
     */
    select?: AccountInvitationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AccountInvitation
     */
    omit?: AccountInvitationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInvitationInclude<ExtArgs> | null
    /**
     * Filter, which AccountInvitations to fetch.
     */
    where?: AccountInvitationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AccountInvitations to fetch.
     */
    orderBy?: AccountInvitationOrderByWithRelationInput | AccountInvitationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing AccountInvitations.
     */
    cursor?: AccountInvitationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AccountInvitations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AccountInvitations.
     */
    skip?: number
    distinct?: AccountInvitationScalarFieldEnum | AccountInvitationScalarFieldEnum[]
  }

  /**
   * AccountInvitation create
   */
  export type AccountInvitationCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AccountInvitation
     */
    select?: AccountInvitationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AccountInvitation
     */
    omit?: AccountInvitationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInvitationInclude<ExtArgs> | null
    /**
     * The data needed to create a AccountInvitation.
     */
    data: XOR<AccountInvitationCreateInput, AccountInvitationUncheckedCreateInput>
  }

  /**
   * AccountInvitation createMany
   */
  export type AccountInvitationCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many AccountInvitations.
     */
    data: AccountInvitationCreateManyInput | AccountInvitationCreateManyInput[]
  }

  /**
   * AccountInvitation createManyAndReturn
   */
  export type AccountInvitationCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AccountInvitation
     */
    select?: AccountInvitationSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AccountInvitation
     */
    omit?: AccountInvitationOmit<ExtArgs> | null
    /**
     * The data used to create many AccountInvitations.
     */
    data: AccountInvitationCreateManyInput | AccountInvitationCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInvitationIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * AccountInvitation update
   */
  export type AccountInvitationUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AccountInvitation
     */
    select?: AccountInvitationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AccountInvitation
     */
    omit?: AccountInvitationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInvitationInclude<ExtArgs> | null
    /**
     * The data needed to update a AccountInvitation.
     */
    data: XOR<AccountInvitationUpdateInput, AccountInvitationUncheckedUpdateInput>
    /**
     * Choose, which AccountInvitation to update.
     */
    where: AccountInvitationWhereUniqueInput
  }

  /**
   * AccountInvitation updateMany
   */
  export type AccountInvitationUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update AccountInvitations.
     */
    data: XOR<AccountInvitationUpdateManyMutationInput, AccountInvitationUncheckedUpdateManyInput>
    /**
     * Filter which AccountInvitations to update
     */
    where?: AccountInvitationWhereInput
    /**
     * Limit how many AccountInvitations to update.
     */
    limit?: number
  }

  /**
   * AccountInvitation updateManyAndReturn
   */
  export type AccountInvitationUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AccountInvitation
     */
    select?: AccountInvitationSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AccountInvitation
     */
    omit?: AccountInvitationOmit<ExtArgs> | null
    /**
     * The data used to update AccountInvitations.
     */
    data: XOR<AccountInvitationUpdateManyMutationInput, AccountInvitationUncheckedUpdateManyInput>
    /**
     * Filter which AccountInvitations to update
     */
    where?: AccountInvitationWhereInput
    /**
     * Limit how many AccountInvitations to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInvitationIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * AccountInvitation upsert
   */
  export type AccountInvitationUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AccountInvitation
     */
    select?: AccountInvitationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AccountInvitation
     */
    omit?: AccountInvitationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInvitationInclude<ExtArgs> | null
    /**
     * The filter to search for the AccountInvitation to update in case it exists.
     */
    where: AccountInvitationWhereUniqueInput
    /**
     * In case the AccountInvitation found by the `where` argument doesn't exist, create a new AccountInvitation with this data.
     */
    create: XOR<AccountInvitationCreateInput, AccountInvitationUncheckedCreateInput>
    /**
     * In case the AccountInvitation was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AccountInvitationUpdateInput, AccountInvitationUncheckedUpdateInput>
  }

  /**
   * AccountInvitation delete
   */
  export type AccountInvitationDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AccountInvitation
     */
    select?: AccountInvitationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AccountInvitation
     */
    omit?: AccountInvitationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInvitationInclude<ExtArgs> | null
    /**
     * Filter which AccountInvitation to delete.
     */
    where: AccountInvitationWhereUniqueInput
  }

  /**
   * AccountInvitation deleteMany
   */
  export type AccountInvitationDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AccountInvitations to delete
     */
    where?: AccountInvitationWhereInput
    /**
     * Limit how many AccountInvitations to delete.
     */
    limit?: number
  }

  /**
   * AccountInvitation without action
   */
  export type AccountInvitationDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AccountInvitation
     */
    select?: AccountInvitationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AccountInvitation
     */
    omit?: AccountInvitationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInvitationInclude<ExtArgs> | null
  }


  /**
   * Model AccountUser
   */

  export type AggregateAccountUser = {
    _count: AccountUserCountAggregateOutputType | null
    _avg: AccountUserAvgAggregateOutputType | null
    _sum: AccountUserSumAggregateOutputType | null
    _min: AccountUserMinAggregateOutputType | null
    _max: AccountUserMaxAggregateOutputType | null
  }

  export type AccountUserAvgAggregateOutputType = {
    userId: number | null
    accountId: number | null
  }

  export type AccountUserSumAggregateOutputType = {
    userId: bigint | null
    accountId: number | null
  }

  export type AccountUserMinAggregateOutputType = {
    userId: bigint | null
    accountId: number | null
    joinedAt: Date | null
  }

  export type AccountUserMaxAggregateOutputType = {
    userId: bigint | null
    accountId: number | null
    joinedAt: Date | null
  }

  export type AccountUserCountAggregateOutputType = {
    userId: number
    accountId: number
    joinedAt: number
    _all: number
  }


  export type AccountUserAvgAggregateInputType = {
    userId?: true
    accountId?: true
  }

  export type AccountUserSumAggregateInputType = {
    userId?: true
    accountId?: true
  }

  export type AccountUserMinAggregateInputType = {
    userId?: true
    accountId?: true
    joinedAt?: true
  }

  export type AccountUserMaxAggregateInputType = {
    userId?: true
    accountId?: true
    joinedAt?: true
  }

  export type AccountUserCountAggregateInputType = {
    userId?: true
    accountId?: true
    joinedAt?: true
    _all?: true
  }

  export type AccountUserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AccountUser to aggregate.
     */
    where?: AccountUserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AccountUsers to fetch.
     */
    orderBy?: AccountUserOrderByWithRelationInput | AccountUserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AccountUserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AccountUsers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AccountUsers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned AccountUsers
    **/
    _count?: true | AccountUserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: AccountUserAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: AccountUserSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AccountUserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AccountUserMaxAggregateInputType
  }

  export type GetAccountUserAggregateType<T extends AccountUserAggregateArgs> = {
        [P in keyof T & keyof AggregateAccountUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAccountUser[P]>
      : GetScalarType<T[P], AggregateAccountUser[P]>
  }




  export type AccountUserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AccountUserWhereInput
    orderBy?: AccountUserOrderByWithAggregationInput | AccountUserOrderByWithAggregationInput[]
    by: AccountUserScalarFieldEnum[] | AccountUserScalarFieldEnum
    having?: AccountUserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AccountUserCountAggregateInputType | true
    _avg?: AccountUserAvgAggregateInputType
    _sum?: AccountUserSumAggregateInputType
    _min?: AccountUserMinAggregateInputType
    _max?: AccountUserMaxAggregateInputType
  }

  export type AccountUserGroupByOutputType = {
    userId: bigint
    accountId: number
    joinedAt: Date
    _count: AccountUserCountAggregateOutputType | null
    _avg: AccountUserAvgAggregateOutputType | null
    _sum: AccountUserSumAggregateOutputType | null
    _min: AccountUserMinAggregateOutputType | null
    _max: AccountUserMaxAggregateOutputType | null
  }

  type GetAccountUserGroupByPayload<T extends AccountUserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AccountUserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AccountUserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AccountUserGroupByOutputType[P]>
            : GetScalarType<T[P], AccountUserGroupByOutputType[P]>
        }
      >
    >


  export type AccountUserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    userId?: boolean
    accountId?: boolean
    joinedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    account?: boolean | AccountDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["accountUser"]>

  export type AccountUserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    userId?: boolean
    accountId?: boolean
    joinedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    account?: boolean | AccountDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["accountUser"]>

  export type AccountUserSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    userId?: boolean
    accountId?: boolean
    joinedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    account?: boolean | AccountDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["accountUser"]>

  export type AccountUserSelectScalar = {
    userId?: boolean
    accountId?: boolean
    joinedAt?: boolean
  }

  export type AccountUserOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"userId" | "accountId" | "joinedAt", ExtArgs["result"]["accountUser"]>
  export type AccountUserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    account?: boolean | AccountDefaultArgs<ExtArgs>
  }
  export type AccountUserIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    account?: boolean | AccountDefaultArgs<ExtArgs>
  }
  export type AccountUserIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    account?: boolean | AccountDefaultArgs<ExtArgs>
  }

  export type $AccountUserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "AccountUser"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
      account: Prisma.$AccountPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      userId: bigint
      accountId: number
      joinedAt: Date
    }, ExtArgs["result"]["accountUser"]>
    composites: {}
  }

  type AccountUserGetPayload<S extends boolean | null | undefined | AccountUserDefaultArgs> = $Result.GetResult<Prisma.$AccountUserPayload, S>

  type AccountUserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<AccountUserFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: AccountUserCountAggregateInputType | true
    }

  export interface AccountUserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['AccountUser'], meta: { name: 'AccountUser' } }
    /**
     * Find zero or one AccountUser that matches the filter.
     * @param {AccountUserFindUniqueArgs} args - Arguments to find a AccountUser
     * @example
     * // Get one AccountUser
     * const accountUser = await prisma.accountUser.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AccountUserFindUniqueArgs>(args: SelectSubset<T, AccountUserFindUniqueArgs<ExtArgs>>): Prisma__AccountUserClient<$Result.GetResult<Prisma.$AccountUserPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one AccountUser that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AccountUserFindUniqueOrThrowArgs} args - Arguments to find a AccountUser
     * @example
     * // Get one AccountUser
     * const accountUser = await prisma.accountUser.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AccountUserFindUniqueOrThrowArgs>(args: SelectSubset<T, AccountUserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AccountUserClient<$Result.GetResult<Prisma.$AccountUserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AccountUser that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountUserFindFirstArgs} args - Arguments to find a AccountUser
     * @example
     * // Get one AccountUser
     * const accountUser = await prisma.accountUser.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AccountUserFindFirstArgs>(args?: SelectSubset<T, AccountUserFindFirstArgs<ExtArgs>>): Prisma__AccountUserClient<$Result.GetResult<Prisma.$AccountUserPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AccountUser that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountUserFindFirstOrThrowArgs} args - Arguments to find a AccountUser
     * @example
     * // Get one AccountUser
     * const accountUser = await prisma.accountUser.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AccountUserFindFirstOrThrowArgs>(args?: SelectSubset<T, AccountUserFindFirstOrThrowArgs<ExtArgs>>): Prisma__AccountUserClient<$Result.GetResult<Prisma.$AccountUserPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more AccountUsers that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountUserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AccountUsers
     * const accountUsers = await prisma.accountUser.findMany()
     * 
     * // Get first 10 AccountUsers
     * const accountUsers = await prisma.accountUser.findMany({ take: 10 })
     * 
     * // Only select the `userId`
     * const accountUserWithUserIdOnly = await prisma.accountUser.findMany({ select: { userId: true } })
     * 
     */
    findMany<T extends AccountUserFindManyArgs>(args?: SelectSubset<T, AccountUserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AccountUserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a AccountUser.
     * @param {AccountUserCreateArgs} args - Arguments to create a AccountUser.
     * @example
     * // Create one AccountUser
     * const AccountUser = await prisma.accountUser.create({
     *   data: {
     *     // ... data to create a AccountUser
     *   }
     * })
     * 
     */
    create<T extends AccountUserCreateArgs>(args: SelectSubset<T, AccountUserCreateArgs<ExtArgs>>): Prisma__AccountUserClient<$Result.GetResult<Prisma.$AccountUserPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many AccountUsers.
     * @param {AccountUserCreateManyArgs} args - Arguments to create many AccountUsers.
     * @example
     * // Create many AccountUsers
     * const accountUser = await prisma.accountUser.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AccountUserCreateManyArgs>(args?: SelectSubset<T, AccountUserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many AccountUsers and returns the data saved in the database.
     * @param {AccountUserCreateManyAndReturnArgs} args - Arguments to create many AccountUsers.
     * @example
     * // Create many AccountUsers
     * const accountUser = await prisma.accountUser.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many AccountUsers and only return the `userId`
     * const accountUserWithUserIdOnly = await prisma.accountUser.createManyAndReturn({
     *   select: { userId: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AccountUserCreateManyAndReturnArgs>(args?: SelectSubset<T, AccountUserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AccountUserPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a AccountUser.
     * @param {AccountUserDeleteArgs} args - Arguments to delete one AccountUser.
     * @example
     * // Delete one AccountUser
     * const AccountUser = await prisma.accountUser.delete({
     *   where: {
     *     // ... filter to delete one AccountUser
     *   }
     * })
     * 
     */
    delete<T extends AccountUserDeleteArgs>(args: SelectSubset<T, AccountUserDeleteArgs<ExtArgs>>): Prisma__AccountUserClient<$Result.GetResult<Prisma.$AccountUserPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one AccountUser.
     * @param {AccountUserUpdateArgs} args - Arguments to update one AccountUser.
     * @example
     * // Update one AccountUser
     * const accountUser = await prisma.accountUser.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AccountUserUpdateArgs>(args: SelectSubset<T, AccountUserUpdateArgs<ExtArgs>>): Prisma__AccountUserClient<$Result.GetResult<Prisma.$AccountUserPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more AccountUsers.
     * @param {AccountUserDeleteManyArgs} args - Arguments to filter AccountUsers to delete.
     * @example
     * // Delete a few AccountUsers
     * const { count } = await prisma.accountUser.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AccountUserDeleteManyArgs>(args?: SelectSubset<T, AccountUserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AccountUsers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountUserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many AccountUsers
     * const accountUser = await prisma.accountUser.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AccountUserUpdateManyArgs>(args: SelectSubset<T, AccountUserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AccountUsers and returns the data updated in the database.
     * @param {AccountUserUpdateManyAndReturnArgs} args - Arguments to update many AccountUsers.
     * @example
     * // Update many AccountUsers
     * const accountUser = await prisma.accountUser.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more AccountUsers and only return the `userId`
     * const accountUserWithUserIdOnly = await prisma.accountUser.updateManyAndReturn({
     *   select: { userId: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends AccountUserUpdateManyAndReturnArgs>(args: SelectSubset<T, AccountUserUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AccountUserPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one AccountUser.
     * @param {AccountUserUpsertArgs} args - Arguments to update or create a AccountUser.
     * @example
     * // Update or create a AccountUser
     * const accountUser = await prisma.accountUser.upsert({
     *   create: {
     *     // ... data to create a AccountUser
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the AccountUser we want to update
     *   }
     * })
     */
    upsert<T extends AccountUserUpsertArgs>(args: SelectSubset<T, AccountUserUpsertArgs<ExtArgs>>): Prisma__AccountUserClient<$Result.GetResult<Prisma.$AccountUserPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of AccountUsers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountUserCountArgs} args - Arguments to filter AccountUsers to count.
     * @example
     * // Count the number of AccountUsers
     * const count = await prisma.accountUser.count({
     *   where: {
     *     // ... the filter for the AccountUsers we want to count
     *   }
     * })
    **/
    count<T extends AccountUserCountArgs>(
      args?: Subset<T, AccountUserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AccountUserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a AccountUser.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountUserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AccountUserAggregateArgs>(args: Subset<T, AccountUserAggregateArgs>): Prisma.PrismaPromise<GetAccountUserAggregateType<T>>

    /**
     * Group by AccountUser.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountUserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AccountUserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AccountUserGroupByArgs['orderBy'] }
        : { orderBy?: AccountUserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AccountUserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAccountUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the AccountUser model
   */
  readonly fields: AccountUserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for AccountUser.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AccountUserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    account<T extends AccountDefaultArgs<ExtArgs> = {}>(args?: Subset<T, AccountDefaultArgs<ExtArgs>>): Prisma__AccountClient<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the AccountUser model
   */
  interface AccountUserFieldRefs {
    readonly userId: FieldRef<"AccountUser", 'BigInt'>
    readonly accountId: FieldRef<"AccountUser", 'Int'>
    readonly joinedAt: FieldRef<"AccountUser", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * AccountUser findUnique
   */
  export type AccountUserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AccountUser
     */
    select?: AccountUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AccountUser
     */
    omit?: AccountUserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountUserInclude<ExtArgs> | null
    /**
     * Filter, which AccountUser to fetch.
     */
    where: AccountUserWhereUniqueInput
  }

  /**
   * AccountUser findUniqueOrThrow
   */
  export type AccountUserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AccountUser
     */
    select?: AccountUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AccountUser
     */
    omit?: AccountUserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountUserInclude<ExtArgs> | null
    /**
     * Filter, which AccountUser to fetch.
     */
    where: AccountUserWhereUniqueInput
  }

  /**
   * AccountUser findFirst
   */
  export type AccountUserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AccountUser
     */
    select?: AccountUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AccountUser
     */
    omit?: AccountUserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountUserInclude<ExtArgs> | null
    /**
     * Filter, which AccountUser to fetch.
     */
    where?: AccountUserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AccountUsers to fetch.
     */
    orderBy?: AccountUserOrderByWithRelationInput | AccountUserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AccountUsers.
     */
    cursor?: AccountUserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AccountUsers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AccountUsers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AccountUsers.
     */
    distinct?: AccountUserScalarFieldEnum | AccountUserScalarFieldEnum[]
  }

  /**
   * AccountUser findFirstOrThrow
   */
  export type AccountUserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AccountUser
     */
    select?: AccountUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AccountUser
     */
    omit?: AccountUserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountUserInclude<ExtArgs> | null
    /**
     * Filter, which AccountUser to fetch.
     */
    where?: AccountUserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AccountUsers to fetch.
     */
    orderBy?: AccountUserOrderByWithRelationInput | AccountUserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AccountUsers.
     */
    cursor?: AccountUserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AccountUsers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AccountUsers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AccountUsers.
     */
    distinct?: AccountUserScalarFieldEnum | AccountUserScalarFieldEnum[]
  }

  /**
   * AccountUser findMany
   */
  export type AccountUserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AccountUser
     */
    select?: AccountUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AccountUser
     */
    omit?: AccountUserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountUserInclude<ExtArgs> | null
    /**
     * Filter, which AccountUsers to fetch.
     */
    where?: AccountUserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AccountUsers to fetch.
     */
    orderBy?: AccountUserOrderByWithRelationInput | AccountUserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing AccountUsers.
     */
    cursor?: AccountUserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AccountUsers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AccountUsers.
     */
    skip?: number
    distinct?: AccountUserScalarFieldEnum | AccountUserScalarFieldEnum[]
  }

  /**
   * AccountUser create
   */
  export type AccountUserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AccountUser
     */
    select?: AccountUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AccountUser
     */
    omit?: AccountUserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountUserInclude<ExtArgs> | null
    /**
     * The data needed to create a AccountUser.
     */
    data: XOR<AccountUserCreateInput, AccountUserUncheckedCreateInput>
  }

  /**
   * AccountUser createMany
   */
  export type AccountUserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many AccountUsers.
     */
    data: AccountUserCreateManyInput | AccountUserCreateManyInput[]
  }

  /**
   * AccountUser createManyAndReturn
   */
  export type AccountUserCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AccountUser
     */
    select?: AccountUserSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AccountUser
     */
    omit?: AccountUserOmit<ExtArgs> | null
    /**
     * The data used to create many AccountUsers.
     */
    data: AccountUserCreateManyInput | AccountUserCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountUserIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * AccountUser update
   */
  export type AccountUserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AccountUser
     */
    select?: AccountUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AccountUser
     */
    omit?: AccountUserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountUserInclude<ExtArgs> | null
    /**
     * The data needed to update a AccountUser.
     */
    data: XOR<AccountUserUpdateInput, AccountUserUncheckedUpdateInput>
    /**
     * Choose, which AccountUser to update.
     */
    where: AccountUserWhereUniqueInput
  }

  /**
   * AccountUser updateMany
   */
  export type AccountUserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update AccountUsers.
     */
    data: XOR<AccountUserUpdateManyMutationInput, AccountUserUncheckedUpdateManyInput>
    /**
     * Filter which AccountUsers to update
     */
    where?: AccountUserWhereInput
    /**
     * Limit how many AccountUsers to update.
     */
    limit?: number
  }

  /**
   * AccountUser updateManyAndReturn
   */
  export type AccountUserUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AccountUser
     */
    select?: AccountUserSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AccountUser
     */
    omit?: AccountUserOmit<ExtArgs> | null
    /**
     * The data used to update AccountUsers.
     */
    data: XOR<AccountUserUpdateManyMutationInput, AccountUserUncheckedUpdateManyInput>
    /**
     * Filter which AccountUsers to update
     */
    where?: AccountUserWhereInput
    /**
     * Limit how many AccountUsers to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountUserIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * AccountUser upsert
   */
  export type AccountUserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AccountUser
     */
    select?: AccountUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AccountUser
     */
    omit?: AccountUserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountUserInclude<ExtArgs> | null
    /**
     * The filter to search for the AccountUser to update in case it exists.
     */
    where: AccountUserWhereUniqueInput
    /**
     * In case the AccountUser found by the `where` argument doesn't exist, create a new AccountUser with this data.
     */
    create: XOR<AccountUserCreateInput, AccountUserUncheckedCreateInput>
    /**
     * In case the AccountUser was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AccountUserUpdateInput, AccountUserUncheckedUpdateInput>
  }

  /**
   * AccountUser delete
   */
  export type AccountUserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AccountUser
     */
    select?: AccountUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AccountUser
     */
    omit?: AccountUserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountUserInclude<ExtArgs> | null
    /**
     * Filter which AccountUser to delete.
     */
    where: AccountUserWhereUniqueInput
  }

  /**
   * AccountUser deleteMany
   */
  export type AccountUserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AccountUsers to delete
     */
    where?: AccountUserWhereInput
    /**
     * Limit how many AccountUsers to delete.
     */
    limit?: number
  }

  /**
   * AccountUser without action
   */
  export type AccountUserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AccountUser
     */
    select?: AccountUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AccountUser
     */
    omit?: AccountUserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountUserInclude<ExtArgs> | null
  }


  /**
   * Model Category
   */

  export type AggregateCategory = {
    _count: CategoryCountAggregateOutputType | null
    _avg: CategoryAvgAggregateOutputType | null
    _sum: CategorySumAggregateOutputType | null
    _min: CategoryMinAggregateOutputType | null
    _max: CategoryMaxAggregateOutputType | null
  }

  export type CategoryAvgAggregateOutputType = {
    id: number | null
    accountId: number | null
  }

  export type CategorySumAggregateOutputType = {
    id: number | null
    accountId: number | null
  }

  export type CategoryMinAggregateOutputType = {
    id: number | null
    accountId: number | null
    name: string | null
    deletedAt: Date | null
  }

  export type CategoryMaxAggregateOutputType = {
    id: number | null
    accountId: number | null
    name: string | null
    deletedAt: Date | null
  }

  export type CategoryCountAggregateOutputType = {
    id: number
    accountId: number
    name: number
    deletedAt: number
    _all: number
  }


  export type CategoryAvgAggregateInputType = {
    id?: true
    accountId?: true
  }

  export type CategorySumAggregateInputType = {
    id?: true
    accountId?: true
  }

  export type CategoryMinAggregateInputType = {
    id?: true
    accountId?: true
    name?: true
    deletedAt?: true
  }

  export type CategoryMaxAggregateInputType = {
    id?: true
    accountId?: true
    name?: true
    deletedAt?: true
  }

  export type CategoryCountAggregateInputType = {
    id?: true
    accountId?: true
    name?: true
    deletedAt?: true
    _all?: true
  }

  export type CategoryAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Category to aggregate.
     */
    where?: CategoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Categories to fetch.
     */
    orderBy?: CategoryOrderByWithRelationInput | CategoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CategoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Categories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Categories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Categories
    **/
    _count?: true | CategoryCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: CategoryAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: CategorySumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CategoryMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CategoryMaxAggregateInputType
  }

  export type GetCategoryAggregateType<T extends CategoryAggregateArgs> = {
        [P in keyof T & keyof AggregateCategory]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCategory[P]>
      : GetScalarType<T[P], AggregateCategory[P]>
  }




  export type CategoryGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CategoryWhereInput
    orderBy?: CategoryOrderByWithAggregationInput | CategoryOrderByWithAggregationInput[]
    by: CategoryScalarFieldEnum[] | CategoryScalarFieldEnum
    having?: CategoryScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CategoryCountAggregateInputType | true
    _avg?: CategoryAvgAggregateInputType
    _sum?: CategorySumAggregateInputType
    _min?: CategoryMinAggregateInputType
    _max?: CategoryMaxAggregateInputType
  }

  export type CategoryGroupByOutputType = {
    id: number
    accountId: number
    name: string
    deletedAt: Date | null
    _count: CategoryCountAggregateOutputType | null
    _avg: CategoryAvgAggregateOutputType | null
    _sum: CategorySumAggregateOutputType | null
    _min: CategoryMinAggregateOutputType | null
    _max: CategoryMaxAggregateOutputType | null
  }

  type GetCategoryGroupByPayload<T extends CategoryGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CategoryGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CategoryGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CategoryGroupByOutputType[P]>
            : GetScalarType<T[P], CategoryGroupByOutputType[P]>
        }
      >
    >


  export type CategorySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    accountId?: boolean
    name?: boolean
    deletedAt?: boolean
    account?: boolean | AccountDefaultArgs<ExtArgs>
    expenses?: boolean | Category$expensesArgs<ExtArgs>
    subcategories?: boolean | Category$subcategoriesArgs<ExtArgs>
    _count?: boolean | CategoryCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["category"]>

  export type CategorySelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    accountId?: boolean
    name?: boolean
    deletedAt?: boolean
    account?: boolean | AccountDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["category"]>

  export type CategorySelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    accountId?: boolean
    name?: boolean
    deletedAt?: boolean
    account?: boolean | AccountDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["category"]>

  export type CategorySelectScalar = {
    id?: boolean
    accountId?: boolean
    name?: boolean
    deletedAt?: boolean
  }

  export type CategoryOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "accountId" | "name" | "deletedAt", ExtArgs["result"]["category"]>
  export type CategoryInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    account?: boolean | AccountDefaultArgs<ExtArgs>
    expenses?: boolean | Category$expensesArgs<ExtArgs>
    subcategories?: boolean | Category$subcategoriesArgs<ExtArgs>
    _count?: boolean | CategoryCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type CategoryIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    account?: boolean | AccountDefaultArgs<ExtArgs>
  }
  export type CategoryIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    account?: boolean | AccountDefaultArgs<ExtArgs>
  }

  export type $CategoryPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Category"
    objects: {
      account: Prisma.$AccountPayload<ExtArgs>
      expenses: Prisma.$ExpensePayload<ExtArgs>[]
      subcategories: Prisma.$SubcategoryPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      accountId: number
      name: string
      deletedAt: Date | null
    }, ExtArgs["result"]["category"]>
    composites: {}
  }

  type CategoryGetPayload<S extends boolean | null | undefined | CategoryDefaultArgs> = $Result.GetResult<Prisma.$CategoryPayload, S>

  type CategoryCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<CategoryFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: CategoryCountAggregateInputType | true
    }

  export interface CategoryDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Category'], meta: { name: 'Category' } }
    /**
     * Find zero or one Category that matches the filter.
     * @param {CategoryFindUniqueArgs} args - Arguments to find a Category
     * @example
     * // Get one Category
     * const category = await prisma.category.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CategoryFindUniqueArgs>(args: SelectSubset<T, CategoryFindUniqueArgs<ExtArgs>>): Prisma__CategoryClient<$Result.GetResult<Prisma.$CategoryPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Category that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CategoryFindUniqueOrThrowArgs} args - Arguments to find a Category
     * @example
     * // Get one Category
     * const category = await prisma.category.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CategoryFindUniqueOrThrowArgs>(args: SelectSubset<T, CategoryFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CategoryClient<$Result.GetResult<Prisma.$CategoryPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Category that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CategoryFindFirstArgs} args - Arguments to find a Category
     * @example
     * // Get one Category
     * const category = await prisma.category.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CategoryFindFirstArgs>(args?: SelectSubset<T, CategoryFindFirstArgs<ExtArgs>>): Prisma__CategoryClient<$Result.GetResult<Prisma.$CategoryPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Category that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CategoryFindFirstOrThrowArgs} args - Arguments to find a Category
     * @example
     * // Get one Category
     * const category = await prisma.category.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CategoryFindFirstOrThrowArgs>(args?: SelectSubset<T, CategoryFindFirstOrThrowArgs<ExtArgs>>): Prisma__CategoryClient<$Result.GetResult<Prisma.$CategoryPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Categories that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CategoryFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Categories
     * const categories = await prisma.category.findMany()
     * 
     * // Get first 10 Categories
     * const categories = await prisma.category.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const categoryWithIdOnly = await prisma.category.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CategoryFindManyArgs>(args?: SelectSubset<T, CategoryFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CategoryPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Category.
     * @param {CategoryCreateArgs} args - Arguments to create a Category.
     * @example
     * // Create one Category
     * const Category = await prisma.category.create({
     *   data: {
     *     // ... data to create a Category
     *   }
     * })
     * 
     */
    create<T extends CategoryCreateArgs>(args: SelectSubset<T, CategoryCreateArgs<ExtArgs>>): Prisma__CategoryClient<$Result.GetResult<Prisma.$CategoryPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Categories.
     * @param {CategoryCreateManyArgs} args - Arguments to create many Categories.
     * @example
     * // Create many Categories
     * const category = await prisma.category.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CategoryCreateManyArgs>(args?: SelectSubset<T, CategoryCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Categories and returns the data saved in the database.
     * @param {CategoryCreateManyAndReturnArgs} args - Arguments to create many Categories.
     * @example
     * // Create many Categories
     * const category = await prisma.category.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Categories and only return the `id`
     * const categoryWithIdOnly = await prisma.category.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CategoryCreateManyAndReturnArgs>(args?: SelectSubset<T, CategoryCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CategoryPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Category.
     * @param {CategoryDeleteArgs} args - Arguments to delete one Category.
     * @example
     * // Delete one Category
     * const Category = await prisma.category.delete({
     *   where: {
     *     // ... filter to delete one Category
     *   }
     * })
     * 
     */
    delete<T extends CategoryDeleteArgs>(args: SelectSubset<T, CategoryDeleteArgs<ExtArgs>>): Prisma__CategoryClient<$Result.GetResult<Prisma.$CategoryPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Category.
     * @param {CategoryUpdateArgs} args - Arguments to update one Category.
     * @example
     * // Update one Category
     * const category = await prisma.category.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CategoryUpdateArgs>(args: SelectSubset<T, CategoryUpdateArgs<ExtArgs>>): Prisma__CategoryClient<$Result.GetResult<Prisma.$CategoryPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Categories.
     * @param {CategoryDeleteManyArgs} args - Arguments to filter Categories to delete.
     * @example
     * // Delete a few Categories
     * const { count } = await prisma.category.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CategoryDeleteManyArgs>(args?: SelectSubset<T, CategoryDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Categories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CategoryUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Categories
     * const category = await prisma.category.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CategoryUpdateManyArgs>(args: SelectSubset<T, CategoryUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Categories and returns the data updated in the database.
     * @param {CategoryUpdateManyAndReturnArgs} args - Arguments to update many Categories.
     * @example
     * // Update many Categories
     * const category = await prisma.category.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Categories and only return the `id`
     * const categoryWithIdOnly = await prisma.category.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends CategoryUpdateManyAndReturnArgs>(args: SelectSubset<T, CategoryUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CategoryPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Category.
     * @param {CategoryUpsertArgs} args - Arguments to update or create a Category.
     * @example
     * // Update or create a Category
     * const category = await prisma.category.upsert({
     *   create: {
     *     // ... data to create a Category
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Category we want to update
     *   }
     * })
     */
    upsert<T extends CategoryUpsertArgs>(args: SelectSubset<T, CategoryUpsertArgs<ExtArgs>>): Prisma__CategoryClient<$Result.GetResult<Prisma.$CategoryPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Categories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CategoryCountArgs} args - Arguments to filter Categories to count.
     * @example
     * // Count the number of Categories
     * const count = await prisma.category.count({
     *   where: {
     *     // ... the filter for the Categories we want to count
     *   }
     * })
    **/
    count<T extends CategoryCountArgs>(
      args?: Subset<T, CategoryCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CategoryCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Category.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CategoryAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CategoryAggregateArgs>(args: Subset<T, CategoryAggregateArgs>): Prisma.PrismaPromise<GetCategoryAggregateType<T>>

    /**
     * Group by Category.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CategoryGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CategoryGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CategoryGroupByArgs['orderBy'] }
        : { orderBy?: CategoryGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CategoryGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCategoryGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Category model
   */
  readonly fields: CategoryFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Category.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CategoryClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    account<T extends AccountDefaultArgs<ExtArgs> = {}>(args?: Subset<T, AccountDefaultArgs<ExtArgs>>): Prisma__AccountClient<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    expenses<T extends Category$expensesArgs<ExtArgs> = {}>(args?: Subset<T, Category$expensesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ExpensePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    subcategories<T extends Category$subcategoriesArgs<ExtArgs> = {}>(args?: Subset<T, Category$subcategoriesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SubcategoryPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Category model
   */
  interface CategoryFieldRefs {
    readonly id: FieldRef<"Category", 'Int'>
    readonly accountId: FieldRef<"Category", 'Int'>
    readonly name: FieldRef<"Category", 'String'>
    readonly deletedAt: FieldRef<"Category", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Category findUnique
   */
  export type CategoryFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Category
     */
    select?: CategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Category
     */
    omit?: CategoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoryInclude<ExtArgs> | null
    /**
     * Filter, which Category to fetch.
     */
    where: CategoryWhereUniqueInput
  }

  /**
   * Category findUniqueOrThrow
   */
  export type CategoryFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Category
     */
    select?: CategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Category
     */
    omit?: CategoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoryInclude<ExtArgs> | null
    /**
     * Filter, which Category to fetch.
     */
    where: CategoryWhereUniqueInput
  }

  /**
   * Category findFirst
   */
  export type CategoryFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Category
     */
    select?: CategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Category
     */
    omit?: CategoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoryInclude<ExtArgs> | null
    /**
     * Filter, which Category to fetch.
     */
    where?: CategoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Categories to fetch.
     */
    orderBy?: CategoryOrderByWithRelationInput | CategoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Categories.
     */
    cursor?: CategoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Categories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Categories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Categories.
     */
    distinct?: CategoryScalarFieldEnum | CategoryScalarFieldEnum[]
  }

  /**
   * Category findFirstOrThrow
   */
  export type CategoryFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Category
     */
    select?: CategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Category
     */
    omit?: CategoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoryInclude<ExtArgs> | null
    /**
     * Filter, which Category to fetch.
     */
    where?: CategoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Categories to fetch.
     */
    orderBy?: CategoryOrderByWithRelationInput | CategoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Categories.
     */
    cursor?: CategoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Categories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Categories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Categories.
     */
    distinct?: CategoryScalarFieldEnum | CategoryScalarFieldEnum[]
  }

  /**
   * Category findMany
   */
  export type CategoryFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Category
     */
    select?: CategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Category
     */
    omit?: CategoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoryInclude<ExtArgs> | null
    /**
     * Filter, which Categories to fetch.
     */
    where?: CategoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Categories to fetch.
     */
    orderBy?: CategoryOrderByWithRelationInput | CategoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Categories.
     */
    cursor?: CategoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Categories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Categories.
     */
    skip?: number
    distinct?: CategoryScalarFieldEnum | CategoryScalarFieldEnum[]
  }

  /**
   * Category create
   */
  export type CategoryCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Category
     */
    select?: CategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Category
     */
    omit?: CategoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoryInclude<ExtArgs> | null
    /**
     * The data needed to create a Category.
     */
    data: XOR<CategoryCreateInput, CategoryUncheckedCreateInput>
  }

  /**
   * Category createMany
   */
  export type CategoryCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Categories.
     */
    data: CategoryCreateManyInput | CategoryCreateManyInput[]
  }

  /**
   * Category createManyAndReturn
   */
  export type CategoryCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Category
     */
    select?: CategorySelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Category
     */
    omit?: CategoryOmit<ExtArgs> | null
    /**
     * The data used to create many Categories.
     */
    data: CategoryCreateManyInput | CategoryCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoryIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Category update
   */
  export type CategoryUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Category
     */
    select?: CategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Category
     */
    omit?: CategoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoryInclude<ExtArgs> | null
    /**
     * The data needed to update a Category.
     */
    data: XOR<CategoryUpdateInput, CategoryUncheckedUpdateInput>
    /**
     * Choose, which Category to update.
     */
    where: CategoryWhereUniqueInput
  }

  /**
   * Category updateMany
   */
  export type CategoryUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Categories.
     */
    data: XOR<CategoryUpdateManyMutationInput, CategoryUncheckedUpdateManyInput>
    /**
     * Filter which Categories to update
     */
    where?: CategoryWhereInput
    /**
     * Limit how many Categories to update.
     */
    limit?: number
  }

  /**
   * Category updateManyAndReturn
   */
  export type CategoryUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Category
     */
    select?: CategorySelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Category
     */
    omit?: CategoryOmit<ExtArgs> | null
    /**
     * The data used to update Categories.
     */
    data: XOR<CategoryUpdateManyMutationInput, CategoryUncheckedUpdateManyInput>
    /**
     * Filter which Categories to update
     */
    where?: CategoryWhereInput
    /**
     * Limit how many Categories to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoryIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Category upsert
   */
  export type CategoryUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Category
     */
    select?: CategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Category
     */
    omit?: CategoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoryInclude<ExtArgs> | null
    /**
     * The filter to search for the Category to update in case it exists.
     */
    where: CategoryWhereUniqueInput
    /**
     * In case the Category found by the `where` argument doesn't exist, create a new Category with this data.
     */
    create: XOR<CategoryCreateInput, CategoryUncheckedCreateInput>
    /**
     * In case the Category was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CategoryUpdateInput, CategoryUncheckedUpdateInput>
  }

  /**
   * Category delete
   */
  export type CategoryDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Category
     */
    select?: CategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Category
     */
    omit?: CategoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoryInclude<ExtArgs> | null
    /**
     * Filter which Category to delete.
     */
    where: CategoryWhereUniqueInput
  }

  /**
   * Category deleteMany
   */
  export type CategoryDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Categories to delete
     */
    where?: CategoryWhereInput
    /**
     * Limit how many Categories to delete.
     */
    limit?: number
  }

  /**
   * Category.expenses
   */
  export type Category$expensesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Expense
     */
    select?: ExpenseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Expense
     */
    omit?: ExpenseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExpenseInclude<ExtArgs> | null
    where?: ExpenseWhereInput
    orderBy?: ExpenseOrderByWithRelationInput | ExpenseOrderByWithRelationInput[]
    cursor?: ExpenseWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ExpenseScalarFieldEnum | ExpenseScalarFieldEnum[]
  }

  /**
   * Category.subcategories
   */
  export type Category$subcategoriesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Subcategory
     */
    select?: SubcategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Subcategory
     */
    omit?: SubcategoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SubcategoryInclude<ExtArgs> | null
    where?: SubcategoryWhereInput
    orderBy?: SubcategoryOrderByWithRelationInput | SubcategoryOrderByWithRelationInput[]
    cursor?: SubcategoryWhereUniqueInput
    take?: number
    skip?: number
    distinct?: SubcategoryScalarFieldEnum | SubcategoryScalarFieldEnum[]
  }

  /**
   * Category without action
   */
  export type CategoryDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Category
     */
    select?: CategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Category
     */
    omit?: CategoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoryInclude<ExtArgs> | null
  }


  /**
   * Model Subcategory
   */

  export type AggregateSubcategory = {
    _count: SubcategoryCountAggregateOutputType | null
    _avg: SubcategoryAvgAggregateOutputType | null
    _sum: SubcategorySumAggregateOutputType | null
    _min: SubcategoryMinAggregateOutputType | null
    _max: SubcategoryMaxAggregateOutputType | null
  }

  export type SubcategoryAvgAggregateOutputType = {
    id: number | null
    categoryId: number | null
  }

  export type SubcategorySumAggregateOutputType = {
    id: number | null
    categoryId: number | null
  }

  export type SubcategoryMinAggregateOutputType = {
    id: number | null
    categoryId: number | null
    name: string | null
    deletedAt: Date | null
  }

  export type SubcategoryMaxAggregateOutputType = {
    id: number | null
    categoryId: number | null
    name: string | null
    deletedAt: Date | null
  }

  export type SubcategoryCountAggregateOutputType = {
    id: number
    categoryId: number
    name: number
    deletedAt: number
    _all: number
  }


  export type SubcategoryAvgAggregateInputType = {
    id?: true
    categoryId?: true
  }

  export type SubcategorySumAggregateInputType = {
    id?: true
    categoryId?: true
  }

  export type SubcategoryMinAggregateInputType = {
    id?: true
    categoryId?: true
    name?: true
    deletedAt?: true
  }

  export type SubcategoryMaxAggregateInputType = {
    id?: true
    categoryId?: true
    name?: true
    deletedAt?: true
  }

  export type SubcategoryCountAggregateInputType = {
    id?: true
    categoryId?: true
    name?: true
    deletedAt?: true
    _all?: true
  }

  export type SubcategoryAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Subcategory to aggregate.
     */
    where?: SubcategoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Subcategories to fetch.
     */
    orderBy?: SubcategoryOrderByWithRelationInput | SubcategoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SubcategoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Subcategories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Subcategories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Subcategories
    **/
    _count?: true | SubcategoryCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: SubcategoryAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: SubcategorySumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SubcategoryMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SubcategoryMaxAggregateInputType
  }

  export type GetSubcategoryAggregateType<T extends SubcategoryAggregateArgs> = {
        [P in keyof T & keyof AggregateSubcategory]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSubcategory[P]>
      : GetScalarType<T[P], AggregateSubcategory[P]>
  }




  export type SubcategoryGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SubcategoryWhereInput
    orderBy?: SubcategoryOrderByWithAggregationInput | SubcategoryOrderByWithAggregationInput[]
    by: SubcategoryScalarFieldEnum[] | SubcategoryScalarFieldEnum
    having?: SubcategoryScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SubcategoryCountAggregateInputType | true
    _avg?: SubcategoryAvgAggregateInputType
    _sum?: SubcategorySumAggregateInputType
    _min?: SubcategoryMinAggregateInputType
    _max?: SubcategoryMaxAggregateInputType
  }

  export type SubcategoryGroupByOutputType = {
    id: number
    categoryId: number
    name: string
    deletedAt: Date | null
    _count: SubcategoryCountAggregateOutputType | null
    _avg: SubcategoryAvgAggregateOutputType | null
    _sum: SubcategorySumAggregateOutputType | null
    _min: SubcategoryMinAggregateOutputType | null
    _max: SubcategoryMaxAggregateOutputType | null
  }

  type GetSubcategoryGroupByPayload<T extends SubcategoryGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SubcategoryGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SubcategoryGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SubcategoryGroupByOutputType[P]>
            : GetScalarType<T[P], SubcategoryGroupByOutputType[P]>
        }
      >
    >


  export type SubcategorySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    categoryId?: boolean
    name?: boolean
    deletedAt?: boolean
    category?: boolean | CategoryDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["subcategory"]>

  export type SubcategorySelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    categoryId?: boolean
    name?: boolean
    deletedAt?: boolean
    category?: boolean | CategoryDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["subcategory"]>

  export type SubcategorySelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    categoryId?: boolean
    name?: boolean
    deletedAt?: boolean
    category?: boolean | CategoryDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["subcategory"]>

  export type SubcategorySelectScalar = {
    id?: boolean
    categoryId?: boolean
    name?: boolean
    deletedAt?: boolean
  }

  export type SubcategoryOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "categoryId" | "name" | "deletedAt", ExtArgs["result"]["subcategory"]>
  export type SubcategoryInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    category?: boolean | CategoryDefaultArgs<ExtArgs>
  }
  export type SubcategoryIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    category?: boolean | CategoryDefaultArgs<ExtArgs>
  }
  export type SubcategoryIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    category?: boolean | CategoryDefaultArgs<ExtArgs>
  }

  export type $SubcategoryPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Subcategory"
    objects: {
      category: Prisma.$CategoryPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      categoryId: number
      name: string
      deletedAt: Date | null
    }, ExtArgs["result"]["subcategory"]>
    composites: {}
  }

  type SubcategoryGetPayload<S extends boolean | null | undefined | SubcategoryDefaultArgs> = $Result.GetResult<Prisma.$SubcategoryPayload, S>

  type SubcategoryCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<SubcategoryFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: SubcategoryCountAggregateInputType | true
    }

  export interface SubcategoryDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Subcategory'], meta: { name: 'Subcategory' } }
    /**
     * Find zero or one Subcategory that matches the filter.
     * @param {SubcategoryFindUniqueArgs} args - Arguments to find a Subcategory
     * @example
     * // Get one Subcategory
     * const subcategory = await prisma.subcategory.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SubcategoryFindUniqueArgs>(args: SelectSubset<T, SubcategoryFindUniqueArgs<ExtArgs>>): Prisma__SubcategoryClient<$Result.GetResult<Prisma.$SubcategoryPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Subcategory that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {SubcategoryFindUniqueOrThrowArgs} args - Arguments to find a Subcategory
     * @example
     * // Get one Subcategory
     * const subcategory = await prisma.subcategory.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SubcategoryFindUniqueOrThrowArgs>(args: SelectSubset<T, SubcategoryFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SubcategoryClient<$Result.GetResult<Prisma.$SubcategoryPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Subcategory that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SubcategoryFindFirstArgs} args - Arguments to find a Subcategory
     * @example
     * // Get one Subcategory
     * const subcategory = await prisma.subcategory.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SubcategoryFindFirstArgs>(args?: SelectSubset<T, SubcategoryFindFirstArgs<ExtArgs>>): Prisma__SubcategoryClient<$Result.GetResult<Prisma.$SubcategoryPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Subcategory that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SubcategoryFindFirstOrThrowArgs} args - Arguments to find a Subcategory
     * @example
     * // Get one Subcategory
     * const subcategory = await prisma.subcategory.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SubcategoryFindFirstOrThrowArgs>(args?: SelectSubset<T, SubcategoryFindFirstOrThrowArgs<ExtArgs>>): Prisma__SubcategoryClient<$Result.GetResult<Prisma.$SubcategoryPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Subcategories that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SubcategoryFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Subcategories
     * const subcategories = await prisma.subcategory.findMany()
     * 
     * // Get first 10 Subcategories
     * const subcategories = await prisma.subcategory.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const subcategoryWithIdOnly = await prisma.subcategory.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends SubcategoryFindManyArgs>(args?: SelectSubset<T, SubcategoryFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SubcategoryPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Subcategory.
     * @param {SubcategoryCreateArgs} args - Arguments to create a Subcategory.
     * @example
     * // Create one Subcategory
     * const Subcategory = await prisma.subcategory.create({
     *   data: {
     *     // ... data to create a Subcategory
     *   }
     * })
     * 
     */
    create<T extends SubcategoryCreateArgs>(args: SelectSubset<T, SubcategoryCreateArgs<ExtArgs>>): Prisma__SubcategoryClient<$Result.GetResult<Prisma.$SubcategoryPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Subcategories.
     * @param {SubcategoryCreateManyArgs} args - Arguments to create many Subcategories.
     * @example
     * // Create many Subcategories
     * const subcategory = await prisma.subcategory.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SubcategoryCreateManyArgs>(args?: SelectSubset<T, SubcategoryCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Subcategories and returns the data saved in the database.
     * @param {SubcategoryCreateManyAndReturnArgs} args - Arguments to create many Subcategories.
     * @example
     * // Create many Subcategories
     * const subcategory = await prisma.subcategory.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Subcategories and only return the `id`
     * const subcategoryWithIdOnly = await prisma.subcategory.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends SubcategoryCreateManyAndReturnArgs>(args?: SelectSubset<T, SubcategoryCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SubcategoryPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Subcategory.
     * @param {SubcategoryDeleteArgs} args - Arguments to delete one Subcategory.
     * @example
     * // Delete one Subcategory
     * const Subcategory = await prisma.subcategory.delete({
     *   where: {
     *     // ... filter to delete one Subcategory
     *   }
     * })
     * 
     */
    delete<T extends SubcategoryDeleteArgs>(args: SelectSubset<T, SubcategoryDeleteArgs<ExtArgs>>): Prisma__SubcategoryClient<$Result.GetResult<Prisma.$SubcategoryPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Subcategory.
     * @param {SubcategoryUpdateArgs} args - Arguments to update one Subcategory.
     * @example
     * // Update one Subcategory
     * const subcategory = await prisma.subcategory.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SubcategoryUpdateArgs>(args: SelectSubset<T, SubcategoryUpdateArgs<ExtArgs>>): Prisma__SubcategoryClient<$Result.GetResult<Prisma.$SubcategoryPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Subcategories.
     * @param {SubcategoryDeleteManyArgs} args - Arguments to filter Subcategories to delete.
     * @example
     * // Delete a few Subcategories
     * const { count } = await prisma.subcategory.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SubcategoryDeleteManyArgs>(args?: SelectSubset<T, SubcategoryDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Subcategories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SubcategoryUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Subcategories
     * const subcategory = await prisma.subcategory.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SubcategoryUpdateManyArgs>(args: SelectSubset<T, SubcategoryUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Subcategories and returns the data updated in the database.
     * @param {SubcategoryUpdateManyAndReturnArgs} args - Arguments to update many Subcategories.
     * @example
     * // Update many Subcategories
     * const subcategory = await prisma.subcategory.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Subcategories and only return the `id`
     * const subcategoryWithIdOnly = await prisma.subcategory.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends SubcategoryUpdateManyAndReturnArgs>(args: SelectSubset<T, SubcategoryUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SubcategoryPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Subcategory.
     * @param {SubcategoryUpsertArgs} args - Arguments to update or create a Subcategory.
     * @example
     * // Update or create a Subcategory
     * const subcategory = await prisma.subcategory.upsert({
     *   create: {
     *     // ... data to create a Subcategory
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Subcategory we want to update
     *   }
     * })
     */
    upsert<T extends SubcategoryUpsertArgs>(args: SelectSubset<T, SubcategoryUpsertArgs<ExtArgs>>): Prisma__SubcategoryClient<$Result.GetResult<Prisma.$SubcategoryPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Subcategories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SubcategoryCountArgs} args - Arguments to filter Subcategories to count.
     * @example
     * // Count the number of Subcategories
     * const count = await prisma.subcategory.count({
     *   where: {
     *     // ... the filter for the Subcategories we want to count
     *   }
     * })
    **/
    count<T extends SubcategoryCountArgs>(
      args?: Subset<T, SubcategoryCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SubcategoryCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Subcategory.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SubcategoryAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SubcategoryAggregateArgs>(args: Subset<T, SubcategoryAggregateArgs>): Prisma.PrismaPromise<GetSubcategoryAggregateType<T>>

    /**
     * Group by Subcategory.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SubcategoryGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends SubcategoryGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SubcategoryGroupByArgs['orderBy'] }
        : { orderBy?: SubcategoryGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, SubcategoryGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSubcategoryGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Subcategory model
   */
  readonly fields: SubcategoryFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Subcategory.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SubcategoryClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    category<T extends CategoryDefaultArgs<ExtArgs> = {}>(args?: Subset<T, CategoryDefaultArgs<ExtArgs>>): Prisma__CategoryClient<$Result.GetResult<Prisma.$CategoryPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Subcategory model
   */
  interface SubcategoryFieldRefs {
    readonly id: FieldRef<"Subcategory", 'Int'>
    readonly categoryId: FieldRef<"Subcategory", 'Int'>
    readonly name: FieldRef<"Subcategory", 'String'>
    readonly deletedAt: FieldRef<"Subcategory", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Subcategory findUnique
   */
  export type SubcategoryFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Subcategory
     */
    select?: SubcategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Subcategory
     */
    omit?: SubcategoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SubcategoryInclude<ExtArgs> | null
    /**
     * Filter, which Subcategory to fetch.
     */
    where: SubcategoryWhereUniqueInput
  }

  /**
   * Subcategory findUniqueOrThrow
   */
  export type SubcategoryFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Subcategory
     */
    select?: SubcategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Subcategory
     */
    omit?: SubcategoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SubcategoryInclude<ExtArgs> | null
    /**
     * Filter, which Subcategory to fetch.
     */
    where: SubcategoryWhereUniqueInput
  }

  /**
   * Subcategory findFirst
   */
  export type SubcategoryFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Subcategory
     */
    select?: SubcategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Subcategory
     */
    omit?: SubcategoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SubcategoryInclude<ExtArgs> | null
    /**
     * Filter, which Subcategory to fetch.
     */
    where?: SubcategoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Subcategories to fetch.
     */
    orderBy?: SubcategoryOrderByWithRelationInput | SubcategoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Subcategories.
     */
    cursor?: SubcategoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Subcategories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Subcategories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Subcategories.
     */
    distinct?: SubcategoryScalarFieldEnum | SubcategoryScalarFieldEnum[]
  }

  /**
   * Subcategory findFirstOrThrow
   */
  export type SubcategoryFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Subcategory
     */
    select?: SubcategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Subcategory
     */
    omit?: SubcategoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SubcategoryInclude<ExtArgs> | null
    /**
     * Filter, which Subcategory to fetch.
     */
    where?: SubcategoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Subcategories to fetch.
     */
    orderBy?: SubcategoryOrderByWithRelationInput | SubcategoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Subcategories.
     */
    cursor?: SubcategoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Subcategories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Subcategories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Subcategories.
     */
    distinct?: SubcategoryScalarFieldEnum | SubcategoryScalarFieldEnum[]
  }

  /**
   * Subcategory findMany
   */
  export type SubcategoryFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Subcategory
     */
    select?: SubcategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Subcategory
     */
    omit?: SubcategoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SubcategoryInclude<ExtArgs> | null
    /**
     * Filter, which Subcategories to fetch.
     */
    where?: SubcategoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Subcategories to fetch.
     */
    orderBy?: SubcategoryOrderByWithRelationInput | SubcategoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Subcategories.
     */
    cursor?: SubcategoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Subcategories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Subcategories.
     */
    skip?: number
    distinct?: SubcategoryScalarFieldEnum | SubcategoryScalarFieldEnum[]
  }

  /**
   * Subcategory create
   */
  export type SubcategoryCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Subcategory
     */
    select?: SubcategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Subcategory
     */
    omit?: SubcategoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SubcategoryInclude<ExtArgs> | null
    /**
     * The data needed to create a Subcategory.
     */
    data: XOR<SubcategoryCreateInput, SubcategoryUncheckedCreateInput>
  }

  /**
   * Subcategory createMany
   */
  export type SubcategoryCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Subcategories.
     */
    data: SubcategoryCreateManyInput | SubcategoryCreateManyInput[]
  }

  /**
   * Subcategory createManyAndReturn
   */
  export type SubcategoryCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Subcategory
     */
    select?: SubcategorySelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Subcategory
     */
    omit?: SubcategoryOmit<ExtArgs> | null
    /**
     * The data used to create many Subcategories.
     */
    data: SubcategoryCreateManyInput | SubcategoryCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SubcategoryIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Subcategory update
   */
  export type SubcategoryUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Subcategory
     */
    select?: SubcategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Subcategory
     */
    omit?: SubcategoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SubcategoryInclude<ExtArgs> | null
    /**
     * The data needed to update a Subcategory.
     */
    data: XOR<SubcategoryUpdateInput, SubcategoryUncheckedUpdateInput>
    /**
     * Choose, which Subcategory to update.
     */
    where: SubcategoryWhereUniqueInput
  }

  /**
   * Subcategory updateMany
   */
  export type SubcategoryUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Subcategories.
     */
    data: XOR<SubcategoryUpdateManyMutationInput, SubcategoryUncheckedUpdateManyInput>
    /**
     * Filter which Subcategories to update
     */
    where?: SubcategoryWhereInput
    /**
     * Limit how many Subcategories to update.
     */
    limit?: number
  }

  /**
   * Subcategory updateManyAndReturn
   */
  export type SubcategoryUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Subcategory
     */
    select?: SubcategorySelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Subcategory
     */
    omit?: SubcategoryOmit<ExtArgs> | null
    /**
     * The data used to update Subcategories.
     */
    data: XOR<SubcategoryUpdateManyMutationInput, SubcategoryUncheckedUpdateManyInput>
    /**
     * Filter which Subcategories to update
     */
    where?: SubcategoryWhereInput
    /**
     * Limit how many Subcategories to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SubcategoryIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Subcategory upsert
   */
  export type SubcategoryUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Subcategory
     */
    select?: SubcategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Subcategory
     */
    omit?: SubcategoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SubcategoryInclude<ExtArgs> | null
    /**
     * The filter to search for the Subcategory to update in case it exists.
     */
    where: SubcategoryWhereUniqueInput
    /**
     * In case the Subcategory found by the `where` argument doesn't exist, create a new Subcategory with this data.
     */
    create: XOR<SubcategoryCreateInput, SubcategoryUncheckedCreateInput>
    /**
     * In case the Subcategory was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SubcategoryUpdateInput, SubcategoryUncheckedUpdateInput>
  }

  /**
   * Subcategory delete
   */
  export type SubcategoryDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Subcategory
     */
    select?: SubcategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Subcategory
     */
    omit?: SubcategoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SubcategoryInclude<ExtArgs> | null
    /**
     * Filter which Subcategory to delete.
     */
    where: SubcategoryWhereUniqueInput
  }

  /**
   * Subcategory deleteMany
   */
  export type SubcategoryDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Subcategories to delete
     */
    where?: SubcategoryWhereInput
    /**
     * Limit how many Subcategories to delete.
     */
    limit?: number
  }

  /**
   * Subcategory without action
   */
  export type SubcategoryDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Subcategory
     */
    select?: SubcategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Subcategory
     */
    omit?: SubcategoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SubcategoryInclude<ExtArgs> | null
  }


  /**
   * Model Expense
   */

  export type AggregateExpense = {
    _count: ExpenseCountAggregateOutputType | null
    _avg: ExpenseAvgAggregateOutputType | null
    _sum: ExpenseSumAggregateOutputType | null
    _min: ExpenseMinAggregateOutputType | null
    _max: ExpenseMaxAggregateOutputType | null
  }

  export type ExpenseAvgAggregateOutputType = {
    id: number | null
    accountId: number | null
    categoryId: number | null
    amount: number | null
  }

  export type ExpenseSumAggregateOutputType = {
    id: number | null
    accountId: number | null
    categoryId: number | null
    amount: number | null
  }

  export type ExpenseMinAggregateOutputType = {
    id: number | null
    accountId: number | null
    categoryId: number | null
    amount: number | null
    description: string | null
    date: Date | null
  }

  export type ExpenseMaxAggregateOutputType = {
    id: number | null
    accountId: number | null
    categoryId: number | null
    amount: number | null
    description: string | null
    date: Date | null
  }

  export type ExpenseCountAggregateOutputType = {
    id: number
    accountId: number
    categoryId: number
    amount: number
    description: number
    date: number
    _all: number
  }


  export type ExpenseAvgAggregateInputType = {
    id?: true
    accountId?: true
    categoryId?: true
    amount?: true
  }

  export type ExpenseSumAggregateInputType = {
    id?: true
    accountId?: true
    categoryId?: true
    amount?: true
  }

  export type ExpenseMinAggregateInputType = {
    id?: true
    accountId?: true
    categoryId?: true
    amount?: true
    description?: true
    date?: true
  }

  export type ExpenseMaxAggregateInputType = {
    id?: true
    accountId?: true
    categoryId?: true
    amount?: true
    description?: true
    date?: true
  }

  export type ExpenseCountAggregateInputType = {
    id?: true
    accountId?: true
    categoryId?: true
    amount?: true
    description?: true
    date?: true
    _all?: true
  }

  export type ExpenseAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Expense to aggregate.
     */
    where?: ExpenseWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Expenses to fetch.
     */
    orderBy?: ExpenseOrderByWithRelationInput | ExpenseOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ExpenseWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Expenses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Expenses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Expenses
    **/
    _count?: true | ExpenseCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ExpenseAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ExpenseSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ExpenseMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ExpenseMaxAggregateInputType
  }

  export type GetExpenseAggregateType<T extends ExpenseAggregateArgs> = {
        [P in keyof T & keyof AggregateExpense]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateExpense[P]>
      : GetScalarType<T[P], AggregateExpense[P]>
  }




  export type ExpenseGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ExpenseWhereInput
    orderBy?: ExpenseOrderByWithAggregationInput | ExpenseOrderByWithAggregationInput[]
    by: ExpenseScalarFieldEnum[] | ExpenseScalarFieldEnum
    having?: ExpenseScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ExpenseCountAggregateInputType | true
    _avg?: ExpenseAvgAggregateInputType
    _sum?: ExpenseSumAggregateInputType
    _min?: ExpenseMinAggregateInputType
    _max?: ExpenseMaxAggregateInputType
  }

  export type ExpenseGroupByOutputType = {
    id: number
    accountId: number
    categoryId: number
    amount: number
    description: string | null
    date: Date
    _count: ExpenseCountAggregateOutputType | null
    _avg: ExpenseAvgAggregateOutputType | null
    _sum: ExpenseSumAggregateOutputType | null
    _min: ExpenseMinAggregateOutputType | null
    _max: ExpenseMaxAggregateOutputType | null
  }

  type GetExpenseGroupByPayload<T extends ExpenseGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ExpenseGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ExpenseGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ExpenseGroupByOutputType[P]>
            : GetScalarType<T[P], ExpenseGroupByOutputType[P]>
        }
      >
    >


  export type ExpenseSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    accountId?: boolean
    categoryId?: boolean
    amount?: boolean
    description?: boolean
    date?: boolean
    account?: boolean | AccountDefaultArgs<ExtArgs>
    category?: boolean | CategoryDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["expense"]>

  export type ExpenseSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    accountId?: boolean
    categoryId?: boolean
    amount?: boolean
    description?: boolean
    date?: boolean
    account?: boolean | AccountDefaultArgs<ExtArgs>
    category?: boolean | CategoryDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["expense"]>

  export type ExpenseSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    accountId?: boolean
    categoryId?: boolean
    amount?: boolean
    description?: boolean
    date?: boolean
    account?: boolean | AccountDefaultArgs<ExtArgs>
    category?: boolean | CategoryDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["expense"]>

  export type ExpenseSelectScalar = {
    id?: boolean
    accountId?: boolean
    categoryId?: boolean
    amount?: boolean
    description?: boolean
    date?: boolean
  }

  export type ExpenseOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "accountId" | "categoryId" | "amount" | "description" | "date", ExtArgs["result"]["expense"]>
  export type ExpenseInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    account?: boolean | AccountDefaultArgs<ExtArgs>
    category?: boolean | CategoryDefaultArgs<ExtArgs>
  }
  export type ExpenseIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    account?: boolean | AccountDefaultArgs<ExtArgs>
    category?: boolean | CategoryDefaultArgs<ExtArgs>
  }
  export type ExpenseIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    account?: boolean | AccountDefaultArgs<ExtArgs>
    category?: boolean | CategoryDefaultArgs<ExtArgs>
  }

  export type $ExpensePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Expense"
    objects: {
      account: Prisma.$AccountPayload<ExtArgs>
      category: Prisma.$CategoryPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      accountId: number
      categoryId: number
      amount: number
      description: string | null
      date: Date
    }, ExtArgs["result"]["expense"]>
    composites: {}
  }

  type ExpenseGetPayload<S extends boolean | null | undefined | ExpenseDefaultArgs> = $Result.GetResult<Prisma.$ExpensePayload, S>

  type ExpenseCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ExpenseFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ExpenseCountAggregateInputType | true
    }

  export interface ExpenseDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Expense'], meta: { name: 'Expense' } }
    /**
     * Find zero or one Expense that matches the filter.
     * @param {ExpenseFindUniqueArgs} args - Arguments to find a Expense
     * @example
     * // Get one Expense
     * const expense = await prisma.expense.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ExpenseFindUniqueArgs>(args: SelectSubset<T, ExpenseFindUniqueArgs<ExtArgs>>): Prisma__ExpenseClient<$Result.GetResult<Prisma.$ExpensePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Expense that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ExpenseFindUniqueOrThrowArgs} args - Arguments to find a Expense
     * @example
     * // Get one Expense
     * const expense = await prisma.expense.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ExpenseFindUniqueOrThrowArgs>(args: SelectSubset<T, ExpenseFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ExpenseClient<$Result.GetResult<Prisma.$ExpensePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Expense that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExpenseFindFirstArgs} args - Arguments to find a Expense
     * @example
     * // Get one Expense
     * const expense = await prisma.expense.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ExpenseFindFirstArgs>(args?: SelectSubset<T, ExpenseFindFirstArgs<ExtArgs>>): Prisma__ExpenseClient<$Result.GetResult<Prisma.$ExpensePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Expense that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExpenseFindFirstOrThrowArgs} args - Arguments to find a Expense
     * @example
     * // Get one Expense
     * const expense = await prisma.expense.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ExpenseFindFirstOrThrowArgs>(args?: SelectSubset<T, ExpenseFindFirstOrThrowArgs<ExtArgs>>): Prisma__ExpenseClient<$Result.GetResult<Prisma.$ExpensePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Expenses that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExpenseFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Expenses
     * const expenses = await prisma.expense.findMany()
     * 
     * // Get first 10 Expenses
     * const expenses = await prisma.expense.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const expenseWithIdOnly = await prisma.expense.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ExpenseFindManyArgs>(args?: SelectSubset<T, ExpenseFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ExpensePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Expense.
     * @param {ExpenseCreateArgs} args - Arguments to create a Expense.
     * @example
     * // Create one Expense
     * const Expense = await prisma.expense.create({
     *   data: {
     *     // ... data to create a Expense
     *   }
     * })
     * 
     */
    create<T extends ExpenseCreateArgs>(args: SelectSubset<T, ExpenseCreateArgs<ExtArgs>>): Prisma__ExpenseClient<$Result.GetResult<Prisma.$ExpensePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Expenses.
     * @param {ExpenseCreateManyArgs} args - Arguments to create many Expenses.
     * @example
     * // Create many Expenses
     * const expense = await prisma.expense.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ExpenseCreateManyArgs>(args?: SelectSubset<T, ExpenseCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Expenses and returns the data saved in the database.
     * @param {ExpenseCreateManyAndReturnArgs} args - Arguments to create many Expenses.
     * @example
     * // Create many Expenses
     * const expense = await prisma.expense.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Expenses and only return the `id`
     * const expenseWithIdOnly = await prisma.expense.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ExpenseCreateManyAndReturnArgs>(args?: SelectSubset<T, ExpenseCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ExpensePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Expense.
     * @param {ExpenseDeleteArgs} args - Arguments to delete one Expense.
     * @example
     * // Delete one Expense
     * const Expense = await prisma.expense.delete({
     *   where: {
     *     // ... filter to delete one Expense
     *   }
     * })
     * 
     */
    delete<T extends ExpenseDeleteArgs>(args: SelectSubset<T, ExpenseDeleteArgs<ExtArgs>>): Prisma__ExpenseClient<$Result.GetResult<Prisma.$ExpensePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Expense.
     * @param {ExpenseUpdateArgs} args - Arguments to update one Expense.
     * @example
     * // Update one Expense
     * const expense = await prisma.expense.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ExpenseUpdateArgs>(args: SelectSubset<T, ExpenseUpdateArgs<ExtArgs>>): Prisma__ExpenseClient<$Result.GetResult<Prisma.$ExpensePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Expenses.
     * @param {ExpenseDeleteManyArgs} args - Arguments to filter Expenses to delete.
     * @example
     * // Delete a few Expenses
     * const { count } = await prisma.expense.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ExpenseDeleteManyArgs>(args?: SelectSubset<T, ExpenseDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Expenses.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExpenseUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Expenses
     * const expense = await prisma.expense.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ExpenseUpdateManyArgs>(args: SelectSubset<T, ExpenseUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Expenses and returns the data updated in the database.
     * @param {ExpenseUpdateManyAndReturnArgs} args - Arguments to update many Expenses.
     * @example
     * // Update many Expenses
     * const expense = await prisma.expense.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Expenses and only return the `id`
     * const expenseWithIdOnly = await prisma.expense.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ExpenseUpdateManyAndReturnArgs>(args: SelectSubset<T, ExpenseUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ExpensePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Expense.
     * @param {ExpenseUpsertArgs} args - Arguments to update or create a Expense.
     * @example
     * // Update or create a Expense
     * const expense = await prisma.expense.upsert({
     *   create: {
     *     // ... data to create a Expense
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Expense we want to update
     *   }
     * })
     */
    upsert<T extends ExpenseUpsertArgs>(args: SelectSubset<T, ExpenseUpsertArgs<ExtArgs>>): Prisma__ExpenseClient<$Result.GetResult<Prisma.$ExpensePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Expenses.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExpenseCountArgs} args - Arguments to filter Expenses to count.
     * @example
     * // Count the number of Expenses
     * const count = await prisma.expense.count({
     *   where: {
     *     // ... the filter for the Expenses we want to count
     *   }
     * })
    **/
    count<T extends ExpenseCountArgs>(
      args?: Subset<T, ExpenseCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ExpenseCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Expense.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExpenseAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ExpenseAggregateArgs>(args: Subset<T, ExpenseAggregateArgs>): Prisma.PrismaPromise<GetExpenseAggregateType<T>>

    /**
     * Group by Expense.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExpenseGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ExpenseGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ExpenseGroupByArgs['orderBy'] }
        : { orderBy?: ExpenseGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ExpenseGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetExpenseGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Expense model
   */
  readonly fields: ExpenseFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Expense.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ExpenseClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    account<T extends AccountDefaultArgs<ExtArgs> = {}>(args?: Subset<T, AccountDefaultArgs<ExtArgs>>): Prisma__AccountClient<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    category<T extends CategoryDefaultArgs<ExtArgs> = {}>(args?: Subset<T, CategoryDefaultArgs<ExtArgs>>): Prisma__CategoryClient<$Result.GetResult<Prisma.$CategoryPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Expense model
   */
  interface ExpenseFieldRefs {
    readonly id: FieldRef<"Expense", 'Int'>
    readonly accountId: FieldRef<"Expense", 'Int'>
    readonly categoryId: FieldRef<"Expense", 'Int'>
    readonly amount: FieldRef<"Expense", 'Float'>
    readonly description: FieldRef<"Expense", 'String'>
    readonly date: FieldRef<"Expense", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Expense findUnique
   */
  export type ExpenseFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Expense
     */
    select?: ExpenseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Expense
     */
    omit?: ExpenseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExpenseInclude<ExtArgs> | null
    /**
     * Filter, which Expense to fetch.
     */
    where: ExpenseWhereUniqueInput
  }

  /**
   * Expense findUniqueOrThrow
   */
  export type ExpenseFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Expense
     */
    select?: ExpenseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Expense
     */
    omit?: ExpenseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExpenseInclude<ExtArgs> | null
    /**
     * Filter, which Expense to fetch.
     */
    where: ExpenseWhereUniqueInput
  }

  /**
   * Expense findFirst
   */
  export type ExpenseFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Expense
     */
    select?: ExpenseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Expense
     */
    omit?: ExpenseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExpenseInclude<ExtArgs> | null
    /**
     * Filter, which Expense to fetch.
     */
    where?: ExpenseWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Expenses to fetch.
     */
    orderBy?: ExpenseOrderByWithRelationInput | ExpenseOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Expenses.
     */
    cursor?: ExpenseWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Expenses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Expenses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Expenses.
     */
    distinct?: ExpenseScalarFieldEnum | ExpenseScalarFieldEnum[]
  }

  /**
   * Expense findFirstOrThrow
   */
  export type ExpenseFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Expense
     */
    select?: ExpenseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Expense
     */
    omit?: ExpenseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExpenseInclude<ExtArgs> | null
    /**
     * Filter, which Expense to fetch.
     */
    where?: ExpenseWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Expenses to fetch.
     */
    orderBy?: ExpenseOrderByWithRelationInput | ExpenseOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Expenses.
     */
    cursor?: ExpenseWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Expenses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Expenses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Expenses.
     */
    distinct?: ExpenseScalarFieldEnum | ExpenseScalarFieldEnum[]
  }

  /**
   * Expense findMany
   */
  export type ExpenseFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Expense
     */
    select?: ExpenseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Expense
     */
    omit?: ExpenseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExpenseInclude<ExtArgs> | null
    /**
     * Filter, which Expenses to fetch.
     */
    where?: ExpenseWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Expenses to fetch.
     */
    orderBy?: ExpenseOrderByWithRelationInput | ExpenseOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Expenses.
     */
    cursor?: ExpenseWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Expenses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Expenses.
     */
    skip?: number
    distinct?: ExpenseScalarFieldEnum | ExpenseScalarFieldEnum[]
  }

  /**
   * Expense create
   */
  export type ExpenseCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Expense
     */
    select?: ExpenseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Expense
     */
    omit?: ExpenseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExpenseInclude<ExtArgs> | null
    /**
     * The data needed to create a Expense.
     */
    data: XOR<ExpenseCreateInput, ExpenseUncheckedCreateInput>
  }

  /**
   * Expense createMany
   */
  export type ExpenseCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Expenses.
     */
    data: ExpenseCreateManyInput | ExpenseCreateManyInput[]
  }

  /**
   * Expense createManyAndReturn
   */
  export type ExpenseCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Expense
     */
    select?: ExpenseSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Expense
     */
    omit?: ExpenseOmit<ExtArgs> | null
    /**
     * The data used to create many Expenses.
     */
    data: ExpenseCreateManyInput | ExpenseCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExpenseIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Expense update
   */
  export type ExpenseUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Expense
     */
    select?: ExpenseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Expense
     */
    omit?: ExpenseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExpenseInclude<ExtArgs> | null
    /**
     * The data needed to update a Expense.
     */
    data: XOR<ExpenseUpdateInput, ExpenseUncheckedUpdateInput>
    /**
     * Choose, which Expense to update.
     */
    where: ExpenseWhereUniqueInput
  }

  /**
   * Expense updateMany
   */
  export type ExpenseUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Expenses.
     */
    data: XOR<ExpenseUpdateManyMutationInput, ExpenseUncheckedUpdateManyInput>
    /**
     * Filter which Expenses to update
     */
    where?: ExpenseWhereInput
    /**
     * Limit how many Expenses to update.
     */
    limit?: number
  }

  /**
   * Expense updateManyAndReturn
   */
  export type ExpenseUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Expense
     */
    select?: ExpenseSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Expense
     */
    omit?: ExpenseOmit<ExtArgs> | null
    /**
     * The data used to update Expenses.
     */
    data: XOR<ExpenseUpdateManyMutationInput, ExpenseUncheckedUpdateManyInput>
    /**
     * Filter which Expenses to update
     */
    where?: ExpenseWhereInput
    /**
     * Limit how many Expenses to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExpenseIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Expense upsert
   */
  export type ExpenseUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Expense
     */
    select?: ExpenseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Expense
     */
    omit?: ExpenseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExpenseInclude<ExtArgs> | null
    /**
     * The filter to search for the Expense to update in case it exists.
     */
    where: ExpenseWhereUniqueInput
    /**
     * In case the Expense found by the `where` argument doesn't exist, create a new Expense with this data.
     */
    create: XOR<ExpenseCreateInput, ExpenseUncheckedCreateInput>
    /**
     * In case the Expense was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ExpenseUpdateInput, ExpenseUncheckedUpdateInput>
  }

  /**
   * Expense delete
   */
  export type ExpenseDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Expense
     */
    select?: ExpenseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Expense
     */
    omit?: ExpenseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExpenseInclude<ExtArgs> | null
    /**
     * Filter which Expense to delete.
     */
    where: ExpenseWhereUniqueInput
  }

  /**
   * Expense deleteMany
   */
  export type ExpenseDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Expenses to delete
     */
    where?: ExpenseWhereInput
    /**
     * Limit how many Expenses to delete.
     */
    limit?: number
  }

  /**
   * Expense without action
   */
  export type ExpenseDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Expense
     */
    select?: ExpenseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Expense
     */
    omit?: ExpenseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExpenseInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const UserScalarFieldEnum: {
    id: 'id',
    createdAt: 'createdAt'
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const AccountScalarFieldEnum: {
    id: 'id',
    name: 'name',
    ownerId: 'ownerId',
    createdAt: 'createdAt'
  };

  export type AccountScalarFieldEnum = (typeof AccountScalarFieldEnum)[keyof typeof AccountScalarFieldEnum]


  export const AccountInvitationScalarFieldEnum: {
    id: 'id',
    code: 'code',
    accountId: 'accountId',
    createdBy: 'createdBy',
    expiresAt: 'expiresAt',
    usedAt: 'usedAt',
    usedBy: 'usedBy'
  };

  export type AccountInvitationScalarFieldEnum = (typeof AccountInvitationScalarFieldEnum)[keyof typeof AccountInvitationScalarFieldEnum]


  export const AccountUserScalarFieldEnum: {
    userId: 'userId',
    accountId: 'accountId',
    joinedAt: 'joinedAt'
  };

  export type AccountUserScalarFieldEnum = (typeof AccountUserScalarFieldEnum)[keyof typeof AccountUserScalarFieldEnum]


  export const CategoryScalarFieldEnum: {
    id: 'id',
    accountId: 'accountId',
    name: 'name',
    deletedAt: 'deletedAt'
  };

  export type CategoryScalarFieldEnum = (typeof CategoryScalarFieldEnum)[keyof typeof CategoryScalarFieldEnum]


  export const SubcategoryScalarFieldEnum: {
    id: 'id',
    categoryId: 'categoryId',
    name: 'name',
    deletedAt: 'deletedAt'
  };

  export type SubcategoryScalarFieldEnum = (typeof SubcategoryScalarFieldEnum)[keyof typeof SubcategoryScalarFieldEnum]


  export const ExpenseScalarFieldEnum: {
    id: 'id',
    accountId: 'accountId',
    categoryId: 'categoryId',
    amount: 'amount',
    description: 'description',
    date: 'date'
  };

  export type ExpenseScalarFieldEnum = (typeof ExpenseScalarFieldEnum)[keyof typeof ExpenseScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'BigInt'
   */
  export type BigIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'BigInt'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    
  /**
   * Deep Input Types
   */


  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    id?: BigIntFilter<"User"> | bigint | number
    createdAt?: DateTimeFilter<"User"> | Date | string
    ownedAccounts?: AccountListRelationFilter
    accounts?: AccountUserListRelationFilter
  }

  export type UserOrderByWithRelationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    ownedAccounts?: AccountOrderByRelationAggregateInput
    accounts?: AccountUserOrderByRelationAggregateInput
  }

  export type UserWhereUniqueInput = Prisma.AtLeast<{
    id?: bigint | number
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    createdAt?: DateTimeFilter<"User"> | Date | string
    ownedAccounts?: AccountListRelationFilter
    accounts?: AccountUserListRelationFilter
  }, "id">

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    _count?: UserCountOrderByAggregateInput
    _avg?: UserAvgOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
    _sum?: UserSumOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    OR?: UserScalarWhereWithAggregatesInput[]
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    id?: BigIntWithAggregatesFilter<"User"> | bigint | number
    createdAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
  }

  export type AccountWhereInput = {
    AND?: AccountWhereInput | AccountWhereInput[]
    OR?: AccountWhereInput[]
    NOT?: AccountWhereInput | AccountWhereInput[]
    id?: IntFilter<"Account"> | number
    name?: StringFilter<"Account"> | string
    ownerId?: BigIntFilter<"Account"> | bigint | number
    createdAt?: DateTimeFilter<"Account"> | Date | string
    owner?: XOR<UserScalarRelationFilter, UserWhereInput>
    users?: AccountUserListRelationFilter
    categories?: CategoryListRelationFilter
    expenses?: ExpenseListRelationFilter
    invitations?: AccountInvitationListRelationFilter
  }

  export type AccountOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    ownerId?: SortOrder
    createdAt?: SortOrder
    owner?: UserOrderByWithRelationInput
    users?: AccountUserOrderByRelationAggregateInput
    categories?: CategoryOrderByRelationAggregateInput
    expenses?: ExpenseOrderByRelationAggregateInput
    invitations?: AccountInvitationOrderByRelationAggregateInput
  }

  export type AccountWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: AccountWhereInput | AccountWhereInput[]
    OR?: AccountWhereInput[]
    NOT?: AccountWhereInput | AccountWhereInput[]
    name?: StringFilter<"Account"> | string
    ownerId?: BigIntFilter<"Account"> | bigint | number
    createdAt?: DateTimeFilter<"Account"> | Date | string
    owner?: XOR<UserScalarRelationFilter, UserWhereInput>
    users?: AccountUserListRelationFilter
    categories?: CategoryListRelationFilter
    expenses?: ExpenseListRelationFilter
    invitations?: AccountInvitationListRelationFilter
  }, "id">

  export type AccountOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    ownerId?: SortOrder
    createdAt?: SortOrder
    _count?: AccountCountOrderByAggregateInput
    _avg?: AccountAvgOrderByAggregateInput
    _max?: AccountMaxOrderByAggregateInput
    _min?: AccountMinOrderByAggregateInput
    _sum?: AccountSumOrderByAggregateInput
  }

  export type AccountScalarWhereWithAggregatesInput = {
    AND?: AccountScalarWhereWithAggregatesInput | AccountScalarWhereWithAggregatesInput[]
    OR?: AccountScalarWhereWithAggregatesInput[]
    NOT?: AccountScalarWhereWithAggregatesInput | AccountScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Account"> | number
    name?: StringWithAggregatesFilter<"Account"> | string
    ownerId?: BigIntWithAggregatesFilter<"Account"> | bigint | number
    createdAt?: DateTimeWithAggregatesFilter<"Account"> | Date | string
  }

  export type AccountInvitationWhereInput = {
    AND?: AccountInvitationWhereInput | AccountInvitationWhereInput[]
    OR?: AccountInvitationWhereInput[]
    NOT?: AccountInvitationWhereInput | AccountInvitationWhereInput[]
    id?: IntFilter<"AccountInvitation"> | number
    code?: StringFilter<"AccountInvitation"> | string
    accountId?: IntFilter<"AccountInvitation"> | number
    createdBy?: BigIntFilter<"AccountInvitation"> | bigint | number
    expiresAt?: DateTimeFilter<"AccountInvitation"> | Date | string
    usedAt?: DateTimeNullableFilter<"AccountInvitation"> | Date | string | null
    usedBy?: BigIntNullableFilter<"AccountInvitation"> | bigint | number | null
    account?: XOR<AccountScalarRelationFilter, AccountWhereInput>
  }

  export type AccountInvitationOrderByWithRelationInput = {
    id?: SortOrder
    code?: SortOrder
    accountId?: SortOrder
    createdBy?: SortOrder
    expiresAt?: SortOrder
    usedAt?: SortOrderInput | SortOrder
    usedBy?: SortOrderInput | SortOrder
    account?: AccountOrderByWithRelationInput
  }

  export type AccountInvitationWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    code?: string
    AND?: AccountInvitationWhereInput | AccountInvitationWhereInput[]
    OR?: AccountInvitationWhereInput[]
    NOT?: AccountInvitationWhereInput | AccountInvitationWhereInput[]
    accountId?: IntFilter<"AccountInvitation"> | number
    createdBy?: BigIntFilter<"AccountInvitation"> | bigint | number
    expiresAt?: DateTimeFilter<"AccountInvitation"> | Date | string
    usedAt?: DateTimeNullableFilter<"AccountInvitation"> | Date | string | null
    usedBy?: BigIntNullableFilter<"AccountInvitation"> | bigint | number | null
    account?: XOR<AccountScalarRelationFilter, AccountWhereInput>
  }, "id" | "code">

  export type AccountInvitationOrderByWithAggregationInput = {
    id?: SortOrder
    code?: SortOrder
    accountId?: SortOrder
    createdBy?: SortOrder
    expiresAt?: SortOrder
    usedAt?: SortOrderInput | SortOrder
    usedBy?: SortOrderInput | SortOrder
    _count?: AccountInvitationCountOrderByAggregateInput
    _avg?: AccountInvitationAvgOrderByAggregateInput
    _max?: AccountInvitationMaxOrderByAggregateInput
    _min?: AccountInvitationMinOrderByAggregateInput
    _sum?: AccountInvitationSumOrderByAggregateInput
  }

  export type AccountInvitationScalarWhereWithAggregatesInput = {
    AND?: AccountInvitationScalarWhereWithAggregatesInput | AccountInvitationScalarWhereWithAggregatesInput[]
    OR?: AccountInvitationScalarWhereWithAggregatesInput[]
    NOT?: AccountInvitationScalarWhereWithAggregatesInput | AccountInvitationScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"AccountInvitation"> | number
    code?: StringWithAggregatesFilter<"AccountInvitation"> | string
    accountId?: IntWithAggregatesFilter<"AccountInvitation"> | number
    createdBy?: BigIntWithAggregatesFilter<"AccountInvitation"> | bigint | number
    expiresAt?: DateTimeWithAggregatesFilter<"AccountInvitation"> | Date | string
    usedAt?: DateTimeNullableWithAggregatesFilter<"AccountInvitation"> | Date | string | null
    usedBy?: BigIntNullableWithAggregatesFilter<"AccountInvitation"> | bigint | number | null
  }

  export type AccountUserWhereInput = {
    AND?: AccountUserWhereInput | AccountUserWhereInput[]
    OR?: AccountUserWhereInput[]
    NOT?: AccountUserWhereInput | AccountUserWhereInput[]
    userId?: BigIntFilter<"AccountUser"> | bigint | number
    accountId?: IntFilter<"AccountUser"> | number
    joinedAt?: DateTimeFilter<"AccountUser"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    account?: XOR<AccountScalarRelationFilter, AccountWhereInput>
  }

  export type AccountUserOrderByWithRelationInput = {
    userId?: SortOrder
    accountId?: SortOrder
    joinedAt?: SortOrder
    user?: UserOrderByWithRelationInput
    account?: AccountOrderByWithRelationInput
  }

  export type AccountUserWhereUniqueInput = Prisma.AtLeast<{
    userId_accountId?: AccountUserUserIdAccountIdCompoundUniqueInput
    AND?: AccountUserWhereInput | AccountUserWhereInput[]
    OR?: AccountUserWhereInput[]
    NOT?: AccountUserWhereInput | AccountUserWhereInput[]
    userId?: BigIntFilter<"AccountUser"> | bigint | number
    accountId?: IntFilter<"AccountUser"> | number
    joinedAt?: DateTimeFilter<"AccountUser"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    account?: XOR<AccountScalarRelationFilter, AccountWhereInput>
  }, "userId_accountId">

  export type AccountUserOrderByWithAggregationInput = {
    userId?: SortOrder
    accountId?: SortOrder
    joinedAt?: SortOrder
    _count?: AccountUserCountOrderByAggregateInput
    _avg?: AccountUserAvgOrderByAggregateInput
    _max?: AccountUserMaxOrderByAggregateInput
    _min?: AccountUserMinOrderByAggregateInput
    _sum?: AccountUserSumOrderByAggregateInput
  }

  export type AccountUserScalarWhereWithAggregatesInput = {
    AND?: AccountUserScalarWhereWithAggregatesInput | AccountUserScalarWhereWithAggregatesInput[]
    OR?: AccountUserScalarWhereWithAggregatesInput[]
    NOT?: AccountUserScalarWhereWithAggregatesInput | AccountUserScalarWhereWithAggregatesInput[]
    userId?: BigIntWithAggregatesFilter<"AccountUser"> | bigint | number
    accountId?: IntWithAggregatesFilter<"AccountUser"> | number
    joinedAt?: DateTimeWithAggregatesFilter<"AccountUser"> | Date | string
  }

  export type CategoryWhereInput = {
    AND?: CategoryWhereInput | CategoryWhereInput[]
    OR?: CategoryWhereInput[]
    NOT?: CategoryWhereInput | CategoryWhereInput[]
    id?: IntFilter<"Category"> | number
    accountId?: IntFilter<"Category"> | number
    name?: StringFilter<"Category"> | string
    deletedAt?: DateTimeNullableFilter<"Category"> | Date | string | null
    account?: XOR<AccountScalarRelationFilter, AccountWhereInput>
    expenses?: ExpenseListRelationFilter
    subcategories?: SubcategoryListRelationFilter
  }

  export type CategoryOrderByWithRelationInput = {
    id?: SortOrder
    accountId?: SortOrder
    name?: SortOrder
    deletedAt?: SortOrderInput | SortOrder
    account?: AccountOrderByWithRelationInput
    expenses?: ExpenseOrderByRelationAggregateInput
    subcategories?: SubcategoryOrderByRelationAggregateInput
  }

  export type CategoryWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: CategoryWhereInput | CategoryWhereInput[]
    OR?: CategoryWhereInput[]
    NOT?: CategoryWhereInput | CategoryWhereInput[]
    accountId?: IntFilter<"Category"> | number
    name?: StringFilter<"Category"> | string
    deletedAt?: DateTimeNullableFilter<"Category"> | Date | string | null
    account?: XOR<AccountScalarRelationFilter, AccountWhereInput>
    expenses?: ExpenseListRelationFilter
    subcategories?: SubcategoryListRelationFilter
  }, "id">

  export type CategoryOrderByWithAggregationInput = {
    id?: SortOrder
    accountId?: SortOrder
    name?: SortOrder
    deletedAt?: SortOrderInput | SortOrder
    _count?: CategoryCountOrderByAggregateInput
    _avg?: CategoryAvgOrderByAggregateInput
    _max?: CategoryMaxOrderByAggregateInput
    _min?: CategoryMinOrderByAggregateInput
    _sum?: CategorySumOrderByAggregateInput
  }

  export type CategoryScalarWhereWithAggregatesInput = {
    AND?: CategoryScalarWhereWithAggregatesInput | CategoryScalarWhereWithAggregatesInput[]
    OR?: CategoryScalarWhereWithAggregatesInput[]
    NOT?: CategoryScalarWhereWithAggregatesInput | CategoryScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Category"> | number
    accountId?: IntWithAggregatesFilter<"Category"> | number
    name?: StringWithAggregatesFilter<"Category"> | string
    deletedAt?: DateTimeNullableWithAggregatesFilter<"Category"> | Date | string | null
  }

  export type SubcategoryWhereInput = {
    AND?: SubcategoryWhereInput | SubcategoryWhereInput[]
    OR?: SubcategoryWhereInput[]
    NOT?: SubcategoryWhereInput | SubcategoryWhereInput[]
    id?: IntFilter<"Subcategory"> | number
    categoryId?: IntFilter<"Subcategory"> | number
    name?: StringFilter<"Subcategory"> | string
    deletedAt?: DateTimeNullableFilter<"Subcategory"> | Date | string | null
    category?: XOR<CategoryScalarRelationFilter, CategoryWhereInput>
  }

  export type SubcategoryOrderByWithRelationInput = {
    id?: SortOrder
    categoryId?: SortOrder
    name?: SortOrder
    deletedAt?: SortOrderInput | SortOrder
    category?: CategoryOrderByWithRelationInput
  }

  export type SubcategoryWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: SubcategoryWhereInput | SubcategoryWhereInput[]
    OR?: SubcategoryWhereInput[]
    NOT?: SubcategoryWhereInput | SubcategoryWhereInput[]
    categoryId?: IntFilter<"Subcategory"> | number
    name?: StringFilter<"Subcategory"> | string
    deletedAt?: DateTimeNullableFilter<"Subcategory"> | Date | string | null
    category?: XOR<CategoryScalarRelationFilter, CategoryWhereInput>
  }, "id">

  export type SubcategoryOrderByWithAggregationInput = {
    id?: SortOrder
    categoryId?: SortOrder
    name?: SortOrder
    deletedAt?: SortOrderInput | SortOrder
    _count?: SubcategoryCountOrderByAggregateInput
    _avg?: SubcategoryAvgOrderByAggregateInput
    _max?: SubcategoryMaxOrderByAggregateInput
    _min?: SubcategoryMinOrderByAggregateInput
    _sum?: SubcategorySumOrderByAggregateInput
  }

  export type SubcategoryScalarWhereWithAggregatesInput = {
    AND?: SubcategoryScalarWhereWithAggregatesInput | SubcategoryScalarWhereWithAggregatesInput[]
    OR?: SubcategoryScalarWhereWithAggregatesInput[]
    NOT?: SubcategoryScalarWhereWithAggregatesInput | SubcategoryScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Subcategory"> | number
    categoryId?: IntWithAggregatesFilter<"Subcategory"> | number
    name?: StringWithAggregatesFilter<"Subcategory"> | string
    deletedAt?: DateTimeNullableWithAggregatesFilter<"Subcategory"> | Date | string | null
  }

  export type ExpenseWhereInput = {
    AND?: ExpenseWhereInput | ExpenseWhereInput[]
    OR?: ExpenseWhereInput[]
    NOT?: ExpenseWhereInput | ExpenseWhereInput[]
    id?: IntFilter<"Expense"> | number
    accountId?: IntFilter<"Expense"> | number
    categoryId?: IntFilter<"Expense"> | number
    amount?: FloatFilter<"Expense"> | number
    description?: StringNullableFilter<"Expense"> | string | null
    date?: DateTimeFilter<"Expense"> | Date | string
    account?: XOR<AccountScalarRelationFilter, AccountWhereInput>
    category?: XOR<CategoryScalarRelationFilter, CategoryWhereInput>
  }

  export type ExpenseOrderByWithRelationInput = {
    id?: SortOrder
    accountId?: SortOrder
    categoryId?: SortOrder
    amount?: SortOrder
    description?: SortOrderInput | SortOrder
    date?: SortOrder
    account?: AccountOrderByWithRelationInput
    category?: CategoryOrderByWithRelationInput
  }

  export type ExpenseWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: ExpenseWhereInput | ExpenseWhereInput[]
    OR?: ExpenseWhereInput[]
    NOT?: ExpenseWhereInput | ExpenseWhereInput[]
    accountId?: IntFilter<"Expense"> | number
    categoryId?: IntFilter<"Expense"> | number
    amount?: FloatFilter<"Expense"> | number
    description?: StringNullableFilter<"Expense"> | string | null
    date?: DateTimeFilter<"Expense"> | Date | string
    account?: XOR<AccountScalarRelationFilter, AccountWhereInput>
    category?: XOR<CategoryScalarRelationFilter, CategoryWhereInput>
  }, "id">

  export type ExpenseOrderByWithAggregationInput = {
    id?: SortOrder
    accountId?: SortOrder
    categoryId?: SortOrder
    amount?: SortOrder
    description?: SortOrderInput | SortOrder
    date?: SortOrder
    _count?: ExpenseCountOrderByAggregateInput
    _avg?: ExpenseAvgOrderByAggregateInput
    _max?: ExpenseMaxOrderByAggregateInput
    _min?: ExpenseMinOrderByAggregateInput
    _sum?: ExpenseSumOrderByAggregateInput
  }

  export type ExpenseScalarWhereWithAggregatesInput = {
    AND?: ExpenseScalarWhereWithAggregatesInput | ExpenseScalarWhereWithAggregatesInput[]
    OR?: ExpenseScalarWhereWithAggregatesInput[]
    NOT?: ExpenseScalarWhereWithAggregatesInput | ExpenseScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Expense"> | number
    accountId?: IntWithAggregatesFilter<"Expense"> | number
    categoryId?: IntWithAggregatesFilter<"Expense"> | number
    amount?: FloatWithAggregatesFilter<"Expense"> | number
    description?: StringNullableWithAggregatesFilter<"Expense"> | string | null
    date?: DateTimeWithAggregatesFilter<"Expense"> | Date | string
  }

  export type UserCreateInput = {
    id: bigint | number
    createdAt?: Date | string
    ownedAccounts?: AccountCreateNestedManyWithoutOwnerInput
    accounts?: AccountUserCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateInput = {
    id: bigint | number
    createdAt?: Date | string
    ownedAccounts?: AccountUncheckedCreateNestedManyWithoutOwnerInput
    accounts?: AccountUserUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserUpdateInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    ownedAccounts?: AccountUpdateManyWithoutOwnerNestedInput
    accounts?: AccountUserUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    ownedAccounts?: AccountUncheckedUpdateManyWithoutOwnerNestedInput
    accounts?: AccountUserUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateManyInput = {
    id: bigint | number
    createdAt?: Date | string
  }

  export type UserUpdateManyMutationInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUncheckedUpdateManyInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AccountCreateInput = {
    name: string
    createdAt?: Date | string
    owner: UserCreateNestedOneWithoutOwnedAccountsInput
    users?: AccountUserCreateNestedManyWithoutAccountInput
    categories?: CategoryCreateNestedManyWithoutAccountInput
    expenses?: ExpenseCreateNestedManyWithoutAccountInput
    invitations?: AccountInvitationCreateNestedManyWithoutAccountInput
  }

  export type AccountUncheckedCreateInput = {
    id?: number
    name: string
    ownerId: bigint | number
    createdAt?: Date | string
    users?: AccountUserUncheckedCreateNestedManyWithoutAccountInput
    categories?: CategoryUncheckedCreateNestedManyWithoutAccountInput
    expenses?: ExpenseUncheckedCreateNestedManyWithoutAccountInput
    invitations?: AccountInvitationUncheckedCreateNestedManyWithoutAccountInput
  }

  export type AccountUpdateInput = {
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    owner?: UserUpdateOneRequiredWithoutOwnedAccountsNestedInput
    users?: AccountUserUpdateManyWithoutAccountNestedInput
    categories?: CategoryUpdateManyWithoutAccountNestedInput
    expenses?: ExpenseUpdateManyWithoutAccountNestedInput
    invitations?: AccountInvitationUpdateManyWithoutAccountNestedInput
  }

  export type AccountUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    ownerId?: BigIntFieldUpdateOperationsInput | bigint | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    users?: AccountUserUncheckedUpdateManyWithoutAccountNestedInput
    categories?: CategoryUncheckedUpdateManyWithoutAccountNestedInput
    expenses?: ExpenseUncheckedUpdateManyWithoutAccountNestedInput
    invitations?: AccountInvitationUncheckedUpdateManyWithoutAccountNestedInput
  }

  export type AccountCreateManyInput = {
    id?: number
    name: string
    ownerId: bigint | number
    createdAt?: Date | string
  }

  export type AccountUpdateManyMutationInput = {
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AccountUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    ownerId?: BigIntFieldUpdateOperationsInput | bigint | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AccountInvitationCreateInput = {
    code: string
    createdBy: bigint | number
    expiresAt: Date | string
    usedAt?: Date | string | null
    usedBy?: bigint | number | null
    account: AccountCreateNestedOneWithoutInvitationsInput
  }

  export type AccountInvitationUncheckedCreateInput = {
    id?: number
    code: string
    accountId: number
    createdBy: bigint | number
    expiresAt: Date | string
    usedAt?: Date | string | null
    usedBy?: bigint | number | null
  }

  export type AccountInvitationUpdateInput = {
    code?: StringFieldUpdateOperationsInput | string
    createdBy?: BigIntFieldUpdateOperationsInput | bigint | number
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    usedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    usedBy?: NullableBigIntFieldUpdateOperationsInput | bigint | number | null
    account?: AccountUpdateOneRequiredWithoutInvitationsNestedInput
  }

  export type AccountInvitationUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    code?: StringFieldUpdateOperationsInput | string
    accountId?: IntFieldUpdateOperationsInput | number
    createdBy?: BigIntFieldUpdateOperationsInput | bigint | number
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    usedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    usedBy?: NullableBigIntFieldUpdateOperationsInput | bigint | number | null
  }

  export type AccountInvitationCreateManyInput = {
    id?: number
    code: string
    accountId: number
    createdBy: bigint | number
    expiresAt: Date | string
    usedAt?: Date | string | null
    usedBy?: bigint | number | null
  }

  export type AccountInvitationUpdateManyMutationInput = {
    code?: StringFieldUpdateOperationsInput | string
    createdBy?: BigIntFieldUpdateOperationsInput | bigint | number
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    usedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    usedBy?: NullableBigIntFieldUpdateOperationsInput | bigint | number | null
  }

  export type AccountInvitationUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    code?: StringFieldUpdateOperationsInput | string
    accountId?: IntFieldUpdateOperationsInput | number
    createdBy?: BigIntFieldUpdateOperationsInput | bigint | number
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    usedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    usedBy?: NullableBigIntFieldUpdateOperationsInput | bigint | number | null
  }

  export type AccountUserCreateInput = {
    joinedAt?: Date | string
    user: UserCreateNestedOneWithoutAccountsInput
    account: AccountCreateNestedOneWithoutUsersInput
  }

  export type AccountUserUncheckedCreateInput = {
    userId: bigint | number
    accountId: number
    joinedAt?: Date | string
  }

  export type AccountUserUpdateInput = {
    joinedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutAccountsNestedInput
    account?: AccountUpdateOneRequiredWithoutUsersNestedInput
  }

  export type AccountUserUncheckedUpdateInput = {
    userId?: BigIntFieldUpdateOperationsInput | bigint | number
    accountId?: IntFieldUpdateOperationsInput | number
    joinedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AccountUserCreateManyInput = {
    userId: bigint | number
    accountId: number
    joinedAt?: Date | string
  }

  export type AccountUserUpdateManyMutationInput = {
    joinedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AccountUserUncheckedUpdateManyInput = {
    userId?: BigIntFieldUpdateOperationsInput | bigint | number
    accountId?: IntFieldUpdateOperationsInput | number
    joinedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CategoryCreateInput = {
    name: string
    deletedAt?: Date | string | null
    account: AccountCreateNestedOneWithoutCategoriesInput
    expenses?: ExpenseCreateNestedManyWithoutCategoryInput
    subcategories?: SubcategoryCreateNestedManyWithoutCategoryInput
  }

  export type CategoryUncheckedCreateInput = {
    id?: number
    accountId: number
    name: string
    deletedAt?: Date | string | null
    expenses?: ExpenseUncheckedCreateNestedManyWithoutCategoryInput
    subcategories?: SubcategoryUncheckedCreateNestedManyWithoutCategoryInput
  }

  export type CategoryUpdateInput = {
    name?: StringFieldUpdateOperationsInput | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    account?: AccountUpdateOneRequiredWithoutCategoriesNestedInput
    expenses?: ExpenseUpdateManyWithoutCategoryNestedInput
    subcategories?: SubcategoryUpdateManyWithoutCategoryNestedInput
  }

  export type CategoryUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    accountId?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    expenses?: ExpenseUncheckedUpdateManyWithoutCategoryNestedInput
    subcategories?: SubcategoryUncheckedUpdateManyWithoutCategoryNestedInput
  }

  export type CategoryCreateManyInput = {
    id?: number
    accountId: number
    name: string
    deletedAt?: Date | string | null
  }

  export type CategoryUpdateManyMutationInput = {
    name?: StringFieldUpdateOperationsInput | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type CategoryUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    accountId?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type SubcategoryCreateInput = {
    name: string
    deletedAt?: Date | string | null
    category: CategoryCreateNestedOneWithoutSubcategoriesInput
  }

  export type SubcategoryUncheckedCreateInput = {
    id?: number
    categoryId: number
    name: string
    deletedAt?: Date | string | null
  }

  export type SubcategoryUpdateInput = {
    name?: StringFieldUpdateOperationsInput | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    category?: CategoryUpdateOneRequiredWithoutSubcategoriesNestedInput
  }

  export type SubcategoryUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    categoryId?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type SubcategoryCreateManyInput = {
    id?: number
    categoryId: number
    name: string
    deletedAt?: Date | string | null
  }

  export type SubcategoryUpdateManyMutationInput = {
    name?: StringFieldUpdateOperationsInput | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type SubcategoryUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    categoryId?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type ExpenseCreateInput = {
    amount: number
    description?: string | null
    date: Date | string
    account: AccountCreateNestedOneWithoutExpensesInput
    category: CategoryCreateNestedOneWithoutExpensesInput
  }

  export type ExpenseUncheckedCreateInput = {
    id?: number
    accountId: number
    categoryId: number
    amount: number
    description?: string | null
    date: Date | string
  }

  export type ExpenseUpdateInput = {
    amount?: FloatFieldUpdateOperationsInput | number
    description?: NullableStringFieldUpdateOperationsInput | string | null
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    account?: AccountUpdateOneRequiredWithoutExpensesNestedInput
    category?: CategoryUpdateOneRequiredWithoutExpensesNestedInput
  }

  export type ExpenseUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    accountId?: IntFieldUpdateOperationsInput | number
    categoryId?: IntFieldUpdateOperationsInput | number
    amount?: FloatFieldUpdateOperationsInput | number
    description?: NullableStringFieldUpdateOperationsInput | string | null
    date?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ExpenseCreateManyInput = {
    id?: number
    accountId: number
    categoryId: number
    amount: number
    description?: string | null
    date: Date | string
  }

  export type ExpenseUpdateManyMutationInput = {
    amount?: FloatFieldUpdateOperationsInput | number
    description?: NullableStringFieldUpdateOperationsInput | string | null
    date?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ExpenseUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    accountId?: IntFieldUpdateOperationsInput | number
    categoryId?: IntFieldUpdateOperationsInput | number
    amount?: FloatFieldUpdateOperationsInput | number
    description?: NullableStringFieldUpdateOperationsInput | string | null
    date?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BigIntFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    in?: bigint[] | number[]
    notIn?: bigint[] | number[]
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntFilter<$PrismaModel> | bigint | number
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type AccountListRelationFilter = {
    every?: AccountWhereInput
    some?: AccountWhereInput
    none?: AccountWhereInput
  }

  export type AccountUserListRelationFilter = {
    every?: AccountUserWhereInput
    some?: AccountUserWhereInput
    none?: AccountUserWhereInput
  }

  export type AccountOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type AccountUserOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
  }

  export type UserAvgOrderByAggregateInput = {
    id?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
  }

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
  }

  export type UserSumOrderByAggregateInput = {
    id?: SortOrder
  }

  export type BigIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    in?: bigint[] | number[]
    notIn?: bigint[] | number[]
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntWithAggregatesFilter<$PrismaModel> | bigint | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedBigIntFilter<$PrismaModel>
    _min?: NestedBigIntFilter<$PrismaModel>
    _max?: NestedBigIntFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type UserScalarRelationFilter = {
    is?: UserWhereInput
    isNot?: UserWhereInput
  }

  export type CategoryListRelationFilter = {
    every?: CategoryWhereInput
    some?: CategoryWhereInput
    none?: CategoryWhereInput
  }

  export type ExpenseListRelationFilter = {
    every?: ExpenseWhereInput
    some?: ExpenseWhereInput
    none?: ExpenseWhereInput
  }

  export type AccountInvitationListRelationFilter = {
    every?: AccountInvitationWhereInput
    some?: AccountInvitationWhereInput
    none?: AccountInvitationWhereInput
  }

  export type CategoryOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ExpenseOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type AccountInvitationOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type AccountCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    ownerId?: SortOrder
    createdAt?: SortOrder
  }

  export type AccountAvgOrderByAggregateInput = {
    id?: SortOrder
    ownerId?: SortOrder
  }

  export type AccountMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    ownerId?: SortOrder
    createdAt?: SortOrder
  }

  export type AccountMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    ownerId?: SortOrder
    createdAt?: SortOrder
  }

  export type AccountSumOrderByAggregateInput = {
    id?: SortOrder
    ownerId?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type BigIntNullableFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel> | null
    in?: bigint[] | number[] | null
    notIn?: bigint[] | number[] | null
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntNullableFilter<$PrismaModel> | bigint | number | null
  }

  export type AccountScalarRelationFilter = {
    is?: AccountWhereInput
    isNot?: AccountWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type AccountInvitationCountOrderByAggregateInput = {
    id?: SortOrder
    code?: SortOrder
    accountId?: SortOrder
    createdBy?: SortOrder
    expiresAt?: SortOrder
    usedAt?: SortOrder
    usedBy?: SortOrder
  }

  export type AccountInvitationAvgOrderByAggregateInput = {
    id?: SortOrder
    accountId?: SortOrder
    createdBy?: SortOrder
    usedBy?: SortOrder
  }

  export type AccountInvitationMaxOrderByAggregateInput = {
    id?: SortOrder
    code?: SortOrder
    accountId?: SortOrder
    createdBy?: SortOrder
    expiresAt?: SortOrder
    usedAt?: SortOrder
    usedBy?: SortOrder
  }

  export type AccountInvitationMinOrderByAggregateInput = {
    id?: SortOrder
    code?: SortOrder
    accountId?: SortOrder
    createdBy?: SortOrder
    expiresAt?: SortOrder
    usedAt?: SortOrder
    usedBy?: SortOrder
  }

  export type AccountInvitationSumOrderByAggregateInput = {
    id?: SortOrder
    accountId?: SortOrder
    createdBy?: SortOrder
    usedBy?: SortOrder
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type BigIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel> | null
    in?: bigint[] | number[] | null
    notIn?: bigint[] | number[] | null
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntNullableWithAggregatesFilter<$PrismaModel> | bigint | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedBigIntNullableFilter<$PrismaModel>
    _min?: NestedBigIntNullableFilter<$PrismaModel>
    _max?: NestedBigIntNullableFilter<$PrismaModel>
  }

  export type AccountUserUserIdAccountIdCompoundUniqueInput = {
    userId: bigint | number
    accountId: number
  }

  export type AccountUserCountOrderByAggregateInput = {
    userId?: SortOrder
    accountId?: SortOrder
    joinedAt?: SortOrder
  }

  export type AccountUserAvgOrderByAggregateInput = {
    userId?: SortOrder
    accountId?: SortOrder
  }

  export type AccountUserMaxOrderByAggregateInput = {
    userId?: SortOrder
    accountId?: SortOrder
    joinedAt?: SortOrder
  }

  export type AccountUserMinOrderByAggregateInput = {
    userId?: SortOrder
    accountId?: SortOrder
    joinedAt?: SortOrder
  }

  export type AccountUserSumOrderByAggregateInput = {
    userId?: SortOrder
    accountId?: SortOrder
  }

  export type SubcategoryListRelationFilter = {
    every?: SubcategoryWhereInput
    some?: SubcategoryWhereInput
    none?: SubcategoryWhereInput
  }

  export type SubcategoryOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type CategoryCountOrderByAggregateInput = {
    id?: SortOrder
    accountId?: SortOrder
    name?: SortOrder
    deletedAt?: SortOrder
  }

  export type CategoryAvgOrderByAggregateInput = {
    id?: SortOrder
    accountId?: SortOrder
  }

  export type CategoryMaxOrderByAggregateInput = {
    id?: SortOrder
    accountId?: SortOrder
    name?: SortOrder
    deletedAt?: SortOrder
  }

  export type CategoryMinOrderByAggregateInput = {
    id?: SortOrder
    accountId?: SortOrder
    name?: SortOrder
    deletedAt?: SortOrder
  }

  export type CategorySumOrderByAggregateInput = {
    id?: SortOrder
    accountId?: SortOrder
  }

  export type CategoryScalarRelationFilter = {
    is?: CategoryWhereInput
    isNot?: CategoryWhereInput
  }

  export type SubcategoryCountOrderByAggregateInput = {
    id?: SortOrder
    categoryId?: SortOrder
    name?: SortOrder
    deletedAt?: SortOrder
  }

  export type SubcategoryAvgOrderByAggregateInput = {
    id?: SortOrder
    categoryId?: SortOrder
  }

  export type SubcategoryMaxOrderByAggregateInput = {
    id?: SortOrder
    categoryId?: SortOrder
    name?: SortOrder
    deletedAt?: SortOrder
  }

  export type SubcategoryMinOrderByAggregateInput = {
    id?: SortOrder
    categoryId?: SortOrder
    name?: SortOrder
    deletedAt?: SortOrder
  }

  export type SubcategorySumOrderByAggregateInput = {
    id?: SortOrder
    categoryId?: SortOrder
  }

  export type FloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type ExpenseCountOrderByAggregateInput = {
    id?: SortOrder
    accountId?: SortOrder
    categoryId?: SortOrder
    amount?: SortOrder
    description?: SortOrder
    date?: SortOrder
  }

  export type ExpenseAvgOrderByAggregateInput = {
    id?: SortOrder
    accountId?: SortOrder
    categoryId?: SortOrder
    amount?: SortOrder
  }

  export type ExpenseMaxOrderByAggregateInput = {
    id?: SortOrder
    accountId?: SortOrder
    categoryId?: SortOrder
    amount?: SortOrder
    description?: SortOrder
    date?: SortOrder
  }

  export type ExpenseMinOrderByAggregateInput = {
    id?: SortOrder
    accountId?: SortOrder
    categoryId?: SortOrder
    amount?: SortOrder
    description?: SortOrder
    date?: SortOrder
  }

  export type ExpenseSumOrderByAggregateInput = {
    id?: SortOrder
    accountId?: SortOrder
    categoryId?: SortOrder
    amount?: SortOrder
  }

  export type FloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type AccountCreateNestedManyWithoutOwnerInput = {
    create?: XOR<AccountCreateWithoutOwnerInput, AccountUncheckedCreateWithoutOwnerInput> | AccountCreateWithoutOwnerInput[] | AccountUncheckedCreateWithoutOwnerInput[]
    connectOrCreate?: AccountCreateOrConnectWithoutOwnerInput | AccountCreateOrConnectWithoutOwnerInput[]
    createMany?: AccountCreateManyOwnerInputEnvelope
    connect?: AccountWhereUniqueInput | AccountWhereUniqueInput[]
  }

  export type AccountUserCreateNestedManyWithoutUserInput = {
    create?: XOR<AccountUserCreateWithoutUserInput, AccountUserUncheckedCreateWithoutUserInput> | AccountUserCreateWithoutUserInput[] | AccountUserUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AccountUserCreateOrConnectWithoutUserInput | AccountUserCreateOrConnectWithoutUserInput[]
    createMany?: AccountUserCreateManyUserInputEnvelope
    connect?: AccountUserWhereUniqueInput | AccountUserWhereUniqueInput[]
  }

  export type AccountUncheckedCreateNestedManyWithoutOwnerInput = {
    create?: XOR<AccountCreateWithoutOwnerInput, AccountUncheckedCreateWithoutOwnerInput> | AccountCreateWithoutOwnerInput[] | AccountUncheckedCreateWithoutOwnerInput[]
    connectOrCreate?: AccountCreateOrConnectWithoutOwnerInput | AccountCreateOrConnectWithoutOwnerInput[]
    createMany?: AccountCreateManyOwnerInputEnvelope
    connect?: AccountWhereUniqueInput | AccountWhereUniqueInput[]
  }

  export type AccountUserUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<AccountUserCreateWithoutUserInput, AccountUserUncheckedCreateWithoutUserInput> | AccountUserCreateWithoutUserInput[] | AccountUserUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AccountUserCreateOrConnectWithoutUserInput | AccountUserCreateOrConnectWithoutUserInput[]
    createMany?: AccountUserCreateManyUserInputEnvelope
    connect?: AccountUserWhereUniqueInput | AccountUserWhereUniqueInput[]
  }

  export type BigIntFieldUpdateOperationsInput = {
    set?: bigint | number
    increment?: bigint | number
    decrement?: bigint | number
    multiply?: bigint | number
    divide?: bigint | number
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type AccountUpdateManyWithoutOwnerNestedInput = {
    create?: XOR<AccountCreateWithoutOwnerInput, AccountUncheckedCreateWithoutOwnerInput> | AccountCreateWithoutOwnerInput[] | AccountUncheckedCreateWithoutOwnerInput[]
    connectOrCreate?: AccountCreateOrConnectWithoutOwnerInput | AccountCreateOrConnectWithoutOwnerInput[]
    upsert?: AccountUpsertWithWhereUniqueWithoutOwnerInput | AccountUpsertWithWhereUniqueWithoutOwnerInput[]
    createMany?: AccountCreateManyOwnerInputEnvelope
    set?: AccountWhereUniqueInput | AccountWhereUniqueInput[]
    disconnect?: AccountWhereUniqueInput | AccountWhereUniqueInput[]
    delete?: AccountWhereUniqueInput | AccountWhereUniqueInput[]
    connect?: AccountWhereUniqueInput | AccountWhereUniqueInput[]
    update?: AccountUpdateWithWhereUniqueWithoutOwnerInput | AccountUpdateWithWhereUniqueWithoutOwnerInput[]
    updateMany?: AccountUpdateManyWithWhereWithoutOwnerInput | AccountUpdateManyWithWhereWithoutOwnerInput[]
    deleteMany?: AccountScalarWhereInput | AccountScalarWhereInput[]
  }

  export type AccountUserUpdateManyWithoutUserNestedInput = {
    create?: XOR<AccountUserCreateWithoutUserInput, AccountUserUncheckedCreateWithoutUserInput> | AccountUserCreateWithoutUserInput[] | AccountUserUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AccountUserCreateOrConnectWithoutUserInput | AccountUserCreateOrConnectWithoutUserInput[]
    upsert?: AccountUserUpsertWithWhereUniqueWithoutUserInput | AccountUserUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: AccountUserCreateManyUserInputEnvelope
    set?: AccountUserWhereUniqueInput | AccountUserWhereUniqueInput[]
    disconnect?: AccountUserWhereUniqueInput | AccountUserWhereUniqueInput[]
    delete?: AccountUserWhereUniqueInput | AccountUserWhereUniqueInput[]
    connect?: AccountUserWhereUniqueInput | AccountUserWhereUniqueInput[]
    update?: AccountUserUpdateWithWhereUniqueWithoutUserInput | AccountUserUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: AccountUserUpdateManyWithWhereWithoutUserInput | AccountUserUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: AccountUserScalarWhereInput | AccountUserScalarWhereInput[]
  }

  export type AccountUncheckedUpdateManyWithoutOwnerNestedInput = {
    create?: XOR<AccountCreateWithoutOwnerInput, AccountUncheckedCreateWithoutOwnerInput> | AccountCreateWithoutOwnerInput[] | AccountUncheckedCreateWithoutOwnerInput[]
    connectOrCreate?: AccountCreateOrConnectWithoutOwnerInput | AccountCreateOrConnectWithoutOwnerInput[]
    upsert?: AccountUpsertWithWhereUniqueWithoutOwnerInput | AccountUpsertWithWhereUniqueWithoutOwnerInput[]
    createMany?: AccountCreateManyOwnerInputEnvelope
    set?: AccountWhereUniqueInput | AccountWhereUniqueInput[]
    disconnect?: AccountWhereUniqueInput | AccountWhereUniqueInput[]
    delete?: AccountWhereUniqueInput | AccountWhereUniqueInput[]
    connect?: AccountWhereUniqueInput | AccountWhereUniqueInput[]
    update?: AccountUpdateWithWhereUniqueWithoutOwnerInput | AccountUpdateWithWhereUniqueWithoutOwnerInput[]
    updateMany?: AccountUpdateManyWithWhereWithoutOwnerInput | AccountUpdateManyWithWhereWithoutOwnerInput[]
    deleteMany?: AccountScalarWhereInput | AccountScalarWhereInput[]
  }

  export type AccountUserUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<AccountUserCreateWithoutUserInput, AccountUserUncheckedCreateWithoutUserInput> | AccountUserCreateWithoutUserInput[] | AccountUserUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AccountUserCreateOrConnectWithoutUserInput | AccountUserCreateOrConnectWithoutUserInput[]
    upsert?: AccountUserUpsertWithWhereUniqueWithoutUserInput | AccountUserUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: AccountUserCreateManyUserInputEnvelope
    set?: AccountUserWhereUniqueInput | AccountUserWhereUniqueInput[]
    disconnect?: AccountUserWhereUniqueInput | AccountUserWhereUniqueInput[]
    delete?: AccountUserWhereUniqueInput | AccountUserWhereUniqueInput[]
    connect?: AccountUserWhereUniqueInput | AccountUserWhereUniqueInput[]
    update?: AccountUserUpdateWithWhereUniqueWithoutUserInput | AccountUserUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: AccountUserUpdateManyWithWhereWithoutUserInput | AccountUserUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: AccountUserScalarWhereInput | AccountUserScalarWhereInput[]
  }

  export type UserCreateNestedOneWithoutOwnedAccountsInput = {
    create?: XOR<UserCreateWithoutOwnedAccountsInput, UserUncheckedCreateWithoutOwnedAccountsInput>
    connectOrCreate?: UserCreateOrConnectWithoutOwnedAccountsInput
    connect?: UserWhereUniqueInput
  }

  export type AccountUserCreateNestedManyWithoutAccountInput = {
    create?: XOR<AccountUserCreateWithoutAccountInput, AccountUserUncheckedCreateWithoutAccountInput> | AccountUserCreateWithoutAccountInput[] | AccountUserUncheckedCreateWithoutAccountInput[]
    connectOrCreate?: AccountUserCreateOrConnectWithoutAccountInput | AccountUserCreateOrConnectWithoutAccountInput[]
    createMany?: AccountUserCreateManyAccountInputEnvelope
    connect?: AccountUserWhereUniqueInput | AccountUserWhereUniqueInput[]
  }

  export type CategoryCreateNestedManyWithoutAccountInput = {
    create?: XOR<CategoryCreateWithoutAccountInput, CategoryUncheckedCreateWithoutAccountInput> | CategoryCreateWithoutAccountInput[] | CategoryUncheckedCreateWithoutAccountInput[]
    connectOrCreate?: CategoryCreateOrConnectWithoutAccountInput | CategoryCreateOrConnectWithoutAccountInput[]
    createMany?: CategoryCreateManyAccountInputEnvelope
    connect?: CategoryWhereUniqueInput | CategoryWhereUniqueInput[]
  }

  export type ExpenseCreateNestedManyWithoutAccountInput = {
    create?: XOR<ExpenseCreateWithoutAccountInput, ExpenseUncheckedCreateWithoutAccountInput> | ExpenseCreateWithoutAccountInput[] | ExpenseUncheckedCreateWithoutAccountInput[]
    connectOrCreate?: ExpenseCreateOrConnectWithoutAccountInput | ExpenseCreateOrConnectWithoutAccountInput[]
    createMany?: ExpenseCreateManyAccountInputEnvelope
    connect?: ExpenseWhereUniqueInput | ExpenseWhereUniqueInput[]
  }

  export type AccountInvitationCreateNestedManyWithoutAccountInput = {
    create?: XOR<AccountInvitationCreateWithoutAccountInput, AccountInvitationUncheckedCreateWithoutAccountInput> | AccountInvitationCreateWithoutAccountInput[] | AccountInvitationUncheckedCreateWithoutAccountInput[]
    connectOrCreate?: AccountInvitationCreateOrConnectWithoutAccountInput | AccountInvitationCreateOrConnectWithoutAccountInput[]
    createMany?: AccountInvitationCreateManyAccountInputEnvelope
    connect?: AccountInvitationWhereUniqueInput | AccountInvitationWhereUniqueInput[]
  }

  export type AccountUserUncheckedCreateNestedManyWithoutAccountInput = {
    create?: XOR<AccountUserCreateWithoutAccountInput, AccountUserUncheckedCreateWithoutAccountInput> | AccountUserCreateWithoutAccountInput[] | AccountUserUncheckedCreateWithoutAccountInput[]
    connectOrCreate?: AccountUserCreateOrConnectWithoutAccountInput | AccountUserCreateOrConnectWithoutAccountInput[]
    createMany?: AccountUserCreateManyAccountInputEnvelope
    connect?: AccountUserWhereUniqueInput | AccountUserWhereUniqueInput[]
  }

  export type CategoryUncheckedCreateNestedManyWithoutAccountInput = {
    create?: XOR<CategoryCreateWithoutAccountInput, CategoryUncheckedCreateWithoutAccountInput> | CategoryCreateWithoutAccountInput[] | CategoryUncheckedCreateWithoutAccountInput[]
    connectOrCreate?: CategoryCreateOrConnectWithoutAccountInput | CategoryCreateOrConnectWithoutAccountInput[]
    createMany?: CategoryCreateManyAccountInputEnvelope
    connect?: CategoryWhereUniqueInput | CategoryWhereUniqueInput[]
  }

  export type ExpenseUncheckedCreateNestedManyWithoutAccountInput = {
    create?: XOR<ExpenseCreateWithoutAccountInput, ExpenseUncheckedCreateWithoutAccountInput> | ExpenseCreateWithoutAccountInput[] | ExpenseUncheckedCreateWithoutAccountInput[]
    connectOrCreate?: ExpenseCreateOrConnectWithoutAccountInput | ExpenseCreateOrConnectWithoutAccountInput[]
    createMany?: ExpenseCreateManyAccountInputEnvelope
    connect?: ExpenseWhereUniqueInput | ExpenseWhereUniqueInput[]
  }

  export type AccountInvitationUncheckedCreateNestedManyWithoutAccountInput = {
    create?: XOR<AccountInvitationCreateWithoutAccountInput, AccountInvitationUncheckedCreateWithoutAccountInput> | AccountInvitationCreateWithoutAccountInput[] | AccountInvitationUncheckedCreateWithoutAccountInput[]
    connectOrCreate?: AccountInvitationCreateOrConnectWithoutAccountInput | AccountInvitationCreateOrConnectWithoutAccountInput[]
    createMany?: AccountInvitationCreateManyAccountInputEnvelope
    connect?: AccountInvitationWhereUniqueInput | AccountInvitationWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type UserUpdateOneRequiredWithoutOwnedAccountsNestedInput = {
    create?: XOR<UserCreateWithoutOwnedAccountsInput, UserUncheckedCreateWithoutOwnedAccountsInput>
    connectOrCreate?: UserCreateOrConnectWithoutOwnedAccountsInput
    upsert?: UserUpsertWithoutOwnedAccountsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutOwnedAccountsInput, UserUpdateWithoutOwnedAccountsInput>, UserUncheckedUpdateWithoutOwnedAccountsInput>
  }

  export type AccountUserUpdateManyWithoutAccountNestedInput = {
    create?: XOR<AccountUserCreateWithoutAccountInput, AccountUserUncheckedCreateWithoutAccountInput> | AccountUserCreateWithoutAccountInput[] | AccountUserUncheckedCreateWithoutAccountInput[]
    connectOrCreate?: AccountUserCreateOrConnectWithoutAccountInput | AccountUserCreateOrConnectWithoutAccountInput[]
    upsert?: AccountUserUpsertWithWhereUniqueWithoutAccountInput | AccountUserUpsertWithWhereUniqueWithoutAccountInput[]
    createMany?: AccountUserCreateManyAccountInputEnvelope
    set?: AccountUserWhereUniqueInput | AccountUserWhereUniqueInput[]
    disconnect?: AccountUserWhereUniqueInput | AccountUserWhereUniqueInput[]
    delete?: AccountUserWhereUniqueInput | AccountUserWhereUniqueInput[]
    connect?: AccountUserWhereUniqueInput | AccountUserWhereUniqueInput[]
    update?: AccountUserUpdateWithWhereUniqueWithoutAccountInput | AccountUserUpdateWithWhereUniqueWithoutAccountInput[]
    updateMany?: AccountUserUpdateManyWithWhereWithoutAccountInput | AccountUserUpdateManyWithWhereWithoutAccountInput[]
    deleteMany?: AccountUserScalarWhereInput | AccountUserScalarWhereInput[]
  }

  export type CategoryUpdateManyWithoutAccountNestedInput = {
    create?: XOR<CategoryCreateWithoutAccountInput, CategoryUncheckedCreateWithoutAccountInput> | CategoryCreateWithoutAccountInput[] | CategoryUncheckedCreateWithoutAccountInput[]
    connectOrCreate?: CategoryCreateOrConnectWithoutAccountInput | CategoryCreateOrConnectWithoutAccountInput[]
    upsert?: CategoryUpsertWithWhereUniqueWithoutAccountInput | CategoryUpsertWithWhereUniqueWithoutAccountInput[]
    createMany?: CategoryCreateManyAccountInputEnvelope
    set?: CategoryWhereUniqueInput | CategoryWhereUniqueInput[]
    disconnect?: CategoryWhereUniqueInput | CategoryWhereUniqueInput[]
    delete?: CategoryWhereUniqueInput | CategoryWhereUniqueInput[]
    connect?: CategoryWhereUniqueInput | CategoryWhereUniqueInput[]
    update?: CategoryUpdateWithWhereUniqueWithoutAccountInput | CategoryUpdateWithWhereUniqueWithoutAccountInput[]
    updateMany?: CategoryUpdateManyWithWhereWithoutAccountInput | CategoryUpdateManyWithWhereWithoutAccountInput[]
    deleteMany?: CategoryScalarWhereInput | CategoryScalarWhereInput[]
  }

  export type ExpenseUpdateManyWithoutAccountNestedInput = {
    create?: XOR<ExpenseCreateWithoutAccountInput, ExpenseUncheckedCreateWithoutAccountInput> | ExpenseCreateWithoutAccountInput[] | ExpenseUncheckedCreateWithoutAccountInput[]
    connectOrCreate?: ExpenseCreateOrConnectWithoutAccountInput | ExpenseCreateOrConnectWithoutAccountInput[]
    upsert?: ExpenseUpsertWithWhereUniqueWithoutAccountInput | ExpenseUpsertWithWhereUniqueWithoutAccountInput[]
    createMany?: ExpenseCreateManyAccountInputEnvelope
    set?: ExpenseWhereUniqueInput | ExpenseWhereUniqueInput[]
    disconnect?: ExpenseWhereUniqueInput | ExpenseWhereUniqueInput[]
    delete?: ExpenseWhereUniqueInput | ExpenseWhereUniqueInput[]
    connect?: ExpenseWhereUniqueInput | ExpenseWhereUniqueInput[]
    update?: ExpenseUpdateWithWhereUniqueWithoutAccountInput | ExpenseUpdateWithWhereUniqueWithoutAccountInput[]
    updateMany?: ExpenseUpdateManyWithWhereWithoutAccountInput | ExpenseUpdateManyWithWhereWithoutAccountInput[]
    deleteMany?: ExpenseScalarWhereInput | ExpenseScalarWhereInput[]
  }

  export type AccountInvitationUpdateManyWithoutAccountNestedInput = {
    create?: XOR<AccountInvitationCreateWithoutAccountInput, AccountInvitationUncheckedCreateWithoutAccountInput> | AccountInvitationCreateWithoutAccountInput[] | AccountInvitationUncheckedCreateWithoutAccountInput[]
    connectOrCreate?: AccountInvitationCreateOrConnectWithoutAccountInput | AccountInvitationCreateOrConnectWithoutAccountInput[]
    upsert?: AccountInvitationUpsertWithWhereUniqueWithoutAccountInput | AccountInvitationUpsertWithWhereUniqueWithoutAccountInput[]
    createMany?: AccountInvitationCreateManyAccountInputEnvelope
    set?: AccountInvitationWhereUniqueInput | AccountInvitationWhereUniqueInput[]
    disconnect?: AccountInvitationWhereUniqueInput | AccountInvitationWhereUniqueInput[]
    delete?: AccountInvitationWhereUniqueInput | AccountInvitationWhereUniqueInput[]
    connect?: AccountInvitationWhereUniqueInput | AccountInvitationWhereUniqueInput[]
    update?: AccountInvitationUpdateWithWhereUniqueWithoutAccountInput | AccountInvitationUpdateWithWhereUniqueWithoutAccountInput[]
    updateMany?: AccountInvitationUpdateManyWithWhereWithoutAccountInput | AccountInvitationUpdateManyWithWhereWithoutAccountInput[]
    deleteMany?: AccountInvitationScalarWhereInput | AccountInvitationScalarWhereInput[]
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type AccountUserUncheckedUpdateManyWithoutAccountNestedInput = {
    create?: XOR<AccountUserCreateWithoutAccountInput, AccountUserUncheckedCreateWithoutAccountInput> | AccountUserCreateWithoutAccountInput[] | AccountUserUncheckedCreateWithoutAccountInput[]
    connectOrCreate?: AccountUserCreateOrConnectWithoutAccountInput | AccountUserCreateOrConnectWithoutAccountInput[]
    upsert?: AccountUserUpsertWithWhereUniqueWithoutAccountInput | AccountUserUpsertWithWhereUniqueWithoutAccountInput[]
    createMany?: AccountUserCreateManyAccountInputEnvelope
    set?: AccountUserWhereUniqueInput | AccountUserWhereUniqueInput[]
    disconnect?: AccountUserWhereUniqueInput | AccountUserWhereUniqueInput[]
    delete?: AccountUserWhereUniqueInput | AccountUserWhereUniqueInput[]
    connect?: AccountUserWhereUniqueInput | AccountUserWhereUniqueInput[]
    update?: AccountUserUpdateWithWhereUniqueWithoutAccountInput | AccountUserUpdateWithWhereUniqueWithoutAccountInput[]
    updateMany?: AccountUserUpdateManyWithWhereWithoutAccountInput | AccountUserUpdateManyWithWhereWithoutAccountInput[]
    deleteMany?: AccountUserScalarWhereInput | AccountUserScalarWhereInput[]
  }

  export type CategoryUncheckedUpdateManyWithoutAccountNestedInput = {
    create?: XOR<CategoryCreateWithoutAccountInput, CategoryUncheckedCreateWithoutAccountInput> | CategoryCreateWithoutAccountInput[] | CategoryUncheckedCreateWithoutAccountInput[]
    connectOrCreate?: CategoryCreateOrConnectWithoutAccountInput | CategoryCreateOrConnectWithoutAccountInput[]
    upsert?: CategoryUpsertWithWhereUniqueWithoutAccountInput | CategoryUpsertWithWhereUniqueWithoutAccountInput[]
    createMany?: CategoryCreateManyAccountInputEnvelope
    set?: CategoryWhereUniqueInput | CategoryWhereUniqueInput[]
    disconnect?: CategoryWhereUniqueInput | CategoryWhereUniqueInput[]
    delete?: CategoryWhereUniqueInput | CategoryWhereUniqueInput[]
    connect?: CategoryWhereUniqueInput | CategoryWhereUniqueInput[]
    update?: CategoryUpdateWithWhereUniqueWithoutAccountInput | CategoryUpdateWithWhereUniqueWithoutAccountInput[]
    updateMany?: CategoryUpdateManyWithWhereWithoutAccountInput | CategoryUpdateManyWithWhereWithoutAccountInput[]
    deleteMany?: CategoryScalarWhereInput | CategoryScalarWhereInput[]
  }

  export type ExpenseUncheckedUpdateManyWithoutAccountNestedInput = {
    create?: XOR<ExpenseCreateWithoutAccountInput, ExpenseUncheckedCreateWithoutAccountInput> | ExpenseCreateWithoutAccountInput[] | ExpenseUncheckedCreateWithoutAccountInput[]
    connectOrCreate?: ExpenseCreateOrConnectWithoutAccountInput | ExpenseCreateOrConnectWithoutAccountInput[]
    upsert?: ExpenseUpsertWithWhereUniqueWithoutAccountInput | ExpenseUpsertWithWhereUniqueWithoutAccountInput[]
    createMany?: ExpenseCreateManyAccountInputEnvelope
    set?: ExpenseWhereUniqueInput | ExpenseWhereUniqueInput[]
    disconnect?: ExpenseWhereUniqueInput | ExpenseWhereUniqueInput[]
    delete?: ExpenseWhereUniqueInput | ExpenseWhereUniqueInput[]
    connect?: ExpenseWhereUniqueInput | ExpenseWhereUniqueInput[]
    update?: ExpenseUpdateWithWhereUniqueWithoutAccountInput | ExpenseUpdateWithWhereUniqueWithoutAccountInput[]
    updateMany?: ExpenseUpdateManyWithWhereWithoutAccountInput | ExpenseUpdateManyWithWhereWithoutAccountInput[]
    deleteMany?: ExpenseScalarWhereInput | ExpenseScalarWhereInput[]
  }

  export type AccountInvitationUncheckedUpdateManyWithoutAccountNestedInput = {
    create?: XOR<AccountInvitationCreateWithoutAccountInput, AccountInvitationUncheckedCreateWithoutAccountInput> | AccountInvitationCreateWithoutAccountInput[] | AccountInvitationUncheckedCreateWithoutAccountInput[]
    connectOrCreate?: AccountInvitationCreateOrConnectWithoutAccountInput | AccountInvitationCreateOrConnectWithoutAccountInput[]
    upsert?: AccountInvitationUpsertWithWhereUniqueWithoutAccountInput | AccountInvitationUpsertWithWhereUniqueWithoutAccountInput[]
    createMany?: AccountInvitationCreateManyAccountInputEnvelope
    set?: AccountInvitationWhereUniqueInput | AccountInvitationWhereUniqueInput[]
    disconnect?: AccountInvitationWhereUniqueInput | AccountInvitationWhereUniqueInput[]
    delete?: AccountInvitationWhereUniqueInput | AccountInvitationWhereUniqueInput[]
    connect?: AccountInvitationWhereUniqueInput | AccountInvitationWhereUniqueInput[]
    update?: AccountInvitationUpdateWithWhereUniqueWithoutAccountInput | AccountInvitationUpdateWithWhereUniqueWithoutAccountInput[]
    updateMany?: AccountInvitationUpdateManyWithWhereWithoutAccountInput | AccountInvitationUpdateManyWithWhereWithoutAccountInput[]
    deleteMany?: AccountInvitationScalarWhereInput | AccountInvitationScalarWhereInput[]
  }

  export type AccountCreateNestedOneWithoutInvitationsInput = {
    create?: XOR<AccountCreateWithoutInvitationsInput, AccountUncheckedCreateWithoutInvitationsInput>
    connectOrCreate?: AccountCreateOrConnectWithoutInvitationsInput
    connect?: AccountWhereUniqueInput
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type NullableBigIntFieldUpdateOperationsInput = {
    set?: bigint | number | null
    increment?: bigint | number
    decrement?: bigint | number
    multiply?: bigint | number
    divide?: bigint | number
  }

  export type AccountUpdateOneRequiredWithoutInvitationsNestedInput = {
    create?: XOR<AccountCreateWithoutInvitationsInput, AccountUncheckedCreateWithoutInvitationsInput>
    connectOrCreate?: AccountCreateOrConnectWithoutInvitationsInput
    upsert?: AccountUpsertWithoutInvitationsInput
    connect?: AccountWhereUniqueInput
    update?: XOR<XOR<AccountUpdateToOneWithWhereWithoutInvitationsInput, AccountUpdateWithoutInvitationsInput>, AccountUncheckedUpdateWithoutInvitationsInput>
  }

  export type UserCreateNestedOneWithoutAccountsInput = {
    create?: XOR<UserCreateWithoutAccountsInput, UserUncheckedCreateWithoutAccountsInput>
    connectOrCreate?: UserCreateOrConnectWithoutAccountsInput
    connect?: UserWhereUniqueInput
  }

  export type AccountCreateNestedOneWithoutUsersInput = {
    create?: XOR<AccountCreateWithoutUsersInput, AccountUncheckedCreateWithoutUsersInput>
    connectOrCreate?: AccountCreateOrConnectWithoutUsersInput
    connect?: AccountWhereUniqueInput
  }

  export type UserUpdateOneRequiredWithoutAccountsNestedInput = {
    create?: XOR<UserCreateWithoutAccountsInput, UserUncheckedCreateWithoutAccountsInput>
    connectOrCreate?: UserCreateOrConnectWithoutAccountsInput
    upsert?: UserUpsertWithoutAccountsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutAccountsInput, UserUpdateWithoutAccountsInput>, UserUncheckedUpdateWithoutAccountsInput>
  }

  export type AccountUpdateOneRequiredWithoutUsersNestedInput = {
    create?: XOR<AccountCreateWithoutUsersInput, AccountUncheckedCreateWithoutUsersInput>
    connectOrCreate?: AccountCreateOrConnectWithoutUsersInput
    upsert?: AccountUpsertWithoutUsersInput
    connect?: AccountWhereUniqueInput
    update?: XOR<XOR<AccountUpdateToOneWithWhereWithoutUsersInput, AccountUpdateWithoutUsersInput>, AccountUncheckedUpdateWithoutUsersInput>
  }

  export type AccountCreateNestedOneWithoutCategoriesInput = {
    create?: XOR<AccountCreateWithoutCategoriesInput, AccountUncheckedCreateWithoutCategoriesInput>
    connectOrCreate?: AccountCreateOrConnectWithoutCategoriesInput
    connect?: AccountWhereUniqueInput
  }

  export type ExpenseCreateNestedManyWithoutCategoryInput = {
    create?: XOR<ExpenseCreateWithoutCategoryInput, ExpenseUncheckedCreateWithoutCategoryInput> | ExpenseCreateWithoutCategoryInput[] | ExpenseUncheckedCreateWithoutCategoryInput[]
    connectOrCreate?: ExpenseCreateOrConnectWithoutCategoryInput | ExpenseCreateOrConnectWithoutCategoryInput[]
    createMany?: ExpenseCreateManyCategoryInputEnvelope
    connect?: ExpenseWhereUniqueInput | ExpenseWhereUniqueInput[]
  }

  export type SubcategoryCreateNestedManyWithoutCategoryInput = {
    create?: XOR<SubcategoryCreateWithoutCategoryInput, SubcategoryUncheckedCreateWithoutCategoryInput> | SubcategoryCreateWithoutCategoryInput[] | SubcategoryUncheckedCreateWithoutCategoryInput[]
    connectOrCreate?: SubcategoryCreateOrConnectWithoutCategoryInput | SubcategoryCreateOrConnectWithoutCategoryInput[]
    createMany?: SubcategoryCreateManyCategoryInputEnvelope
    connect?: SubcategoryWhereUniqueInput | SubcategoryWhereUniqueInput[]
  }

  export type ExpenseUncheckedCreateNestedManyWithoutCategoryInput = {
    create?: XOR<ExpenseCreateWithoutCategoryInput, ExpenseUncheckedCreateWithoutCategoryInput> | ExpenseCreateWithoutCategoryInput[] | ExpenseUncheckedCreateWithoutCategoryInput[]
    connectOrCreate?: ExpenseCreateOrConnectWithoutCategoryInput | ExpenseCreateOrConnectWithoutCategoryInput[]
    createMany?: ExpenseCreateManyCategoryInputEnvelope
    connect?: ExpenseWhereUniqueInput | ExpenseWhereUniqueInput[]
  }

  export type SubcategoryUncheckedCreateNestedManyWithoutCategoryInput = {
    create?: XOR<SubcategoryCreateWithoutCategoryInput, SubcategoryUncheckedCreateWithoutCategoryInput> | SubcategoryCreateWithoutCategoryInput[] | SubcategoryUncheckedCreateWithoutCategoryInput[]
    connectOrCreate?: SubcategoryCreateOrConnectWithoutCategoryInput | SubcategoryCreateOrConnectWithoutCategoryInput[]
    createMany?: SubcategoryCreateManyCategoryInputEnvelope
    connect?: SubcategoryWhereUniqueInput | SubcategoryWhereUniqueInput[]
  }

  export type AccountUpdateOneRequiredWithoutCategoriesNestedInput = {
    create?: XOR<AccountCreateWithoutCategoriesInput, AccountUncheckedCreateWithoutCategoriesInput>
    connectOrCreate?: AccountCreateOrConnectWithoutCategoriesInput
    upsert?: AccountUpsertWithoutCategoriesInput
    connect?: AccountWhereUniqueInput
    update?: XOR<XOR<AccountUpdateToOneWithWhereWithoutCategoriesInput, AccountUpdateWithoutCategoriesInput>, AccountUncheckedUpdateWithoutCategoriesInput>
  }

  export type ExpenseUpdateManyWithoutCategoryNestedInput = {
    create?: XOR<ExpenseCreateWithoutCategoryInput, ExpenseUncheckedCreateWithoutCategoryInput> | ExpenseCreateWithoutCategoryInput[] | ExpenseUncheckedCreateWithoutCategoryInput[]
    connectOrCreate?: ExpenseCreateOrConnectWithoutCategoryInput | ExpenseCreateOrConnectWithoutCategoryInput[]
    upsert?: ExpenseUpsertWithWhereUniqueWithoutCategoryInput | ExpenseUpsertWithWhereUniqueWithoutCategoryInput[]
    createMany?: ExpenseCreateManyCategoryInputEnvelope
    set?: ExpenseWhereUniqueInput | ExpenseWhereUniqueInput[]
    disconnect?: ExpenseWhereUniqueInput | ExpenseWhereUniqueInput[]
    delete?: ExpenseWhereUniqueInput | ExpenseWhereUniqueInput[]
    connect?: ExpenseWhereUniqueInput | ExpenseWhereUniqueInput[]
    update?: ExpenseUpdateWithWhereUniqueWithoutCategoryInput | ExpenseUpdateWithWhereUniqueWithoutCategoryInput[]
    updateMany?: ExpenseUpdateManyWithWhereWithoutCategoryInput | ExpenseUpdateManyWithWhereWithoutCategoryInput[]
    deleteMany?: ExpenseScalarWhereInput | ExpenseScalarWhereInput[]
  }

  export type SubcategoryUpdateManyWithoutCategoryNestedInput = {
    create?: XOR<SubcategoryCreateWithoutCategoryInput, SubcategoryUncheckedCreateWithoutCategoryInput> | SubcategoryCreateWithoutCategoryInput[] | SubcategoryUncheckedCreateWithoutCategoryInput[]
    connectOrCreate?: SubcategoryCreateOrConnectWithoutCategoryInput | SubcategoryCreateOrConnectWithoutCategoryInput[]
    upsert?: SubcategoryUpsertWithWhereUniqueWithoutCategoryInput | SubcategoryUpsertWithWhereUniqueWithoutCategoryInput[]
    createMany?: SubcategoryCreateManyCategoryInputEnvelope
    set?: SubcategoryWhereUniqueInput | SubcategoryWhereUniqueInput[]
    disconnect?: SubcategoryWhereUniqueInput | SubcategoryWhereUniqueInput[]
    delete?: SubcategoryWhereUniqueInput | SubcategoryWhereUniqueInput[]
    connect?: SubcategoryWhereUniqueInput | SubcategoryWhereUniqueInput[]
    update?: SubcategoryUpdateWithWhereUniqueWithoutCategoryInput | SubcategoryUpdateWithWhereUniqueWithoutCategoryInput[]
    updateMany?: SubcategoryUpdateManyWithWhereWithoutCategoryInput | SubcategoryUpdateManyWithWhereWithoutCategoryInput[]
    deleteMany?: SubcategoryScalarWhereInput | SubcategoryScalarWhereInput[]
  }

  export type ExpenseUncheckedUpdateManyWithoutCategoryNestedInput = {
    create?: XOR<ExpenseCreateWithoutCategoryInput, ExpenseUncheckedCreateWithoutCategoryInput> | ExpenseCreateWithoutCategoryInput[] | ExpenseUncheckedCreateWithoutCategoryInput[]
    connectOrCreate?: ExpenseCreateOrConnectWithoutCategoryInput | ExpenseCreateOrConnectWithoutCategoryInput[]
    upsert?: ExpenseUpsertWithWhereUniqueWithoutCategoryInput | ExpenseUpsertWithWhereUniqueWithoutCategoryInput[]
    createMany?: ExpenseCreateManyCategoryInputEnvelope
    set?: ExpenseWhereUniqueInput | ExpenseWhereUniqueInput[]
    disconnect?: ExpenseWhereUniqueInput | ExpenseWhereUniqueInput[]
    delete?: ExpenseWhereUniqueInput | ExpenseWhereUniqueInput[]
    connect?: ExpenseWhereUniqueInput | ExpenseWhereUniqueInput[]
    update?: ExpenseUpdateWithWhereUniqueWithoutCategoryInput | ExpenseUpdateWithWhereUniqueWithoutCategoryInput[]
    updateMany?: ExpenseUpdateManyWithWhereWithoutCategoryInput | ExpenseUpdateManyWithWhereWithoutCategoryInput[]
    deleteMany?: ExpenseScalarWhereInput | ExpenseScalarWhereInput[]
  }

  export type SubcategoryUncheckedUpdateManyWithoutCategoryNestedInput = {
    create?: XOR<SubcategoryCreateWithoutCategoryInput, SubcategoryUncheckedCreateWithoutCategoryInput> | SubcategoryCreateWithoutCategoryInput[] | SubcategoryUncheckedCreateWithoutCategoryInput[]
    connectOrCreate?: SubcategoryCreateOrConnectWithoutCategoryInput | SubcategoryCreateOrConnectWithoutCategoryInput[]
    upsert?: SubcategoryUpsertWithWhereUniqueWithoutCategoryInput | SubcategoryUpsertWithWhereUniqueWithoutCategoryInput[]
    createMany?: SubcategoryCreateManyCategoryInputEnvelope
    set?: SubcategoryWhereUniqueInput | SubcategoryWhereUniqueInput[]
    disconnect?: SubcategoryWhereUniqueInput | SubcategoryWhereUniqueInput[]
    delete?: SubcategoryWhereUniqueInput | SubcategoryWhereUniqueInput[]
    connect?: SubcategoryWhereUniqueInput | SubcategoryWhereUniqueInput[]
    update?: SubcategoryUpdateWithWhereUniqueWithoutCategoryInput | SubcategoryUpdateWithWhereUniqueWithoutCategoryInput[]
    updateMany?: SubcategoryUpdateManyWithWhereWithoutCategoryInput | SubcategoryUpdateManyWithWhereWithoutCategoryInput[]
    deleteMany?: SubcategoryScalarWhereInput | SubcategoryScalarWhereInput[]
  }

  export type CategoryCreateNestedOneWithoutSubcategoriesInput = {
    create?: XOR<CategoryCreateWithoutSubcategoriesInput, CategoryUncheckedCreateWithoutSubcategoriesInput>
    connectOrCreate?: CategoryCreateOrConnectWithoutSubcategoriesInput
    connect?: CategoryWhereUniqueInput
  }

  export type CategoryUpdateOneRequiredWithoutSubcategoriesNestedInput = {
    create?: XOR<CategoryCreateWithoutSubcategoriesInput, CategoryUncheckedCreateWithoutSubcategoriesInput>
    connectOrCreate?: CategoryCreateOrConnectWithoutSubcategoriesInput
    upsert?: CategoryUpsertWithoutSubcategoriesInput
    connect?: CategoryWhereUniqueInput
    update?: XOR<XOR<CategoryUpdateToOneWithWhereWithoutSubcategoriesInput, CategoryUpdateWithoutSubcategoriesInput>, CategoryUncheckedUpdateWithoutSubcategoriesInput>
  }

  export type AccountCreateNestedOneWithoutExpensesInput = {
    create?: XOR<AccountCreateWithoutExpensesInput, AccountUncheckedCreateWithoutExpensesInput>
    connectOrCreate?: AccountCreateOrConnectWithoutExpensesInput
    connect?: AccountWhereUniqueInput
  }

  export type CategoryCreateNestedOneWithoutExpensesInput = {
    create?: XOR<CategoryCreateWithoutExpensesInput, CategoryUncheckedCreateWithoutExpensesInput>
    connectOrCreate?: CategoryCreateOrConnectWithoutExpensesInput
    connect?: CategoryWhereUniqueInput
  }

  export type FloatFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type AccountUpdateOneRequiredWithoutExpensesNestedInput = {
    create?: XOR<AccountCreateWithoutExpensesInput, AccountUncheckedCreateWithoutExpensesInput>
    connectOrCreate?: AccountCreateOrConnectWithoutExpensesInput
    upsert?: AccountUpsertWithoutExpensesInput
    connect?: AccountWhereUniqueInput
    update?: XOR<XOR<AccountUpdateToOneWithWhereWithoutExpensesInput, AccountUpdateWithoutExpensesInput>, AccountUncheckedUpdateWithoutExpensesInput>
  }

  export type CategoryUpdateOneRequiredWithoutExpensesNestedInput = {
    create?: XOR<CategoryCreateWithoutExpensesInput, CategoryUncheckedCreateWithoutExpensesInput>
    connectOrCreate?: CategoryCreateOrConnectWithoutExpensesInput
    upsert?: CategoryUpsertWithoutExpensesInput
    connect?: CategoryWhereUniqueInput
    update?: XOR<XOR<CategoryUpdateToOneWithWhereWithoutExpensesInput, CategoryUpdateWithoutExpensesInput>, CategoryUncheckedUpdateWithoutExpensesInput>
  }

  export type NestedBigIntFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    in?: bigint[] | number[]
    notIn?: bigint[] | number[]
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntFilter<$PrismaModel> | bigint | number
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedBigIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    in?: bigint[] | number[]
    notIn?: bigint[] | number[]
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntWithAggregatesFilter<$PrismaModel> | bigint | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedBigIntFilter<$PrismaModel>
    _min?: NestedBigIntFilter<$PrismaModel>
    _max?: NestedBigIntFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedBigIntNullableFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel> | null
    in?: bigint[] | number[] | null
    notIn?: bigint[] | number[] | null
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntNullableFilter<$PrismaModel> | bigint | number | null
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedBigIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel> | null
    in?: bigint[] | number[] | null
    notIn?: bigint[] | number[] | null
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntNullableWithAggregatesFilter<$PrismaModel> | bigint | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedBigIntNullableFilter<$PrismaModel>
    _min?: NestedBigIntNullableFilter<$PrismaModel>
    _max?: NestedBigIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedFloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type AccountCreateWithoutOwnerInput = {
    name: string
    createdAt?: Date | string
    users?: AccountUserCreateNestedManyWithoutAccountInput
    categories?: CategoryCreateNestedManyWithoutAccountInput
    expenses?: ExpenseCreateNestedManyWithoutAccountInput
    invitations?: AccountInvitationCreateNestedManyWithoutAccountInput
  }

  export type AccountUncheckedCreateWithoutOwnerInput = {
    id?: number
    name: string
    createdAt?: Date | string
    users?: AccountUserUncheckedCreateNestedManyWithoutAccountInput
    categories?: CategoryUncheckedCreateNestedManyWithoutAccountInput
    expenses?: ExpenseUncheckedCreateNestedManyWithoutAccountInput
    invitations?: AccountInvitationUncheckedCreateNestedManyWithoutAccountInput
  }

  export type AccountCreateOrConnectWithoutOwnerInput = {
    where: AccountWhereUniqueInput
    create: XOR<AccountCreateWithoutOwnerInput, AccountUncheckedCreateWithoutOwnerInput>
  }

  export type AccountCreateManyOwnerInputEnvelope = {
    data: AccountCreateManyOwnerInput | AccountCreateManyOwnerInput[]
  }

  export type AccountUserCreateWithoutUserInput = {
    joinedAt?: Date | string
    account: AccountCreateNestedOneWithoutUsersInput
  }

  export type AccountUserUncheckedCreateWithoutUserInput = {
    accountId: number
    joinedAt?: Date | string
  }

  export type AccountUserCreateOrConnectWithoutUserInput = {
    where: AccountUserWhereUniqueInput
    create: XOR<AccountUserCreateWithoutUserInput, AccountUserUncheckedCreateWithoutUserInput>
  }

  export type AccountUserCreateManyUserInputEnvelope = {
    data: AccountUserCreateManyUserInput | AccountUserCreateManyUserInput[]
  }

  export type AccountUpsertWithWhereUniqueWithoutOwnerInput = {
    where: AccountWhereUniqueInput
    update: XOR<AccountUpdateWithoutOwnerInput, AccountUncheckedUpdateWithoutOwnerInput>
    create: XOR<AccountCreateWithoutOwnerInput, AccountUncheckedCreateWithoutOwnerInput>
  }

  export type AccountUpdateWithWhereUniqueWithoutOwnerInput = {
    where: AccountWhereUniqueInput
    data: XOR<AccountUpdateWithoutOwnerInput, AccountUncheckedUpdateWithoutOwnerInput>
  }

  export type AccountUpdateManyWithWhereWithoutOwnerInput = {
    where: AccountScalarWhereInput
    data: XOR<AccountUpdateManyMutationInput, AccountUncheckedUpdateManyWithoutOwnerInput>
  }

  export type AccountScalarWhereInput = {
    AND?: AccountScalarWhereInput | AccountScalarWhereInput[]
    OR?: AccountScalarWhereInput[]
    NOT?: AccountScalarWhereInput | AccountScalarWhereInput[]
    id?: IntFilter<"Account"> | number
    name?: StringFilter<"Account"> | string
    ownerId?: BigIntFilter<"Account"> | bigint | number
    createdAt?: DateTimeFilter<"Account"> | Date | string
  }

  export type AccountUserUpsertWithWhereUniqueWithoutUserInput = {
    where: AccountUserWhereUniqueInput
    update: XOR<AccountUserUpdateWithoutUserInput, AccountUserUncheckedUpdateWithoutUserInput>
    create: XOR<AccountUserCreateWithoutUserInput, AccountUserUncheckedCreateWithoutUserInput>
  }

  export type AccountUserUpdateWithWhereUniqueWithoutUserInput = {
    where: AccountUserWhereUniqueInput
    data: XOR<AccountUserUpdateWithoutUserInput, AccountUserUncheckedUpdateWithoutUserInput>
  }

  export type AccountUserUpdateManyWithWhereWithoutUserInput = {
    where: AccountUserScalarWhereInput
    data: XOR<AccountUserUpdateManyMutationInput, AccountUserUncheckedUpdateManyWithoutUserInput>
  }

  export type AccountUserScalarWhereInput = {
    AND?: AccountUserScalarWhereInput | AccountUserScalarWhereInput[]
    OR?: AccountUserScalarWhereInput[]
    NOT?: AccountUserScalarWhereInput | AccountUserScalarWhereInput[]
    userId?: BigIntFilter<"AccountUser"> | bigint | number
    accountId?: IntFilter<"AccountUser"> | number
    joinedAt?: DateTimeFilter<"AccountUser"> | Date | string
  }

  export type UserCreateWithoutOwnedAccountsInput = {
    id: bigint | number
    createdAt?: Date | string
    accounts?: AccountUserCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutOwnedAccountsInput = {
    id: bigint | number
    createdAt?: Date | string
    accounts?: AccountUserUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutOwnedAccountsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutOwnedAccountsInput, UserUncheckedCreateWithoutOwnedAccountsInput>
  }

  export type AccountUserCreateWithoutAccountInput = {
    joinedAt?: Date | string
    user: UserCreateNestedOneWithoutAccountsInput
  }

  export type AccountUserUncheckedCreateWithoutAccountInput = {
    userId: bigint | number
    joinedAt?: Date | string
  }

  export type AccountUserCreateOrConnectWithoutAccountInput = {
    where: AccountUserWhereUniqueInput
    create: XOR<AccountUserCreateWithoutAccountInput, AccountUserUncheckedCreateWithoutAccountInput>
  }

  export type AccountUserCreateManyAccountInputEnvelope = {
    data: AccountUserCreateManyAccountInput | AccountUserCreateManyAccountInput[]
  }

  export type CategoryCreateWithoutAccountInput = {
    name: string
    deletedAt?: Date | string | null
    expenses?: ExpenseCreateNestedManyWithoutCategoryInput
    subcategories?: SubcategoryCreateNestedManyWithoutCategoryInput
  }

  export type CategoryUncheckedCreateWithoutAccountInput = {
    id?: number
    name: string
    deletedAt?: Date | string | null
    expenses?: ExpenseUncheckedCreateNestedManyWithoutCategoryInput
    subcategories?: SubcategoryUncheckedCreateNestedManyWithoutCategoryInput
  }

  export type CategoryCreateOrConnectWithoutAccountInput = {
    where: CategoryWhereUniqueInput
    create: XOR<CategoryCreateWithoutAccountInput, CategoryUncheckedCreateWithoutAccountInput>
  }

  export type CategoryCreateManyAccountInputEnvelope = {
    data: CategoryCreateManyAccountInput | CategoryCreateManyAccountInput[]
  }

  export type ExpenseCreateWithoutAccountInput = {
    amount: number
    description?: string | null
    date: Date | string
    category: CategoryCreateNestedOneWithoutExpensesInput
  }

  export type ExpenseUncheckedCreateWithoutAccountInput = {
    id?: number
    categoryId: number
    amount: number
    description?: string | null
    date: Date | string
  }

  export type ExpenseCreateOrConnectWithoutAccountInput = {
    where: ExpenseWhereUniqueInput
    create: XOR<ExpenseCreateWithoutAccountInput, ExpenseUncheckedCreateWithoutAccountInput>
  }

  export type ExpenseCreateManyAccountInputEnvelope = {
    data: ExpenseCreateManyAccountInput | ExpenseCreateManyAccountInput[]
  }

  export type AccountInvitationCreateWithoutAccountInput = {
    code: string
    createdBy: bigint | number
    expiresAt: Date | string
    usedAt?: Date | string | null
    usedBy?: bigint | number | null
  }

  export type AccountInvitationUncheckedCreateWithoutAccountInput = {
    id?: number
    code: string
    createdBy: bigint | number
    expiresAt: Date | string
    usedAt?: Date | string | null
    usedBy?: bigint | number | null
  }

  export type AccountInvitationCreateOrConnectWithoutAccountInput = {
    where: AccountInvitationWhereUniqueInput
    create: XOR<AccountInvitationCreateWithoutAccountInput, AccountInvitationUncheckedCreateWithoutAccountInput>
  }

  export type AccountInvitationCreateManyAccountInputEnvelope = {
    data: AccountInvitationCreateManyAccountInput | AccountInvitationCreateManyAccountInput[]
  }

  export type UserUpsertWithoutOwnedAccountsInput = {
    update: XOR<UserUpdateWithoutOwnedAccountsInput, UserUncheckedUpdateWithoutOwnedAccountsInput>
    create: XOR<UserCreateWithoutOwnedAccountsInput, UserUncheckedCreateWithoutOwnedAccountsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutOwnedAccountsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutOwnedAccountsInput, UserUncheckedUpdateWithoutOwnedAccountsInput>
  }

  export type UserUpdateWithoutOwnedAccountsInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    accounts?: AccountUserUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutOwnedAccountsInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    accounts?: AccountUserUncheckedUpdateManyWithoutUserNestedInput
  }

  export type AccountUserUpsertWithWhereUniqueWithoutAccountInput = {
    where: AccountUserWhereUniqueInput
    update: XOR<AccountUserUpdateWithoutAccountInput, AccountUserUncheckedUpdateWithoutAccountInput>
    create: XOR<AccountUserCreateWithoutAccountInput, AccountUserUncheckedCreateWithoutAccountInput>
  }

  export type AccountUserUpdateWithWhereUniqueWithoutAccountInput = {
    where: AccountUserWhereUniqueInput
    data: XOR<AccountUserUpdateWithoutAccountInput, AccountUserUncheckedUpdateWithoutAccountInput>
  }

  export type AccountUserUpdateManyWithWhereWithoutAccountInput = {
    where: AccountUserScalarWhereInput
    data: XOR<AccountUserUpdateManyMutationInput, AccountUserUncheckedUpdateManyWithoutAccountInput>
  }

  export type CategoryUpsertWithWhereUniqueWithoutAccountInput = {
    where: CategoryWhereUniqueInput
    update: XOR<CategoryUpdateWithoutAccountInput, CategoryUncheckedUpdateWithoutAccountInput>
    create: XOR<CategoryCreateWithoutAccountInput, CategoryUncheckedCreateWithoutAccountInput>
  }

  export type CategoryUpdateWithWhereUniqueWithoutAccountInput = {
    where: CategoryWhereUniqueInput
    data: XOR<CategoryUpdateWithoutAccountInput, CategoryUncheckedUpdateWithoutAccountInput>
  }

  export type CategoryUpdateManyWithWhereWithoutAccountInput = {
    where: CategoryScalarWhereInput
    data: XOR<CategoryUpdateManyMutationInput, CategoryUncheckedUpdateManyWithoutAccountInput>
  }

  export type CategoryScalarWhereInput = {
    AND?: CategoryScalarWhereInput | CategoryScalarWhereInput[]
    OR?: CategoryScalarWhereInput[]
    NOT?: CategoryScalarWhereInput | CategoryScalarWhereInput[]
    id?: IntFilter<"Category"> | number
    accountId?: IntFilter<"Category"> | number
    name?: StringFilter<"Category"> | string
    deletedAt?: DateTimeNullableFilter<"Category"> | Date | string | null
  }

  export type ExpenseUpsertWithWhereUniqueWithoutAccountInput = {
    where: ExpenseWhereUniqueInput
    update: XOR<ExpenseUpdateWithoutAccountInput, ExpenseUncheckedUpdateWithoutAccountInput>
    create: XOR<ExpenseCreateWithoutAccountInput, ExpenseUncheckedCreateWithoutAccountInput>
  }

  export type ExpenseUpdateWithWhereUniqueWithoutAccountInput = {
    where: ExpenseWhereUniqueInput
    data: XOR<ExpenseUpdateWithoutAccountInput, ExpenseUncheckedUpdateWithoutAccountInput>
  }

  export type ExpenseUpdateManyWithWhereWithoutAccountInput = {
    where: ExpenseScalarWhereInput
    data: XOR<ExpenseUpdateManyMutationInput, ExpenseUncheckedUpdateManyWithoutAccountInput>
  }

  export type ExpenseScalarWhereInput = {
    AND?: ExpenseScalarWhereInput | ExpenseScalarWhereInput[]
    OR?: ExpenseScalarWhereInput[]
    NOT?: ExpenseScalarWhereInput | ExpenseScalarWhereInput[]
    id?: IntFilter<"Expense"> | number
    accountId?: IntFilter<"Expense"> | number
    categoryId?: IntFilter<"Expense"> | number
    amount?: FloatFilter<"Expense"> | number
    description?: StringNullableFilter<"Expense"> | string | null
    date?: DateTimeFilter<"Expense"> | Date | string
  }

  export type AccountInvitationUpsertWithWhereUniqueWithoutAccountInput = {
    where: AccountInvitationWhereUniqueInput
    update: XOR<AccountInvitationUpdateWithoutAccountInput, AccountInvitationUncheckedUpdateWithoutAccountInput>
    create: XOR<AccountInvitationCreateWithoutAccountInput, AccountInvitationUncheckedCreateWithoutAccountInput>
  }

  export type AccountInvitationUpdateWithWhereUniqueWithoutAccountInput = {
    where: AccountInvitationWhereUniqueInput
    data: XOR<AccountInvitationUpdateWithoutAccountInput, AccountInvitationUncheckedUpdateWithoutAccountInput>
  }

  export type AccountInvitationUpdateManyWithWhereWithoutAccountInput = {
    where: AccountInvitationScalarWhereInput
    data: XOR<AccountInvitationUpdateManyMutationInput, AccountInvitationUncheckedUpdateManyWithoutAccountInput>
  }

  export type AccountInvitationScalarWhereInput = {
    AND?: AccountInvitationScalarWhereInput | AccountInvitationScalarWhereInput[]
    OR?: AccountInvitationScalarWhereInput[]
    NOT?: AccountInvitationScalarWhereInput | AccountInvitationScalarWhereInput[]
    id?: IntFilter<"AccountInvitation"> | number
    code?: StringFilter<"AccountInvitation"> | string
    accountId?: IntFilter<"AccountInvitation"> | number
    createdBy?: BigIntFilter<"AccountInvitation"> | bigint | number
    expiresAt?: DateTimeFilter<"AccountInvitation"> | Date | string
    usedAt?: DateTimeNullableFilter<"AccountInvitation"> | Date | string | null
    usedBy?: BigIntNullableFilter<"AccountInvitation"> | bigint | number | null
  }

  export type AccountCreateWithoutInvitationsInput = {
    name: string
    createdAt?: Date | string
    owner: UserCreateNestedOneWithoutOwnedAccountsInput
    users?: AccountUserCreateNestedManyWithoutAccountInput
    categories?: CategoryCreateNestedManyWithoutAccountInput
    expenses?: ExpenseCreateNestedManyWithoutAccountInput
  }

  export type AccountUncheckedCreateWithoutInvitationsInput = {
    id?: number
    name: string
    ownerId: bigint | number
    createdAt?: Date | string
    users?: AccountUserUncheckedCreateNestedManyWithoutAccountInput
    categories?: CategoryUncheckedCreateNestedManyWithoutAccountInput
    expenses?: ExpenseUncheckedCreateNestedManyWithoutAccountInput
  }

  export type AccountCreateOrConnectWithoutInvitationsInput = {
    where: AccountWhereUniqueInput
    create: XOR<AccountCreateWithoutInvitationsInput, AccountUncheckedCreateWithoutInvitationsInput>
  }

  export type AccountUpsertWithoutInvitationsInput = {
    update: XOR<AccountUpdateWithoutInvitationsInput, AccountUncheckedUpdateWithoutInvitationsInput>
    create: XOR<AccountCreateWithoutInvitationsInput, AccountUncheckedCreateWithoutInvitationsInput>
    where?: AccountWhereInput
  }

  export type AccountUpdateToOneWithWhereWithoutInvitationsInput = {
    where?: AccountWhereInput
    data: XOR<AccountUpdateWithoutInvitationsInput, AccountUncheckedUpdateWithoutInvitationsInput>
  }

  export type AccountUpdateWithoutInvitationsInput = {
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    owner?: UserUpdateOneRequiredWithoutOwnedAccountsNestedInput
    users?: AccountUserUpdateManyWithoutAccountNestedInput
    categories?: CategoryUpdateManyWithoutAccountNestedInput
    expenses?: ExpenseUpdateManyWithoutAccountNestedInput
  }

  export type AccountUncheckedUpdateWithoutInvitationsInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    ownerId?: BigIntFieldUpdateOperationsInput | bigint | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    users?: AccountUserUncheckedUpdateManyWithoutAccountNestedInput
    categories?: CategoryUncheckedUpdateManyWithoutAccountNestedInput
    expenses?: ExpenseUncheckedUpdateManyWithoutAccountNestedInput
  }

  export type UserCreateWithoutAccountsInput = {
    id: bigint | number
    createdAt?: Date | string
    ownedAccounts?: AccountCreateNestedManyWithoutOwnerInput
  }

  export type UserUncheckedCreateWithoutAccountsInput = {
    id: bigint | number
    createdAt?: Date | string
    ownedAccounts?: AccountUncheckedCreateNestedManyWithoutOwnerInput
  }

  export type UserCreateOrConnectWithoutAccountsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutAccountsInput, UserUncheckedCreateWithoutAccountsInput>
  }

  export type AccountCreateWithoutUsersInput = {
    name: string
    createdAt?: Date | string
    owner: UserCreateNestedOneWithoutOwnedAccountsInput
    categories?: CategoryCreateNestedManyWithoutAccountInput
    expenses?: ExpenseCreateNestedManyWithoutAccountInput
    invitations?: AccountInvitationCreateNestedManyWithoutAccountInput
  }

  export type AccountUncheckedCreateWithoutUsersInput = {
    id?: number
    name: string
    ownerId: bigint | number
    createdAt?: Date | string
    categories?: CategoryUncheckedCreateNestedManyWithoutAccountInput
    expenses?: ExpenseUncheckedCreateNestedManyWithoutAccountInput
    invitations?: AccountInvitationUncheckedCreateNestedManyWithoutAccountInput
  }

  export type AccountCreateOrConnectWithoutUsersInput = {
    where: AccountWhereUniqueInput
    create: XOR<AccountCreateWithoutUsersInput, AccountUncheckedCreateWithoutUsersInput>
  }

  export type UserUpsertWithoutAccountsInput = {
    update: XOR<UserUpdateWithoutAccountsInput, UserUncheckedUpdateWithoutAccountsInput>
    create: XOR<UserCreateWithoutAccountsInput, UserUncheckedCreateWithoutAccountsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutAccountsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutAccountsInput, UserUncheckedUpdateWithoutAccountsInput>
  }

  export type UserUpdateWithoutAccountsInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    ownedAccounts?: AccountUpdateManyWithoutOwnerNestedInput
  }

  export type UserUncheckedUpdateWithoutAccountsInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    ownedAccounts?: AccountUncheckedUpdateManyWithoutOwnerNestedInput
  }

  export type AccountUpsertWithoutUsersInput = {
    update: XOR<AccountUpdateWithoutUsersInput, AccountUncheckedUpdateWithoutUsersInput>
    create: XOR<AccountCreateWithoutUsersInput, AccountUncheckedCreateWithoutUsersInput>
    where?: AccountWhereInput
  }

  export type AccountUpdateToOneWithWhereWithoutUsersInput = {
    where?: AccountWhereInput
    data: XOR<AccountUpdateWithoutUsersInput, AccountUncheckedUpdateWithoutUsersInput>
  }

  export type AccountUpdateWithoutUsersInput = {
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    owner?: UserUpdateOneRequiredWithoutOwnedAccountsNestedInput
    categories?: CategoryUpdateManyWithoutAccountNestedInput
    expenses?: ExpenseUpdateManyWithoutAccountNestedInput
    invitations?: AccountInvitationUpdateManyWithoutAccountNestedInput
  }

  export type AccountUncheckedUpdateWithoutUsersInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    ownerId?: BigIntFieldUpdateOperationsInput | bigint | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    categories?: CategoryUncheckedUpdateManyWithoutAccountNestedInput
    expenses?: ExpenseUncheckedUpdateManyWithoutAccountNestedInput
    invitations?: AccountInvitationUncheckedUpdateManyWithoutAccountNestedInput
  }

  export type AccountCreateWithoutCategoriesInput = {
    name: string
    createdAt?: Date | string
    owner: UserCreateNestedOneWithoutOwnedAccountsInput
    users?: AccountUserCreateNestedManyWithoutAccountInput
    expenses?: ExpenseCreateNestedManyWithoutAccountInput
    invitations?: AccountInvitationCreateNestedManyWithoutAccountInput
  }

  export type AccountUncheckedCreateWithoutCategoriesInput = {
    id?: number
    name: string
    ownerId: bigint | number
    createdAt?: Date | string
    users?: AccountUserUncheckedCreateNestedManyWithoutAccountInput
    expenses?: ExpenseUncheckedCreateNestedManyWithoutAccountInput
    invitations?: AccountInvitationUncheckedCreateNestedManyWithoutAccountInput
  }

  export type AccountCreateOrConnectWithoutCategoriesInput = {
    where: AccountWhereUniqueInput
    create: XOR<AccountCreateWithoutCategoriesInput, AccountUncheckedCreateWithoutCategoriesInput>
  }

  export type ExpenseCreateWithoutCategoryInput = {
    amount: number
    description?: string | null
    date: Date | string
    account: AccountCreateNestedOneWithoutExpensesInput
  }

  export type ExpenseUncheckedCreateWithoutCategoryInput = {
    id?: number
    accountId: number
    amount: number
    description?: string | null
    date: Date | string
  }

  export type ExpenseCreateOrConnectWithoutCategoryInput = {
    where: ExpenseWhereUniqueInput
    create: XOR<ExpenseCreateWithoutCategoryInput, ExpenseUncheckedCreateWithoutCategoryInput>
  }

  export type ExpenseCreateManyCategoryInputEnvelope = {
    data: ExpenseCreateManyCategoryInput | ExpenseCreateManyCategoryInput[]
  }

  export type SubcategoryCreateWithoutCategoryInput = {
    name: string
    deletedAt?: Date | string | null
  }

  export type SubcategoryUncheckedCreateWithoutCategoryInput = {
    id?: number
    name: string
    deletedAt?: Date | string | null
  }

  export type SubcategoryCreateOrConnectWithoutCategoryInput = {
    where: SubcategoryWhereUniqueInput
    create: XOR<SubcategoryCreateWithoutCategoryInput, SubcategoryUncheckedCreateWithoutCategoryInput>
  }

  export type SubcategoryCreateManyCategoryInputEnvelope = {
    data: SubcategoryCreateManyCategoryInput | SubcategoryCreateManyCategoryInput[]
  }

  export type AccountUpsertWithoutCategoriesInput = {
    update: XOR<AccountUpdateWithoutCategoriesInput, AccountUncheckedUpdateWithoutCategoriesInput>
    create: XOR<AccountCreateWithoutCategoriesInput, AccountUncheckedCreateWithoutCategoriesInput>
    where?: AccountWhereInput
  }

  export type AccountUpdateToOneWithWhereWithoutCategoriesInput = {
    where?: AccountWhereInput
    data: XOR<AccountUpdateWithoutCategoriesInput, AccountUncheckedUpdateWithoutCategoriesInput>
  }

  export type AccountUpdateWithoutCategoriesInput = {
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    owner?: UserUpdateOneRequiredWithoutOwnedAccountsNestedInput
    users?: AccountUserUpdateManyWithoutAccountNestedInput
    expenses?: ExpenseUpdateManyWithoutAccountNestedInput
    invitations?: AccountInvitationUpdateManyWithoutAccountNestedInput
  }

  export type AccountUncheckedUpdateWithoutCategoriesInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    ownerId?: BigIntFieldUpdateOperationsInput | bigint | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    users?: AccountUserUncheckedUpdateManyWithoutAccountNestedInput
    expenses?: ExpenseUncheckedUpdateManyWithoutAccountNestedInput
    invitations?: AccountInvitationUncheckedUpdateManyWithoutAccountNestedInput
  }

  export type ExpenseUpsertWithWhereUniqueWithoutCategoryInput = {
    where: ExpenseWhereUniqueInput
    update: XOR<ExpenseUpdateWithoutCategoryInput, ExpenseUncheckedUpdateWithoutCategoryInput>
    create: XOR<ExpenseCreateWithoutCategoryInput, ExpenseUncheckedCreateWithoutCategoryInput>
  }

  export type ExpenseUpdateWithWhereUniqueWithoutCategoryInput = {
    where: ExpenseWhereUniqueInput
    data: XOR<ExpenseUpdateWithoutCategoryInput, ExpenseUncheckedUpdateWithoutCategoryInput>
  }

  export type ExpenseUpdateManyWithWhereWithoutCategoryInput = {
    where: ExpenseScalarWhereInput
    data: XOR<ExpenseUpdateManyMutationInput, ExpenseUncheckedUpdateManyWithoutCategoryInput>
  }

  export type SubcategoryUpsertWithWhereUniqueWithoutCategoryInput = {
    where: SubcategoryWhereUniqueInput
    update: XOR<SubcategoryUpdateWithoutCategoryInput, SubcategoryUncheckedUpdateWithoutCategoryInput>
    create: XOR<SubcategoryCreateWithoutCategoryInput, SubcategoryUncheckedCreateWithoutCategoryInput>
  }

  export type SubcategoryUpdateWithWhereUniqueWithoutCategoryInput = {
    where: SubcategoryWhereUniqueInput
    data: XOR<SubcategoryUpdateWithoutCategoryInput, SubcategoryUncheckedUpdateWithoutCategoryInput>
  }

  export type SubcategoryUpdateManyWithWhereWithoutCategoryInput = {
    where: SubcategoryScalarWhereInput
    data: XOR<SubcategoryUpdateManyMutationInput, SubcategoryUncheckedUpdateManyWithoutCategoryInput>
  }

  export type SubcategoryScalarWhereInput = {
    AND?: SubcategoryScalarWhereInput | SubcategoryScalarWhereInput[]
    OR?: SubcategoryScalarWhereInput[]
    NOT?: SubcategoryScalarWhereInput | SubcategoryScalarWhereInput[]
    id?: IntFilter<"Subcategory"> | number
    categoryId?: IntFilter<"Subcategory"> | number
    name?: StringFilter<"Subcategory"> | string
    deletedAt?: DateTimeNullableFilter<"Subcategory"> | Date | string | null
  }

  export type CategoryCreateWithoutSubcategoriesInput = {
    name: string
    deletedAt?: Date | string | null
    account: AccountCreateNestedOneWithoutCategoriesInput
    expenses?: ExpenseCreateNestedManyWithoutCategoryInput
  }

  export type CategoryUncheckedCreateWithoutSubcategoriesInput = {
    id?: number
    accountId: number
    name: string
    deletedAt?: Date | string | null
    expenses?: ExpenseUncheckedCreateNestedManyWithoutCategoryInput
  }

  export type CategoryCreateOrConnectWithoutSubcategoriesInput = {
    where: CategoryWhereUniqueInput
    create: XOR<CategoryCreateWithoutSubcategoriesInput, CategoryUncheckedCreateWithoutSubcategoriesInput>
  }

  export type CategoryUpsertWithoutSubcategoriesInput = {
    update: XOR<CategoryUpdateWithoutSubcategoriesInput, CategoryUncheckedUpdateWithoutSubcategoriesInput>
    create: XOR<CategoryCreateWithoutSubcategoriesInput, CategoryUncheckedCreateWithoutSubcategoriesInput>
    where?: CategoryWhereInput
  }

  export type CategoryUpdateToOneWithWhereWithoutSubcategoriesInput = {
    where?: CategoryWhereInput
    data: XOR<CategoryUpdateWithoutSubcategoriesInput, CategoryUncheckedUpdateWithoutSubcategoriesInput>
  }

  export type CategoryUpdateWithoutSubcategoriesInput = {
    name?: StringFieldUpdateOperationsInput | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    account?: AccountUpdateOneRequiredWithoutCategoriesNestedInput
    expenses?: ExpenseUpdateManyWithoutCategoryNestedInput
  }

  export type CategoryUncheckedUpdateWithoutSubcategoriesInput = {
    id?: IntFieldUpdateOperationsInput | number
    accountId?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    expenses?: ExpenseUncheckedUpdateManyWithoutCategoryNestedInput
  }

  export type AccountCreateWithoutExpensesInput = {
    name: string
    createdAt?: Date | string
    owner: UserCreateNestedOneWithoutOwnedAccountsInput
    users?: AccountUserCreateNestedManyWithoutAccountInput
    categories?: CategoryCreateNestedManyWithoutAccountInput
    invitations?: AccountInvitationCreateNestedManyWithoutAccountInput
  }

  export type AccountUncheckedCreateWithoutExpensesInput = {
    id?: number
    name: string
    ownerId: bigint | number
    createdAt?: Date | string
    users?: AccountUserUncheckedCreateNestedManyWithoutAccountInput
    categories?: CategoryUncheckedCreateNestedManyWithoutAccountInput
    invitations?: AccountInvitationUncheckedCreateNestedManyWithoutAccountInput
  }

  export type AccountCreateOrConnectWithoutExpensesInput = {
    where: AccountWhereUniqueInput
    create: XOR<AccountCreateWithoutExpensesInput, AccountUncheckedCreateWithoutExpensesInput>
  }

  export type CategoryCreateWithoutExpensesInput = {
    name: string
    deletedAt?: Date | string | null
    account: AccountCreateNestedOneWithoutCategoriesInput
    subcategories?: SubcategoryCreateNestedManyWithoutCategoryInput
  }

  export type CategoryUncheckedCreateWithoutExpensesInput = {
    id?: number
    accountId: number
    name: string
    deletedAt?: Date | string | null
    subcategories?: SubcategoryUncheckedCreateNestedManyWithoutCategoryInput
  }

  export type CategoryCreateOrConnectWithoutExpensesInput = {
    where: CategoryWhereUniqueInput
    create: XOR<CategoryCreateWithoutExpensesInput, CategoryUncheckedCreateWithoutExpensesInput>
  }

  export type AccountUpsertWithoutExpensesInput = {
    update: XOR<AccountUpdateWithoutExpensesInput, AccountUncheckedUpdateWithoutExpensesInput>
    create: XOR<AccountCreateWithoutExpensesInput, AccountUncheckedCreateWithoutExpensesInput>
    where?: AccountWhereInput
  }

  export type AccountUpdateToOneWithWhereWithoutExpensesInput = {
    where?: AccountWhereInput
    data: XOR<AccountUpdateWithoutExpensesInput, AccountUncheckedUpdateWithoutExpensesInput>
  }

  export type AccountUpdateWithoutExpensesInput = {
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    owner?: UserUpdateOneRequiredWithoutOwnedAccountsNestedInput
    users?: AccountUserUpdateManyWithoutAccountNestedInput
    categories?: CategoryUpdateManyWithoutAccountNestedInput
    invitations?: AccountInvitationUpdateManyWithoutAccountNestedInput
  }

  export type AccountUncheckedUpdateWithoutExpensesInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    ownerId?: BigIntFieldUpdateOperationsInput | bigint | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    users?: AccountUserUncheckedUpdateManyWithoutAccountNestedInput
    categories?: CategoryUncheckedUpdateManyWithoutAccountNestedInput
    invitations?: AccountInvitationUncheckedUpdateManyWithoutAccountNestedInput
  }

  export type CategoryUpsertWithoutExpensesInput = {
    update: XOR<CategoryUpdateWithoutExpensesInput, CategoryUncheckedUpdateWithoutExpensesInput>
    create: XOR<CategoryCreateWithoutExpensesInput, CategoryUncheckedCreateWithoutExpensesInput>
    where?: CategoryWhereInput
  }

  export type CategoryUpdateToOneWithWhereWithoutExpensesInput = {
    where?: CategoryWhereInput
    data: XOR<CategoryUpdateWithoutExpensesInput, CategoryUncheckedUpdateWithoutExpensesInput>
  }

  export type CategoryUpdateWithoutExpensesInput = {
    name?: StringFieldUpdateOperationsInput | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    account?: AccountUpdateOneRequiredWithoutCategoriesNestedInput
    subcategories?: SubcategoryUpdateManyWithoutCategoryNestedInput
  }

  export type CategoryUncheckedUpdateWithoutExpensesInput = {
    id?: IntFieldUpdateOperationsInput | number
    accountId?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    subcategories?: SubcategoryUncheckedUpdateManyWithoutCategoryNestedInput
  }

  export type AccountCreateManyOwnerInput = {
    id?: number
    name: string
    createdAt?: Date | string
  }

  export type AccountUserCreateManyUserInput = {
    accountId: number
    joinedAt?: Date | string
  }

  export type AccountUpdateWithoutOwnerInput = {
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    users?: AccountUserUpdateManyWithoutAccountNestedInput
    categories?: CategoryUpdateManyWithoutAccountNestedInput
    expenses?: ExpenseUpdateManyWithoutAccountNestedInput
    invitations?: AccountInvitationUpdateManyWithoutAccountNestedInput
  }

  export type AccountUncheckedUpdateWithoutOwnerInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    users?: AccountUserUncheckedUpdateManyWithoutAccountNestedInput
    categories?: CategoryUncheckedUpdateManyWithoutAccountNestedInput
    expenses?: ExpenseUncheckedUpdateManyWithoutAccountNestedInput
    invitations?: AccountInvitationUncheckedUpdateManyWithoutAccountNestedInput
  }

  export type AccountUncheckedUpdateManyWithoutOwnerInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AccountUserUpdateWithoutUserInput = {
    joinedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    account?: AccountUpdateOneRequiredWithoutUsersNestedInput
  }

  export type AccountUserUncheckedUpdateWithoutUserInput = {
    accountId?: IntFieldUpdateOperationsInput | number
    joinedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AccountUserUncheckedUpdateManyWithoutUserInput = {
    accountId?: IntFieldUpdateOperationsInput | number
    joinedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AccountUserCreateManyAccountInput = {
    userId: bigint | number
    joinedAt?: Date | string
  }

  export type CategoryCreateManyAccountInput = {
    id?: number
    name: string
    deletedAt?: Date | string | null
  }

  export type ExpenseCreateManyAccountInput = {
    id?: number
    categoryId: number
    amount: number
    description?: string | null
    date: Date | string
  }

  export type AccountInvitationCreateManyAccountInput = {
    id?: number
    code: string
    createdBy: bigint | number
    expiresAt: Date | string
    usedAt?: Date | string | null
    usedBy?: bigint | number | null
  }

  export type AccountUserUpdateWithoutAccountInput = {
    joinedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutAccountsNestedInput
  }

  export type AccountUserUncheckedUpdateWithoutAccountInput = {
    userId?: BigIntFieldUpdateOperationsInput | bigint | number
    joinedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AccountUserUncheckedUpdateManyWithoutAccountInput = {
    userId?: BigIntFieldUpdateOperationsInput | bigint | number
    joinedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CategoryUpdateWithoutAccountInput = {
    name?: StringFieldUpdateOperationsInput | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    expenses?: ExpenseUpdateManyWithoutCategoryNestedInput
    subcategories?: SubcategoryUpdateManyWithoutCategoryNestedInput
  }

  export type CategoryUncheckedUpdateWithoutAccountInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    expenses?: ExpenseUncheckedUpdateManyWithoutCategoryNestedInput
    subcategories?: SubcategoryUncheckedUpdateManyWithoutCategoryNestedInput
  }

  export type CategoryUncheckedUpdateManyWithoutAccountInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type ExpenseUpdateWithoutAccountInput = {
    amount?: FloatFieldUpdateOperationsInput | number
    description?: NullableStringFieldUpdateOperationsInput | string | null
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    category?: CategoryUpdateOneRequiredWithoutExpensesNestedInput
  }

  export type ExpenseUncheckedUpdateWithoutAccountInput = {
    id?: IntFieldUpdateOperationsInput | number
    categoryId?: IntFieldUpdateOperationsInput | number
    amount?: FloatFieldUpdateOperationsInput | number
    description?: NullableStringFieldUpdateOperationsInput | string | null
    date?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ExpenseUncheckedUpdateManyWithoutAccountInput = {
    id?: IntFieldUpdateOperationsInput | number
    categoryId?: IntFieldUpdateOperationsInput | number
    amount?: FloatFieldUpdateOperationsInput | number
    description?: NullableStringFieldUpdateOperationsInput | string | null
    date?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AccountInvitationUpdateWithoutAccountInput = {
    code?: StringFieldUpdateOperationsInput | string
    createdBy?: BigIntFieldUpdateOperationsInput | bigint | number
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    usedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    usedBy?: NullableBigIntFieldUpdateOperationsInput | bigint | number | null
  }

  export type AccountInvitationUncheckedUpdateWithoutAccountInput = {
    id?: IntFieldUpdateOperationsInput | number
    code?: StringFieldUpdateOperationsInput | string
    createdBy?: BigIntFieldUpdateOperationsInput | bigint | number
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    usedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    usedBy?: NullableBigIntFieldUpdateOperationsInput | bigint | number | null
  }

  export type AccountInvitationUncheckedUpdateManyWithoutAccountInput = {
    id?: IntFieldUpdateOperationsInput | number
    code?: StringFieldUpdateOperationsInput | string
    createdBy?: BigIntFieldUpdateOperationsInput | bigint | number
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    usedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    usedBy?: NullableBigIntFieldUpdateOperationsInput | bigint | number | null
  }

  export type ExpenseCreateManyCategoryInput = {
    id?: number
    accountId: number
    amount: number
    description?: string | null
    date: Date | string
  }

  export type SubcategoryCreateManyCategoryInput = {
    id?: number
    name: string
    deletedAt?: Date | string | null
  }

  export type ExpenseUpdateWithoutCategoryInput = {
    amount?: FloatFieldUpdateOperationsInput | number
    description?: NullableStringFieldUpdateOperationsInput | string | null
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    account?: AccountUpdateOneRequiredWithoutExpensesNestedInput
  }

  export type ExpenseUncheckedUpdateWithoutCategoryInput = {
    id?: IntFieldUpdateOperationsInput | number
    accountId?: IntFieldUpdateOperationsInput | number
    amount?: FloatFieldUpdateOperationsInput | number
    description?: NullableStringFieldUpdateOperationsInput | string | null
    date?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ExpenseUncheckedUpdateManyWithoutCategoryInput = {
    id?: IntFieldUpdateOperationsInput | number
    accountId?: IntFieldUpdateOperationsInput | number
    amount?: FloatFieldUpdateOperationsInput | number
    description?: NullableStringFieldUpdateOperationsInput | string | null
    date?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SubcategoryUpdateWithoutCategoryInput = {
    name?: StringFieldUpdateOperationsInput | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type SubcategoryUncheckedUpdateWithoutCategoryInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type SubcategoryUncheckedUpdateManyWithoutCategoryInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}