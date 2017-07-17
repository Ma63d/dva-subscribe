'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _pathToRegexp = require('path-to-regexp');

var _pathToRegexp2 = _interopRequireDefault(_pathToRegexp);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function subscribe(history, dispatch) {
    for (var _len = arguments.length, rules = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        rules[_key - 2] = arguments[_key];
    }

    var lastLocation = void 0;
    var currentLocation = void 0;
    var _unSubscribe = history.listen(function (newLocation) {
        lastLocation = currentLocation;
        currentLocation = newLocation;
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = (0, _getIterator3.default)(rules), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var route = _step.value;
                var url = route.url,
                    _route$queries = route.queries,
                    queries = _route$queries === undefined ? [] : _route$queries,
                    actionCreator = route.actionCreator,
                    _route$everyTime = route.everyTime,
                    everyTime = _route$everyTime === undefined ? false : _route$everyTime;

                var match = (0, _pathToRegexp2.default)(url).exec(currentLocation.pathname);
                if (!match) {
                    continue;
                }
                var shouldExec = false;

                if (everyTime || lastLocation === undefined) {
                    shouldExec = true;
                } else {
                    var lastMatch = (0, _pathToRegexp2.default)(url).exec(lastLocation.pathname);
                    if (!lastMatch) {
                        shouldExec = true;
                    } else {
                        shouldExec = _diff(match.slice(1), lastMatch.slice(1), currentLocation.query, lastLocation.query, queries);
                    }
                }
                if (shouldExec) {
                    var queryResult = [];
                    var _iteratorNormalCompletion2 = true;
                    var _didIteratorError2 = false;
                    var _iteratorError2 = undefined;

                    try {
                        for (var _iterator2 = (0, _getIterator3.default)(queries), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                            var query = _step2.value;

                            queryResult.push(currentLocation.query[query]);
                        }
                    } catch (err) {
                        _didIteratorError2 = true;
                        _iteratorError2 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion2 && _iterator2.return) {
                                _iterator2.return();
                            }
                        } finally {
                            if (_didIteratorError2) {
                                throw _iteratorError2;
                            }
                        }
                    }

                    var action = actionCreator && actionCreator.apply(undefined, (0, _toConsumableArray3.default)(match.slice(1)).concat(queryResult));
                    if (Array.isArray(action)) {
                        var _iteratorNormalCompletion3 = true;
                        var _didIteratorError3 = false;
                        var _iteratorError3 = undefined;

                        try {
                            for (var _iterator3 = (0, _getIterator3.default)(action), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                                var i = _step3.value;

                                dispatch(i);
                            }
                        } catch (err) {
                            _didIteratorError3 = true;
                            _iteratorError3 = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion3 && _iterator3.return) {
                                    _iterator3.return();
                                }
                            } finally {
                                if (_didIteratorError3) {
                                    throw _iteratorError3;
                                }
                            }
                        }
                    } else {
                        dispatch(action);
                    }
                }
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator.return) {
                    _iterator.return();
                }
            } finally {
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }
    });
    var listen = function listen() {
        rules.push.apply(rules, arguments);
        return ret;
    };
    var ret = {
        listen: listen,
        unListen: _unSubscribe
    };
    return ret;
}

function _diff(params, lastParams, query, lastQuery, targetQueries) {
    var _iteratorNormalCompletion4 = true;
    var _didIteratorError4 = false;
    var _iteratorError4 = undefined;

    try {
        for (var _iterator4 = (0, _getIterator3.default)(targetQueries), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
            var queryName = _step4.value;

            if (query && query[queryName] !== lastQuery[queryName]) {
                return true;
            }
        }
    } catch (err) {
        _didIteratorError4 = true;
        _iteratorError4 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion4 && _iterator4.return) {
                _iterator4.return();
            }
        } finally {
            if (_didIteratorError4) {
                throw _iteratorError4;
            }
        }
    }

    for (var i = 0; i < params.length; i++) {
        if (params[i] !== lastParams[i]) {
            return true;
        }
    }
    return false;
}

exports.default = subscribe;