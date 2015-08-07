/* --------------------------------
 Developed by Jonathan Meyer
 Applied Information Sciences
 7/8/2014
 ---------------------------------*/

angular.module('opApp.header').controller('opHeaderController',
    function ($scope, $rootScope, $location, $modal, $timeout, $controller, opConfig, opPopupWindow, opStateService) {
        'use strict';

        $scope.classification = opConfig.classification;
        $scope.bamfLink = '';
        $scope.kmlLink = '';
        $scope.kmlEnabled = false;
        $scope.docLink = opConfig.docLink;
        $scope.announcementCount = 0;
        $scope.announcementsEnabled = false;
        $scope.servers = [];
        $scope.selectedServer = '';
        $scope.kmlServers = null;
        $scope.kmlSingleServer = false;
        $scope.KmlLayers = [];
        $scope.KmlServers = [];

        $scope.isActive = function (viewLocation) {
            return viewLocation === $location.path();
        };

        $scope.showSecurityBanner = function () {
            $modal.open({
                templateUrl: 'modules/header/opSecurityBanner.html'
            });
        };
        $scope.openResults = function (){
            opPopupWindow.showPopup('results.html');
        };
        $scope.drawStart = function (){
            $rootScope.$broadcast('drawStart');
            $scope.isDrawing = true;
        };
        $scope.drawClear = function (){
            $rootScope.$broadcast('drawClear');
        };

        $scope.showBookmark = function () {
            $scope.bamfLink = opStateService.getPermalink();
            $modal.open({
                templateUrl: 'modules/header/opBookmark.html'
            });
        };

        $scope.showKmlLink = function () {
            $scope.kmlLinks = [];
            var servers = [];
            var layers = [[]];
            layers[1] = [];
            //
            var val = opStateService.getDatasets();
            for(var i = 0; i < val.length; i++) {
                var splitVals = val[i].split(':');
                var server = splitVals[0];
                var layer = splitVals[2];
                var serverIndex = servers.indexOf(server);
                if(serverIndex === -1) {
                    servers.push(server);
                    serverIndex = servers.indexOf(server);
                    layers[serverIndex].push(layer);
                } else {
                    layers[serverIndex].push(layer);
                }
            }
            //
            $scope.KmlLayers = layers;
            $scope.KmlServers = servers;
            var serverCount = servers.length;
            for(var i = 0; i < serverCount; i++) {
                $scope.kmlLinks[i] = $scope.buildKmlLink($scope.KmlServers[i]);
            }
            $modal.open({
                templateUrl: 'modules/header/opKmlSelector.html'
            });
        };

        $scope.getLayersForServer = function(serverNum) {
            return $scope.KmlLayers[serverNum];
        };

        $scope.refreshServer = function(server) {
            var serverData = $scope.servers[server];
            $rootScope.$broadcast('refresh-server', serverData);
        };

        $scope.getActiveServers = function() {
            var servers = opStateService.getActiveServer();
            return servers;
        };

        $scope.buildKmlLink = function(serverName) {
            var val = opStateService.getDatasets();

            var server = opStateService.getServer(serverName);
            var link = '';
            if (val !== null && val.length > 0) {
                $scope.kmlEnabled = true;
                link = server.url + '/wms/kml?layers=';
                var serverVals = [];
                for(var i = 0; i < val.length; i++) {
                    var splitVal = val[i].split(':');
                    // getting rid of server name as geoserver has no concept of this when querying for KML link
                    var layerVal = splitVal[1] + ':' + splitVal[2];
                    if(splitVal[0] === serverName) {
                        serverVals.push(layerVal);
                    }
                }
                link = link + serverVals.join(',');

                var timeFilter = opStateService.getTemporalFilter();

                var timeStr = null;
                var titleString = null;
                if (timeFilter !== null && timeFilter.type) {
                    if (timeFilter.type === 'duration') {
                        timeStr = 'back' + timeFilter.value + timeFilter.interval + '/present';
                        var timeLookup = {'h': 'Hour', 'd': 'Day', 'w': 'Week'};
                        titleString = 'OGC Last ' + timeFilter.value + ' ' + timeLookup[timeFilter.interval];
                        // Add s to make interval name plural if greater than 1
                        if (timeFilter.value !== 1) {
                            titleString += 's';
                        }
                    }
                    else if (timeFilter.type === 'range') {
                        timeStr = timeFilter.start.format('YYYY-MM-DDTHH:mm:ss\\Z') + '/' +
                          timeFilter.stop.format('YYYY-MM-DDTHH:mm:ss\\Z');
                        titleString = 'OGC between ' + timeFilter.start.format('YYYY-MM-DDTHH:mm:ss\\Z') + ' and ' +
                          timeFilter.stop.format('YYYY-MM-DDTHH:mm:ss\\Z');
                    }
                }

                if (timeStr !== null) {
                    link += '&time=' + timeStr;
                }
                if (titleString !== null) {
                    link += '&kmltitle=' + titleString;
                }
            }
            return link;
        };

        $scope.buildKmlLinkOld = function() {
            var val = opStateService.getDatasets();

            // break out server names from datasets to build individual server-specific kml links
            // TODO figure out what to do as this changes the UI/usecase?
            var serversOn = [];
            for(var i = 0; i < val.length; i++) {
                var server = val[i].split(':')[0];
                if(serversOn.indexOf(server) === -1) {
                    serversOn.push(server);
                }
            }

            if(serversOn.length === 0) {
                // do nothing if no servers are on
            }
            else if(serversOn.length === 1) {
                var server = opStateService.getServer(serversOn[0]);

                if (val !== null && val.length > 0) {
                    $scope.kmlEnabled = true;
                    $scope.kmlLink = server.url + '/wms/kml?layers=' + val.join(',');

                    var timeFilter = opStateService.getTemporalFilter();

                    var timeStr = null;
                    var titleString = null;
                    if (timeFilter !== null && timeFilter.type) {
                        if (timeFilter.type === 'duration') {
                            timeStr = 'back' + timeFilter.value + timeFilter.interval + '/present';
                            var timeLookup = {'h': 'Hour', 'd': 'Day', 'w': 'Week'};
                            titleString = 'OGC Last ' + timeFilter.value + ' ' + timeLookup[timeFilter.interval];
                            // Add s to make interval name plural if greater than 1
                            if (timeFilter.value !== 1) {
                                titleString += 's';
                            }
                        }
                        else if (timeFilter.type === 'range') {
                            timeStr = timeFilter.start.format('YYYY-MM-DDTHH:mm:ss\\Z') + '/' +
                                timeFilter.stop.format('YYYY-MM-DDTHH:mm:ss\\Z');
                            titleString = 'OGC between ' + timeFilter.start.format('YYYY-MM-DDTHH:mm:ss\\Z') + ' and ' +
                                timeFilter.stop.format('YYYY-MM-DDTHH:mm:ss\\Z');
                        }
                    }

                    if (timeStr !== null) {
                        $scope.kmlLink += '&time=' + timeStr;
                    }
                    if (titleString !== null) {
                        $scope.kmlLink += '&kmltitle=' + titleString;
                    }
                }
                else {
                    $scope.kmlEnabled = false;
                }
            }
            else if(serversOn.length > 1) {
                //var server = opStateService.getServer(serversOn[i])
                // use modal to select?

            }
        };

        $scope.showFeedback = function () {
            $modal.open({
                templateUrl: 'modules/header/opFeedback.html',
                windowClass: 'small-modal'
            });
        };

        $scope.showAnnouncements = function () {
            $rootScope.$broadcast('showAnnouncements');
        };

        $scope.$on('announcementsChanged', function (e, messages, enabled) {
            $scope.announcementCount = messages.length;
            $scope.announcementsEnabled = enabled;
        });


        $scope.$on('mapBoundsChanged', function(){
            $timeout(function() {
                $scope.isDrawing = false;
            });
        });

        $scope.$on('filters-updated', function() {
            var val = opStateService.getDatasets();
            var serversActive = opStateService.getActiveServer();
            if(val.length > 0) {
                $scope.kmlEnabled = true;
            } else {
                $scope.kmlEnabled = false;
            }
            if(serversActive.length === 1) {
                $scope.kmlSingleServer = true;
                $scope.kmlLink = $scope.buildKmlLink(serversActive[0].name);
            } else {
                $scope.kmlSingleServer = false;
            }
            console.log('kmlSingleServer?: ' + $scope.kmlSingleServer);
            console.log('kmlLink = ' + $scope.kmlLink);
            //$scope.buildKmlLink();
        });

        // this is strictly here to toggle the CSS class when the servers are updated directly via
        // the URL params (so that we can toggle the tabs active or not)
        $scope.$on('servers-updated', function(event, args) {
            var serversOn = args[0];
            var serversOff = args[1];
            var serversActive = opStateService.getActiveServer();
            if(serversActive.length === 1) {
                $scope.kmlSingleServer = true;
                $scope.kmlLink = $scope.buildKmlLink(serversActive[0].name);
            } else {
                $scope.kmlSingleServer = false;
            }

            serversOn.forEach(function(serverOn) {
                $scope.servers.forEach(function(server) {
                    if(serverOn.name === server.name) {
                        server.active = true;
                    }
                });
            });

            serversOff.forEach(function(serverOff) {
                $scope.servers.forEach(function(server) {
                    if (serverOff.name === server.name) {
                        server.active = false;
                    }
                });
            });
        });

        //$scope.buildKmlLink();
        //$scope.workspaces = Configuration.workspaces;

        $scope.getServerNames = function() {
            $scope.servers = opConfig.servers;
            $scope.servers.forEach(function(server) {
                server.active = false;
                server.loaded = false;
            });
        };

        $scope.setSelectedServer = function(serverName) {
            if($scope.selectedServer == serverName) {
                $scope.selectedServer = '';
            } else {
                $scope.selectedServer = serverName;
            }
            console.log('selectedServer: ' + $scope.selectedServer);
        };

        $scope.toggleServer = function(server) {
            $scope.servers[server].active = !$scope.servers[server].active;
            $scope.updateStateService();
        };

        $scope.updateStateService = function() {
            opStateService.setActiveServerData($scope.servers);
            console.log('server changed, new data: ' + JSON.stringify($scope.servers));
        };

        $scope.getServerNames();
        $scope.updateStateService();
    });
