import React, { useState, useEffect, useRef } from "react";
import SocketIOClient from "socket.io-client";
import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import dynamic from 'next/dynamic'

import OlMap from "ol/Map";
import OlView from "ol/View";
import OlFeature from "ol/Feature";
import OlLayerTile from "ol/layer/tile";
import OlLayerVector from "ol/layer/Vector";
import OlSourceXYZ from "ol/source/XYZ";
import OlSourceVector from "ol/source/Vector";
import OlGeomPoint from "ol/geom/Point";
import OlGeomLineString from "ol/geom/LineString";
import OlStyleStyle from 'ol/style/Style';
import OlStyleIcon from 'ol/style/Icon';
import { fromLonLat } from 'ol/proj';
// import olExtFeatureAnimation from 'ol-ext/featureanimation/Path';
// const olExtFeatureAnimation = dynamic(import('ol-ext/featureanimation/Path').then(mode => mode.default), { ssr: false }) 

const Home: NextPage = () => {
  useEffect((): any => {
    const mapSource = new OlSourceVector();
    const mapVector = new OlLayerVector({
        source: mapSource,
        zIndex: 99
    });

    const olmap = new OlMap({
      target: 'map',
      layers: [
        new OlLayerTile({
          source: new OlSourceXYZ({url: 'https://mt0.google.com/vt/lyrs=m&hl=en&x={x}&y={y}&z={z}&s=GaEdit'})
        }),
        mapVector
      ],
      view: new OlView({
        center: fromLonLat([121.5470022, 25.0485038]),
        zoom: 14
      })
    });

    // connect to socket server
    const socket = SocketIOClient.connect(process.env.BASE_URL, {
      path: "/api/socketio",
    });

    // log socket connection
    socket.on("connect", () => {
      console.log("SOCKET CONNECTED!", socket.id);
    });

    // update chat on new message dispatched
    socket.on("message", (message: any) => {
      message.forEach((bus: any) => {
        const coord = fromLonLat([bus.BusPosition.PositionLon, bus.BusPosition.PositionLat]);
        const busFeature = mapSource.getFeatureById(bus.PlateNumb);
        if (busFeature) {
          // busFeature.getGeometry()!.setCoordinates(coord);
          const prevCoord = busFeature.getGeometry()!.getCoordinates();
          import(`ol-ext/featureanimation/Path`).then(module => {
            const olExtFeatureAnimation = module.default;
            const anim = new olExtFeatureAnimation({
              path: new OlGeomLineString([prevCoord, coord]),
              rotate: true,
              speed: 0.3
            });
            mapVector.animateFeature(busFeature, anim);
          });
          // console.log(importOlExt());
          
        } else {
          const feature = new OlFeature({
            geometry: new OlGeomPoint(coord)
          });
          feature.setId(bus.PlateNumb);
          feature.setStyle(new OlStyleStyle({
            image: new OlStyleIcon({
              src: './images/car.png',
              scale: 0.05,
              rotateWithView: true,
              rotation: bus.Azimuth * Math.PI / 180
            })
          }));
          mapSource.addFeature(feature);
        }
      });
    });

    // socket disconnet onUnmount if exists
    if (socket) return () => socket.disconnect();
  }, []);

  
  return (
    <div id="map" style={{ width: "100%", height: "100vh" }}>
    </div>
  )
}

export default Home
