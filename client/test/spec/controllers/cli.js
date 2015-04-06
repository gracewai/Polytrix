'use strict';

describe('Controller: CliCtrl', function () {

  // load the controller's module
  beforeEach(module('clientApp'));

  var CliCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    CliCtrl = $controller('CliCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
