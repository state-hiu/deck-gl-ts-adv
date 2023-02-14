import React, { useRef, useEffect, useState, useCallback  } from 'react';
//import { HexagonLayer } from '@deck.gl/aggregation-layers/typed';
import {H3HexagonLayer} from '@deck.gl/geo-layers/typed';
import {GeoJsonLayer} from '@deck.gl/layers/typed';
import { MapboxOverlay, MapboxOverlayProps } from '@deck.gl/mapbox/typed';
//import { Box } from 'grommet';
import Map, {
  ScaleControl,
  FullscreenControl,
  NavigationControl,
  AttributionControl,
  useControl,
  MapRef,
} from 'react-map-gl';
import mapboxgl from "mapbox-gl"; // This is a dependency of react-map-gl even if you didn't explicitly install it
import 'mapbox-gl/dist/mapbox-gl.css';
import {MaskExtension} from '@deck.gl/extensions/typed';
import { NeighborhoodMenu } from "./NeighborhoodMenu";
import * as turf from "@turf/turf";
import { DataBar } from "./DataBar";


// add to apply the following fix so that the basemap works in production: https://github.com/visgl/react-map-gl/issues/1266
// npm install worker-loader
// eslint-disable-next-line import/no-webpack-loader-syntax
//mapboxgl.workerClass = require("worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker").default;

// Set your mapbox access token here
const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoiaGl1IiwiYSI6InJWNGZJSzgifQ.xK1ndT3W8XL9lwVZrT6jvQ';

function getDataAsync() {
  return fetch('boston_crimes_h3.json'
  ,{
    headers : { 
      'Content-Type': 'application/json',
      'Accept': 'application/json'
     }
  }
  )
  .then((response) => response.json())
  .then((responseJson) => {
    return responseJson;
  })
  .catch((error) => {
    console.error(error);
  });
}

//https://deck.gl/docs/api-reference/mapbox/mapbox-overlay
function DeckGLOverlay(props: MapboxOverlayProps & {
  interleaved?: boolean;
}) {
  const overlay = useControl<MapboxOverlay>(() => new MapboxOverlay(props));
  overlay.setProps(props);
  return null;
}

interface dataProps {
  newData?: any[];
}

export default function App() {

  // console.log('print bostonShotsFired')
  // console.log(bostonShotsFired)

  //const mapRef = React.useRef();
  const mapRef = useRef<MapRef>(null);

  //https://deck.gl/docs/developer-guide/interactivity
  const [viewState, setViewState] = useState({
    longitude: -71.039,
    latitude: 42.352,
    zoom: 9,
    maxZoom: 15,
    pitch: 30,
    bearing: 0
  });

  const [layers, setLayers] = React.useState<any[]>([]);

  const [neighborhoods, setNeighborhoods] = useState<Array<any>>([])
  const [neighborhood, setNeighborhood] = useState('')
  const [filteredNeighborhood, setfilteredNeighborhood] = useState<Array<any>>([])

  useEffect(() => {
    fetch('Boston_Neighborhoods.geojson')
    .then(response => response.json())
    //.then(json => console.log(json.features))
    .then(json => setNeighborhoods(json.features))
  },[])

  const neighborhoodNames = neighborhoods.map(neighborhood => {
    return neighborhood.properties.Name
  })

  //console.log(neighborhoodNames)

  const addSelectedNeighborhood = (neighborhood:string) => {
    setNeighborhood(neighborhood)

    const filteredNeighborhood = neighborhoods.filter(singleNeighborhood => {
      //console.log(singleNeighborhood.properties.Name)
      //console.log(singleNeighborhood.geometry.coordinates[0][0])
      //return singleNeighborhood
      // console.log('compare')
      // console.log(singleNeighborhood.properties.Name)
      // console.log(neighborhood)
      if (singleNeighborhood.properties.Name == neighborhood) {
        //console.log(neighborhood.geometry.coordinates)
        //console.log(singleNeighborhood.geometry.coordinates[0][0])
        return singleNeighborhood
      }
    })

    setfilteredNeighborhood(filteredNeighborhood)
    //note there is a useEffect that calls createLayers whenever filteredNeighborhood changes

    const centroid = turf.centroid(filteredNeighborhood[0].geometry);
    // console.log('print turf centroid')
    // console.log(centroid)
    // console.log(centroid.geometry.coordinates)

    const newLon = centroid.geometry.coordinates[0]
    const newlat = centroid.geometry.coordinates[1]

    mapRef.current?.flyTo({
      center: [newLon, newlat],
      zoom: 11,
      duration: 2000
    })

  }

  useEffect(() => createLayers({}), [filteredNeighborhood]);
  
  useEffect(() => {
    //console.log('calling render function');
    setLayers([]);
    createLayers({});
  }, []);

  function createLayers({newData}:dataProps) {

    // console.log('function createLayers')

    // console.log('print filteredNeighborhood3')
    // console.log(filteredNeighborhood)

    let data: any;
    if (newData !== undefined) {
      data = newData
    } else {
      data = getDataAsync()
    }

    let filteredLayer: any;
    if (filteredNeighborhood.length > 0) {
      console.log('filteredNeighborhood exists')
      filteredLayer = new GeoJsonLayer({
        id: 'geofence',
        data: filteredNeighborhood,
        operation: 'mask'
      })
    }

    const myLayer = new H3HexagonLayer({
      id: 'h3-hexagon-layer',
      data: data,
      pickable: true,
      wireframe: false,
      filled: true,
      extruded: true,
      elevationScale: 20,
      getHexagon: d => d.hex,
      getFillColor: d => [255, (1 - d.value / 500) * 255, 0],
      getElevation: d => d.value,
      // only render points that are inside the geofence
      extensions: [new MaskExtension()],
      maskId: 'geofence'
    });

    // console.log('print filteredNeighborhood')
    // console.log(filteredNeighborhood)
    // console.log(filteredNeighborhood.length)

    if (filteredNeighborhood.length > 0) {
      console.log('set layers')
      setLayers([myLayer,filteredLayer]);
    } else {
      setLayers([myLayer]);
    }
    
  }

  const filterData = () => {
    // console.log('filtering data')
    // const data = getDataAsync()
    // console.log(data)
    // const newData = [{value: 67, hex: '892a30646dbffff'},
    // {value: 19, hex: '892a3064803ffff'},
    // {value: 150, hex: '892a306481bffff'},
    // {value: 55, hex: '892a306483bffff'},
    // {value: 364, hex: '892a3064867ffff'},
    // {value: 1309, hex: '892a3066b73ffff'},
    // {value: 1417, hex: '892a30663b3ffff'},
    // {value: 184, hex: '892a3064807ffff'}]
    // createLayers({newData})
    setfilteredNeighborhood([])
    createLayers({})
    mapRef.current?.flyTo({
      center: [-71.061, 42.33],
      zoom: 10,
      duration: 2000
    })
  } 


  return (
    <>

    

    <div style={{height: '100vh'}}>
      <Map 
        attributionControl={false}
        ref={mapRef}
        initialViewState={viewState}
        mapStyle="mapbox://styles/mapbox/light-v10"
        mapboxAccessToken={MAPBOX_ACCESS_TOKEN}
      >
        <DeckGLOverlay layers={layers} getTooltip={({object}) => object && `${object.hex} value: ${object.value}`}/>
        <NavigationControl position="top-right" />
        <FullscreenControl position="top-right" />
        <AttributionControl position="bottom-right" />
        <ScaleControl position="bottom-right" />
      </Map>
    </div>
    <NeighborhoodMenu
      onClickFunction={filterData}
      neighborhoodNames={neighborhoodNames} 
      addSelectedNeighborhood={addSelectedNeighborhood} 
    />
    <DataBar
      filteredNeighborhood={filteredNeighborhood}
    />
    </>

   );
};