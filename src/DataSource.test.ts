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
  default: string,
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

const defaultArg = 'default-argument'
class TestDataSource extends ConfigurableRESTDataSource<Args, Params, Headers, Body> {
  url = "https://test.url/$arg1/$arg2/$default"
  defaultArgs = {
    default: defaultArg,
  }
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
    header2: "$default",
    header3: {
      headerField31: "arg2: $arg2",
      headerField32: "headerField32"
    }
  }
  body = {
    bodyField1: "$arg2",
    bodyField2: "$default",
    bodyField3: {
      bodyField31: "arg2: $arg2",
      bodyField32:"arg2: $arg2",
    }
  }
  cacheTime = 5000
}

class TestDataSourceWithoutSearchParams extends ConfigurableRESTDataSource<Args, Params, Headers, Body> {
  url = "https://test.url/$arg1/$arg2/$default"
  defaultArgs = {
    default: defaultArg,
  }
  headers = {
    header1: "$arg1",
    header2: "$default",
    header3: {
      headerField31: "arg2: $arg2",
      headerField32: "headerField32"
    }
  }
  body = {
    bodyField1: "$arg2",
    bodyField2: "$default",
    bodyField3: {
      bodyField31: "arg2: $arg2",
      bodyField32:"arg2: $arg2",
    }
  }
  cacheTime = 5000
}

describe('ConfigurableRESTDataSource', () => {

  const args = {
    arg1: "mock-arg-1",
    arg2: "mock-arg-2",
  }

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
    headers.append('header2', defaultArg)
    headers.append('header3', JSON.stringify({
      headerField31: `arg2: ${args.arg2}`,
      headerField32: "headerField32"
    }))
    return headers
  }
  const expectedBody = () => ({
    bodyField1: `${args.arg2}`,
    bodyField2: defaultArg,
    bodyField3: {
      bodyField31: `arg2: ${args.arg2}`,
      bodyField32: `arg2: ${args.arg2}`,
    }
  })
  const expectedRequestInit = (headers = expectedHeaders()) => {
    return {
      cacheOptions: { ttl: 5000 },
      headers,
    }
  }

  describe('datasource with search params', () => {
    const datasource = new TestDataSource()

    it('removes search params and headers when the corresponding arguments are not available', async () => {
      const clonedArgs = {...args}
      delete clonedArgs.arg1
      const result = await datasource.configuredGET(clonedArgs)

      const params = new URLSearchParams()
      params.append('param2', '22')
      params.append('param3', JSON.stringify({
        param31: `${args.arg2}`,
        param32: 33,
      }))
      
      const headers = new RequestHeaders()
      headers.append('header2', defaultArg)
      headers.append('header3', JSON.stringify({
        headerField31: `arg2: ${args.arg2}`,
        headerField32: "headerField32"
      }))

      expect(result[0]).toMatchSnapshot()
      expect(result[1]).toEqual(params)
      expect(result[2]).toEqual(expectedRequestInit(headers))
    })

    it('calls configuredGET with expected args', async () => {
      const result = await datasource.configuredGET(args)
      expect(result[0]).toMatchSnapshot()
      expect(result[1]).toEqual(expectedParams())
      expect(result[2]).toEqual(expectedRequestInit())
    })

    it('calls configuredDELETE with expected args', async () => {
      const result = await datasource.configuredDELETE(args)
      expect(result[0]).toMatchSnapshot()
      expect(result[1]).toEqual(expectedParams())
      expect(result[2]).toEqual(expectedRequestInit())
    })

    it('calls configuredPOST with expected args', async () => {
      const result = await datasource.configuredPOST(args)
      expect(result[0]).toMatchSnapshot()
      expect(result[1]).toEqual(expectedBody())
      expect(result[2]).toEqual(expectedRequestInit())
    })

    it('calls configuredPUT with expected args', async () => {
      const result = await datasource.configuredPUT(args)
      expect(result[0]).toMatchSnapshot()
      expect(result[1]).toEqual(expectedBody())
      expect(result[2]).toEqual(expectedRequestInit())
    })

    it('calls configuredPATCH with expected args', async () => {
      const result = await datasource.configuredPATCH(args)
      expect(result[0]).toMatchSnapshot()
      expect(result[1]).toEqual(expectedBody())
      expect(result[2]).toEqual(expectedRequestInit())
    })
  })

  describe('datasource without search params', () => {
    const datasource = new TestDataSourceWithoutSearchParams()

    it('calls configuredGET with expected args', async () => {
      const result = await datasource.configuredGET(args)
      expect(result[0]).toMatchSnapshot()
      expect(result[1]).toEqual(new URLSearchParams())
      expect(result[2]).toEqual(expectedRequestInit())
    })

    it('calls configuredDELETE with expected args', async () => {
      const result = await datasource.configuredDELETE(args)
      expect(result[0]).toMatchSnapshot()
      expect(result[1]).toEqual(new URLSearchParams())
      expect(result[2]).toEqual(expectedRequestInit())
    })

    it('calls configuredPOST with expected args', async () => {
      const result = await datasource.configuredPOST(args)
      expect(result[0]).toMatchSnapshot()
      expect(result[1]).toEqual(expectedBody())
      expect(result[2]).toEqual(expectedRequestInit())
    })

    it('calls configuredPUT with expected args', async () => {
      const result = await datasource.configuredPUT(args)
      expect(result[0]).toMatchSnapshot()
      expect(result[1]).toEqual(expectedBody())
      expect(result[2]).toEqual(expectedRequestInit())
    })

    it('calls configuredPATCH with expected args', async () => {
      const result = await datasource.configuredPATCH(args)
      expect(result[0]).toMatchSnapshot()
      expect(result[1]).toEqual(expectedBody())
      expect(result[2]).toEqual(expectedRequestInit())
    })
  })
})