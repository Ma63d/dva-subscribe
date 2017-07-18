import {Location, History} from './history'
import subscribe from '../src/index'
import chai from 'chai'
import spies from 'chai-spies'
chai.use(spies)
const expect = chai.expect

describe('subscribe to history', function() {
    // fake history
    let history
    beforeEach(() => {
        history = new History()
    });

    it('basic usage', () => {
        let dispatch = chai.spy()
        let actionCreator = () => ({})
        let spiedActionCreator = chai.spy(actionCreator)

        subscribe(history, dispatch, {
            url: '/index',
            actionCreator: spiedActionCreator
        })

        // url changed
        let newLocation = new Location('/index')
        history.update(newLocation)

        expect(spiedActionCreator).to.have.been.called.with()
        expect(dispatch).to.have.been.called.with({})
    })

    it('should both support using spread arguments and chain calls to add url rules', () => {
        let dispatch = chai.spy()
        let spyOfIndex = chai.spy(() => ({}))
        let spyOfHome = chai.spy(() => ({}))
        let spyOfDetail = chai.spy(() => ({}))
        let spyOfList = chai.spy(() => ({}))

        subscribe(history, dispatch, {
            url: '/index',
            actionCreator: spyOfIndex
        }, {
            url: '/home',
            actionCreator: spyOfHome
        }, {
            url: '/detail',
            actionCreator: spyOfDetail
        }, {
            url: '/list',
            actionCreator: spyOfList
        })

        expect(spyOfIndex).to.not.have.been.called()
        expect(spyOfHome).to.not.have.been.called()
        expect(spyOfDetail).to.not.have.been.called()
        expect(spyOfList).to.not.have.been.called()
        expect(dispatch).to.not.have.been.called()

        // url changed twice
        let newLocation = new Location('/index')
        history.update(newLocation)
        newLocation = new Location('/list')
        history.update(newLocation)

        expect(spyOfIndex).to.have.been.called.once
        expect(spyOfList).to.have.been.called.once
        expect(dispatch).to.have.been.called.exactly(2)

        expect(spyOfHome).to.not.have.been.called()
        expect(spyOfDetail).to.not.have.been.called()

    })

    it(`should only dispatch action when the new url matches specified pattern `, () => {
        let dispatch = chai.spy()
        let actionCreator = () => ({})
        let spiedActionCreator = chai.spy(actionCreator)

        subscribe(history, dispatch, {
            url: '/index',
            actionCreator: spiedActionCreator
        })

        history.update(new Location('/home'))

        expect(spiedActionCreator).to.not.have.been.called()
        expect(dispatch).to.not.have.been.called()

        history.update(new Location('/index'))

        expect(spiedActionCreator).to.have.been.called.with()
        expect(dispatch).to.have.been.called.with({})

        dispatch = chai.spy()
        spiedActionCreator = chai.spy(() => [{type: 'fetchDetail'}, {type: 'fetchList'}])

        subscribe(history, dispatch, {
            url: '/index',
            actionCreator: spiedActionCreator
        })

        history.update(new Location('/index'))

        expect(spiedActionCreator).to.have.been.called.with()

        expect(dispatch).to.have.been.called.twice
        expect(dispatch).to.have.been.called.with({type: 'fetchDetail'})
        expect(dispatch).to.have.been.called.with({type: 'fetchList'})

    })

    it('should fire actionCreator with params and queries', () => {
        let dispatch = chai.spy()
        let spiedActionCreator = chai.spy(
            (sid, cid, gender) => {
                return {
                    type: 'fetch',
                    payload: {
                        sid,
                        cid,
                        gender
                    }
                }
            }
        )

        subscribe(history, dispatch, {
            url: '/schools/:sid/classes/:cid/students',
            queries: ['gender'],
            actionCreator: spiedActionCreator
        })

        let newLocation = new Location('/schools/1/classes/2/students', {
            gender: 'female'
        })
        history.update(newLocation)

        newLocation = new Location('/schools/1/classes/3/students', {
            gender: 'female'
        })
        history.update(newLocation)

        newLocation = new Location('/schools/1/classes/3/students', {
            gender: 'male'
        })
        history.update(newLocation)

        expect(spiedActionCreator).to.have.been.called.with('1', '2', 'female')
        expect(dispatch).to.have.been.called.with({
            type: 'fetch',
            payload: {
                sid: '1',
                cid: '2',
                gender: 'female'
            }
        })
        expect(spiedActionCreator).to.have.been.called.with('1', '3', 'female')
        expect(dispatch).to.have.been.called.with({
            type: 'fetch',
            payload: {
                sid: '1',
                cid: '2',
                gender: 'female'
            }
        })
        expect(spiedActionCreator).to.have.been.called.with('1', '3', 'male')
        expect(dispatch).to.have.been.called.with({
            type: 'fetch',
            payload: {
                sid: '1',
                cid: '2',
                gender: 'female'
            }
        })
    })

    it('should not dispatch action when the url pattern matches but the params and specified queries are the same with last url', () => {
        let dispatch = chai.spy()
        let spiedActionCreator = chai.spy(
            (sid, cid, gender) => {
                return {
                    type: 'fetch',
                    payload: {
                        sid,
                        cid,
                        gender
                    }
                }
            }
        )

        subscribe(history, dispatch, {
            url: '/schools/:sid/classes/:cid/students',
            queries: ['gender'],
            actionCreator: spiedActionCreator
        })

        // initial url
        let location = new Location('/schools/1/classes/2/students', {
            gender: 'female'
        })
        history.update(location)

        // new url is the same except for query `lastname`
        let newLocation = new Location('/schools/1/classes/2/students', {
            gender: 'female',
            lastname: 'Zhang'
        })
        history.update(location)
        history.update(location)
        history.update(location)

        expect(spiedActionCreator).to.have.been.called.once
        expect(dispatch).to.have.been.called.once
    })

    it('should always dispatch action if option `everyTime` is true', () => {
        let dispatch = chai.spy()
        let spiedActionCreator = chai.spy(
            (sid, cid, gender) => {
                return {
                    type: 'fetch',
                    payload: {
                        sid,
                        cid,
                        gender
                    }
                }
            }
        )

        subscribe(history, dispatch, {
            url: '/schools/:sid/classes/:cid/students',
            queries: ['gender'],
            actionCreator: spiedActionCreator,
            everyTime: true
        })

        // initial url
        let location = new Location('/schools/1/classes/2/students', {
            gender: 'female'
        })
        history.update(location)
        // new url is completely the same
        history.update(location)

        expect(spiedActionCreator).to.have.been.called.twice
        expect(dispatch).to.have.been.called.twice
    })

    it('should not listen to history change once unListen executed', () => {
        let dispatch = chai.spy()
        let spiedActionCreator = chai.spy(() => ({}))

        const unListen = subscribe(history, dispatch, {
            url: '/index',
            actionCreator: spiedActionCreator
        })
        history.update(new Location('/index'))
        history.update(new Location('/'))
        history.update(new Location('/index'))

        expect(spiedActionCreator).to.have.been.called.twice
        expect(dispatch).to.have.been.called.twice

        unListen()

        history.update(new Location('/index'))
        history.update(new Location('/index'))
        history.update(new Location('/index'))

        // still be twice
        expect(spiedActionCreator).to.have.been.called.twice
        expect(dispatch).to.have.been.called.twice

    })
})
