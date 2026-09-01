import ClientNav from '../components/ClientNav'
import { H1, P } from '../components/ui'

export default function About() {
  return (
    <div className="min-h-screen">
      <ClientNav />
      <div className="p-6 flex flex-col gap-3 max-w-xl">
        <H1>About Purdue MarketPlace</H1>
        <P>
          A peer-to-peer marketplace for Boilermaker and Ivy Tech students to hire and be hired for services — nails,
          tutoring, rides, DJing, pet sitting, and more. Every account is gated by a school email, every provider is
          reviewed by a human before going live, and a three-strike policy on both sides keeps it worth trusting.
        </P>
      </div>
    </div>
  )
}
