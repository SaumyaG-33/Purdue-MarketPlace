import { Link, useNavigate, useParams } from 'react-router-dom'
import ClientNav from '../../components/ClientNav'
import { Card, Chip, H2, H3, Mono, P } from '../../components/ui'
import { CATEGORY_MAP } from '../../lib/data'

export default function CategoryBrowse() {
  const { categoryId } = useParams()
  const navigate = useNavigate()
  const category = CATEGORY_MAP[categoryId]

  if (!category) {
    return (
      <div className="min-h-screen">
        <ClientNav />
        <div className="p-6">
          <P>Unknown category.</P>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <ClientNav
        search={
          <input
            placeholder={`Search ${category.name.toLowerCase()} services…`}
            className="flex-1 border border-border-field bg-white rounded-md px-3 py-1.5 text-[12px] focus:outline-none focus:ring-2 focus:ring-gold"
          />
        }
      />
      <div className="px-5 py-5 flex flex-col gap-2.5">
        <Mono>
          <Link to="/" className="hover:text-ink">
            Home
          </Link>{' '}
          / {category.name}
        </Mono>
        <H2>What are you booking?</H2>
        <P>Pick a service and we'll show you every student who does it, and when they're free.</P>
        <div className="flex flex-wrap gap-2">
          <Chip>Price: any ▾</Chip>
          <Chip>Available: this week ▾</Chip>
          <Chip>Rating 4.5+ ▾</Chip>
          <Chip>Comes to you</Chip>
          <Chip className="border-dashed">Clear all</Chip>
        </div>
      </div>

      <div className="px-5 pb-8">
        <div className="grid grid-cols-3 gap-4">
          {category.services.map((svc) => (
            <Card key={svc.id} onClick={() => navigate(`/browse/${categoryId}/${svc.id}`)} className="cursor-pointer hover:border-gold-border">
              <div className="h-16 bg-box border border-border-soft rounded-md" />
              <H3>{svc.name}</H3>
              <Mono>{svc.desc}</Mono>
              <Mono>
                {svc.providers} providers · from ${svc.from}
              </Mono>
            </Card>
          ))}
          <Card className="border-dashed items-center justify-center text-center cursor-pointer">
            <H3 className="text-text-faint">Something else</H3>
            <Mono>Tell us what you're looking for</Mono>
          </Card>
        </div>
      </div>
    </div>
  )
}
