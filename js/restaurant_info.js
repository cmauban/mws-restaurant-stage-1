let restaurant;
var newMap;

/**
 * Initialize map as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  initMap();
});

/**
 * Initialize leaflet map
 */
initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.newMap = L.map('map', {
        center: [restaurant.latlng.lat, restaurant.latlng.lng],
        zoom: 16,
        scrollWheelZoom: false
      });
      L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
        mapboxToken: 'pk.eyJ1IjoiY21hdWJhbiIsImEiOiJjamlhazl3MmsxODN5M3FxcW5heDNjd2k4In0.UGQ4ABqAO56aBEJfsNReTw',
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
          '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
          'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox.streets'
      }).addTo(newMap);
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.newMap);
    }
  });
}

/* window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
} */

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant)
    });
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const picture = document.createElement('picture');

    const source = document.getElementById('restaurant-source');
    const imgUrl = DBHelper.imageUrlForRestaurant(restaurant, 'banner');
    const imgParts = imgUrl.split('.');
    const imgUrlx3 = imgParts[0] + '-980_3x.' + imgParts[1];
    source.srcset = imgUrlx3;

    const image = document.getElementById('restaurant-img');
    image.className = 'restaurant-img';
    const imgUrlx2 = imgParts[0] + '-600_2x.' + imgParts[1];
    image.src = imgUrlx2;
    image.alt = restaurant.name + ' promo';

  picture.innerHTML = restaurant.picture;

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  fillReviewsHTML();
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  // fetch all reviews
  DBHelper.fetchRestaurantReviwsByID(self.restaurant.id, (error, reviews) => {

    const container = document.getElementById('reviews-container');

    // if no reviews, display:
    if (!reviews) {
      const noReviews = document.createElement('p');
      noReviews.className = 'no-reviews';
      noReviews.innerHTML = 'No reviews yet!';
      container.appendChild(noReviews);
      return;
    }

    const ul = document.getElementById('reviews-list');

    // create review HTML for each review
    reviews.forEach(review => {
      ul.appendChild(createReviewHTML(review));
    });

    container.appendChild(ul);
  });
}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');
  const name = document.createElement('p');
  name.innerHTML = review.name;
  name.className = 'review-name';
  li.appendChild(name);

  // TODO: GET DATE FORMATTED CORRECTLY
  // const date = document.createElement('p');
  // date.innerHTML = review.date;
  // date.className = 'review-date';
  // li.appendChild(date);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  rating.className = 'review-rating';
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  comments.className = 'comments';
  li.appendChild(comments);

  return li;
}

/**
 * Display review form
 */
 $('#start-review').click(function(){
   $(this).addClass('hide');
   $('.no-reviews').addClass('hide');
   $('#form-container').addClass('open');
 });

 $('#submit-review').click(function(){
   $(this).removeClass('hide');
   $('.no-reviews').removeClass('hide');
   $('#form-container').removeClass('open');
 });


 /**
  * Review submit form
  */
addReview = () => {
  event.preventDefault();
  // get data from the form
  let restaurant_id = getParameterByName('id');
  let name = document.getElementById('review-name').value;
  let rating = document.querySelector('#review-selection option:checked').value;
  let comments = document.getElementById('review-comments').value;

  const review = [name, rating, comments, restaurant_id];
  // add data to UI
  const displayReview = {
    restaurant_id: parseInt(review[3]),
    name: review[0],
    createdAt: new Date(),
    rating: parseInt(review[1]),
    comments: review[2].substring(0, 300),
  };

  // add review form to database
  DBHelper.addReview(displayReview);
  createReviewHTML(displayReview);
  document.getElementById('review-form').reset();
  // TODO: GET REFRESH WORKING
  // window.location.reload(true);
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
};

const handleFavoriteClick = (id, newState) => {
  const favorite = document.getElementById('favorite-icon-' + id);
  /* change data to new state */
  self.restaurants['is_favorite'] = newState;
  favorite.onclick = event => handleFavoriteClick(restaurant.id, !self.restaurant['is_favorite']);
  DBHelper.handleFavoriteClick(id, newState);
}
