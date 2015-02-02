'use strict';

describe('Service: formValidateService', function () {

  // load the service's module
  beforeEach(module('clientApp'));

  // instantiate service
  var formValidateService;
  beforeEach(inject(function (_formValidateService_) {
    formValidateService = _formValidateService_;
  }));

  it('should do something', function () {
    expect(!!formValidateService).toBe(true);
  });

});
