angular.module('paytm.ctrl.scroll', []).
controller('scrollCtrl', ['$scope', '$rootScope', '$timeout', '$interval', '$window', function ($scope, $rootScope, $timeout, $interval, $window) {
    $scope.title = "Scroll View";
    $scope.formDateData = $rootScope.formDateData;
    $scope.formDisplayAmount = $rootScope.formDisplayAmount;

    $scope.formAudioFile = $rootScope.formAudioFile = "media/alert.mp3";
    $scope.streamlabsdebug = true;
    $scope.scrollResult = true;

    $scope.allTimeDonors = null;
    $scope.recentDonor = null;
    $scope.highestDonor = null;
    $scope.moreThenDefined = null;

    var paytmData = $rootScope.paytmData;
    var unqEmailIds = $rootScope.unqEmailIds;
    var sname = [];
    var smoney = [];
    var sponsors = [];

    // FOR MUSIC / SOUNDS alerts
    var isCheckedAudio = $rootScope.isCheckAudio;

    var dateCategory = $rootScope.dateCategory;

    var highestDonatorWeekly = null;
    $scope.highestDonatorWeekly = highestDonatorWeekly;

    /*
    var labelid = null;
    gapi.client.gmail.users.labels.list({'userId':'me'})
    .then( function(res) {
        console.log(JSON.stringify(res.result.labels));
        _.forEach(res.result.labels, function(e){
            if(e.name == 'PAYTM'){
                labelid = e.id;
                alert(e.id);
                return;
            }
        });
    });
    */

    var listAndReadMailsFn = function (q) {
        //var query = $rootScope.formDateData == 0 ? { 'userId': 'me', 'q': 'is:paytm' } : { 'userId': 'me', 'q': 'is:paytm', 'maxResults': $rootScope.formDateData };
        var query = {
            'userId': 'me',
            'q': 'is:paytm'
        };

        gapi.client.gmail.users.messages.list(query)
            .then(function (res) {
                _.forEach(res.result.messages, function (e) {
                    var result = unqEmailIds.indexOf(e.id) > -1;
                    if (!result) {
                        $('#deleteMeBaby').remove();
                        if (isCheckedAudio) {
                            $('#hiddenMusicPlayer').append('<audio id="deleteMeBaby" hidden="true" controls autoplay><source src="media/alert.mp3" type="audio/mpeg"></audio>');
                        }
                        unqEmailIds.push(e.id);

                        gapi.client.gmail.users.messages.get({
                            'userId': 'me',
                            'id': e.id,
                            'format': 'metadata'
                        }).then(function (res) {
                            res = res.result;
                            var blockData = {};
                            var streamlabsData = {};
                            var date, data = null;
                            for (var headerIndex = 0; headerIndex < res.payload.headers.length; headerIndex++) {
                                if (res.payload.headers[headerIndex].name == 'Date') {
                                    var x = moment();
                                    var y = moment(res.payload.headers[headerIndex].value);
                                    if (x.diff(y, 'days') > $rootScope.formDateData && $rootScope.formDateData != 0) {
                                        return;
                                    }
                                    date = res.payload.headers[headerIndex].value;
                                    date = moment(date).format('DD MMM YYYY HH:mm:ss A');
                                } else if (res.payload.headers[headerIndex].name == 'Subject') {
                                    data = res.payload.headers[headerIndex].value;
                                    data = data.replace(/You have received /g, '');
                                    data = data.replace(/ from/g, '');
                                    data = data.match(/[^\s]+/g);
                                    data.money = data[0].replace(/Rs./g, '');
                                    data.name = data[2] ? data[1] + " " + data[2] : data[1];
                                }
                            }
                            //dateCategory.push(date);
                            blockData = {
                                name: data.name.toUpperCase(),
                                money: parseInt(data.money),
                                date: moment(date, 'DD MMM YYYY HH:mm:ss').unix()
                            };
                            // streamlabsData = {
                            //     name: blockData.name,
                            //     message: blockData.money + ' received via PayTM',
                            //     identifier: blockData.name,
                            //     amount: parseFloat(blockData.money / 70).toFixed(2),
                            //     currency: 'USD',
                            //     date: blockData.date,
                            //     access_token: $rootScope.streamlabsToken,
                            //     skip_alert: 'no'
                            // };
                            // initStreamlabs();
                            /*
                            blockData.push(data.money);
                            blockData.push(data.name.toUpperCase());
                            blockData.push(date);
                            */
                            paytmData.push(blockData);
                        });
                    }
                });
                //console.log(paytmData);
            });
        //console.log(paytmData[0]);
        /*
        function allTimeDonors() {
            $scope.allTimeDonors = [];
            _.forEach(paytmData, function (e, i) {
                $scope.allTimeDonors.push(e[dateCategory[i]]);
            });
            //console.log($scope.allTimeDonors);
        }
        allTimeDonors();
        */


        var dupPaytmData = _.cloneDeep(paytmData);

        function runFunScript() {
            var highestDonor = _.maxBy(dupPaytmData, 'money');
            $scope.highestDonor = highestDonor;
            
            var allTimeDonors = _.sortBy(dupPaytmData, 'date');
            allTimeDonors.reverse();
            $scope.allTimeDonors = allTimeDonors;

            var moreThenDefined = _.remove(dupPaytmData, function (o) {
                return o.money >= $rootScope.formDisplayAmount;
            });
            moreThenDefined = _.sortBy(moreThenDefined, 'date');
            moreThenDefined.reverse();
            $scope.moreThenDefined = moreThenDefined;

            $scope.recentDonor = allTimeDonors[0];

            // _.forEach(dupPaytmData, function (e) {
            //     smoney = [];
            //     if (sname.indexOf(e.name) == -1) {
            //         sname.push(e.name);
            //         _.forEach(dupPaytmData, function (f) {
            //             if (f.name == e.name) {
            //                 smoney.push(f.money);
            //             }
            //         });
            //         console.log(smoney);
            //         if (_.sum(smoney) >= 159) {
            //             sponsors.push(e.name);
            //         }
            //     }
            // });
            // $scope.sponsors = sponsors;
        }
        runFunScript();

        // function initStreamlabs() {
        //     var url = "https://streamlabs.com/api/v1.0";
        //     var query = {
        //         response_type: 'code',
        //         client_id: 'IwAXDUMbv9kBkQ46udItsZemcagceYYMu3AMgTrS',
        //         redirect_uri: 'http://paytm-alerts-alpha.herokuapp.com',
        //         scope: 'donations.read+donations.create'
        //     };
        //     var queryToken = {
        //         grant_type: 'authorization_code',
        //         client_id: 'IwAXDUMbv9kBkQ46udItsZemcagceYYMu3AMgTrS',
        //         client_secret: 'Fr0Sl3nG44zZJM2qFG2rbT8jf0BQG1y1oQBQtPx1',
        //         redirect_uri: 'http://localhost:3000',
        //         code: $rootScope.streamlabsToken
        //     };
        //     var queryString = Object.keys(queryToken).map(key => key + '=' + queryToken[key]).join('&');
        //     var tokenUrl = url+'/token?'+queryString;
        //     console.log(tokenUrl);
    
        //     var config = 'content-type';
        //     $http.post(tokenUrl, queryString)
        //         .then(
        //             function (res) {
        //                 console.log('initStreamlabs := ' + JSON.stringify(res));
        //             },
        //             function (err) {
        //                 console.log('ERROR initstreamlabs := ' + JSON.stringify(err));
        //             }
        //         );
    
        // };

        /*
        function highestDonatorFn() {
            var series = [];
            _.forEach(paytmData, function (e, i) {
                series.push(e[dateCategory[i]].money);
            });
            var maxie = _.max(series);
            _.findIndex(paytmData, function (e, i) {
                if (e[dateCategory[i]].money == maxie) $scope.highestDonator = e;
            });
        }
        highestDonatorFn();

        function highestDonatorWeeklyFn() {
            var newDateCategory = dateCategory;
            var newPaytmData = paytmData;

            var weekly = moment().subtract(7, 'days').hours(0).minutes(0).seconds(0);
            weekly = moment(weekly).format('DD MMM YYYY HH:mm:ss A');

            //console.log(newDateCategory);
            newDateCategory = _.slice(newDateCategory, 3, newDateCategory.length
                //console.log(moment(e,'DD MMM YYYY HH:mm:ss A').isAfter(weekly,'DD MMM YYYY HH:mm:ss A'));
            );
            //console.log(newDateCategory);

            var series = [];
            _.forEach(newPaytmData, function (e, i) {
                console.log(e[newDateCategory[i]].money);
                //series.push(newPaytmData[e].money);
            });
            var maxie = _.max(series);
            _.findIndex(newDateCategory, function (e) {
                if (newPaytmData[e].money == maxie) $scope.highestDonatorWeekly = newPaytmData[e];
            });
            console.log($scope.highestDonatorWeekly);
        }
        highestDonatorWeeklyFn();
        $rootScope.paytmData = [];
        */
    };
    // Add blinking

    var promise;
    $scope.startFn = function () {
        promise = $interval(listAndReadMailsFn, 2500);
        $scope.scrollResult = false;
    };
    $scope.stopFn = function () {
        $interval.cancel(promise);
        $scope.scrollResult = true;
    };
    $scope.resetFn = function () {
        if (confirm('Are you sure?')) $window.location.reload();
    };


    $scope.$on('$routeChangeSuccess', function (event, current, previous) {

    });
    $scope.$watch('formDateData', function (o, n) {
        $rootScope.formDateData = n;
        paytmData = [];
        unqEmailIds = [];
    });
    $scope.$watch('formDisplayAmount', function (o, n) {
        $rootScope.formDisplayAmount = n;
        paytmData = [];
        unqEmailIds = [];
    });
    /*
    $scope.$watch('recentDonor', function(o, n){
        $scope.recentDonor = n;
    });
    $scope.$watch('isCheckedAudio', function (o, n) {
        // FOR MUSIC / SOUNDS alerts
        $rootScope.isCheckAudio = isCheckedAudio =  n;
    });
    $scope.$watch('highestDonor', function (o, n){
        $scope.highestDonor = highestDonor = n;
    });
    */
    $scope.$on('$destroy', function () {
        $interval.cancel(promise);
    });
}]);