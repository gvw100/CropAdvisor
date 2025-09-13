import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [location, setLocation] = useState<{lat: number; lon: number} | null>(null)
  const [errMsg, setErrMsg] = useState<string | null>(null)

  useEffect(() =>{
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude })
      },
      (err) => {
        setErrMsg(err.message)
      }
    )
  })

  return (
    <>
      
    </>
  )
}

export default App
