'use strict';

describe('Service: xfs', function () {

  // load the service's module
  beforeEach(module('clientApp'));

  // instantiate service
  var xfs;
  beforeEach(inject(function (_xfs_) {
    xfs = _xfs_;
  }));

  it('should do something', function () {
    expect(!!xfs).toBe(true);
  });

});
