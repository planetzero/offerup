'use strict';

/**
 * Dependencies
 */

const tress = require('tress');
const request = require('request');
const NodeGeocoder = require('node-geocoder');


/**
   * Gets latitude and longitude by location name
   *
   * @param  {String}  location  Location parameter from query
   * @return {Promise}
   */

function _getLocation(location){
    return new Promise(function(resolve, reject){

        if(!OfferUp.googleApi){
            reject(new Error('\'Google Map Api Key\' is not defined. Please use method setGoogleMapApi to defined it'));
        }
        if(!location){
            reject(new Error('\'location\' parameter is required'));
        }
        if(!(typeof location == 'string')){
            reject(new Error('\'location\' parameter should be \'string\''));
        }


        var options = {
            provider: 'google',
            
            // Optional depending on the providers
            httpAdapter: 'https',
            apiKey: OfferUp.googleApi,
            formatter: null
        };

        var geocoder = NodeGeocoder(options);

        geocoder.geocode(location, function(err, res) {
            if(err){
                throw new Error(err);
            }else{
                /*
                    Returns result if location is found
                */
                if(res.length && res[0].latitude && res[0].longitude){
                    var result = {};
                    result.success = true;
                    result.data = {
                        latitude: res[0].latitude,
                        longitude: res[0].longitude
                    }
                    resolve(result);
                }else{
                    reject(new Error('\'location\' is not defined'));
                }
                
            }
        });
    });
}

/**
   * Gets latitude and longitude by location name
   *
   * @param {Object} query Query object
   * @param  {Object}  location  latitude and longitude object
   * @param {Function} resolve Callback success
   * @param {Function} reject Callback error
   * 
   */

function getFullListByQuery(query, location, resolve, reject){
    
    var results = [], k = 0, search_after = '', price_min = '', price_max = '';


    var q = tress(function(query, callback){
        /*
            multiple queries
        */
        if(query.search_after){
            if(!(typeof query.search_after == 'number')){
                reject(new Error('search_after is not a number'));
            }
            if(query.search_after < 10){
                reject(new Error('search after should be more than 10'));
            }
            if(!query.cursor_id){
                reject(new Error('cursor_id is not defined'));
            }
            if(!(typeof(query.cursor_id == 'number'))){
                reject(new Error('cursor_id is not a number'));
            }
            var search_after_number = query.search_after;
            var i = 0;

            while(search_after_number > 10){
                i++;
                search_after_number = search_after_number / 10;
            }
            search_after = '%22search_after%22%3A' + search_after_number + 'E' + i + '%2C%22cursor_id%22%3A' + query.cursor_id + '%7D';
        }
        if(query.price_min){
            price_min = '&price_min=' + query.price_min;
        }
        if(query.price_max){
            price_max = '&price_max=' + query.price_max;
        }

        var url = 'https://offerup.com/webapi/search/v2/feed/?q='+query.search+'&radius='+query.radius+''+price_min+''+price_max+'&platform=web&experiment_id=experimentmodel24&lon='+location.longitude+'&lat='+location.latitude+'&page_cursor=%7B%22index%22%3A31%2C%22external_ads_cursor%22%3A%22b54522541be8463aa9e9536c099430cf%22%2C' + search_after + '&limit=1000';
        
        request({url: url}, function(error, response, body){
            if(!error && response.statusCode == 200){

                var r = JSON.parse(body);

                for(var i=0,l=r.data.feed_items.length;i<l;i++){
                    if(k === query.limit) break;
                    if(r.data.feed_items[i].type == 'item'){
                        results.push(r.data.feed_items[i].item);
                        k++;
                    }
                }

                /*
                    Creates another request if id is less than query.limit
                */
                if(k < query.limit){
                    var s = JSON.parse(r.data.next_page_cursor);
                    query.search_after = s.search_after;
                    query.cursor_id = s.cursor_id;
                    q.push(query)
                }
                

                callback();
            }else{
                reject(new Error('Request error: ' + error + ', statusCode: ' + response.statusCode));
            }
        })
    });

    q.drain = function(){
        resolve(results);
    }

    /*
        First request
    */
    q.push(query);

    
}

    /*
        exports Object
    */
    var OfferUp = {};

    /**
     * Allows you to set Google Map Api to get location
     *
     * @param  {String}  apikey Your Api Key
     * 
    */
    OfferUp.setGoogleMapApi = function(apikey){
        if(this.googleApi){
            reject(new Error('You already have an API KEY'));
        }
        if(!apikey){
            reject(new Error('\'API Key\' is not defined'));
        }
        if(!(typeof apikey == 'string')){
            reject(new Error('\'API Key\' should be \'string\''));
        }
        this.googleApi = apikey;
    }

    /**
     * Allows you to set Default options for your query
     *
     * @param  {Object}  defaults Default options
     * 
    */

    OfferUp.setDefaults = function(defaults){
        if(!defaults){
            reject(new Error('defaults is not defined'));
        }
        if(!(typeof defaults == 'object')){
            reject(new Error('defaults is not an object'));
        }
        this.defaults = defaults;
    }

    /**
     * Allows you to get full list by query
     *
     * @param  {Object}  query  Your request
     * @return {Promise}
     * 
    */
    OfferUp.getFullListByQuery = function(query){
        return new Promise(function(resolve, reject){
            if(!query){
                reject(new Error('\'query\' is not defined'));
            }
            if(!(query instanceof Object)){
                reject(new Error('Object is not defined'));
            }
            /**
             * If there are default options and these options are not defined
             */
            if(OfferUp.defaults){
                var _defaults = OfferUp.defaults;
                var _keys = Object.keys(_defaults);
                for(var i=0,keys = _keys.length;i<keys;i++){
                    /**
                     * Sets there options in your query
                     */
                    if(!query[_keys[i]]){
                        query[_keys[i]] = _defaults[_keys[i]];
                    }
                }
            }
            if(!query.location){
                reject( new Error('\'location\' parameter is required'));
            }
            if(!query.search){
                reject(new Error('\'search\' parameter is required'));
            }
            if(!(typeof query.search == 'string')){
                reject(new Error('\'search\' parameter should be \'string\''));
            }
            if(query.radius){
                if(!(typeof query.radius == 'number')){
                    reject(new Error('\'radius\' parameter should be \'number\''));
                }
                if(query.radius < 5 || query.radius > 50){
                    reject(new Error('\'radius\' parameter should be from 5 to 50'));
                }
            }else{
                /**
                 * Sets default radius for request // 30
                 */
                query.radius = 30;
            }
            if(query.limit){
                if(query.limit < 1 || query.limit > 1000){
                    reject(new Error('\'limit\' parameter should be from 1 to 1000'));
                }
            }else{
                /**
                 * Sets default limit for request // 50
                 */
                query.limit = 50;
            }
            if(!(typeof query.location == 'string')){
                reject(new Error('\'location\' parameter should be \'string\''));
            }
            if(!(query.price_min === undefined) && !(query.price_max === undefined)){
                if(query.price_min > query.price_max){
                    reject(new Error('\'price_max\' should be more than \'price_min\''));
                }
            }
            if(!(query.price_min === undefined)){
                if(!(typeof query.price_min == 'number')){
                    reject(new Error('\'price_min\' shoube be \'number\''));
                }
                if(query.price_min < 0){
                    reject(new Error('\'price_min\' shoube be more than 0'));
                }
                
            }
            if(!(query.price_max === undefined)){
                if(!(typeof query.price_max == 'number')){
                    reject(new Error('\'price_max\' shoube be \'number\''));
                }
                if(query.price_max <= 0){
                    reject(new Error('\'price_max\' shoube be more than 0'));
                }
            }

            _getLocation(query.location).then(function(response){
                if(response && response.success && response.data){
                    getFullListByQuery(query, response.data, resolve, reject);
                }else{
                    reject(new Error('\'location\' is not defined'));
                }
                
            }).catch(function(error){
                console.log(error)
            });

            
        });
    }


    module.exports = OfferUp;