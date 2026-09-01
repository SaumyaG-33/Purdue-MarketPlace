import { createContext, useContext, useEffect, useMemo, useReducer } from 'react'
import {
  DEMO_USERS,
  PROVIDERS,
  APPLICATIONS_SEED,
  REPORTS_SEED,
  REVIEW_FLAGS_SEED,
  SUSPENSIONS_SEED,
} from './data'

const STORAGE_KEY = 'pm_state_v1'

function loadInitial() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // ignore corrupt storage
  }
  return {
    currentUserId: null,
    pendingVerifyUserId: null,
    users: DEMO_USERS,
    providers: PROVIDERS,
    bookings: [
      {
        id: 'bk-priya-1',
        clientId: 'jdoe',
        clientName: 'Priya R.',
        clientEmail: 'pr@purdue.edu',
        providerId: 'maya',
        serviceId: 'gel',
        serviceName: 'Gel manicure',
        dayOffset: 0,
        start: 16 * 60,
        duration: 75,
        price: 35,
        deposit: 10,
        depositPaid: true,
        status: 'confirmed',
        comments: 'Bringing inspo pics, chrome if you have it!',
        thread: [{ from: 'Priya', when: '2 hrs ago', text: 'Running 5 min late from class, still good?' }],
      },
      {
        id: 'bk-devon-1',
        clientId: 'jdoe',
        clientName: 'Devon M.',
        clientEmail: 'dm@purdue.edu',
        providerId: 'maya',
        serviceId: 'gel-ext',
        serviceName: 'Gel + extensions',
        dayOffset: 1,
        start: 11 * 60 + 30,
        duration: 120,
        price: 60,
        deposit: 10,
        depositPaid: false,
        status: 'requested',
        comments: '',
        thread: [],
      },
      {
        id: 'bk-jdoe-upcoming',
        clientId: 'jdoe',
        clientName: 'Jamie Doe',
        clientEmail: 'jdoe@purdue.edu',
        providerId: 'maya',
        serviceId: 'gel',
        serviceName: 'Gel manicure',
        dayOffset: 3,
        start: 16 * 60,
        duration: 75,
        price: 37,
        deposit: 10,
        depositPaid: true,
        status: 'confirmed',
        comments: '',
        thread: [],
      },
      {
        id: 'bk-jdoe-pending',
        clientId: 'jdoe',
        clientName: 'Jamie Doe',
        clientEmail: 'jdoe@purdue.edu',
        providerId: 'sam-mock',
        providerName: 'Sam K.',
        serviceId: 'airport',
        serviceName: 'Airport ride to IND',
        dayOffset: 12,
        start: 6 * 60,
        duration: 60,
        price: 45,
        deposit: 0,
        depositPaid: false,
        status: 'requested',
        comments: '',
        thread: [],
      },
    ],
    applications: APPLICATIONS_SEED,
    reports: REPORTS_SEED,
    reviewFlags: REVIEW_FLAGS_SEED,
    suspensions: SUSPENSIONS_SEED,
    pendingBooking: null,
  }
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_PENDING_BOOKING':
      return { ...state, pendingBooking: action.payload }

    case 'SIGNUP': {
      const id = `u-${Date.now()}`
      const user = { id, name: action.payload.name, email: action.payload.email, role: 'client', verified: false }
      return { ...state, users: { ...state.users, [id]: user }, pendingVerifyUserId: id }
    }

    case 'VERIFY_EMAIL': {
      const id = state.pendingVerifyUserId
      if (!id) return state
      return {
        ...state,
        users: { ...state.users, [id]: { ...state.users[id], verified: true } },
        currentUserId: id,
        pendingVerifyUserId: null,
      }
    }

    case 'LOGIN': {
      const match = Object.values(state.users).find(
        (u) => u.email.toLowerCase() === action.payload.email.toLowerCase(),
      )
      if (match) return { ...state, currentUserId: match.id }
      // unseen school email -> spin up a fresh client account, no verification needed for demo login
      const id = `u-${Date.now()}`
      const user = { id, name: action.payload.email.split('@')[0], email: action.payload.email, role: 'client', verified: true }
      return { ...state, users: { ...state.users, [id]: user }, currentUserId: id }
    }

    case 'LOGOUT':
      return { ...state, currentUserId: null }

    case 'CREATE_BOOKING': {
      const booking = { id: `bk-${Date.now()}`, status: 'requested', thread: [], ...action.payload }
      return { ...state, bookings: [booking, ...state.bookings] }
    }

    case 'UPDATE_BOOKING_STATUS': {
      return {
        ...state,
        bookings: state.bookings.map((b) => (b.id === action.payload.id ? { ...b, status: action.payload.status } : b)),
      }
    }

    case 'ADD_BOOKING_MESSAGE': {
      return {
        ...state,
        bookings: state.bookings.map((b) =>
          b.id === action.payload.id
            ? { ...b, thread: [...b.thread, { from: 'You', when: 'just now', text: action.payload.text }] }
            : b,
        ),
      }
    }

    case 'SUBMIT_APPLICATION': {
      const app = {
        id: `app-${Date.now()}`,
        status: 'pending',
        submittedAt: new Date().toISOString().slice(0, 10),
        ageDays: 0,
        internalNote: '',
        docs: [],
        ...action.payload,
      }
      return { ...state, applications: [app, ...state.applications] }
    }

    case 'UPDATE_APPLICATION_STATUS': {
      return {
        ...state,
        applications: state.applications.map((a) =>
          a.id === action.payload.id
            ? { ...a, status: action.payload.status, internalNote: action.payload.internalNote ?? a.internalNote }
            : a,
        ),
      }
    }

    case 'APPROVE_APPLICATION_TO_PROVIDER': {
      const app = state.applications.find((a) => a.id === action.payload.applicationId)
      if (!app) return state
      const providerId = app.id.replace(/^app-/, 'prov-')
      const provider = {
        id: providerId,
        name: app.businessName,
        serviceId: null,
        categoryId: app.category,
        ownerName: app.ownerName,
        email: app.email,
        rating: 0,
        reviewCount: 0,
        area: '',
        joined: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        bio: app.description || '',
        portfolioCount: 0,
        venmo: '',
        zelle: '',
        applicationStatus: 'approved',
        strikes: 0,
        suspended: false,
        services: [],
        reviews: [],
      }
      return {
        ...state,
        providers: { ...state.providers, [providerId]: provider },
        applications: state.applications.map((a) => (a.id === app.id ? { ...a, status: 'approved' } : a)),
      }
    }

    case 'UPDATE_PROVIDER_AVAILABILITY': {
      return {
        ...state,
        providers: {
          ...state.providers,
          [action.payload.providerId]: {
            ...state.providers[action.payload.providerId],
            availabilityGrid: action.payload.grid,
          },
        },
      }
    }

    case 'SUBMIT_REPORT': {
      const report = { id: `rpt-${Date.now()}`, status: 'open', flagged: false, ...action.payload }
      return { ...state, reports: [report, ...state.reports] }
    }

    case 'RESOLVE_REPORT': {
      return {
        ...state,
        reports: state.reports.map((r) => (r.id === action.payload.id ? { ...r, status: action.payload.status } : r)),
      }
    }

    case 'REVIEW_FLAG_ACTION': {
      return { ...state, reviewFlags: state.reviewFlags.filter((f) => f.id !== action.payload.id) }
    }

    case 'UPDATE_SUSPENSION': {
      const { group, id, status } = action.payload
      return {
        ...state,
        suspensions: {
          ...state.suspensions,
          [group]: state.suspensions[group].map((x) => (x.id === id ? { ...x, status } : x)),
        },
      }
    }

    case 'ADD_REVIEW': {
      const providerId = action.payload.providerId
      const provider = state.providers[providerId]
      if (!provider) return state
      const review = { id: `r-${Date.now()}`, ...action.payload }
      return {
        ...state,
        providers: {
          ...state.providers,
          [providerId]: { ...provider, reviews: [review, ...provider.reviews] },
        },
      }
    }

    default:
      return state
  }
}

const StoreContext = createContext(null)

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadInitial)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  const currentUser = state.currentUserId ? state.users[state.currentUserId] : null

  const value = useMemo(() => ({ state, dispatch, currentUser }), [state, currentUser])

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used inside StoreProvider')
  return ctx
}
