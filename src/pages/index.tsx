import Head from 'next/head'
import { useState } from 'react'

import styles from './Home.module.scss'
import Sidebar from '@/components/sidebar'
import Logo from '@/components/logo'
import Map from '@/components/map'

import { MapModel } from '@/model/map'
import { usePersistentState } from '@/model/state'
import { MapContext, defaultMap } from '@/model/context'

export default function Home() {
  const [map, setMap] = useState(defaultMap)
  const [visibleLayers, setVisibleLayers] = useState([0])
  const [activeLayer, setActiveLayer] = useState(0)

  return (
    <>
      <Head>
        <title>World Canvas</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/ico.ico" />
      </Head>

      <main className={styles.main}>
        <MapContext.Provider value={{map, setMap}}>
          <Sidebar activeLayer={activeLayer} setActiveLayer={(id) => setActiveLayer(id)} />
          <Map visibleLayers={visibleLayers} activeLayer={activeLayer}/>
        </MapContext.Provider>
        <Logo />
      </main>
    </>
  )
}
