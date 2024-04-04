'use client'
import React, { useEffect, useState } from 'react'
import { Map, View } from 'ol'
import { fromLonLat } from 'ol/proj'
import { Tile as TileLayer } from 'ol/layer'
import { OSM } from 'ol/source'
import { Vector as VectorLayer } from 'ol/layer'
import  VectorSource  from 'ol/source/Vector'
import { Draw, Modify, Snap } from 'ol/interaction'
import { Point, LineString, Polygon, Geometry } from 'ol/geom'
import { Feature } from 'ol'
import { getLength, getArea } from 'ol/sphere'

const MapComp: React.FC = () => {
  const [pinpoint, setPinpoint] = useState<[number, number]>([0, 0])
  const [drawingMode, setDrawingMode] = useState<string>('')
  const [measurement, setMeasurement] = useState<string | null>(null)

  useEffect(() => {
    // Initialize OpenLayers map
      const map = new Map({
        target: 'map',
        layers: [
          new TileLayer({
            source: new OSM()
          }),
          new VectorLayer({
            source: new VectorSource({
              features: [
                new Feature({
                  geometry: new Point(fromLonLat(pinpoint)),
                }),
              ],
            }),
          }),
        ],
        view: new View({
          center: fromLonLat([-100, 40]),
          zoom: 4,
        }),
      })

      // Add pinpoint functionality
      map.on('click', (event) => {
        setPinpoint(prevState => [fromLonLat(event.coordinate)[0], fromLonLat(event.coordinate)[1]]);
      })
   
      // Add drawing interactions
      const drawInteraction = new Draw({
        source: (map.getLayers().item(1) as VectorLayer<VectorSource>).getSource() as VectorSource,
        type: drawingMode || 'Point',
      })

      // Add modify interaction
      const modifyInteraction = new Modify({
        source: (map.getLayers().item(1) as VectorLayer<VectorSource>).getSource() as VectorSource,
      })

      // Add snap interaction
      const snapInteraction = new Snap({
        source: (map.getLayers().item(1) as VectorLayer<VectorSource>).getSource() as VectorSource,
      })

      // Add interactions to the map
      map.addInteraction(drawInteraction)
      map.addInteraction(modifyInteraction)
      map.addInteraction(snapInteraction)

      // Calculate Area/Length of Line, and Polygon
      const calculateMeasurement = (feature: Feature<Geometry>) => {
        if (feature.getGeometry() instanceof Point) {
          setMeasurement(`${getLength(feature.getGeometry() as Point).toFixed(
            2
          )} meters`)
        } else if (feature.getGeometry() instanceof LineString) {
          setMeasurement(
            `${getLength(feature.getGeometry() as LineString).toFixed(
              2
            )} meters`
          )
        } else if (feature.getGeometry() instanceof Polygon) {
          setMeasurement(
            `${getArea(
              feature.getGeometry() as Polygon
            ).toFixed(2)} square meters`
          )
        }
      }

      // Add event listeners for drawing interactions
      drawInteraction.on('drawend', (event) => {
        calculateMeasurement(event.feature)
      })

      modifyInteraction.on('modifyend', (event) => {
        calculateMeasurement(event.features.getArray()[0])
      })

      return () => {
        map.removeInteraction(drawInteraction)
        map.removeInteraction(modifyInteraction)
        map.removeInteraction(snapInteraction)
      }
    // }
  }, [drawingMode])

  return (
    <section>
      <div id='map' style={{  height: '800px', width: '100%'}} className='text-xl font-bold font-serif text-gray-400 z-30 mt-28 bg-black'>{drawingMode === 'LineString' && 'Line' || drawingMode }</div>
      <div className='fixed top-0 z-10 w-full'>
      <div className='p-3 flex items-center justify-center bg-gray-800'>
      <button onClick={() => setDrawingMode('Point')} className='bg-black mx-auto shadow-md hover:shadow-slate-300 hover:bg-gray-700 text-gray-400 rounded-md h-12 px-3 py-2 font-bold text-sm active:scale-95 active:shadow-none'>Draw Point</button>
      <button onClick={() => setDrawingMode('LineString')}className='bg-black mx-auto shadow-md hover:shadow-slate-300 hover:bg-gray-700 text-gray-400 rounded-md h-12 px-3 py-2 font-bold text-sm active:scale-95 active:shadow-none'>Draw Line</button>
      <button onClick={() => setDrawingMode('Polygon')} className='bg-black mx-auto shadow-md hover:shadow-slate-300 hover:bg-gray-700 text-gray-400 rounded-md h-12 px-3 py-2 font-bold text-sm active:scale-95 active:shadow-none'>Draw Polygon</button>
      <button onClick={() => setDrawingMode('')} className='bg-black mx-auto shadow-md hover:shadow-slate-300 hover:bg-gray-700 text-gray-400 rounded-md h-12 px-3 py-2 font-bold text-sm active:scale-95 active:shadow-none'>Stop Drawing</button>
      </div>
      <p className='font-semibold text-xl text-red-500 bg-slate-900 font-serif p-2 text-center'>{measurement || 'Area/Length'}</p>
      </div>
    </section>
  )
}

export default MapComp