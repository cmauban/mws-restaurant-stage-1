// open database
const dbPromise = idb.open('mws-restaurant-stage-3', 2, function(upgradeDB){
  switch(upgradeDB.oldVersion) {
    case 0:
      upgradeDB.createObjectStore('restaurants', {keyPath: 'id'});
      console.log('Created restaurant review obj store');
    case 1:
      const storedReviews = upgradeDB.createObjectStore('reviews', {keyPath: 'id'});
      storedReviews.createIndex('restaurant', 'restaurant_id');
  }
});

/**
 * Database URL.
 * Change this to restaurants.json file location on your server.
 */

  const port = 1337; // Change this to your server port
  const RESTAURANTS_URL = `http://localhost:${port}/restaurants/`;
  const REVIEWS_URL = `http://localhost:${port}/reviews/`;


/**
 * Common database helper functions.
 */
class DBHelper {


  // STORE RESTAURANTS TO indexDB
  static storeRestaurantsToIDB() {

    // fetch data from server and convert to JSON
    fetch(RESTAURANTS_URL).then(function(response) {
      return response.json();
    // put JSON data in restaurants indexDB
    }).then(function(restaurants) {
      console.log('pulled restaurant json data successful');
      dbPromise.then(function(db) {
        if(!db) return;
        var tx = db.transaction('restaurants', 'readwrite');
        var store = tx.objectStore('restaurants');
        restaurants.forEach(function(restaurant) {
          store.put(restaurant)
        });
      });
      // return it
      // console.log('restaurants ', restaurants);
      callback(null, restaurants);
    }).catch(function(err) {
      const error = (`unable to store restaurants ${err}`);
    });

  }

  // FETCH RESTAURANTS FROM indexDB
  static getRestaurantsFromIDB() {
    dbPromise.then(function(db) {
      var tx = db.transaction('restaurants', 'readonly');
      var store = tx.objectStore('restaurants');
      return store.getAll();
    }).then(function(items) {
      console.log('restaurant names:', items);
    });
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback, id) {

    // let xhr = new XMLHttpRequest();
    let fetchURL;

    DBHelper.storeRestaurantsToIDB();
    DBHelper.getRestaurantsFromIDB();

    if (!id) {
      fetchURL = RESTAURANTS_URL;
    } else {
      fetchURL = RESTAURANTS_URL + '/' + id;
    }

    fetch(fetchURL, {method: 'GET'})
      .then(response => {
        response.json().then(restaurants => {
          // console.log('restaurants JSON: ', restaurants);
          callback(null, restaurants);
        });
      })
      .catch(error => {
        callback('Request failed. Returned $(error)', null);
      });

    // xhr.open('GET', DBHelper.DATABASE_URL);
    // xhr.onload = () => {
    //   if (xhr.status === 200) { // Got a success response from server!
    //     const json = JSON.parse(xhr.responseText);
    //     const restaurants = json.restaurants;
    //     callback(null, restaurants);
    //   } else { // Oops!. Got an error from server.
    //     const error = (`Request failed. Returned status of ${xhr.status}`);
    //     callback(error, null);
    //   }
    // };
    // xhr.send();

  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { // Got the restaurant
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }


  /* SEND FAVORITE UPDATE */
  static updateFavoriteStatus(restaurantId, isFavorite) {
    console.log('changing status to: ', isFavorite);

    fetch(`${RESTAURANTS_URL}${restaurantId}/?is_favorite=${isFavorite}`, { method: 'PUT'})
    .then(() => {
      console.log('changed');
      this.dbPromise().then(db => {
        const tx = db.tranaction('restaurants', 'readwrite');
        const restaurantsStore = tx.objectStore('restaurants');
        restaurantsStore.get(restaurantID).then(restaurant => {
          restaurant.is_favorite = isFavorite;
          restaurantsStore.put(restaurant);
        });
      })
    })
  }

  /**
   * ADD Reviews
   */

   static addReview(review) {
     const btn = document.getElementById('submit-review');
     btn.onclick = null;
      // create post
      let body = {
          'restaurant_id': parseInt(review.restaurant_id),
          'name': review.name,
          'createdAt': Date.now(),
          'rating': parseInt(review.rating),
          'comments': review.comments,
        };

        console.log('sending review: ', body);

        let offline_obj = {
          name: 'addReview',
          data: review,
          object_type: 'review'
        };

        //Check if offline
       if (!navigator.onLine && (offline_obj.name === 'addReview')) {
         sendDataWhenOnline(offLine_obj);
         return;
       }

       const URL = `${this.REVIEWS_URL}`;

       const properties = {
         body: JSON.stringify(body),
         method: 'POST',
         headers: new Headers ({
           'Content-Type': 'application/json'
         })
       };

       fetch(REVIEWS_URL, properties).then(response => response.json())
        .catch(error => console.error('adding review failed'))
        .then(response => console.log('review was added'));
      }


  /**
   * STORE REVIEWS
   */

  static storeReviews(id) {
    /* fetch data from server */
    return fetch(`${REVIEWS_URL}?restaurant_id=${id}`)
      .then(response => {
        return response.json();
      })
      .then(reviews => {
        this.dbPromise().then(db => {
          if (!db) return;
          /* store reviews in indexed db */
          let tx = db.transaction('reviews', 'readwrite');
          const store = tx.objectStore('reviews');
          return store.getAll();
          if(Array.isArray(reviews)) {
            reviews.forEach(function(review) {
              store.put(review);
            });
          } else {
            store.put(reviews);
          }
        });
        console.log('restaurant reviews are: ', reviews);
        return Promise.resolve(reviews);
        /* if offline, fail and fetch reviews from indexed db */
      }).catch(error => {
        // return DBHelper.getStoredObjectByID('reviews', 'restaurant', id)
          // .then((storedReviews) => {
            // console.log('looking for offline stored reviews');
            // return Promise.resolve(storedReviews);
          // })
      });
  }
  //
  // static getStoredObjectByID(table, idx, id) {
  //   return this.dbPromise()
  //   .then(function(db){
  //     if(!db) return;
  //
  //     const store = db.transaction(table).objectStore(table);
  //     const indexID = store.index(idx);
  //     return indexID.getAll(id);
  //   });
  // }

  /**
   * FETCH REVIEWS
   */

   // Help method to fetch review from server.
  static fetchReviews(url = "", errorMessage = "Error: ") {
      return fetch(url)
        .then(response => {
          if (!response.ok) {
            throw new Error(response.statusText);
          }
          return response.json();
        })
        .catch(err => {
          return err;
        });
    }


  static fetchRestaurantReviwsByID(id, callback) {
    // verify the restaurant ID
    if (!Number.isInteger(Number(id))) {
      // throw error if id invalid
      callback(new Error(`ID: ${id} is not a valid id.`), null);
    }

    // Fetch the review from the server.
    DBHelper.fetchReviews(`${REVIEWS_URL}?restaurant_id=${id}`,"error while fetching reviews: ")
      .then(reviews => {
        callback(null, reviews);
      })
      .catch(err => {
        callback(err, null);
      });
  }


  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant, type) {
    if (restaurant.photograph == undefined)
      restaurant.photograph = restaurant.id;
      return (`/img/${type}/${restaurant.photograph}` + '.jpg');
  }

  /**
   * Map marker for a restaurant.
   */
   static mapMarkerForRestaurant(restaurant, map) {
    // https://leafletjs.com/reference-1.3.0.html#marker
    const marker = new L.marker([restaurant.latlng.lat, restaurant.latlng.lng],
      {title: restaurant.name,
      alt: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant)
      })
      marker.addTo(newMap);
    return marker;
  }

  /* static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  } */

}
