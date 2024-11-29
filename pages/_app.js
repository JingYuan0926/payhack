import { NextUIProvider } from '@nextui-org/react'
import '../styles/globals.css'

function MyApp({ Component, pageProps }) {
  return (
    <NextUIProvider>
      <main className="font-['ThaleahFat']">
        <Component {...pageProps} />
      </main>
    </NextUIProvider>
  )
}

export default MyApp 