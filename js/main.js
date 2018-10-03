let restaurants,
  neighborhoods,
  cuisines
var newMap
var markers = []

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  initMap(); // added
  fetchNeighborhoods();
  fetchCuisines();
});

/**
 * Fetch all neighborhoods and set their HTML.
 */
fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods((error, neighborhoods) => {
    if (error) { // Got an error
      console.error(error);
    } else {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    }
  });
}

/**
 * Set neighborhoods HTML.
 */
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
}

/**
 * Fetch all cuisines and set their HTML.
 */
fetchCuisines = () => {
  DBHelper.fetchCuisines((error, cuisines) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }
  });
}

/**
 * Set cuisines HTML.
 */
fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');

  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
}

/**
 * Initialize leaflet map, called from HTML.
 */
initMap = () => {
  self.newMap = L.map('map', {
        center: [40.722216, -73.987501],
        zoom: 12,
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

  updateRestaurants();
}

/**
 * Update page and map for current restaurants.
 */
updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
    }
  })
}

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
resetRestaurants = (restaurants) => {
  // Remove all restaurants
  self.restaurants = [];
  const div = document.getElementById('restaurants-list');
  div.innerHTML = '';

  // Remove all map markers
  self.markers.forEach(m => m.setMap(null));
  self.markers = [];
  self.restaurants = restaurants;
}

/**
 * Create all restaurants HTML and add them to the webpage.
 */
fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const div = document.getElementById('restaurants-list');
  restaurants.forEach(restaurant => {
    div.append(createRestaurantHTML(restaurant));
  });
  addMarkersToMap();
}


/**
 * Create restaurant HTML.
 */
createRestaurantHTML = (restaurant) => {
  const article = document.createElement('article');
  console.log('is_favorite: ', restaurant['is_favorite']);
  const isFavorite = (restaurant['is_favorite'] && restaurant['is_favorite'].toString() === 'true') ? true : false;
  const favoriteContainer = document.createElement('div');
  favoriteContainer.className = 'favorite-container';

    const favorite = document.createElement('button');
    favorite.id = 'favorite-icon-' + restaurant.id;
    favorite.className = 'favorite-icon';
      const favoriteIcon = document.createElement('span');
        favoriteIcon.innerHTML = isFavorite
        ? restaurant.name + ' is favorite'
        : restaurant.name + ' is not a favorite';
       favorite.append(favoriteIcon);
       favorite.classList.add('fav_button');
    favorite.onclick = event => handleFavoriteClick(restaurant.id, !isFavorite);
      favorite.onclick = function() {
        // const isFavorite = !restaurant.is_favorite;
        // DBHelper.updateFavoriteStatus(restaurant.id, isFavorite);
        restaurant.is_favorite = !restaurant.is_favorite
        changeFavElement(favoriteIcon, restaurant.is_favorite)
    };
    changeFavElement(favoriteIcon, restaurant.is_favorite);

    favoriteContainer.append(favorite);
  article.append(favoriteContainer);

  const picture = document.createElement('picture');

    const imgUrl = DBHelper.imageUrlForRestaurant(restaurant, 'thumbnail');
    const imgParts = imgUrl.split('.');
    const imgUrlx2 = imgParts[0] + '-600_2x.' + imgParts[1];

    const image = document.createElement('img');
    image.className = 'restaurant-img';
    const imgUrlx1 = imgParts[0] + '-300_1x.' + imgParts[1];
    image.src = imgUrlx1;
    image.alt = restaurant.name + ' promo';
    picture.append(image);

  article.append(picture);

  const infoContainer = document.createElement('div');
  infoContainer.className = 'article-info';

  const copy = document.createElement('div');
  copy.className = 'restaurant-copy';

    const name = document.createElement('h3');
    name.innerHTML = restaurant.name;
    copy.append(name);

    const neighborhood = document.createElement('p');
    neighborhood.innerHTML = restaurant.neighborhood;
    copy.append(neighborhood);

    const address = document.createElement('p');
    address.innerHTML = restaurant.address;
    copy.append(address);

  infoContainer.append(copy);

  const more = document.createElement('button');
  more.className = 'view-details';
  // add aria-label to view-details button for screen readers
  more.setAttribute('aria-label', 'view details for ' + restaurant.name);
  more.innerHTML = 'View Details';
  more.onclick = function() {
    const link = DBHelper.urlForRestaurant(restaurant);
    window.location = link
  }
  infoContainer.append(more);

  article.append(infoContainer);

  return article
}

changeFavElement = (el, fav) => {
  if (!fav) {
    el.classList.remove('favorite_yes');
    el.classList.add('favorite_no');
    el.setAttribute('aria-label', 'removed as favorite');
  } else {
      console.log('toggle yes update');
      el.classList.remove('favorite_no');
      el.classList.add('favorite_yes');
      el.setAttribute('aria-label', 'marked as favorite');
  }

}

const handleFavoriteClick = (id, newState) => {
  const favorite = document.getElementById('favorite-icon-' + id);
  const restaurant = self
    .restaurants
    .filter(r => r.id === id)[0];
  if (!restaurant)
    return;
  restaurant['is_favorite'] = newState;
  favorite.onclick = event => handleFavoriteClick(restaurant.id, !restaurant['is_favorite']);
  DBHelper.handleFavoriteClick(id, newState);
}


/**
 * Add markers for current restaurants to the map.
 */
addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.newMap);
    marker.on("click", onClick);
    function onClick() {
      window.location.href = marker.options.url;
    }
  });
}
