/**
 * A helper function which can simplify the subscription of history in dva.
 * @author Chuck Liu(chuck7liu@gmail.com)
 */

import pathToRegexp from 'path-to-regexp'

/**
 * @param {Object} history, react-router history
 * @param {Function} dispatch, dva's dispatch
 * @param {Object} rules, rest arguments, optional,
 *  * rule {Object}, { url: '...', queries: [...], actionCreator: (...) => {...}, everyTime: true/false }
 *  *   property {String} url
 *          the url pattern, etc '/a/:b/:c/x'
 *  *   property {Array}  queries, optional, default is an empty array
 *          list the queries you care, etc ['keyword', 'time']. If the pattern matches current url,
 *      only when queries you list or params are different with last url(if last url also matches the specified pattern)
 *      will the actionCreator executed and action dispatched, which is useful to avoid unnecessary dispatching.
 *  *   property {Function} actionCreator
 *          a function that will return action(s) you want to dispatch when url match
 *      and params/queries are different(if last url also match).
 *      It will receive params and queries you speciafied as arguments: actionCreator(...params, ...queries)
 *  *   property {Boolean}  everyTime, optional, default is false
 *          if true, the actionCreator will always be fired and the action it returns will
 *      always be dispatched as long as the url matches the pattern you specified. .
 *
 *  @return {Object} { listen: (...) => {...}, unListen: (...) => {...} }
 *   * property {function} listen, a chainable function to add rule: subscribe(history, dispatch).listen(rule).listen(rule).listen(rule)
 *   * property {function} unListen, a function to stop listening to the url change: const {unListen} = subscribe(history, dispatch).listen({...});unListen();
 * */
function subscribe (history, dispatch, ...rules) {
    let lastLocation
    let currentLocation
    const _unSubscribe = history.listen((newLocation) => {
        lastLocation = currentLocation
        currentLocation = newLocation
        for (let route of rules) {
            const { url, queries = [], actionCreator, everyTime = false } = route
            const match = pathToRegexp(url).exec(currentLocation.pathname)
            if (!match) {
                continue
            }
            let shouldExec = false
            // first time
            if (everyTime || lastLocation === undefined) {
                shouldExec = true
            } else {
                let lastMatch = pathToRegexp(url).exec(lastLocation.pathname)
                if (!lastMatch) {
                    shouldExec = true
                } else {
                    shouldExec = _diff(match.slice(1), lastMatch.slice(1), currentLocation.query, lastLocation.query, queries)
                }
            }
            if (shouldExec) {
                const queryResult = []
                for (let query of queries) {
                    queryResult.push(currentLocation.query[query])
                }
                const action = actionCreator && actionCreator(...match.slice(1), ...queryResult)
                if (Array.isArray(action)) {
                    for (let i of action) {
                        dispatch(i)
                    }
                } else {
                    dispatch(action)
                }
            }
        }
    })
    const listen = (...args) => {
        rules.push(...args)
        return ret
    }
    const ret = {
        listen,
        unListen: _unSubscribe
    }
    return ret
}

function _diff (params, lastParams, query, lastQuery, targetQueries) {
    for (let queryName of targetQueries) {
        if (query && query[queryName] !== lastQuery[queryName]) {
            return true
        }
    }
    for (let i = 0; i < params.length; i++) {
        if (params[i] !== lastParams[i]) {
            return true
        }
    }
    return false
}

export default subscribe
