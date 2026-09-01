import { useNavigate } from 'react-router-dom'
import ClientNav from '../../components/ClientNav'
import { H2, Mono } from '../../components/ui'
import { CATEGORIES } from '../../lib/data'

export default function Categories() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen">
      <ClientNav />
      <div className="px-5 py-6 flex flex-col gap-4">
        <H2>Browse by category</H2>
        <div className="grid grid-cols-5 gap-3">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              onClick={() => navigate(`/browse/${cat.id}`)}
              className="h-24 bg-tile border border-border-soft rounded-md flex flex-col justify-end p-2.5 font-semibold text-[12px] cursor-pointer hover:border-gold-border transition-colors"
            >
              {cat.name}
              <Mono className="font-normal">{cat.services.length} services</Mono>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
