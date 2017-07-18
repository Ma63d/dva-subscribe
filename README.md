# dva-subscribe
[![Build Status](https://travis-ci.org/Ma63d/dva-subscribe.svg?branch=master)](https://travis-ci.org/Ma63d/dva-subscribe)
[![Coverage Status](https://coveralls.io/repos/github/Ma63d/dva-subscribe/badge.svg)](https://coveralls.io/github/Ma63d/dva-subscribe)
[![NPM downloads](https://img.shields.io/npm/v/dva-subscribe.svg)](https://npmjs.org/package/dva-subscribe)

A helper function which can simplify the subscription of history in [dva](https://github.com/dvajs/dva).

## Usage

```javascript
import subscribe from 'dva-subscribe'

// basic usage
// subscribe(history, dispatch, ...rules)

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
        subscribe (history, dispatch, {
            url: '/a/:a/b/:b',
            queries: ['name'],
            actionCreator: (a, b, name) => [{
                type: 'fetch',
                payload: {a, b}
            }, {
                type: 'init',
                payload: { name },
            }]
        }, {
            url: '/index',
            queries: ['id'],
            actionCreator: (id) => ({ type: 'load', payload: {id} })
        })
    },
}
```

## Api

### `subscribe(history, dispatch, ...rules)`
- @param `history: Object:`  react-router history
- @param `dispatch: Function:` dva's dispatch
- @param `rules: Array<Object rule>` url rules, describe the pattern to match url and dispatch action
	-  `rule: Object`  url match option:
		- field `url: String`, the url pattern, etc '/a/:b/:c/x'
		- field `queries: Array`, default: [], list the queries you care, etc ['keyword', 'time']. If the pattern matches current url, only when queries you list or params in url are different with last url(if last url also matches the specified pattern) will the actionCreator executed and action dispatched, which is useful to avoid unnecessary dispatching.
		- field `actionCreator: Function` a function that will return action(s) you want to dispatch when url match and params/queries are different(if last url also matches).It will receive params and queries you speciafied as arguments: `actionCreator(...params, ...queries)`
		- field `everyTime: Boolean` optional, default: `false`, if true, the actionCreator will always be fired and the action it returns will always be dispatched as long as the url matches the pattern you specified. 
- @return `unListen: Function` to stop listening, call the function returned from subscribe()
