# Add a UI element that displays information about a specific place to a web page or mobile app

> **EEA COMPLIANCE REQUIREMENT:** For showing place data on a map in the
> European Economic Area (EEA), do not call Places API web services from a
> backend server. To ensure compliance, use client-side rendering exclusively
> via Places UI Kit components directly within the Maps JavaScript API. Full
> requirements & FAQ:
> [https://developers.google.com/maps/comms/eea/faq](https://developers.google.com/maps/comms/eea/faq)

## Overview

The Places UI Kit provides customizable HTML web components that render
visualizable place details directly in your web application:

-   **Place Details Element (`<gmp-place-details>`)**: Renders comprehensive
    details for a selected place, including full opening hours, website, phone
    number, AI-powered summaries (with fallback to editorial summary),
    type-specific highlights, reviews, AI-powered review summaries, plus codes,
    feature lists, and multiple photos. It is billed in the
    [Essentials tier](https://developers.google.com/maps/documentation/javascript/usage-and-billing#places-ui-kit-essentials).
-   **Place Details Compact Element (`<gmp-place-details-compact>`)**: Designed
    to consume minimal space (such as inside an `InfoWindow`, chat location
    share, or media article). Displays a concise set of information (name,
    address, rating, type, price, accessibility icon, open status, and a single
    photo) in either `horizontal` or `vertical` orientation.
-   **Advanced Place Details Element (`<gmp-advanced-place-details>`,
    preview)**: Extends the Place Details Element by letting you configure
    action buttons and apply search and filtering options to reviews and media.
    It is billed in the
    [Pro tier](https://developers.google.com/maps/documentation/javascript/usage-and-billing#places-ui-kit-pro).

--------------------------------------------------------------------------------

## 1. Place Details Element (`<gmp-place-details>`)

To display full place details, add a `<gmp-place-details>` element to your HTML
page (either inside a `<gmp-map>` control slot or in an external UI panel).
Include a child `<gmp-place-details-place-request>` element to specify the place
via a Place ID, a Place's resource name, or a `Place` object.

### Basic Usage (All Content)

You can use `<gmp-place-all-content>` to show all available details or
`<gmp-place-standard-content>` for a standard preset configuration:

```html
<gmp-map center="47.759737, -122.250632" zoom="16" map-id="DEMO_MAP_ID" internal-usage-attribution-ids="gmp_git_agentskills_v1">
  <div class="widget-container" slot="control-inline-start-block-start">
    <gmp-place-details internal-usage-attribution-ids="gmp_git_agentskills_v1">
      <gmp-place-details-place-request place="ChIJC8HakaIRkFQRiOgkgdHmqkk"></gmp-place-details-place-request>
      <gmp-place-all-content></gmp-place-all-content>
    </gmp-place-details>
  </div>
  <gmp-advanced-marker></gmp-advanced-marker>
</gmp-map>
```

### Customizing Content (`<gmp-place-content-config>`)

To control the exact fields displayed, replace `<gmp-place-all-content>` with
`<gmp-place-content-config>` and nest the desired child elements. Note that the
order of child elements in your HTML does not change the visual layout, as
selected details are always rendered in a fixed, predefined order.

Child Element                          | Description & Attributes
:------------------------------------- | :-----------------------
`<gmp-place-address>`                  | Displays the place's formatted address.
`<gmp-place-rating>`                   | Displays the user rating score and count.
`<gmp-place-type>`                     | Displays the primary place type.
`<gmp-place-price>`                    | Displays the price level.
`<gmp-place-accessible-entrance-icon>` | Displays the wheelchair-accessible entrance icon.
`<gmp-place-opening-hours>`            | Displays the full opening hours schedule (`<gmp-place-details>` only).
`<gmp-place-open-now-status>`          | Displays current open/closed status (commonly used in `<gmp-place-details-compact>`).
`<gmp-place-website>`                  | Displays the place's website link.
`<gmp-place-phone-number>`             | Displays the place's phone number.
`<gmp-place-summary>`                  | Displays an AI-powered summary of the place with fallback to editorial summary.
`<gmp-place-type-specific-highlights>` | Displays type-specific highlights.
`<gmp-place-review-summary>`           | Displays an AI-powered summary of user reviews.
`<gmp-place-reviews>`                  | Displays individual user reviews.
`<gmp-place-feature-list>`             | Displays place amenities and features.
`<gmp-place-media>`                    | Displays a single photo. Supports the `lightbox-preferred` attribute to open the photo in a lightbox when clicked (disabled by default).
`<gmp-place-attribution>`              | Displays the source attribution of the photo. Supports `light-scheme-color` and `dark-scheme-color` attributes (e.g., `light-scheme-color="gray" dark-scheme-color="white"`).

### Appearance & Sizing Guidelines (`<gmp-place-details>`)

-   **Recommended Width**: `250px` to `400px`. Widths less than `250px` may not
    display correctly.
-   **Height**: Set the height to suit your application; the component scrolls
    internally within its allotted space.
-   **Attribution Policy**: When applying custom CSS properties for colors and
    fonts, you must adhere to Google Maps Platform
    [Attribution requirements](https://developers.google.com/maps/documentation/javascript/policies).

### Complete Example: Place Details Side Panel with POI Click Handling

#### HTML (`index.html`)

```html
<!doctype html>
<html>
  <head>
    <title>Place Details with Google Maps</title>
    <meta charset="utf-8" />
    <link rel="stylesheet" type="text/css" href="style.css" />
    <script type="module" src="./index.js"></script>
    <script>
      (g=>{var h,a,k,p="The Google Maps JavaScript API",c="google",l="importLibrary",q="__ib__",m=document,b=window;b=b[c]||(b[c]={});var d=b.maps||(b.maps={}),r=new Set,e=new URLSearchParams,u=()=>h||(h=new Promise(async(f,n)=>{await (a=m.createElement("script"));e.set("libraries",[...r]+"");for(k in g)e.set(k.replace(/[A-Z]/g,t=>"_"+t[0].toLowerCase()),g[k]);e.set("callback",c+".maps."+q);a.src=`https://maps.${c}apis.com/maps/api/js?`+e;d[q]=f;a.onerror=()=>h=n(Error(p+" could not load."));a.nonce=m.querySelector("script[nonce]")?.nonce||"";m.head.append(a)}));d[l]?console.warn(p+" only loads once. Ignoring:",g):d[l]=(f,...n)=>r.add(f)&&u().then(()=>d[l](f,...n))})({
        key: "GOOGLE_MAPS_API_KEY"
      });
    </script>
  </head>
  <body>
    <div class="container">
      <!-- map-id is required to use advanced markers. -->
      <gmp-map zoom="17" map-id="DEMO_MAP_ID" internal-usage-attribution-ids="gmp_git_agentskills_v1">
        <gmp-advanced-marker></gmp-advanced-marker>
      </gmp-map>
      <div class="ui-panel">
        <gmp-place-details internal-usage-attribution-ids="gmp_git_agentskills_v1">
          <gmp-place-details-place-request
            place="ChIJC8HakaIRkFQRiOgkgdHmqkk"></gmp-place-details-place-request>
          <gmp-place-content-config>
            <gmp-place-address></gmp-place-address>
            <gmp-place-rating></gmp-place-rating>
            <gmp-place-type></gmp-place-type>
            <gmp-place-price></gmp-place-price>
            <gmp-place-accessible-entrance-icon></gmp-place-accessible-entrance-icon>
            <gmp-place-opening-hours></gmp-place-opening-hours>
            <gmp-place-website></gmp-place-website>
            <gmp-place-phone-number></gmp-place-phone-number>
            <gmp-place-summary></gmp-place-summary>
            <gmp-place-type-specific-highlights></gmp-place-type-specific-highlights>
            <gmp-place-review-summary></gmp-place-review-summary>
            <gmp-place-reviews></gmp-place-reviews>
            <gmp-place-feature-list></gmp-place-feature-list>
          </gmp-place-content-config>
        </gmp-place-details>
      </div>
    </div>
  </body>
</html>
```

#### CSS (`style.css`)

```css
html,
body {
  height: 100%;
  margin: 0;
  padding: 0;
}

.container {
  display: flex;
  height: 100vh;
  width: 100%;
}

gmp-map {
  flex-grow: 1;
}

.ui-panel {
  width: 400px;
  margin-left: 20px;
  margin-top: 10px;
}

gmp-place-details {
  width: 100%;
  margin: 0;
  border: none;
}
```

#### JavaScript (`index.js`)

```javascript
const map = document.querySelector('gmp-map');
const placeDetails = document.querySelector('gmp-place-details');
const placeDetailsRequest = document.querySelector(
  'gmp-place-details-place-request'
);
const marker = document.querySelector('gmp-advanced-marker');

async function init() {
  // Request needed libraries.
  await Promise.all([
    google.maps.importLibrary('maps'),
    google.maps.importLibrary('marker'),
    google.maps.importLibrary('places'),
  ]);

  // Hide the map type control.
  map.innerMap.setOptions({ mapTypeControl: false });

  // Function to update map and marker based on place details
  const updateMapAndMarker = () => {
    if (placeDetails.place?.location) {
      map.innerMap.panTo(placeDetails.place.location);
      map.innerMap.setZoom(16);
      marker.position = placeDetails.place.location;
      marker.collisionBehavior = 'REQUIRED_AND_HIDES_OPTIONAL';
      marker.style.display = 'block';
    }
  };

  // Set up map once widget is loaded.
  placeDetails.addEventListener('gmp-load', () => {
    updateMapAndMarker();
  });

  // Add an event listener to handle clicks on map POIs.
  map.innerMap.addListener('click', (event) => {
    marker.position = null;
    event.stop();
    if ('placeId' in event && event.placeId) {
      // Fire when the user clicks a POI.
      placeDetailsRequest.place = event.placeId;
      updateMapAndMarker();
    } else {
      // Fire when the user clicks the map (not on a POI).
      console.log('No place was selected.');
      marker.style.display = 'none';
    }
  });
}

void init();
```

--------------------------------------------------------------------------------

## 2. Place Details Compact Element (`<gmp-place-details-compact>`)

The `<gmp-place-details-compact>` element renders a concise summary of a place
and supports two layout attributes:

-   `orientation`: Set to `"horizontal"` or `"vertical"`.
-   `truncation-preferred`: Truncates certain content to fit on a single line
    instead of wrapping.

### Appearance, Sizing, & Shadow DOM Guidelines

-   **Vertical Orientation Width**: Recommended `180px` to `300px` (widths under
    `160px` may not display correctly). **Do not set a fixed height.**
-   **Horizontal Orientation Width**: Recommended `180px` to `500px` (widths
    under `160px` may not display correctly; at widths under `350px`, the
    thumbnail image is hidden). **Do not set a fixed height.**
-   **InfoWindow Shadow DOM Styling**: If you place
    `<gmp-place-details-compact>` inside an `InfoWindow`, external CSS
    stylesheet rules will not apply because the `InfoWindow` renders inside the
    map's Shadow DOM. Apply custom styles inline directly on the
    `<gmp-place-details-compact>` element.

### Complete Example: Place Details Compact Inside an InfoWindow

#### HTML (`index.html`)

```html
<!doctype html>
<html>
  <head>
    <title>Place Details Compact with Google Maps</title>
    <meta charset="utf-8" />
    <link rel="stylesheet" type="text/css" href="style.css" />
    <script type="module" src="./index.js"></script>
    <script>
      (g=>{var h,a,k,p="The Google Maps JavaScript API",c="google",l="importLibrary",q="__ib__",m=document,b=window;b=b[c]||(b[c]={});var d=b.maps||(b.maps={}),r=new Set,e=new URLSearchParams,u=()=>h||(h=new Promise(async(f,n)=>{await (a=m.createElement("script"));e.set("libraries",[...r]+"");for(k in g)e.set(k.replace(/[A-Z]/g,t=>"_"+t[0].toLowerCase()),g[k]);e.set("callback",c+".maps."+q);a.src=`https://maps.${c}apis.com/maps/api/js?`+e;d[q]=f;a.onerror=()=>h=n(Error(p+" could not load."));a.nonce=m.querySelector("script[nonce]")?.nonce||"";m.head.append(a)}));d[l]?console.warn(p+" only loads once. Ignoring:",g):d[l]=(f,...n)=>r.add(f)&&u().then(()=>d[l](f,...n))})({
        key: "GOOGLE_MAPS_API_KEY"
      });
    </script>
  </head>
  <body>
    <div class="container">
      <!-- map-id is required to use Advanced Markers. -->
      <gmp-map zoom="17" map-id="DEMO_MAP_ID" internal-usage-attribution-ids="gmp_git_agentskills_v1">
        <gmp-advanced-marker></gmp-advanced-marker>
      </gmp-map>
    </div>
    <!--
      The gmp-place-details-compact element is styled inline because it is
      conditionally rendered and moved into the info window, which is
      part of the map's shadow DOM.
    -->
    <gmp-place-details-compact
      orientation="horizontal"
      truncation-preferred
      internal-usage-attribution-ids="gmp_git_agentskills_v1"
      style="
        width: 400px;
        padding: 0;
        margin: 0;
        border: none;
        background-color: transparent;
        color-scheme: light;
      ">
      <gmp-place-details-place-request
        place="ChIJC8HakaIRkFQRiOgkgdHmqkk"></gmp-place-details-place-request>
      <gmp-place-content-config>
        <gmp-place-media lightbox-preferred></gmp-place-media>
        <gmp-place-rating></gmp-place-rating>
        <gmp-place-type></gmp-place-type>
        <gmp-place-price></gmp-place-price>
        <gmp-place-accessible-entrance-icon></gmp-place-accessible-entrance-icon>
        <gmp-place-open-now-status></gmp-place-open-now-status>
        <gmp-place-attribution
          light-scheme-color="gray"
          dark-scheme-color="white"></gmp-place-attribution>
      </gmp-place-content-config>
    </gmp-place-details-compact>
  </body>
</html>
```

#### CSS (`style.css`)

```css
html,
body {
  height: 100%;
  margin: 0;
  padding: 0;
}

.container {
  display: flex;
  height: 100vh;
  width: 100%;
}

gmp-map {
  flex-grow: 1;
}
```

#### JavaScript (`index.js`)

```javascript
const map = document.querySelector('gmp-map');
const placeDetails = document.querySelector('gmp-place-details-compact');
const placeDetailsRequest = document.querySelector(
  'gmp-place-details-place-request'
);
const marker = document.querySelector('gmp-advanced-marker');

async function init() {
  // Request needed libraries.
  void Promise.all([
    google.maps.importLibrary('marker'),
    google.maps.importLibrary('places'),
  ]);
  const { InfoWindow } = await google.maps.importLibrary('maps');

  await window.customElements.whenDefined('gmp-map');
  // Set the inner map options.
  map.innerMap.setOptions({
    mapTypeControl: false,
    streetViewControl: false,
  });

  await window.customElements.whenDefined('gmp-advanced-marker');
  marker.collisionBehavior = 'REQUIRED_AND_HIDES_OPTIONAL';

  const infoWindow = new InfoWindow();
  infoWindow.addListener('close', () => {
    marker.position = null;
  });

  const showInfoWindow = () => {
    if (infoWindow.isOpen) return;
    infoWindow.setContent(placeDetails);
    infoWindow.open({ anchor: marker });
  };

  placeDetails.addEventListener('gmp-load', () => {
    // For the initial load case, with no user click, fall back to the place's location
    // and ensure the map has a center set and the InfoWindow is shown.
    if (!map.center && placeDetails.place?.location) {
      map.center = marker.position = placeDetails.place.location;
      showInfoWindow();
    }
  });

  // Add an event listener to handle clicks.
  map.innerMap.addListener('click', (event) => {
    event.stop();

    if ('placeId' in event) {
      // When the user clicks a POI.
      marker.position = event.latLng;
      placeDetailsRequest.place = event.placeId;
      showInfoWindow();
    } else {
      // When the user clicks the map (not on a POI).
      marker.position = null;
      placeDetailsRequest.place = null;
      console.log('No place was selected.');
    }
  });
}

void init();
```
