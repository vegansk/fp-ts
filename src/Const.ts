import { Monoid } from './Monoid'
import { Functor, FantasyFunctor } from './Functor'
import { Contravariant, FantasyContravariant } from './Contravariant'
import { Applicative } from './Applicative'
import { Apply } from './Apply'
import { Semigroup } from './Semigroup'
import { Setoid } from './Setoid'
import { identity, toString } from './function'

declare module './HKT' {
  interface URI2HKT2<L, A> {
    Const: Const<L, A>
  }
}

export const URI = 'Const'

export type URI = typeof URI

export class Const<L, A> implements FantasyFunctor<URI, A>, FantasyContravariant<URI, A> {
  readonly _A: A
  readonly _L: L
  readonly _URI: URI
  constructor(readonly value: L) {}
  map<B, C>(f: (b: B) => C): Const<L, C> {
    return this as any
  }
  contramap<B, C>(f: (c: C) => B): Const<L, C> {
    return this as any
  }
  fold<B>(f: (l: L) => B): B {
    return f(this.value)
  }
  equals(S: Setoid<L>, fy: Const<L, A>): boolean {
    return this.fold(x => fy.fold(y => S.equals(x)(y)))
  }
  inspect() {
    return this.toString()
  }
  toString() {
    return `new Const(${toString(this.value)})`
  }
}

export const equals = <L>(S: Setoid<L>) => <A>(fx: Const<L, A>) => (fy: Const<L, A>): boolean => {
  return fx.equals(S, fy)
}

export const getSetoid = <L, A>(S: Setoid<L>): Setoid<Const<L, A>> => ({
  equals: x => y => equals(S)(x)(y)
})

export const map = <L, A, B>(f: (a: A) => B, fa: Const<L, A>): Const<L, B> => fa.map(f)

export const contramap = <L, A>(fa: Const<L, A>): (<B>(f: (b: B) => A) => Const<L, B>) => <B>(f: (b: B) => A) =>
  fa.contramap(f)

export const getApply = <L>(S: Semigroup<L>): Apply<URI> => ({
  URI,
  map,
  ap<A, B>(fab: Const<L, (a: A) => B>, fa: Const<L, A>): Const<L, B> {
    return new Const(S.concat(fab.fold(identity))(fa.fold(identity)))
  }
})

export const getApplicative = <L>(M: Monoid<L>): Applicative<URI> => {
  const empty = new Const<L, any>(M.empty())
  return {
    ...getApply(M),
    of<A>(b: A): Const<L, A> {
      return empty
    }
  }
}

export const const_: Functor<URI> & Contravariant<URI> = {
  URI,
  map,
  contramap
}
