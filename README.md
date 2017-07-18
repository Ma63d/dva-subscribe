# dva-subscribe
[![Build Status](https://travis-ci.org/Ma63d/dva-subscribe.svg?branch=master)](https://travis-ci.org/Ma63d/dva-subscribe)
[![Coverage Status](https://coveralls.io/repos/github/Ma63d/dva-subscribe/badge.svg)](https://coveralls.io/github/Ma63d/dva-subscribe)

A helper function which can simplify the subscription of history in [dva](https://github.com/dvajs/dva).

## Usage

```javascript
import subscribe from 'dva-subscribe'

// basic usage
// subscribe(history, dispatch, ...rules)
//   .listen(rule)
//   .listen(rule)

//in dva's subscriptions
subscriptions: {
    setup ({ history, dispatch }) {
        // you may code this before
        // history.listen (({ pathname, query }) => {
        //     if (pathname === '/index') {
        //         const {id} = query
        //         dispatch({ type: 'load', payload: {id} })
        //     } else if (pathname.startsWith('/a')) {
        //         const match = pathToRegexp('/a/:a/b/:b').exec(pathname);
        //         if (match) {
        //             const {name} = query
        //             dispatch({
        //                 type: 'fetch',
        //                 payload: { a: match[1], b: match[2] },
        //             })
        //             dispatch({
        //                 type: 'init',
        //                 payload: { name },
        //             })
        //         }
        //     }
        // })

        // now you can use following
        subscribe (history, dispatch)
            .listen({
                url: '/index',
                queries: ['id'],
                actionCreator: (id) => ({ type: 'load', payload: {id} })
            })
            .listen({
                url: '/a/:a/b/:b',
                queries: ['name'],
                actionCreator: (a, b, name) => [{
                    type: 'fetch',
                    payload: {a, b}
                }, {
                    type: 'init',
                    payload: { name },
                }]
            })
    },
}
```

## Parameters

```
  @param {Object} history, react-router history
  @param {Function} dispatch, dva's dispatch
  @param {Object} rules, rest arguments, optional,
    rule {Object}, { url: '...', queries: [...], actionCreator: (...) => {...}, everyTime: true/false }
      property {String} url
           the url pattern, etc '/a/:b/:c/x'
      property {Array}  queries, optional, default is an empty array
           list the queries you care, etc ['keyword', 'time']. If the pattern matches current url,
       only when queries you list or params are different with last url(if last url also matches the specified pattern)
       will the actionCreator executed and action dispatched, which is useful to avoid unnecessary dispatching.
      property {Function} actionCreator
           a function that will return action(s) you want to dispatch when url match
       and params/queries are different(if last url also match).
       It will receive params and queries you speciafied as arguments: actionCreator(...params, ...queries)
      property {Boolean}  everyTime, optional, default is false
           if true, the actionCreator will always be fired and the action it returns will
       always be dispatched as long as the url matches the pattern you specified. .
 
   @return {Object} { listen: (...) => {...}, unListen: (...) => {...} }
     property {function} listen, a chainable function to add rule: subscribe(history, dispatch).listen(rule).listen(rule).listen(rule)
     property {function} unListen, a function to stop listening to the url change: const {unListen} = subscribe(history, dispatch).listen({...});unListen();
```



