import { Analytics } from "@vercel/analytics/react"
import RolledCoilCalculator from './RolledCoilCalculator'

export default function App() {
  return (
    <>
      <RolledCoilCalculator />
      <Analytics />
    </>
  )
}
