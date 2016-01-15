import koa from 'koa'
import parameter from '../dist'
import request from 'supertest'

describe('GET', () => {
    it('getParameter', (done) => {
        var app = koa()

        app.use(parameter(app))
        app.use(function *(next){
            this.status = 204
            this.getParameter('a').should.eql('1')
        })

        request(app.listen())
            .get('/?a[0]=1&a[1]=2&a[2]=3')
            .expect(204, done)
    })

    it('getParameters', (done) => {
        var app = koa()

        app.use(parameter(app))
        app.use(function *(next){
            this.status = 204
            this.getParameters('a').should.eql(['1', '2', '3'])
        })

        request(app.listen())
            .get('/?a[0]=1&a[1]=2&a[2]=3')
            .expect(204, done)
    })

    it('filter xss', (done) => {
        var app = koa()

        app.use(parameter(app))
        app.use(function *(next){
            this.status = 204
            this.getParameter('a').should.eql('&lt;script&gt;alert("xss")&lt;/script&gt;')
        })

        request(app.listen())
            .get('/?a=<script>alert("xss")</script>')
            .expect(204, done)
    })

    it('filter xss: false', (done) => {
        var app = koa()

        app.use(parameter(app))
        app.use(function *(next){
            this.status = 204
            this.getParameter('a', false).should.eql('<script>alert("xss")</script>')
        })

        request(app.listen())
            .get('/?a=<script>alert("xss")</script>')
            .expect(204, done)
    })

    it('parameter is not', (done) => {
        var app = koa()

        app.use(parameter(app))
        app.use(function *(next){
            this.status = 204
            this.getParameter('a').should.eql('1')
            this.getParameter('b').should.eql('')
        })

        request(app.listen())
            .get('/?a=1')
            .expect(204, done)
    })

    it('special parameter', (done) => {
        var app = koa()

        app.use(parameter(app))
        app.use(function *(next){
            this.status = 204
            this.getParameter('a').should.eql('1')
            this.getParameter('b').should.not.eql('~!@#$%^^&&(())')
        })

        request(app.listen())
            .get('/?a=1&b=~!@#$%^^&&(())')
            .expect(204, done)
    })
})

describe('POST', () => {
    it('getParameter', (done) => {
        var app = koa()

        app.use(parameter(app))
        app.use(function *(next){
            this.status = 204
            this.getParameter('a').should.eql('1')
        })

        request(app.listen())
            .post('/')
            .field('a', 1)
            .expect(204, done)
    })

    it('getParameters', (done) => {
        var app = koa()

        app.use(parameter(app))
        app.use(function *(next){
            this.status = 204
            this.getParameters('a').should.eql(['1', '2', '3'])
        })

        request(app.listen())
            .post('/')
            .field('a', 1)
            .field('a', 2)
            .field('a', 3)
            .expect(204, done)
    })

    it('filter xss', (done) => {
        var app = koa()

        app.use(parameter(app))
        app.use(function *(next){
            this.status = 204
            this.getParameter('a').should.eql('&lt;script&gt;alert("xss")&lt;/script&gt;')
        })

        request(app.listen())
            .post('/')
            .field('a', '<script>alert("xss")</script>')
            .expect(204, done)
    })

    it('filter xss: false', (done) => {
        var app = koa()

        app.use(parameter(app))
        app.use(function *(next){
            this.status = 204
            this.getParameter('a', false).should.eql('<script>alert("xss")</script>')
        })

        request(app.listen())
            .post('/')
            .field('a', '<script>alert("xss")</script>')
            .expect(204, done)
    })

    it('parameter is not', (done) => {
        var app = koa()

        app.use(parameter(app))
        app.use(function *(next){
            this.status = 204
            this.getParameter('a').should.eql('1')
            this.getParameter('b').should.eql('')
        })

        request(app.listen())
            .post('/')
            .field('a', 1)
            .expect(204, done)
    })

    it('special parameter', (done) => {
        var app = koa()

        app.use(parameter(app))
        app.use(function *(next){
            this.status = 204
            this.getParameter('a').should.eql('1')
            this.getParameter('b').should.eql('~!@#$%^^&&(())')
        })

        request(app.listen())
            .post('/')
            .field('a', 1)
            .field('b', '~!@#$%^^&&(())')
            .expect(204, done)
    })

    it('file parameter', (done) => {
        var app = koa()

        app.use(parameter(app))
        app.use(function *(next){
            this.status = 204
            this.getParameter('a').should.eql('1')
            this.getParameter('file').name.should.eql('package.json')
        })

        request(app.listen())
            .post('/')
            .type('multipart/form-data')
            .field('a', 1)
            .attach('file', 'package.json')
            .expect(204, done)
    })

    it('multiple file parameter', (done) => {
        var app = koa()

        app.use(parameter(app))
        app.use(function *(next){
            this.status = 204
            this.getParameter('a').should.eql('1')
            this.getParameter('file').name.should.eql('package.json')
            this.getParameter('file2').name.should.eql('README.md')
        })

        request(app.listen())
            .post('/')
            .type('multipart/form-data')
            .field('a', 1)
            .attach('file', 'package.json')
            .attach('file2', 'README.md')
            .expect(204, done)
    })
})
