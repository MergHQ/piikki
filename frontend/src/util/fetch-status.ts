export type FetchStatus<T> =
  | { state: 'done'; data: T }
  | { state: 'loading' }
  | { state: 'error' }

export const fold = <A, B>(
  onLoading: () => B,
  onError: () => B,
  onDone: (data: A) => B
) => (status: FetchStatus<A>): B => {
  switch (status.state) {
    case 'loading':
      return onLoading()
    case 'error':
      return onError()
    case 'done':
      return onDone(status.data)
  }
}

export const map = <A, B>(fn: (data: A) => B) => (
  status: FetchStatus<A>
): FetchStatus<B> => {
  if (status.state === 'done') {
    return {
      ...status,
      data: fn(status.data),
    }
  }

  return status
}
