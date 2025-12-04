export function loadGoogleMaps(
  apiKey = "AIzaSyCoQ58bNGXYgXOMKAlTjPjgrr6_4N2gyY0", 
  libraries = ["places"]
) {
  return new Promise((resolve, reject) => {
    if (window.google && window.google.maps) {
      resolve(window.google.maps);
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=${libraries.join(",")}`;
    script.async = true;
    script.defer = true;

    script.onload = () => resolve(window.google.maps);
    script.onerror = (err) => reject(err);

    document.head.appendChild(script);
  });
}
