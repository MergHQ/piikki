// from https://github.com/galkowskit/denofun/blob/a321d6ef0cfe72de55d6d2d968c620d80eaa226f/lib/memoize.ts

export default function memoize<A>(
  fn: (...xs: any[]) => A,
  ttl: number
): (...xs: any[]) => A {
  const cache = new Map()
  return (...xs: any[]): A => {
    const args = JSON.stringify(xs)

    if (cache.has(args)) {
      const cached = cache.get(args)!
      if (Date.now() - cached.requested < ttl) return cached.result
    }

    const result = fn.apply(null, xs)
    cache.set(args, { requested: Date.now(), result })
    return result
  }
}
