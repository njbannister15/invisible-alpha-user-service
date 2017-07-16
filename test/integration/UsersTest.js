process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../../index');
const expect = require('chai').expect
describe("AUTHENTICATION", () => {

  describe('POST /signup', () => {
    describe('signup new person', () => {
      it('should return 200 when successfull', (done) => {
        request(app)
          .post('/signup')
          .set('Accept', 'application/json')
          .set('Content-Type', 'application/json')
          .send({email: 'test_a@testing.com', password: 'Tester@2017', firstName: 'John', lastName: 'Tester'})
          .expect(200)
          .end(done);
      });
    });

    describe('signup existing person', () => {
      before((done) => {
        request(app)
          .post('/signup')
          .set('Accept', 'application/json')
          .set('Content-Type', 'application/json')
          .send({email: 'existing@testing.com', password: 'Tester@2017', firstName: 'John', lastName: 'Tester'})
          .end(done)
      });
      it('should return 409', (done) => {
        request(app)
          .post('/signup')
          .set('Accept', 'application/json')
          .set('Content-Type', 'application/json')
          .send({email: 'existing@testing.com', password: 'Tester@2017', firstName: 'John', lastName: 'Tester'})
          .expect(409)
          .end(done);

      });

    });

  })

  describe('POST /authenticate', () => {

    before((done) => {
      request(app)
        .post('/signup')
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .send({email: 'test_b@testing.com', password: 'Tester@2017', firstName: 'John', lastName: 'Tester'})
        .end(done)
    })

    it('should return 200 when successfull', (done) => {
      request(app)
        .post('/authenticate')
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .send({email: 'test_b@testing.com', password: 'Tester@2017'})
        .expect(200, (err, result) => {
          expect(result.body)
            .to
            .have
            .property('id_token');
          expect(result.body)
            .to
            .have
            .property('access_token');
          done(err, result);
        });
    })

    it('should return 401 when incorrect password', (done) => {
      request(app)
        .post('/authenticate')
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .send({email: 'test_b@testing.com', password: 'Tester2017'})
        .expect(401, (err, result) => {
          expect(result.body)
            .to
            .have
            .property('error');
          done(err, result);
        });
    })

    it('should return 401 when no-existant', (done) => {
      request(app)
        .post('/authenticate')
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .send({email: 'nonxestant@testing.com', password: 'Tester@2017'})
        .expect(401, (err, result) => {
          expect(result.body)
            .to
            .have
            .property('error');
          done(err, result);
        });
    })
  })

})

describe("USERS", () => {

  describe('GET /users', () => {
    let access_token = null;
    before((done) => {
      request(app)
        .post('/signup')
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .send({email: 'test_c@testing.com', password: 'Tester@2017', firstName: 'John', lastName: 'Tester'})
        .end((err, result) => {

          request(app)
            .post('/authenticate')
            .set('Accept', 'application/json')
            .set('Content-Type', 'application/json')
            .send({email: 'test_c@testing.com', password: 'Tester@2017'})
            .end((err, result) => {
              access_token = result.body.access_token;
              done(err, result);
            });

        });
    })

    it('should return 200 when successfully using JWT', (done) => {
      request(app)
        .get('/users')
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'JWT ' + access_token)
        .expect(200, (err, result) => {
          expect(result.body)
            .to
            .not
            .be
            .a('null');
          done(err, result);
        });
    })

    it('should return 200 when successfully using Bearer', (done) => {
      request(app)
        .get('/users')
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + access_token)
        .expect(200, (err, result) => {
          expect(result.body)
            .to
            .not
            .be
            .a('null');
          done(err, result);
        });
    })

    it('should return 401 malformed Authorization header', (done) => {
      request(app)
        .get('/users')
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .set('Authorization', access_token)
        .expect(401, (err, result) => {
          expect(result.body)
            .to
            .not
            .be
            .a('null');
          done(err, result);
        });
    })

    it('should return 401 when unauthorized', (done) => {
      request(app)
        .get('/users')
        .set('Accept', 'application/json')
        .set('Authorization', 'JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6Ikp' +
            'vaG4gRG9lIiwiYWRtaW4iOnRydWV9.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ')
        .set('Content-Type', 'application/json')
        .expect(401, (err, result) => {
          done(err, result);
        });
    })

    it('should return 400 when missing Authorization header', (done) => {
      request(app)
        .get('/users')
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .expect(400, (err, result) => {
          done(err, result);
        });
    })
  })
});