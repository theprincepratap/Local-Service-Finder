// Calculate distance between two coordinates using Haversine formula
// Returns distance in kilometers
exports.calculateDistance = (coords1, coords2) => {
  const toRad = (value) => (value * Math.PI) / 180;

  const lat1 = coords1[1];
  const lon1 = coords1[0];
  const lat2 = coords2[1];
  const lon2 = coords2[0];

  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance; // in kilometers
};

// Sort workers by distance
exports.sortByDistance = (workers, userLocation) => {
  return workers
    .map((worker) => {
      const distance = this.calculateDistance(
        userLocation,
        worker.location.coordinates
      );
      return {
        ...worker.toObject(),
        distance: Math.round(distance * 100) / 100 // Round to 2 decimal places
      };
    })
    .sort((a, b) => a.distance - b.distance);
};

// Sort workers by rating
exports.sortByRating = (workers) => {
  return workers.sort((a, b) => b.rating - a.rating);
};

// Sort workers by price
exports.sortByPrice = (workers, order = 'asc') => {
  if (order === 'asc') {
    return workers.sort((a, b) => a.pricePerHour - b.pricePerHour);
  }
  return workers.sort((a, b) => b.pricePerHour - a.pricePerHour);
};

// Multi-criteria sorting with weights
exports.smartSort = (workers, userLocation, weights = {}) => {
  const { distance = 0.4, rating = 0.4, price = 0.2 } = weights;

  return workers
    .map((worker) => {
      const dist = this.calculateDistance(
        userLocation,
        worker.location.coordinates
      );
      
      // Normalize values (0-1 scale)
      const normalizedDistance = Math.min(dist / 50, 1); // 50km max
      const normalizedRating = worker.rating / 5;
      const normalizedPrice = Math.min(worker.pricePerHour / 1000, 1); // 1000 max

      // Calculate score (lower is better for distance and price)
      const score =
        distance * (1 - normalizedDistance) +
        rating * normalizedRating +
        price * (1 - normalizedPrice);

      return {
        ...worker.toObject(),
        distance: Math.round(dist * 100) / 100,
        score: Math.round(score * 100) / 100
      };
    })
    .sort((a, b) => b.score - a.score);
};
