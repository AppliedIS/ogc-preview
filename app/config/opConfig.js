angular.module('opApp').service('opConfig', ['$http', 'L', 'moment', '$q',
    function($http, L, moment, $q) {
    'use strict';

    return {
        /* LEAFLET CONFIGURATION */
        leafletLayers: [
            {
                prettyName: 'Natural Earth',
                name: 'ne:NE1_HR_LC_SR_W_DR',
                url: 'http://demo.boundlessgeo.com/geoserver/wms',
                params: {
                    tileSize: 512
                }
            },
            {
                prettyName: 'Natural Earth Land',
                name: 'maps:ne_50m_land',
                url: 'http://demo.boundlessgeo.com/geoserver/wms',
                params: {
                    tileSize: 512
                }
            },
            {
                prettyName: 'Blue Marble',
                name: 'nasa:bluemarble',
                url: 'http://demo.boundlessgeo.com/geoserver/wms',
                params: {
                    tileSize: 512
                }
            },
            {
                prettyName: 'Shaded Relief',
                name: '0',
                url: 'http://basemap.nationalmap.gov/arcgis/services/USGSShadedReliefOnly/MapServer/WMSServer',
                params: {
                    tileSize: 512
                }
            }
        ],

        leafletOptions: {
            center: [10.0, -50.0],
            zoom: 3,
            attributionControl: false,
            crs: L.CRS.EPSG4326
        },

        // shown above the header banner
        classification: 'UNCLASSIFIED',

        // Can be uncommented to support addition collection filter
        // collectionTypes: {
        //     'filter1': {
        //         name: 'Filter 1',
        //         keywords: ['archsites'],
        //         description: 'Description of filter 1'
        //
        //     },
        //     'filter2': {
        //         name: 'Filter 2',
        //         keywords: ['type2'],
        //         description: 'Description of filter 2'
        //     }
        // },

        // file/URL location of the User Guide (for header link)
        docLink: 'OGC-Preview User Guide.pptx',

        // Endpoint for retreiving list of country boundaries in GeoJSON format
        countryDataUrl: '/config/countries.geo.json',
        // Set endpoint to non-null value to enable control for converting shape files to geoJSON
        shapeToGeoUrl: null,
        //shapeToGeoUrl: 'http://10.3.2.100:8000/shapes/',

        // Identification of the server(s) providing data layers
        servers: [
            {
                url: '/geoserver',
                ajaxUrl: '/geoserver',
                name: 'GeoServer',
                wmsVersion: '1.3.0',
                wfsVersion: '1.0.0',
                wfsOutputFormat: 'text/xml; subtype=gml/3.1.1'
            }//,
            //{
            //    url: 'http://demo.boundlessgeo.com/geoserver',
            //    ajaxUrl: 'http://demo.boundlessgeo.com/geoserver',
            //    name: 'dev',
            //    wmsVersion: '1.3.0',
            //    wfsVersion: '1.0.0',
            //    wfsOutputFormat: 'text/xml; subtype=gml/3.1.1'
            //},
        ],

        // Used to make intelligent guesses as to what time fields are available
        timeFields: {
            start: ['start', 'begin', 'up', 'event', 'time', 'date'],
            stop: ['stop', 'end', 'down', 'event', 'time', 'date']
        },
        // As found in DescribeFeatureType under element's type attributes
        timeFieldTypes : [ 'xsd:date', 'xsd:dateTime' ],
        geomFieldNamespace : 'gml',

        /* Sanity values for performance, etc. */
        // Cap value for features returned by WMS tile set per layer
        wmsFeatureLimiter : 10000,
        wfsFeatureLimiter : 1000,
        // 2 minutes cache period on all layers (cache period in seconds)
        cachePeriod: 60 * 2,
        // 2 minutes cache period for layer metadata (cache period in seconds)
        layerCachePeriod: 60 * 2,

        // time filtering configuration
        maxDaysBack: 14,
        defaultDaysBack: 1,

        /* Ranges used to prime the pre-selection of ranges */
        dateList: [
            // One based because of a weird issue with falsey values in angular views.
            {index: 1, name: 'Today', date: [moment().utc().startOf('d'), moment().utc().add('days', 1).startOf('d')]},
            {index: 2, name: 'Yesterday', date: [moment().utc().subtract('days', 1).startOf('d'), moment().utc().startOf('d')]},
            {index: 4, name: 'Last Two Weeks', date: [moment().utc().subtract('days', 14).startOf('d'), moment().utc().add('days',1).startOf('d')]}
        ],

        // List of tags to attempt to match against WMS layer keywords.
        // If a tag cannot be found for any layer it is not added as a selection.
        // Order is important as that is the order they will be rendered in layer control.
        recognizedTags: [ 'MODIS', 'VIIRS', 'TOPP', 'archsites' ],

        // helper function for gulp that bumps version numbers up with each build
        getVersion: function(){
          return $http({ method: 'GET', url: 'config/version.json', timeout: 50000}).then(function (result) {
              return result.data;
          });
        },
        
        getContact: function(){
            var deferred = $q.defer();
            
            deferred.resolve('Contact');
            
            return deferred.promise;
        }
    };
}]);
