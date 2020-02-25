import { Headers as RequestHeaders } from 'apollo-env'
import { URLSearchParams } from 'apollo-server-env'
import { ConfigurableRESTDataSource } from './DataSource'

jest.mock('apollo-datasource-rest', () => ({
  RESTDataSource: class {
    public get = async (...args: any) => args
    public post = async (...args: any) => args
    public put = async (...args: any) => args
    public delete = async (...args: any) => args
    public patch = async (...args: any) => args
  }
}))

type Args = {
  arg1: string,
  arg2: string,
}

type Params = {
  param1: string,
  param2: number,
  param3?: {
    param31: string,
    param32: number,
  }
}

type Headers = {
  header1: string,
  header2: string,
  header3: {
    headerField31: string
    headerField32: string
  }
}

type Body = {
  bodyField1: string,
  bodyField2: string,
  bodyField3: {
    bodyField31: string,
    bodyField32: string,
  },
}

class TestDatasoursce extends ConfigurableRESTDataSource<Args, Params, Headers, Body> {
  url = "https://test.url/$arg1/$arg2/$arg2"
  params = {
    param1: "$arg1",
    param2: 22,
    param3: {
      param31: "$arg2",
      param32: 33,
    }
  }
  headers = {
    header1: "$arg1",
    header2: "h2",
    header3: {
      headerField31: "arg2: $arg2",
      headerField32: "headerField32"
    }
  }
  body = {
    bodyField1: "$arg2",
    bodyField2: "b2",
    bodyField3: {
      bodyField31: "arg2: $arg2",
      bodyField32:"arg2: $arg2",
    }
  }
  cacheTime = 5000
}

describe('ConfigurableRESTDataSource', () => {

  const datasource = new TestDatasoursce()

  const args = {
    arg1: "mock-arg-1",
    arg2: "mock-arg-2",
  }

  const expectedURL = () => `https://test.url/${args.arg1}/${args.arg2}/${args.arg2}`
  const expectedParams = () => {
    const params = new URLSearchParams()
    params.append('param1', `${args.arg1}`)
    params.append('param2', '22')
    params.append('param3', JSON.stringify({
      param31: `${args.arg2}`,
      param32: 33,
    }))
    return params
  }
  const expectedHeaders = () => {
    const headers = new RequestHeaders()
    headers.append('header1', `${args.arg1}`)
    headers.append('header2', 'h2')
    headers.append('header3', JSON.stringify({
      headerField31: `arg2: ${args.arg2}`,
      headerField32: "headerField32"
    }))
    return headers
  }
  const expectedBody = () => ({
    bodyField1: `${args.arg2}`,
    bodyField2: "b2",
    bodyField3: {
      bodyField31: `arg2: ${args.arg2}`,
      bodyField32: `arg2: ${args.arg2}`,
    }
  })
  const expectedRequestInit = () => {
    return {
      cacheOptions: { ttl: 5000 },
      headers: expectedHeaders(),
    }
  }

  it('calls configuredGET with expected args', async () => {
    const result = await datasource.configuredGET(args)
    expect(result[0]).toEqual(expectedURL())
    expect(result[1]).toEqual(expectedParams())
    expect(result[2]).toEqual(expectedRequestInit())
  })

  it('calls configuredDELETE with expected args', async () => {
    const result = await datasource.configuredDELETE(args)
    expect(result[0]).toEqual(expectedURL())
    expect(result[1]).toEqual(expectedParams())
    expect(result[2]).toEqual(expectedRequestInit())
  })

  it('calls configuredPOST with expected args', async () => {
    const result = await datasource.configuredPOST(args)
    expect(result[0]).toEqual(expectedURL())
    expect(result[1]).toEqual(expectedBody())
    expect(result[2]).toEqual(expectedRequestInit())
  })

  it('calls configuredPUT with expected args', async () => {
    const result = await datasource.configuredPUT(args)
    expect(result[0]).toEqual(expectedURL())
    expect(result[1]).toEqual(expectedBody())
    expect(result[2]).toEqual(expectedRequestInit())
  })

  it('calls configuredPATCH with expected args', async () => {
    const result = await datasource.configuredPATCH(args)
    expect(result[0]).toEqual(expectedURL())
    expect(result[1]).toEqual(expectedBody())
    expect(result[2]).toEqual(expectedRequestInit())
  })
})