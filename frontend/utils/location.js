export const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

export const calculateShopsDeliveryMetrics = (shops, userCoordinates) => {
    if (!shops || !Array.isArray(shops)) return [];
    const userLng = userCoordinates?.[0];
    const userLat = userCoordinates?.[1];

    return shops.map((shop) => {
        const shopLat = shop?.location?.latitude;
        const shopLng = shop?.location?.longitude;
        const prepTime = shop.preparationTime || 15;
        const bufferTime = 5;
        const minsPerKm = 3;
        let dynamicTime = shop.deliveryTime || 30;
        let displayDistance = null;

        if (userLat && userLng && shopLat && shopLng) {
            const distanceKm = calculateDistance(userLat, userLng, shopLat, shopLng);

            if (distanceKm !== null) {
                const distanceMeters = Math.round(distanceKm * 1000);
                if (distanceMeters === 0) {
                    displayDistance = "0 m";
                } else if (distanceKm < 1) {
                    displayDistance = `${distanceMeters} m`;
                } else {
                    displayDistance = `${distanceKm.toFixed(1)} km`;
                }
                const travelTime = distanceKm * minsPerKm;
                const estimatedTime = Math.ceil(prepTime + travelTime + bufferTime);

                dynamicTime = Math.min(Math.max(estimatedTime, prepTime), 120);
            }
        }

        return {
            ...shop,
            deliveryTime: dynamicTime,
            distance: displayDistance,
        };
    });
};