var request = require('supertest')
  , express = require('express')
  , assert = require('assert')
  ;

var app = require('../app.js').app;

describe('Content', function(){
  it('home page', function(done){
    testRedirect(done, '/', 'https://datahub.io');
  });
  it('data package page', function(done){
    testRedirect(done, '/doc/data-package', 'https://datahub.io/docs/data-packages')
  });
});


describe('GET /tools/validate', function(){
  this.timeout(5000);
  it('responds with correct json', function(done){
    var url = '/tools/validate.json';
    url += '?url=' + 'https://raw.github.com/datasets/gold-prices/master/datapackage.json';
    request(app)
      .get(url)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) done(err);

        var out = res.body;
        assert.deepEqual(out, {
          valid: true,
          errors: []
        });
        done();
      });
  })
  it('fails', function(done){
    var url = '/tools/validate.json';
    url += '?url=' + 'http://localhost:9999';
    request(app)
      .get(url)
      .expect({valid: false, errors: [{message: 'Error: connect ECONNREFUSED 127.0.0.1:9999'}]})
      .expect(200, done)
    ;
  })
})


describe('GET /tools/view', function(){
  this.timeout(5000);
  it('responds with correct info', function(done){
    var url = '/tools/view';
    url += '?url=' + 'https://raw.github.com/datasets/gold-prices/master/datapackage.json';
    request(app)
      .get(url)
      .end(function(err, res) {
        if (err) done(err);

        var out = res.body;
        console.log(out);
        // assert.equal(out.length, 0);
        done();
      });
  })
  it('fails with 500 on bad input url', function(done){
    var url = '/tools/view';
    url += '?url=' + 'http://localhost:9999';
    request(app)
      .get(url)
      .expect('<p>There was an error.</p>\n\nconnect ECONNREFUSED 127.0.0.1:9999')
      .expect(200, done)
    ;
  })
})

// describe('GET /data.json', function(){
//   it('works', function(done){
//     var url = '/data.json';
//     request(app)
//       .get(url)
//       .expect('Content-Type', /json/)
//       .expect(200)
//       .end(function(err, res) {
//         if (err) done(err);
//
//         var out = res.body;
//         assert.equal(out.total, 15);
//         var ds = out.datasets[0];
//         assert.equal(ds.name, 'bond-yields-uk-10y');
//
//         done();
//       });
//   });
// });

describe('redirects for docs to datahub.io', function() {
  it('/doc => /docs', function(done) {
    var basePath = '/doc';
    testRedirect(done, basePath, 'https://datahub.io/docs');
  })

  it('/doc/publish => /docs/data-packages/publish', function(done) {
    var publish = '/doc/publish'; // assume it is enough to test
    testRedirect(done, publish, 'https://datahub.io/docs/data-packages/publish');
  })

  it('/doc/:page => /docs', function(done) {
    var anyOtherPath = '/doc/other';
    testRedirect(done, anyOtherPath, 'https://datahub.io/docs');
  })
})

function testRedirect(done, url, shouldRedirectTo) {
  request(app)
    .get(url)
    .expect(302)
    .end(function(err, res) {
      if (err) done(err);

      assert(res.headers.location, shouldRedirectTo);
      done();
    })
}
