app.controller('IndexCntrl', ['$scope', 'ReqHandlingSrvc', function($scope, ReqHandlingSrvc) {
    $scope.users = [];

    ReqHandlingSrvc.get('/users', {})
        .then(function(res) {
            $scope.users = res;
        })
        .catch(function(err) {

        })

    $scope.activateUser = function(userId, index) {
        ReqHandlingSrvc.patch('/activate/'+userId, {})
            .then(function(res) {
                if(res.success) {
                    $scope.users.splice(index, 1);
                }
            })
            .catch(function(err) {

            })
    }

}])