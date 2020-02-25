import { RESTDataSource } from 'apollo-datasource-rest'
import { URLSearchParams, RequestInit } from 'apollo-server-env'
import { Headers as RequestHeaders } from 'apollo-env'

type MaybeObject<T> = T | Record<string, string>

type PrivateConfig<TParams, THeaders, TBody> = {
  url: string,
  params: MaybeObject<TParams>,
  headers: MaybeObject<THeaders>,
  body: MaybeObject<TBody>,
  cacheTime: number,
}

type RequestInitOptions = {
  cacheTime?: number
}

export class ConfigurableRESTDataSource<
  TArgs = Record<string, string>,
  TParams = Record<string, string>, 
  THeaders = Record<string, string>, 
  TBody = Record<string, string>
> extends RESTDataSource {
  private config: PrivateConfig<TParams, THeaders, TBody> = {
    url: '',
    params: {},
    headers: {},
    body: {},
    cacheTime: 5,
  }

  protected set url(url: string) {
    this.config.url = url
  }
  protected set params(params: MaybeObject<TParams>) {
    this.config.params = params
  }
  protected set headers(headers: MaybeObject<THeaders>) {
    this.config.headers = headers
  }
  protected set body(body: MaybeObject<TBody>) {
    this.config.body = body
  }
  protected set cacheTime(cacheTime: number) {
    this.config.cacheTime = cacheTime
  }

  protected get url(): string {
    return this.config.url
  }
  protected get params(): MaybeObject<TParams> {
    return this.config.params
  }
  protected get headers(): MaybeObject<THeaders> {
    return this.config.headers
  }
  protected get body(): MaybeObject<TBody> {
    return this.config.body
  }
  protected get cacheTime() {
    return this.config.cacheTime
  }

  protected async configuredGET<TResult = any>(args: MaybeObject<TArgs>, options?: RequestInitOptions): Promise<TResult> {
    return this.get<TResult>(
      this.url,
      this.convertToURLSearchParams(this.params, args),
      this.getRequestInit(args, options),
    )
  }

  protected async configuredPOST<TResult = any>(args: MaybeObject<TArgs>, body?: string): Promise<TResult> {
    return this.post<TResult>(
      this.url,
      body,
      this.getRequestInit(args),
    )
  }

  protected async configuredPUT<TResult = any>(args: MaybeObject<TArgs>, body?: string): Promise<TResult> {
    return this.put<TResult>(
      this.url,
      body,
      this.getRequestInit(args),
    )
  }

  private replaceArgsInObject<TObject = Record<string, string>>(obj: TObject, args: MaybeObject<TArgs>): TObject {
    let str = JSON.stringify(obj)
    for (const key in (args as Record<string, string>)) {
      str = str.replace(`$${key}`, (args as Record<string, string>)[key])
    }
    return JSON.parse(str)
  }

  private convertToURLSearchParams(params: MaybeObject<TParams>, args: MaybeObject<TArgs>): URLSearchParams {
    const paramsWithReplacedArgs = this.replaceArgsInObject<MaybeObject<TParams>>(params, args)
    const urlParams = new URLSearchParams()
    for (const key in (paramsWithReplacedArgs as Record<string, string>)) {
      urlParams.append(key, (paramsWithReplacedArgs as Record<string, string>)[key])
    }
    return urlParams
  }

  private convertToHeaders(headers: MaybeObject<THeaders>, args: MaybeObject<TArgs>): RequestHeaders {
    const headersWithReplacedArgs = this.replaceArgsInObject<MaybeObject<THeaders>>(headers, args)
    const requestHeaders = new RequestHeaders()
    for (const key in (headersWithReplacedArgs as Record<string, string>)) {
      requestHeaders.append(key, (headersWithReplacedArgs as Record<string, string>)[key])
    }
    return requestHeaders
  }

  private getRequestInit(args: MaybeObject<TArgs>, options?: RequestInitOptions): RequestInit {
    const ttl = (options && options.cacheTime) || this.cacheTime
    return {
      cacheOptions: { ttl },
      headers: this.convertToHeaders(this.headers, args)
    }
  }
}