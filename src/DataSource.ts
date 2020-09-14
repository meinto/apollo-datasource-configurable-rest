import { RESTDataSource } from 'apollo-datasource-rest'
import { URLSearchParams, RequestInit, BodyInit } from 'apollo-server-env'
import { Headers as RequestHeaders } from 'apollo-env'

export type PrivateConfig<TArgs, TParams, THeaders, TBody> = {
  url: string,
  defaultArgs: Partial<TArgs>,
  params: TParams,
  headers: THeaders,
  body: TBody,
  cacheTime: number,
}

export type RequestInitOptions = {
  cacheTime?: number
}

export type Body = BodyInit | object

export class ConfigurableRESTDataSource<
  TArgs = Record<string, string>,
  TParams = Record<string, string>, 
  THeaders = Record<string, string>, 
  TBody = Body, 
> extends RESTDataSource {
  private config: PrivateConfig<TArgs, TParams, THeaders, TBody> = {
    url: '',
    defaultArgs: {} as TArgs,
    params: {} as TParams,
    headers: {} as THeaders,
    body: {} as TBody,
    cacheTime: 5,
  }

  protected set url(url: string) {
    this.config.url = url
  }
  protected set defaultArgs(args: Partial<TArgs>) {
    this.config.defaultArgs = args
  }
  protected set params(params: TParams) {
    this.config.params = params
  }
  protected set headers(headers: THeaders) {
    this.config.headers = headers
  }
  protected set body(body: TBody) {
    this.config.body = body
  }
  protected set cacheTime(cacheTime: number) {
    this.config.cacheTime = cacheTime
  }

  protected get url(): string {
    return this.config.url
  }
  protected get defaultArgs(): Partial<TArgs> {
    return this.config.defaultArgs
  }
  protected get params(): TParams {
    return this.config.params
  }
  protected get headers(): THeaders {
    return this.config.headers
  }
  protected get body(): TBody {
    return this.config.body
  }
  protected get cacheTime() {
    return this.config.cacheTime
  }

  public async configuredGET<TResult = any>(args: Partial<TArgs>, options?: RequestInitOptions): Promise<TResult> {
    return this.get<TResult>(
      this.replaceArgsInString(this.url, this.getArgs(args)),
      this.convertToURLSearchParams(this.params, this.getArgs(args)),
      this.getRequestInit(this.getArgs(args), options),
    )
  }

  public async configuredDELETE<TResult = any>(args: Partial<TArgs>, options?: RequestInitOptions): Promise<TResult> {
    return this.delete<TResult>(
      this.replaceArgsInString(this.url, this.getArgs(args)),
      this.convertToURLSearchParams(this.params, this.getArgs(args)),
      this.getRequestInit(this.getArgs(args), options),
    )
  }

  public async configuredPOST<TResult = any>(args: Partial<TArgs>, body?: Body): Promise<TResult> {
    const url = new URL(this.replaceArgsInString(this.url, this.getArgs(args)))
    url.search = this.convertToURLSearchParams(this.params, this.getArgs(args)).toString()
    return this.post<TResult>(
      url.toString(),
      this.convertToBody((body || this.body) as Body, this.getArgs(args)),
      this.getRequestInit(this.getArgs(args)),
    )
  }

  public async configuredPUT<TResult = any>(args: Partial<TArgs>, body?: Body): Promise<TResult> {
    const url = new URL(this.replaceArgsInString(this.url, this.getArgs(args)))
    url.search = this.convertToURLSearchParams(this.params, this.getArgs(args)).toString()
    return this.put<TResult>(
      url.toString(),
      this.convertToBody((body || this.body) as Body, this.getArgs(args)),
      this.getRequestInit(this.getArgs(args)),
    )
  }

  public async configuredPATCH<TResult = any>(args: Partial<TArgs>, body?: Body): Promise<TResult> {
    const url = new URL(this.replaceArgsInString(this.url, this.getArgs(args)))
    url.search = this.convertToURLSearchParams(this.params, this.getArgs(args)).toString()
    return this.patch<TResult>(
      url.toString(),
      this.convertToBody((body || this.body) as Body, this.getArgs(args)),
      this.getRequestInit(this.getArgs(args)),
    )
  }

  private getArgs(args: Partial<TArgs>): TArgs {
    return {
      ...this.defaultArgs,
      ...args,
    } as TArgs
  }

  private replaceArgsInString(str: string, args: TArgs): string {
    let replaced = str
    for (const key in args) {
      const regexp = new RegExp(`\\$${key}`, 'g')
      replaced = replaced.replace(regexp, this.convertToString(args[key]))
    }
    return replaced
  } 

  private replaceArgsInObject<TObject = Record<string, string>>(obj: TObject, args: TArgs): TObject {
    let str = this.replaceArgsInString(JSON.stringify(obj), args)
    return JSON.parse(str)
  }

  private convertToURLSearchParams(params: TParams, args: TArgs): URLSearchParams {
    const paramsWithReplacedArgs = this.replaceArgsInObject<TParams>(params, args)
    const urlParams = new URLSearchParams()
    for (const key in paramsWithReplacedArgs) {
      const convertedValue = this.convertToString(paramsWithReplacedArgs[key])
      if (convertedValue.indexOf('$') === -1) urlParams.append(key, convertedValue)
    }
    return urlParams
  }

  private convertToHeaders(headers: THeaders, args: TArgs): RequestHeaders {
    const headersWithReplacedArgs = this.replaceArgsInObject<THeaders>(headers, args)
    const requestHeaders = new RequestHeaders()
    for (const key in headersWithReplacedArgs) {
      const convertedValue = this.convertToString(headersWithReplacedArgs[key])
      if (convertedValue.indexOf('$') === -1) requestHeaders.append(key, convertedValue)
    }
    return requestHeaders
  }

  private convertToBody(body: Body, args: TArgs): Body {
    if (body instanceof String) {
      return this.replaceArgsInString(body as string, args)
    }
    if (body instanceof Object) {
      return this.replaceArgsInObject(body, args)
    }
    return body
  }

  convertToString(val: string | Object): string {
    let converted = `${val}`
    if (val instanceof Object) {
      converted = JSON.stringify(val)
    }
    return converted
  }

  private getRequestInit(args: TArgs, options?: RequestInitOptions): RequestInit {
    const ttl = (options && options.cacheTime) || this.cacheTime
    return {
      cacheOptions: { ttl },
      headers: this.convertToHeaders(this.headers, args)
    }
  }
}