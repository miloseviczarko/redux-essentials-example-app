import { Post } from './postsSlice'

type QueryDefinition<ResultType, QueryArg> = {
  kind: 'query'
  resultType: ResultType
  queryArg: QueryArg
}

type MutationDefinition<ResultType, QueryArg> = {
  kind: 'mutation'
  resultType: ResultType
  queryArg: QueryArg
}

const builder = {
  query<ResultType, ArgType>(config: {
    query: (arg: ArgType) => string
  }): QueryDefinition<ResultType, ArgType> {
    return {
      kind: 'query',
      resultType: {} as ResultType,
      queryArg: {} as ArgType,
    }
  },
  mutation<ResultType, ArgType>(config: {
    query: (arg: ArgType) => {
      url: string
      method: string
      body: ArgType
    }
  }): MutationDefinition<ResultType, ArgType> {
    return {
      kind: 'mutation',
      resultType: {} as ResultType,
      queryArg: {} as ArgType,
    }
  },
}

const queryPosts = builder.query<Post[], void>({
  query: () => '/posts',
})

const queryPost = builder.query<Post, string>({
  query: (postId: string) => `/posts/${postId}`,
})

const mutationPost = builder.mutation<Post, Post>({
  query: (unsavedPost) => ({
    url: '/posts',
    method: 'POST',
    body: unsavedPost,
  }),
})

type ReturnType<Definition> =
  Definition extends QueryDefinition<infer Return, any>
    ? Return
    : Definition extends MutationDefinition<infer Return, any>
      ? Return
      : never

type VoidReturnType = ReturnType<QueryDefinition<void, string>>

type ArgType<Definition> =
  Definition extends QueryDefinition<any, infer Arg>
    ? Arg
    : Definition extends MutationDefinition<any, infer Arg>
      ? Arg
      : never

type StringArgType = ArgType<MutationDefinition<any, string>>

function createApi<
  Definitions extends Record<
    string,
    QueryDefinition<any, any> | MutationDefinition<any, any>
  >,
>(config: { endpoints: (build: typeof builder) => Definitions }) {
  return {
    endpoints: config.endpoints(builder),
    util: {
      updateQueryData<EndPointName extends keyof Definitions>(
        endpointName: EndPointName,
        arg: ArgType<Definitions[EndPointName]>,
        recipe: (draft: ReturnType<Definitions[EndPointName]>) => void,
      ) {
        return {
          endpointName,
          arg,
        }
      },
    },
  }
}

const api = createApi({
  endpoints: (builder) => ({
    getPosts: builder.query<Post[], void>({
      query: () => '/posts',
    }),
    addPost: builder.mutation<Post, Post>({
      query: (post) => ({
        url: '/posts',
        method: 'POST',
        body: post,
      }),
    }),
  }),
})

api.util.updateQueryData('getPosts', undefined, (draft) => {
  console.log(draft?.length)
})

export default {}
