# 🏥 Health Wallet

A **production-ready, full-stack healthcare document management platform** built with Next.js 14, TypeScript, Tailwind CSS, and shadcn/ui.

## ✨ Features

### 🔐 Authentication
- **Sign Up / Login / Logout**
- Form validation with real-time feedback
- Password strength indicator
- Remember me functionality
- Forgot password flow
- Protected routes via `AppShell` auth guard
- Demo account for quick exploration

### 📄 Document Management
- Upload PDFs, images (JPG, PNG, WebP)
- Drag-and-drop upload with file validation (max 10MB)
- Upload progress indicator
- Document categories: Prescription, Lab Report, Medical Record, Imaging, Vaccination, Insurance, Bills
- Search documents by title, doctor, tags, category
- Sort by newest, oldest, name, size
- Filter by category
- Grid and list view modes
- Favorite important documents ⭐
- Archive documents
- Delete documents
- Document detail page with full metadata

### 📅 Appointment Tracker
- Schedule appointments with doctor, specialty, hospital, date, time, notes
- Mark appointments as Completed or Cancelled
- Filter by status (Upcoming / Completed / Cancelled)
- Today/Tomorrow indicators
- Delete appointments

### 🚨 Emergency Profile
- Blood group selection with visual display
- Allergies (tag-based input)
- Medical conditions (tag-based)
- Current medications (tag-based)
- Insurance provider & policy number
- Emergency contacts management (add/remove)
- Auto-save to localStorage

### 👤 Profile & Settings
- Edit personal information (first name, last name, phone)
- Change password with validation
- Document & appointment stats
- Settings: notifications, 2FA toggle, data export (JSON), account deletion

### 🎨 UI/UX
- Premium glassmorphism design system
- Smooth animations & micro-interactions
- Responsive sidebar (collapsible on desktop)
- Mobile bottom tab bar + slide-in drawer
- Toast notifications (sonner)
- Empty states for all sections
- Dark mode CSS variables configured
- Healthcare-focused blue/green palette

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + custom design system |
| UI Components | shadcn/ui (Radix UI) |
| Icons | Lucide React |
| Forms | Native HTML5 + custom validation |
| State | React local state + localStorage |
| Notifications | Sonner |
| Dates | date-fns |
| Charts | Recharts (ready) |
| Analytics | Vercel Analytics |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/health-wallet.git
cd health-wallet

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Demo Account
Click **"Try Demo Account"** on the sign-in page for instant access, or create your own account on the sign-up page.

---

## 📁 Project Structure

```
health-wallet/
├── app/
│   ├── layout.tsx              # Root layout with metadata & Toaster
│   ├── globals.css             # Design system (variables, animations, utilities)
│   ├── page.tsx                # Dashboard
│   ├── auth/
│   │   ├── signin/page.tsx     # Sign in page
│   │   ├── signup/page.tsx     # Sign up page
│   │   └── forgot-password/   # Forgot password page
│   ├── documents/
│   │   ├── page.tsx            # Documents list page
│   │   └── [id]/page.tsx       # Document detail page
│   ├── appointments/page.tsx   # Appointments page
│   ├── emergency/page.tsx      # Emergency profile page
│   ├── profile/page.tsx        # User profile page
│   └── settings/page.tsx       # Settings page
├── components/
│   ├── app-shell.tsx           # Auth guard + layout wrapper
│   ├── app-sidebar.tsx         # Desktop collapsible sidebar
│   ├── mobile-nav.tsx          # Mobile top bar + drawer + bottom nav
│   ├── add-document-modal.tsx  # Document upload modal
│   ├── auth-wrapper.tsx        # (legacy, replaced by app-shell)
│   ├── profile-dropdown.tsx    # Profile menu dropdown
│   └── ui/                     # shadcn/ui components
├── lib/
│   ├── document-management.ts  # Document CRUD, search, categories
│   ├── user-management.ts      # User auth, sessions, profiles
│   ├── health-data.ts          # Appointments + Emergency storage
│   └── utils.ts                # Utility functions
└── public/                     # Static assets
```

---

## 🌐 Deployment

### Deploy to Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Or link to GitHub for auto-deployments
```

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/health-wallet)

### Environment Variables

No environment variables are required for the current MVP (uses localStorage).

For production cloud integration, add:

```env
# Cloudinary (file storage)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Database (Supabase/Neon PostgreSQL)
DATABASE_URL=

# Auth (NextAuth)
NEXTAUTH_SECRET=
NEXTAUTH_URL=

# OpenAI (AI features)
OPENAI_API_KEY=
```

---

## 🗺️ Roadmap

### Phase 2 – Cloud Integration
- [ ] Cloudinary file uploads (real PDF/image storage)
- [ ] PostgreSQL + Prisma ORM (Supabase/Neon)
- [ ] NextAuth with Google OAuth

### Phase 3 – AI Features
- [ ] OCR text extraction from uploaded documents
- [ ] Smart tag suggestions
- [ ] AI document summarizer (OpenAI)

### Phase 4 – Advanced
- [ ] Secure document sharing (time-limited links)
- [ ] Email notifications (Resend)
- [ ] PDF export of health profile
- [ ] PWA support (offline access)
- [ ] Health timeline visualization

---

## 📸 Screenshots

| Page | Description |
|------|-------------|
| Sign In | Split-panel auth with gradient left panel |
| Sign Up | Registration with password strength meter |
| Dashboard | Stats cards, recent docs, appointments |
| Documents | Grid/list view with search & filters |
| Document Detail | Full metadata + actions |
| Appointments | Schedule & track doctor visits |
| Emergency Profile | Blood type, allergies, contacts |
| Profile | Account settings & password change |

---

## 🧑‍💻 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

MIT License – see [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful component library
- [Radix UI](https://www.radix-ui.com/) for accessible primitives
- [Lucide](https://lucide.dev/) for icons
- [Vercel](https://vercel.com/) for hosting
- [date-fns](https://date-fns.org/) for date utilities

---

*Built as a portfolio project demonstrating full-stack Next.js development with a focus on healthcare UX.*
