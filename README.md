# offerup

The unofficial OfferUp API client.

> Note: OfferUp doesn't provide an API. So this lib should only be used for personal fun.

## Install

```bash
npm install offerup
```
## Usage

```js
var offerup = require('offerup');

// Set your Google Map Api
offerup.setGoogleMapApi('Your_Api_Key');

// Get your list by Query
offerup.getFullListByQuery({
    location: 'Chicago', // required
    search: 'iphone', // required
    radius: 50,
    limit: 100,
    price_min: 100,
    price_max: 1000
    }).then(function success(response){

        /*
        Output
            "status": {
                "status": "ok",
                "message": "success",
                "code": "200",
                "server_time": "2017-12-10T04:54:43Z"
            },
            "data": {
                "feed_items": [
                    {
                        "type": "item",
                        "item": {
                            "post_date": "2017-12-10T04:49:07.464Z",
                            "owner": {
                                    ...
                                },
                            "id": 391663263,
                            "title": "Looking to buy iPod 6 or any iPhone",
                            "post_date_ago": "13 minutes",
                            "location_name": "Joliet, IL"
                        }
                    }
                ],

            }
        */

    }, function error(response){
        console.log(response);
    });
```

* See the [full getFullListByQuery() docs](docs/getFullListByQuery.md) for the list of all possible modules and the data they return.

## Methods

### setGoogleMapApi()

>https://developers.google.com/maps/

```js
offerup.setGoogleMapApi('Your_Api_Key');
```

### setDefaults()

This data will be used if the query parameter is empty

```js
offerup.setDefaults({
    location: 'New York',
    radius: 30,
    limit: 1000,
    price_min: 100,
    price_max: 1000
});
```

### getUserProfile()

Allows you get user information by user ID

```js
offerup.getUserProfile('112390').then(function(response){
    if(response && response.success == 'success'){
        console.log(response.data);
        /*
        Output
            { 
                success: 'success',
                data: { 
                        type: 'SELLER',
                        name: 'calvin',
                        member_since: 'March, 2014',
                        reviews: '1',
                        location: 'VANCOUVER, WA',
                        followers: '8',
                        items: [
                            { 
                                id: '392556488',
                                title: 'Shirt',
                                img_src: 'https://d2j6tswx2otu6e.cloudfront.net/0qdf73oL5yfun8RBLcnUyoj2upY=/200x267/d2c0/d2c0a133a6194e9da25266a8165c4e2a.jpg',
                                price: '5.00',
                                location: 'Elizabethton, TN',
                                link: 'https://offerup.com/item/detail/392556488/' 
                            }
                        ] 
                    } 
                }
            */
    }
}, function error(response){
    console.log(response);
});
```