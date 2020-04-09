# Apollo Configurable REST Data Source

This rest datasource is an extension of [apollo's rest data source](https://github.com/apollographql/apollo-server/tree/master/packages/apollo-datasource-rest). So you have all the options which come from apollo's rest data source and even more: 

This extension aims to simplify data source definitions in your [apollo server](https://github.com/apollographql/apollo-server) by configuring them via class parameters.

## Installation

```bash
yarn add apollo-datasource-configurable-rest
# or
npm i apollo-datasource-configurable-rest
```

## Usage

One key thought, besides the configuration via class parameter, is that all keywords which are prefixed with a `$` are replaced by the query argument with the same name. 

For example if you have a query argument named `language` and you use `$language` in your definitions it will be replaced by the query argument.

### Simple example

The following example shows how to configure a get request with url params and headers:

```typescript
import { ConfigurableRESTDataSource } from 'apollo-datasource-configurable-rest'

export class MyRestDatasource extends ConfigurableRESTDataSource {

  // $book will be replaced by the query argument named "book"
  baseURL = 'https://api.com/texts/$book'

  // if your query contains optional arguments 
  // you can set a default value for these arguments here
  defaultArgs = {
    book: 'title-of-book'
    language: 'de',
    chapter: 1,
  }

  // url parameter definitions
  // with the default arguments this would result in:
  // https://api.com/texts/title-of-book?lng=de&chapter=1
  params = {
    lng: "$language",
    chapter: "$chapter",
  }

  // header definitions
  // the $accessToken keyword would replaced by
  // the query argument named "accessToken"
  headers = {
    Authorization: 'Bearer $accessToken',
    'Content-Type': 'application/json',
  }

  // this is for your resolver
  async fetchChapters(args: QueryArgs) {
    // the configuredGET command now replaces the arguments
    // in the url, parameters and headers and fetches the api
    return this.configuredGET(args)
  }
}
```

### Configured fetchers

There are fetchers `GET`, `DELETE`, `POST`, `PUT` and `PATCH`. 

```ts
async configuredGET<TResult = any>(args: Partial<TArgs>, options?: RequestInitOptions): Promise<TResult>

async configuredDELETE<TResult = any>(args: Partial<TArgs>, options?: RequestInitOptions): Promise<TResult>

async configuredPOST<TResult = any>(args: Partial<TArgs>, body?: Body): Promise<TResult>

async configuredPUT<TResult = any>(args: Partial<TArgs>, body?: Body): Promise<TResult>

async configuredPATCH<TResult = any>(args: Partial<TArgs>, body?: Body): Promise<TResult>
```

### Caching

You can configure a cache time for the `GET` and `DELETE` fetcher:

```ts
public fetchChapters(args: QueryArgs) {
  this.configuredGET(args, { cacheTime: 3000 })
}
```

### Use Generics

You can define typings for your query arguments, url parameters, headers and body definitions:

```typescript
import { ConfigurableRESTDataSource } from 'apollo-datasource-configurable-rest'

type QueryArgs = {
  book?: string,
  language?: string,
  chapter?: number,
  accessToken: string,
}

type Params = {
  lng: string,
  chapter: number,
}

type Headers = {
  Authorization: string 
}

type Body = {
  myBody: {
    structure: string,
    num: number,
  }
}

export class MyRestDatasource extends ConfigurableRESTDataSource<
  QueryArgs, Params, Headers, Body
> {
  // ...
}


