/**
 * A helper function which can simplify the subscription of history in dva.
 * @author Chuck Liu(chuck7liu@gmail.com)
 */

import pathToRegexp from 'path-to-regexp'

/**
 * @param {Object} history, react-router history
 * @param {Function} dispatch, dva's dispatch
 * @param {Object} rules, spread arguments, optional,
 *  * url 规则对象:
 *  *   属性 {String} url       用于匹配 pathname 的 url 规则， 如: '/a/:b/:c/x'
 *  *   属性 {Array}  queries 默认为空数组，你关注的 query 内容， 只有当 url 中的 params 和 queries 部分有变动的时候，才会执行 actionCreator，
 *  当你想要避免 url 中你不关心的 query 变动导致触发不必要的 action 时，这个参数很有用
 *  *   属性 {Function} actionCreator  返回需要 dispatch 的 action，或者 actions 数组，
 *  *   属性 {Boolean}  everyTime 默认为 false ，当 pathname 匹配上时，如果跟上次 pathname 一致，只有当 params 和 queries 变动时，才会 dispatch action，但是如果
 *  你想关闭这个机制、希望任何时候匹配上时都 dispatch action，那么请设置 everyTime 为 true
 *
 *  @return {Object} 返回对象
 *   * 返回对象
 *   * 属性 {function} listen 绑定 url 规则对象，且可以链式调用： subscribe(history, dispatch).listen({...}).listen({...}).listen({...})
 *   * 属性 {function} unListen 用于解绑 history 的 listen 操作： const {unListen} = subscribe(history, dispatch).listen({...});unListen();
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
