'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import { useAppStore } from '@/store/app'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import {
  Search,
  TrendingUp,
  Plus,
  User,
  Shield,
  LogOut,
  LogIn,
  Eye,
  EyeOff,
  Send,
  X,
  ChevronRight,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Edit3,
  Trash2,
  Loader2,
  MessageSquare,
  Link as LinkIcon,
  Bot,
  UserIcon,
  CalendarDays,
  ChevronLeft,
  Copy,
  Check,
  BarChart3,
  Database,
  FileText,
  Clock,
  Scale,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import UserNameHistoryModal from '@/components/UserNameHistoryModal'
import UserTagsBadge from '@/components/UserTagsBadge'

// ==================== TYPES ====================
interface ScammerResult {
  id: string
  name: string
  description: string
  status: string
  statusLabel: string
  statusColor?: string
  statusTextColor?: string
  searchCount: number
  likeCount?: number
  dislikeCount?: number
  submissionCount?: number
  screenshots: string[]
  scammerType?: string
  scamDate?: string
  proofLink?: string
  telegramUserId?: string
  createdAt: string
}

interface Submission {
  id: string
  scammerName: string
  scammerData: string
  screenshots: string[]
  status: string
  statusLabel: string
  revisionReason: string
  createdAt: string
}

interface CommentItem {
  id: string
  content: string
  createdAt: string
  user: { id: string; username: string }
}

// ==================== AUTH VIEW ====================
function AuthView() {
  const [isLogin, setIsLogin] = useState(true)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!isLogin) {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        })
        const data = await res.json()

        if (!res.ok) {
          toast.error(data.error)
          setLoading(false)
          return
        }

        toast.success('Регистрация успешна! Входим...')
      }

      const result = await signIn('credentials', {
        username,
        password,
        redirect: false,
      })

      if (result?.error) {
        toast.error('Неверное имя пользователя или пароль')
      } else {
        toast.success('Вход выполнен!')
        window.location.reload()
      }
    } catch (err) {
      toast.error('Ошибка соединения')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="glass rounded-3xl p-8">
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center"
            >
              <Shield className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
              ScamBase
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              Проверяй. Защищай. Доверяй с умом.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Input
                placeholder="Имя пользователя"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-12 rounded-xl bg-secondary border-border focus:border-blue-500/50 pl-4"
                required
                minLength={3}
              />
            </div>

            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 rounded-xl bg-secondary border-border focus:border-blue-500/50 pl-4 pr-12"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-semibold text-base transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isLogin ? (
                'Войти'
              ) : (
                'Зарегистрироваться'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-muted-foreground hover:text-blue-400 transition-colors"
            >
              {isLogin ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// ==================== AUTH MODAL ====================
function AuthModal({ onClose }: { onClose: () => void }) {
  const [isLogin, setIsLogin] = useState(true)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!isLogin) {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        })
        const data = await res.json()

        if (!res.ok) {
          toast.error(data.error)
          setLoading(false)
          return
        }

        toast.success('Регистрация успешна! Входим...')
      }

      const result = await signIn('credentials', {
        username,
        password,
        redirect: false,
      })

      if (result?.error) {
        toast.error('Неверное имя пользователя или пароль')
      } else {
        toast.success('Вход выполнен!')
        onClose()
        setTimeout(() => window.location.reload(), 300)
      }
    } catch (err) {
      toast.error('Ошибка соединения')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
        animate={{ opacity: 1, backdropFilter: 'blur(8px)' }}
        exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
        transition={{ duration: 0.25 }}
        style={{ backgroundColor: 'var(--overlay)' }}
      />
      <motion.div
        initial={{ y: 120, opacity: 0, scale: 0.95, filter: 'blur(8px)' }}
        animate={{ y: 0, opacity: 1, scale: 1, filter: 'blur(0px)' }}
        exit={{
          y: 80,
          opacity: 0,
          scale: 0.92,
          filter: 'blur(6px)',
          transition: { duration: 0.3, ease: [0.36, 0, 0.66, -0.56] }
        }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 w-full max-w-md mx-4 mb-20 sm:mb-0"
      >
          <TiltCard className="glass-strong rounded-t-3xl sm:rounded-3xl p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold">ScamBase</h3>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-secondary transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <TiltCard className="rounded-xl">
                  <Input
                    placeholder="Имя пользователя"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                    className="h-12 rounded-xl bg-secondary border-border focus:border-blue-500/50 pl-4"
                    required
                    minLength={3}
                    maxLength={20}
                    pattern="[a-zA-Z0-9_]+"
                    title="Только английские буквы, цифры и _"
                  />
                </TiltCard>
                {!isLogin && (
                  <p className="text-[10px] text-muted-foreground mt-1 pl-1">Только английские буквы (a-z), цифры и _ • 3-20 символов</p>
                )}
              </div>

              <div className="relative">
                <TiltCard className="rounded-xl">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 rounded-xl bg-secondary border-border focus:border-blue-500/50 pl-4 pr-12"
                    required
                    minLength={6}
                  />
                </TiltCard>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
                {!isLogin && (
                  <p className="text-[10px] text-muted-foreground mt-1 pl-1">Минимум 6 символов</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : isLogin ? (
                  'Войти'
                ) : (
                  'Зарегистрироваться'
                )}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-muted-foreground hover:text-blue-400 transition-colors"
              >
                {isLogin ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
              </button>
            </div>
          </TiltCard>
        </motion.div>
    </motion.div>
  )
}

// ==================== 3D TILT CARD ====================
function TiltCard({ children, className = '', enabled = true, ...props }: { children: React.ReactNode; className?: string; enabled?: boolean } & React.HTMLAttributes<HTMLDivElement>) {
  const ref = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    if (!enabled) return
    const el = ref.current
    if (!el) return

    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0

    // Create glare overlay
    let glareEl = el.querySelector('.tilt-glare') as HTMLElement
    if (!glareEl) {
      glareEl = document.createElement('div')
      glareEl.className = 'tilt-glare'
      glareEl.style.cssText = 'position:absolute;inset:0;pointer-events:none;border-radius:inherit;overflow:hidden;z-index:10;'
      const glareInner = document.createElement('div')
      glareInner.className = 'tilt-glare-inner'
      glareInner.style.cssText = 'position:absolute;width:200%;height:200%;top:-50%;left:-50%;background:radial-gradient(ellipse at center, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%);opacity:0;transition:opacity 0.3s;'
      glareEl.appendChild(glareInner)
      el.style.position = el.style.position || 'relative'
      el.style.overflow = 'hidden'
      el.appendChild(glareEl)
    }
    const glareInner = glareEl.querySelector('.tilt-glare-inner') as HTMLElement

    // Create holographic rainbow overlay
    let holoEl = el.querySelector('.tilt-holo') as HTMLElement
    if (!holoEl) {
      holoEl = document.createElement('div')
      holoEl.className = 'tilt-holo'
      holoEl.style.cssText = 'position:absolute;inset:0;pointer-events:none;border-radius:inherit;z-index:9;opacity:0;transition:opacity 0.4s;background:linear-gradient(125deg, rgba(96,165,250,0.07) 0%, rgba(168,85,247,0.09) 25%, rgba(236,72,153,0.07) 50%, rgba(34,211,238,0.09) 75%, rgba(96,165,250,0.07) 100%);background-size:200% 200%;mix-blend-mode:overlay;'
      el.appendChild(holoEl)
    }

    // Create edge glow
    let glowEl = el.querySelector('.tilt-glow') as HTMLElement
    if (!glowEl) {
      glowEl = document.createElement('div')
      glowEl.className = 'tilt-glow'
      glowEl.style.cssText = 'position:absolute;inset:0;pointer-events:none;border-radius:inherit;z-index:1;opacity:0;transition:opacity 0.4s;box-shadow:inset 0 0 30px rgba(96,165,250,0.1), inset 0 0 60px rgba(139,92,246,0.06);'
      el.appendChild(glowEl)
    }

    // ---- DESKTOP: Mouse follow ----
    if (!isTouchDevice) {
      const handleMove = (e: MouseEvent) => {
        if (!el) return
        const rect = el.getBoundingClientRect()
        const x = (e.clientX - rect.left) / rect.width
        const y = (e.clientY - rect.top) / rect.height
        const tiltX = (0.5 - y) * 18
        const tiltY = (x - 0.5) * 18
        const sc = 1 + Math.abs(x - 0.5) * 0.05 + Math.abs(y - 0.5) * 0.05
        el.style.transform = `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(${sc}, ${sc}, ${sc})`
        el.style.transition = 'transform 0.08s ease-out'
        
        const glareX = x * 100
        const glareY = y * 100
        glareInner.style.background = `radial-gradient(ellipse at ${glareX}% ${glareY}%, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.06) 30%, rgba(255,255,255,0) 60%)`
        holoEl.style.backgroundPosition = `${50 + (x - 0.5) * 80}% ${50 + (y - 0.5) * 80}%`
        glareEl.style.opacity = '1'
        glowEl.style.opacity = '1'
        holoEl.style.opacity = '1'
      }

      const handleEnter = () => {
        glareEl.style.opacity = '1'
        glowEl.style.opacity = '1'
        holoEl.style.opacity = '1'
      }

      const handleLeave = () => {
        if (!el) return
        el.style.transition = 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)'
        el.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale3d(1, 1, 1)'
        glareEl.style.opacity = '0'
        glowEl.style.opacity = '0'
        holoEl.style.opacity = '0'
      }

      el.addEventListener('mousemove', handleMove)
      el.addEventListener('mouseenter', handleEnter)
      el.addEventListener('mouseleave', handleLeave)
      return () => {
        el.removeEventListener('mousemove', handleMove)
        el.removeEventListener('mouseenter', handleEnter)
        el.removeEventListener('mouseleave', handleLeave)
        cancelAnimationFrame(rafRef.current)
      }
    }

    // ---- TOUCH: CSS animation (unstoppable) + rAF for effects ----
    // Inject keyframes once
    const styleId = 'tilt-auto-rotate-style'
    if (!document.getElementById(styleId)) {
      const s = document.createElement('style')
      s.id = styleId
      s.textContent = `@keyframes tiltAutoRotate{0%{transform:perspective(800px) rotateX(10deg) rotateY(-8deg) scale3d(1.04,1.04,1.04)}25%{transform:perspective(800px) rotateX(-3deg) rotateY(12deg) scale3d(1.06,1.06,1.06)}50%{transform:perspective(800px) rotateX(-10deg) rotateY(8deg) scale3d(1.04,1.04,1.04)}75%{transform:perspective(800px) rotateX(3deg) rotateY(-12deg) scale3d(1.02,1.02,1.02)}100%{transform:perspective(800px) rotateX(10deg) rotateY(-8deg) scale3d(1.04,1.04,1.04)}}`
      document.head.appendChild(s)
    }

    // CSS animation never stops - browser compositor handles it
    const duration = 6 + Math.random() * 6
    const delay = -Math.random() * duration
    el.style.animation = `tiltAutoRotate ${duration}s ease-in-out infinite`
    el.style.animationDelay = `${delay}s`

    // rAF only updates glare/holo position (not critical if paused during scroll)
    let running = true
    let phase = Math.random() * Math.PI * 2
    const updateEffects = () => {
      if (!running || !el) return
      phase += 0.012
      const glareX = 50 + Math.sin(phase * 0.7) * 35
      const glareY = 50 + Math.cos(phase * 0.5) * 35
      glareInner.style.background = `radial-gradient(ellipse at ${glareX}% ${glareY}%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.06) 30%, rgba(255,255,255,0) 60%)`
      holoEl.style.backgroundPosition = `${50 + Math.sin(phase * 0.4) * 40}% ${50 + Math.cos(phase * 0.3) * 40}%`
      glareEl.style.opacity = '1'
      glowEl.style.opacity = '1'
      holoEl.style.opacity = '0.8'
      rafRef.current = requestAnimationFrame(updateEffects)
    }
    updateEffects()

    return () => {
      running = false
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <div ref={ref} data-tilt className={`transform-gpu will-change-transform ${className}`} style={{ transition: 'transform 0.3s ease-out' }} {...props}>
      {children}
    </div>
  )
}

// ==================== FLOATING SCAMMERS ====================
function FloatingScammers() {
  const { setSelectedScammer } = useAppStore()
  const [scammers, setScammers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const loadBatch = useCallback(async () => {
    try {
      const res = await fetch(`/api/random-scammers?limit=15`)
      const data = await res.json()
      if (data.results && data.results.length > 0) {
        setScammers(prev => {
          const existingIds = new Set(prev.map(s => s.id))
          const newItems = data.results.filter((s: any) => !existingIds.has(s.id))
          const combined = [...prev, ...newItems]
          // Keep max 60 items to avoid memory issues
          return combined.slice(-60)
        })
      }
    } catch {
      // silently ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadBatch()
    // Generate new batch every 8 seconds
    intervalRef.current = setInterval(loadBatch, 8000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [loadBatch])

  const colors = [
    'from-blue-500/20 to-cyan-500/10',
    'from-purple-500/20 to-pink-500/10',
    'from-green-500/20 to-emerald-500/10',
    'from-orange-500/20 to-red-500/10',
    'from-cyan-500/20 to-blue-500/10',
    'from-rose-500/20 to-orange-500/10',
    'from-indigo-500/20 to-violet-500/10',
  ]

  const statusIcons: Record<string, string> = {
    scam: '🚫',
    verified: '✅',
    suspicious: '⚠️',
    unverified: '❓',
    not_in_db: '⚪',
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mt-6"
    >
      {/* Cosmic container */}
      <div className="relative rounded-3xl overflow-hidden" style={{ minHeight: '200px' }}>
        {/* Starfield background */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/40 via-indigo-50/20 to-gray-100/60 dark:from-blue-950/40 dark:via-purple-950/20 dark:to-gray-950/30 rounded-3xl overflow-hidden">
          <div className="stars-layer" />
        </div>

        {/* Content */}
        <div className="relative z-10 p-4">
          <div className="text-center mb-4">
            <p className="text-xs text-muted-foreground/70 uppercase tracking-widest font-medium">
              База скамеров в реальном времени
            </p>
          </div>

          {loading && scammers.length === 0 ? (
            <div className="flex items-center justify-center" style={{ height: '180px' }}>
              <Loader2 className="w-6 h-6 animate-spin text-blue-500/50" />
            </div>
          ) : (
            <div
              ref={scrollRef}
              className="flex gap-3 overflow-x-auto pb-3 snap-x snap-mandatory scrollbar-hide"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                WebkitOverflowScrolling: 'touch',
              }}
              onWheel={(e) => {
                if (e.deltaY !== 0) {
                  e.preventDefault()
                  e.currentTarget.scrollLeft += e.deltaY
                }
              }}
            >
              {scammers.map((scammer, i) => (
                <motion.div
                  key={`${scammer.id}-${i}`}
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: Math.min(i * 0.04, 0.6), type: 'spring', stiffness: 200, damping: 25 }}
                  className="snap-start shrink-0"
                  style={{ width: '180px' }}
                >
                  <TiltCard
                    onClick={() => setSelectedScammer(scammer)}
                    className={`cursor-pointer rounded-2xl bg-gradient-to-br ${colors[i % colors.length]} backdrop-blur-md border border-border p-4 h-full flex flex-col transition-shadow hover:shadow-lg hover:shadow-blue-500/10`}
                  >
                    {/* Avatar + status */}
                    <div className="flex items-center gap-2 mb-3">
                      <Avatar className="h-9 w-9 shrink-0">
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white font-bold text-sm">
                          {scammer.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm truncate">{scammer.name}</p>
                        <StatusBadge status={scammer.statusLabel || scammer.status} size="sm" color={scammer.statusColor} textColor={scammer.statusTextColor} />
                      </div>
                    </div>

                    {/* Description snippet */}
                    {scammer.description && (
                      <p className="text-[11px] text-muted-foreground line-clamp-2 mb-3 flex-1">
                        {scammer.description}
                      </p>
                    )}

                    {/* Stats row */}
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-0.5">
                        <ThumbsUp className="w-3 h-3 text-green-400" />
                        {scammer.likeCount}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <ThumbsDown className="w-3 h-3 text-red-400" />
                        {scammer.dislikeCount}
                      </span>
                      <span>{scammer.searchCount} поисков</span>
                    </div>
                  </TiltCard>
                </motion.div>
              ))}
              {/* Loading indicator at the end */}
              <div className="snap-start shrink-0 flex items-center justify-center" style={{ width: '40px' }}>
                <Loader2 className="w-4 h-4 animate-spin text-blue-500/40" />
              </div>
            </div>
          )}

          {/* Scroll hint */}
          <div className="text-center mt-2">
            <p className="text-[10px] text-muted-foreground/40">
              ← Полистайте для новых записей →
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .stars-layer {
          position: absolute;
          inset: 0;
          background-image:
            radial-gradient(1px 1px at 10% 20%, rgba(255,255,255,0.15) 0%, transparent 100%),
            radial-gradient(1px 1px at 30% 60%, rgba(255,255,255,0.1) 0%, transparent 100%),
            radial-gradient(1px 1px at 50% 10%, rgba(255,255,255,0.12) 0%, transparent 100%),
            radial-gradient(1px 1px at 70% 80%, rgba(255,255,255,0.08) 0%, transparent 100%),
            radial-gradient(1px 1px at 90% 40%, rgba(255,255,255,0.15) 0%, transparent 100%),
            radial-gradient(1px 1px at 20% 90%, rgba(255,255,255,0.1) 0%, transparent 100%),
            radial-gradient(1px 1px at 60% 30%, rgba(255,255,255,0.08) 0%, transparent 100%),
            radial-gradient(1px 1px at 80% 70%, rgba(255,255,255,0.12) 0%, transparent 100%),
            radial-gradient(1.5px 1.5px at 15% 50%, rgba(96,165,250,0.2) 0%, transparent 100%),
            radial-gradient(1.5px 1.5px at 85% 15%, rgba(139,92,246,0.15) 0%, transparent 100%);
          animation: twinkle 6s ease-in-out infinite alternate;
        }
        @keyframes twinkle {
          0% { opacity: 0.6; }
          50% { opacity: 1; }
          100% { opacity: 0.7; }
        }
      `}</style>
    </motion.div>
  )
}

// ==================== COMPLAINT CARD ====================
function ComplaintCard({ name }: { name: string }) {
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async () => {
    if (sent) return
    setLoading(true)
    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, reason: reason.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error)
        return
      }
      toast.success('Жалоба отправлена! Админ рассмотрит её')
      setSent(true)
    } catch {
      toast.error('Ошибка отправки')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="glass rounded-2xl p-4 max-w-sm mx-auto">
        <div className="text-center">
          <p className="text-sm font-medium text-muted-foreground">
            Жалоба на <span className="text-foreground font-semibold">{name}</span> отправлена
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="glass rounded-2xl p-4 max-w-sm mx-auto">
      <div className="flex items-center gap-3 mb-3">
        <Avatar className="h-10 w-10 shrink-0">
          <AvatarFallback className="bg-gradient-to-br from-gray-400 to-gray-500 text-white font-semibold">
            {name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="font-semibold truncate">{name}</p>
          <p className="text-xs text-muted-foreground">Не найден в базе</p>
        </div>
      </div>
      <div className="mb-3">
        <textarea
          placeholder="Опишите причину жалобы (необязательно)..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full h-20 rounded-xl bg-secondary border border-border p-3 text-sm resize-none focus:outline-none focus:border-blue-500/50 placeholder:text-muted-foreground"
          maxLength={500}
        />
      </div>
      <Button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full h-10 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold text-sm"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
          <span className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Пожаловаться
          </span>
        )}
      </Button>
    </div>
  )
}

// ==================== SEARCH VIEW ====================
function SearchView() {
  const { setSelectedScammer } = useAppStore()
  const [query, setQuery] = useState('')
  const [telegramId, setTelegramId] = useState('')
  const [results, setResults] = useState<ScammerResult[]>([])
  const [searched, setSearched] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSearch = useCallback(async () => {
    if (!query.trim() && !telegramId.trim()) return

    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (query.trim()) params.set('q', query.trim())
      if (telegramId.trim()) params.set('id', telegramId.trim())
      const res = await fetch(`/api/search?${params.toString()}`)
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error)
        return
      }

      setResults(data.results || [])
      setSearched(true)

      if (data.results.length === 0) {
        toast.info('Ничего не найдено')
      }
    } catch {
      toast.error('Ошибка поиска')
    } finally {
      setLoading(false)
    }
  }, [query, telegramId])

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="px-4 pt-6 pb-4"
    >
      <div className="text-center mb-6">
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold mb-2"
        >
          Проверьте —{' '}
          <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            скам ли это?
          </span>
        </motion.h2>
        <p className="text-sm text-muted-foreground">
          Введите имя или Telegram ID
        </p>
      </div>

      <div className="relative max-w-lg mx-auto mb-6">
        {/* Floating magnifying glasses background */}
        <div className="absolute -top-32 -bottom-8 -left-8 -right-8 overflow-hidden pointer-events-none">
          <Search className="absolute top-4 left-[8%] w-8 h-8 text-blue-500/[0.06] rotate-[-20deg]" />
          <Search className="absolute top-12 right-[12%] w-6 h-6 text-cyan-500/[0.08] rotate-[15deg]" />
          <Search className="absolute top-24 left-[20%] w-10 h-10 text-blue-400/[0.05] rotate-[35deg]" />
          <Search className="absolute bottom-8 right-[6%] w-7 h-7 text-purple-500/[0.07] rotate-[-40deg]" />
          <Search className="absolute bottom-16 left-[5%] w-5 h-5 text-cyan-400/[0.06] rotate-[25deg]" />
          <Search className="absolute top-[60%] left-[45%] w-9 h-9 text-blue-300/[0.04] rotate-[-10deg]" />
          <Search className="absolute top-[30%] right-[35%] w-6 h-6 text-indigo-500/[0.06] rotate-[50deg]" />
        </div>

        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl opacity-30 group-focus-within:opacity-60 blur transition-opacity" />
          <div className="relative flex flex-col gap-2 p-1.5">
            <Input
              placeholder="Имя скамера..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="h-12 rounded-xl bg-background/80 border-0 focus-visible:ring-0 px-4 text-base"
            />
            <div className="flex gap-2">
              <Input
                placeholder="Telegram ID..."
                value={telegramId}
                onChange={(e) => setTelegramId(e.target.value.replace(/[^\d]/g, ''))}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1 h-12 rounded-xl bg-background/80 border-0 focus-visible:ring-0 px-4 text-base"
              />
              <Button
                onClick={handleSearch}
                disabled={loading || (!query.trim() && !telegramId.trim())}
                className="h-12 px-5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white shrink-0"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating scammers when not searching */}
      {!searched && <FloatingScammers />}

      <AnimatePresence>
        {searched && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {results.length > 0 ? (
              results.map((scammer, i) => (
                <motion.div
                  key={scammer.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div
                    onClick={() => setSelectedScammer(scammer)}
                    className="glass rounded-2xl p-4 cursor-pointer hover:bg-muted transition-shadow duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <Avatar className="h-10 w-10 shrink-0">
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white font-semibold">
                            {scammer.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-semibold truncate">{scammer.name}</p>
                          <p className="text-xs text-muted-foreground">{scammer.searchCount} поисков</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <StatusBadge status={scammer.statusLabel || scammer.status} color={scammer.statusColor} textColor={scammer.statusTextColor} />
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                    {/* Like/Dislike bar */}
                    <div className="flex items-center gap-1 mt-3 pt-3 border-t border-border">
                      <LikeButton scammerId={scammer.id} initialLikes={scammer.likeCount || 0} initialDislikes={scammer.dislikeCount || 0} />
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center"
                >
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </motion.div>
                <p className="text-lg font-semibold text-green-400">Чисто!</p>
                <p className="text-sm text-muted-foreground mt-1">Этого человека нет в базе</p>
                {(query.trim() || telegramId.trim()) && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-6"
                  >
                    <ComplaintCard
                      name={query.trim() || telegramId.trim()}
                    />
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ==================== TOP 10 VIEW ====================
function Top10View() {
  const { setSelectedScammer } = useAppStore()
  const tiltTop10 = useAppStore((s) => s.tiltTop10)
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/top10')
        const json = await res.json()
        setData(json.results || [])
      } catch {
        toast.error('Ошибка загрузки')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="px-4 pt-6 pb-4"
    >
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-1">
          🔥 <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">Топ-10</span>
        </h2>
        <p className="text-sm text-muted-foreground">Самые популярные поиски</p>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-16">
          <TrendingUp className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
          <p className="text-muted-foreground">Пока нет данных</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <TiltCard
                enabled={tiltTop10}
                onClick={() => setSelectedScammer(item)}
                className="glass rounded-2xl p-4 cursor-pointer hover:bg-muted transition-shadow duration-300"
              >
                <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    <Avatar className="h-11 w-11">
                      <AvatarFallback
                        className={`font-bold text-white ${
                          i === 0
                            ? 'bg-gradient-to-br from-yellow-400 to-orange-500'
                            : i === 1
                            ? 'bg-gradient-to-br from-gray-300 to-gray-400'
                            : i === 2
                            ? 'bg-gradient-to-br from-amber-600 to-amber-700'
                            : 'bg-gradient-to-br from-blue-500/50 to-cyan-500/50'
                        }`}
                      >
                        {i + 1}
                      </AvatarFallback>
                    </Avatar>
                    {i < 3 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: i * 0.1 + 0.3 }}
                        className="absolute -top-1 -right-1 text-xs"
                      >
                        {i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}
                      </motion.div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.totalSearches} поисков</p>
                  </div>
                  <StatusBadge status={item.statusLabel || item.status} color={item.statusColor} textColor={item.statusTextColor} />
                </div>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}

// ==================== CREATE MODAL ====================
function CreateModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [name, setName] = useState('')
  const [data, setData] = useState('')
  const [telegramUserId, setTelegramUserId] = useState('')
  const [screenshotText, setScreenshotText] = useState('')
  const [loading, setLoading] = useState(false)
  const [statusTypes, setStatusTypes] = useState<any[]>([])
  const [selectedStatus, setSelectedStatus] = useState('scam')

  useEffect(() => {
    fetch('/api/status-types').then(r => r.json()).then(d => {
      if (d.statuses) setStatusTypes(d.statuses)
    }).catch(() => {})
  }, [])

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error('Введите имя')
      return
    }

    setLoading(true)
    try {
      const urls = screenshotText.split('\n').map(l => l.trim()).filter(l => l.length > 0).slice(0, 3)

      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scammerName: name,
          scammerData: data,
          telegramUserId: telegramUserId.trim(),
          screenshots: urls,
          scammerStatus: selectedStatus,
        }),
      })

      const resData = await res.json()

      if (!res.ok) {
        toast.error(resData.error)
        return
      }

      toast.success('Заявка отправлена на проверку!')
      onClose()
      setName('')
      setData('')
      setTelegramUserId('')
      setScreenshotText('')
      setSelectedStatus('scam')
    } catch {
      toast.error('Ошибка отправки')
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
        animate={{ opacity: 1, backdropFilter: 'blur(8px)' }}
        exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
        transition={{ duration: 0.25 }}
        style={{ backgroundColor: 'var(--overlay)' }}
      />
      <motion.div
        initial={{ y: 120, opacity: 0, scale: 0.95, filter: 'blur(8px)' }}
        animate={{ y: 0, opacity: 1, scale: 1, filter: 'blur(0px)' }}
        exit={{
          y: 80,
          opacity: 0,
          scale: 0.92,
          filter: 'blur(6px)',
          transition: { duration: 0.3, ease: [0.36, 0, 0.66, -0.56] }
        }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 w-full max-w-lg mx-4 mb-20 sm:mb-0 max-h-[90dvh] overflow-y-auto"
      >
          <div className="glass-strong rounded-t-3xl sm:rounded-3xl p-5 sm:p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-bold">Сообщить о скаме</h3>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-secondary transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">Имя скамера *</label>
                <Input
                  placeholder="Введите имя..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-12 rounded-xl bg-secondary border-border"
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">Telegram ID скамера</label>
                <Input
                  placeholder="Цифровой ID в Telegram..."
                  value={telegramUserId}
                  onChange={(e) => setTelegramUserId(e.target.value.replace(/[^\d]/g, ''))}
                  className="h-12 rounded-xl bg-secondary border-border"
                />
              </div>

              {statusTypes.length > 0 && (
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">Тип</label>
                  <div className="flex flex-wrap gap-2 max-h-[120px] overflow-y-auto pr-1">
                    {statusTypes.map((st) => (
                      <button
                        key={st.key}
                        type="button"
                        onClick={() => setSelectedStatus(st.key)}
                        className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-all shrink-0"
                        style={{
                          backgroundColor: selectedStatus === st.key ? st.color + '44' : st.color + '15',
                          color: st.textColor || '#ffffff',
                          borderColor: selectedStatus === st.key ? st.color + '88' : st.color + '33',
                          boxShadow: selectedStatus === st.key ? `0 0 8px ${st.color}44` : 'none',
                        }}
                      >
                        {selectedStatus === st.key && '✓ '}{st.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">Данные / описание</label>
                <Input
                  placeholder="Телефон, Telegram, детали..."
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                  className="h-12 rounded-xl bg-secondary border-border"
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">
                  Ссылки на доказательства (по одной на строку, макс. 3)
                </label>
                <textarea
                  placeholder="https://t.me/..."
                  value={screenshotText}
                  onChange={(e) => setScreenshotText(e.target.value)}
                  className="w-full h-20 rounded-xl bg-secondary border border-border p-3 text-sm resize-none focus:outline-none focus:border-blue-500/50 placeholder:text-muted-foreground"
                  rows={3}
                />
                <p className="text-[10px] text-muted-foreground mt-1.5 leading-relaxed">
                  Киньте скриншоты на которых показано что вас заскамили (пруфы) в чат{' '}
                  <a href="https://t.me/wocmf" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline underline-offset-1">@wocmf</a>,{' '}
                  копируйте ссылку и вставьте сюда.
                </p>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={loading || !name.trim()}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-semibold"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <span className="flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    Отправить
                  </span>
                )}
              </Button>
            </div>
          </div>
        </motion.div>
    </motion.div>
  )
}

// ==================== APPEAL MODAL ====================
function AppealModal({ scammer, onClose }: { scammer: any; onClose: () => void }) {
  const { data: session } = useSession()
  const [proofLink, setProofLink] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!description.trim() || description.trim().length < 10) {
      toast.error('Описание должно быть минимум 10 символов')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/appeals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scammerId: scammer.id,
          proofLink: proofLink.trim(),
          description: description.trim(),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error)
        return
      }
      toast.success('Апелляция отправлена!')
      onClose()
    } catch {
      toast.error('Ошибка отправки')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div
        className="absolute inset-0 transition-[backdrop-filter] duration-300"
        style={{ backgroundColor: 'var(--overlay)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
      />
      <motion.div
        initial={{ y: 60, opacity: 0, scale: 0.96 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 40, opacity: 0, scale: 0.94, transition: { duration: 0.2, ease: [0.36, 0, 0.66, -0.56] } }}
        transition={{ type: 'spring', damping: 30, stiffness: 350 }}
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 w-full max-w-lg mx-4 mb-20 sm:mb-0 max-h-[90dvh] overflow-y-auto"
      >
        <div className="glass-strong rounded-t-3xl sm:rounded-3xl p-5 sm:p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center">
                <Scale className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Подать апелляцию</h3>
                <p className="text-xs text-muted-foreground">на {scammer.name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-secondary transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">Ссылка на доказательства невиновности</label>
              <Input
                placeholder="https://t.me/... или любая ссылка"
                value={proofLink}
                onChange={(e) => setProofLink(e.target.value)}
                className="h-12 rounded-xl bg-secondary border-border"
              />
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">Описание *</label>
              <textarea
                placeholder="Опишите почему этот человек не виноват, приведите доказательства..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full h-28 rounded-xl bg-secondary border border-border p-3 text-sm resize-none focus:outline-none focus:border-orange-500/50 placeholder:text-muted-foreground"
                rows={4}
                maxLength={100}
              />
              <p className="text-[10px] text-muted-foreground mt-1.5 leading-relaxed">
                Киньте скриншоты доказательств невиновности в чат{' '}
                <a href="https://t.me/wocmf" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline underline-offset-1">@wocmf</a>,{' '}
                копируйте ссылку и вставьте в поле выше.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={onClose}
                variant="outline"
                className="flex-1 h-12 rounded-xl font-semibold"
              >
                Закрыть
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading || !description.trim() || description.trim().length < 10}
                className={`flex-1 h-12 rounded-xl font-semibold transition-all duration-200 ${
                  (!description.trim() || description.trim().length < 10) && !loading
                    ? 'bg-muted text-muted-foreground cursor-not-allowed'
                    : 'bg-gradient-to-r from-orange-600 to-red-500 hover:from-orange-700 hover:to-red-600 text-white hover:shadow-lg hover:shadow-orange-500/25'
                }`}
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <span className="flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    Отправить
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ==================== SCAMER DETAIL MODAL ====================
function ScamerDetailModal({ scammer, onClose }: { scammer: any; onClose: () => void }) {
  const { data: session } = useSession()
  const tiltEnabled = useAppStore((s) => s.tiltEnabled)
  const [comments, setComments] = useState<CommentItem[]>([])
  const [newComment, setNewComment] = useState('')
  const [sendingComment, setSendingComment] = useState(false)
  const [loadingComments, setLoadingComments] = useState(true)
  const [commentPage, setCommentPage] = useState(1)
  const [commentTotalPages, setCommentTotalPages] = useState(1)
  const [commentTotal, setCommentTotal] = useState(0)
  const [showNameHistory, setShowNameHistory] = useState(false)
  const [showAppeal, setShowAppeal] = useState(false)

  const loadComments = useCallback((scammerId: string, page: number) => {
    setLoadingComments(true)
    fetch(`/api/comments?scammerId=${scammerId}&page=${page}&limit=10`)
      .then((r) => r.json())
      .then((data) => {
        setComments(data.results || [])
        setCommentTotalPages(data.totalPages || 1)
        setCommentTotal(data.total || 0)
      })
      .catch(() => {})
      .finally(() => setLoadingComments(false))
  }, [])

  useEffect(() => {
    if (!scammer) return
    setCommentPage(1)
    loadComments(scammer.id, 1)
  }, [scammer, loadComments])

  useEffect(() => {
    if (!scammer || commentPage === 1) return
    loadComments(scammer.id, commentPage)
  }, [commentPage, scammer, loadComments])

  const handleSendComment = async () => {
    if (!newComment.trim()) return
    setSendingComment(true)
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scammerId: scammer.id, content: newComment.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error)
        return
      }
      toast.success('Комментарий отправлен на модерацию ✓')
      // Reload first page to see the new comment
      setCommentPage(1)
      loadComments(scammer.id, 1)
      setNewComment('')
    } catch {
      toast.error('Ошибка отправки')
    } finally {
      setSendingComment(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    try {
      const res = await fetch(`/api/comments?id=${commentId}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error)
        return
      }
      loadComments(scammer.id, commentPage)
    } catch {
      toast.error('Ошибка')
    }
  }

  if (!scammer) return null

  const sessionUser = session?.user as { id?: string; userId?: string; role?: string } | undefined
  const currentUserId = sessionUser?.userId || sessionUser?.id
  const isLoggedIn = !!session?.user

  return (
    <>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
        animate={{ opacity: 1, backdropFilter: 'blur(8px)' }}
        exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
        transition={{ duration: 0.25 }}
        style={{ backgroundColor: 'var(--overlay)' }}
      />
      <motion.div
        initial={{ y: 120, opacity: 0, scale: 0.95, filter: 'blur(8px)' }}
        animate={{ y: 0, opacity: 1, scale: 1, filter: 'blur(0px)' }}
        exit={{
          y: 80,
          opacity: 0,
          scale: 0.92,
          filter: 'blur(6px)',
          transition: { duration: 0.3, ease: [0.36, 0, 0.66, -0.56] }
        }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 w-full max-w-lg mx-0 sm:mx-4 max-h-[100dvh] sm:max-h-[85vh] overflow-y-auto"
      >
          <TiltCard enabled={tiltEnabled !== false} className="glass-strong rounded-t-3xl sm:rounded-3xl p-5 sm:p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar className="h-12 w-12 shrink-0">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white text-lg font-bold">
                    {scammer.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <h3 className="text-lg font-bold truncate">{scammer.name}</h3>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <StatusBadge status={scammer.statusLabel || scammer.status} size="sm" color={scammer.statusColor} textColor={scammer.statusTextColor} />
                    {scammer.scammerType && (
                      <Badge variant="outline" className="text-[10px] px-2 py-0 bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-300 border-blue-200 dark:border-blue-500/30">
                        {scammer.scammerType === 'bot' ? (
                          <span className="flex items-center gap-1"><Bot className="w-3 h-3" /> Бот</span>
                        ) : (
                          <span className="flex items-center gap-1"><UserIcon className="w-3 h-3" /> Человек</span>
                        )}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0 ml-2">
                <button
                  onClick={() => setShowNameHistory(true)}
                  className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-secondary transition-colors"
                  title="История имён"
                >
                  <Clock className="w-4 h-4 text-muted-foreground" />
                </button>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-secondary transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Telegram User ID */}
            {scammer.telegramUserId && (
              <div className="mb-4">
                <div className="glass rounded-xl p-3 flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-blue-400 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground">Telegram ID</p>
                    <p className="text-sm font-medium">{scammer.telegramUserId}</p>
                  </div>
                  <CopyButton text={scammer.telegramUserId} label="ID" />
                </div>
              </div>
            )}

            {/* Description */}
            {scammer.description && (
              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-1">Описание</p>
                <div className="glass rounded-xl p-3">
                  <p className="text-sm whitespace-pre-wrap break-words">{scammer.description}</p>
                </div>
              </div>
            )}

            {/* Extra fields */}
            {(scammer.scamDate || scammer.proofLink) && (
              <div className="mb-4 space-y-2">
                {scammer.scamDate && (
                  <div className="glass rounded-xl p-3 flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-blue-400 shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {scammer.status === 'verified' ? 'Дата' : 'Дата скама'}
                      </p>
                      <p className="text-sm font-medium">{scammer.scamDate}</p>
                    </div>
                  </div>
                )}
                {scammer.proofLink && (
                  <div className="glass rounded-xl p-3 flex items-center gap-2">
                    <LinkIcon className="w-4 h-4 text-blue-400 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground">Доказательство</p>
                      <a
                        href={scammer.proofLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-400 hover:text-blue-300 underline underline-offset-2 truncate block"
                      >
                        {scammer.proofLink}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Stats */}
            <div className="flex gap-3 mb-4">
              <div className="glass rounded-xl p-3 flex-1 text-center">
                <p className="text-xl sm:text-2xl font-bold text-blue-400">{scammer.searchCount || scammer.totalSearches || 0}</p>
                <p className="text-xs text-muted-foreground">Поисков</p>
              </div>
              <div className="glass rounded-xl p-3 flex-1 text-center">
                <p className="text-xl sm:text-2xl font-bold text-cyan-400">{scammer.submissionCount || 0}</p>
                <p className="text-xs text-muted-foreground">Жалоб</p>
              </div>
            </div>

            {/* Like/Dislike */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <LikeButton scammerId={scammer.id} initialLikes={scammer.likeCount || 0} initialDislikes={scammer.dislikeCount || 0} large />
            </div>

            {/* Screenshots / Proof links */}
            {scammer.screenshots && scammer.screenshots.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-2">Доказательства</p>
                <div className="grid grid-cols-2 gap-2">
                  {scammer.screenshots.map((src: string, i: number) => {
                    const isUrl = src.startsWith('http://') || src.startsWith('https://')
                    return isUrl ? (
                      <a
                        key={i}
                        href={src}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="glass rounded-xl p-3 text-sm text-blue-400 hover:text-blue-300 hover:bg-muted transition-colors flex items-center gap-2 truncate"
                      >
                        <LinkIcon className="w-4 h-4 shrink-0" />
                        <span className="truncate">{src.replace(/^https?:\/\//, '').replace(/\/$/, '')}</span>
                      </a>
                    ) : (
                      <img
                        key={i}
                        src={src}
                        alt={`Screenshot ${i + 1}`}
                        className="w-full rounded-xl border border-border"
                      />
                    )
                  })}
                </div>
              </div>
            )}

            {/* Comments section */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm font-semibold">
                  Комментарии {commentTotal > 0 && `(${commentTotal})`}
                </p>
              </div>

              {/* Add comment — only for logged-in users */}
              {isLoggedIn && (
                <div className="flex gap-2 mb-3">
                  <TiltCard className="rounded-xl flex-1 min-w-0">
                    <Input
                      placeholder="Написать комментарий..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendComment()}
                      className="h-10 rounded-xl bg-secondary border-border text-sm"
                      maxLength={500}
                    />
                  </TiltCard>
                  <Button
                    onClick={handleSendComment}
                    disabled={sendingComment || !newComment.trim()}
                    size="sm"
                    className="h-10 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white shrink-0"
                  >
                    {sendingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                </div>
              )}

              {/* Comments list */}
              {loadingComments ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                </div>
              ) : comments.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-3">
                  Пока нет комментариев. Будьте первым!
                </p>
              ) : (
                <>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {comments.map((comment) => {
                    const isOwner = comment.user.id === currentUserId
                    const isAdmin = sessionUser?.role === 'admin'
                    return (
                      <div key={comment.id} className="glass rounded-xl p-3">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2 min-w-0">
                            <Avatar className="h-6 w-6 shrink-0">
                              {comment.user.image && <AvatarImage src={comment.user.image} alt={comment.user.username} />}
                              <AvatarFallback className="bg-blue-500/20 dark:bg-blue-500/30 text-blue-600 dark:text-blue-300 text-[10px] font-bold">
                                {comment.user.username.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs font-medium truncate">{comment.user.username}</span>
                            <UserTagsBadge userId={comment.user.id} size="sm" />
                          </div>
                          <div className="flex items-center gap-2 shrink-0 ml-2">
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(comment.createdAt).toLocaleDateString('ru-RU', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                            {(isOwner || isAdmin) && (
                              <button
                                onClick={() => handleDeleteComment(comment.id)}
                                className="text-muted-foreground hover:text-red-400 transition-colors p-0.5"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-sm break-words">{comment.content}</p>
                      </div>
                    )
                  })}
                </div>
                {commentTotalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-3">
                    <button
                      onClick={() => setCommentPage(p => Math.max(1, p - 1))}
                      disabled={commentPage <= 1}
                      className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs text-muted-foreground">{commentPage} / {commentTotalPages}</span>
                    <button
                      onClick={() => setCommentPage(p => Math.min(commentTotalPages, p + 1))}
                      disabled={commentPage >= commentTotalPages}
                      className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
                </>
              )}
            </div>

            {/* Created date */}
            {scammer.createdAt && !isNaN(new Date(scammer.createdAt).getTime()) && (
              <div className="text-center">
                <p className="text-xs text-muted-foreground">
                  Добавлен: {new Date(scammer.createdAt).toLocaleDateString('ru-RU')}
                </p>
              </div>
            )}

            {/* Appeal button */}
            <div className="mt-4">
              <Button
                onClick={() => setShowAppeal(true)}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-orange-600/80 to-red-500/80 hover:from-orange-600 hover:to-red-500 text-white font-semibold text-sm"
              >
                <Scale className="w-4 h-4 mr-2" />
                Подать апелляцию
              </Button>
            </div>
          </TiltCard>
        </motion.div>
    </motion.div>
    <UserNameHistoryModal
      scammer={showNameHistory ? scammer : null}
      onClose={() => setShowNameHistory(false)}
    />
    {showAppeal && (
      <AppealModal
        scammer={scammer}
        onClose={() => setShowAppeal(false)}
      />
    )}
    </>
  )
}

// ==================== STATS VIEW ====================
function StatsView() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.json())
      .then(d => setStats(d))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    )
  }

  if (!stats) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-5"
    >
      <div className="pt-6">
        <h2 className="text-2xl font-bold">Статистика</h2>
        <p className="text-sm text-muted-foreground mt-1">Общая информация о системе</p>
      </div>

      {/* Overview */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Всего скамеров', value: stats.totalScammers, icon: Shield, color: 'text-red-500' },
          { label: 'Всего заявок', value: stats.totalSubmissions, icon: FileText, color: 'text-yellow-500' },
          { label: 'Всего юзеров', value: stats.totalUsers, icon: User, color: 'text-blue-500' },
          { label: 'Всего поисков', value: stats.totalSearches, icon: Search, color: 'text-purple-500' },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <s.icon className={`w-4 h-4 ${s.color}`} />
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </div>
            <p className="text-2xl font-bold">{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Today stats */}
      <div>
        <p className="text-xs text-muted-foreground mb-3 font-medium">За сегодня</p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Поисков', value: stats.searchesToday, icon: Search, color: 'text-cyan-500' },
            { label: 'Лайков', value: stats.likesToday, icon: TrendingUp, color: 'text-green-500' },
            { label: 'Новых', value: stats.scammersAddedToday, icon: Database, color: 'text-orange-500' },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (i + 4) * 0.05 }}
              className="glass rounded-xl p-3 text-center"
            >
              <s.icon className={`w-4 h-4 ${s.color} mx-auto mb-1`} />
              <p className="text-lg font-bold">{s.value}</p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Status breakdown */}
      <div>
        <p className="text-xs text-muted-foreground mb-3 font-medium">По статусам</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="glass rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span className="text-xs text-muted-foreground">Скам</span>
            </div>
            <p className="text-2xl font-bold text-red-500">{stats.scamCount}</p>
          </div>
          <div className="glass rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-xs text-muted-foreground">Проверено</span>
            </div>
            <p className="text-2xl font-bold text-green-500">{stats.verifiedCount}</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ==================== PROFILE VIEW ====================
function ProfileView({ user }: { user: any }) {
  const { update } = useSession()
  const tiltEnabled = useAppStore((s) => s.tiltEnabled)
  const setTiltEnabled = useAppStore((s) => s.setTiltEnabled)
  const tiltTop10 = useAppStore((s) => s.tiltTop10)
  const setTiltTop10 = useAppStore((s) => s.setTiltTop10)
  const [showAuth, setShowAuth] = useState(false)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [avatarUrl, setAvatarUrl] = useState((user as any)?.image || '')
  const [avatarSaving, setAvatarSaving] = useState(false)
  const [showAvatarEdit, setShowAvatarEdit] = useState(false)
  const drunkMode = useAppStore((s) => s.drunkMode)
  const setDrunkMode = useAppStore((s) => s.setDrunkMode)
  const logoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const logoutIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Sync avatarUrl when session user image changes (e.g. after update())
  useEffect(() => {
    const img = (user as any)?.image || ''
    if (img) setAvatarUrl(img)
  }, [user])

  // Drunk mode timer / click handlers remain here, CSS class managed in Home component

  const handleLogoutDown = () => {
    logoutTimerRef.current = setTimeout(() => {
      setDrunkMode(true)
      toast('Режим алкаша активирован!', { description: 'Удерживай ещё раз чтобы выключить' })
      logoutTimerRef.current = null
    }, 3000)
  }

  const handleLogoutUp = () => {
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current)
      logoutTimerRef.current = null
    }
  }

  const handleLogoutClick = () => {
    if (drunkMode) {
      setDrunkMode(false)
      toast.success('Режим алкаша выключен. Ты протрезвел.')
      return
    }
    signOut()
  }

  useEffect(() => {
    if (!user) return
    async function load() {
      try {
        const res = await fetch('/api/submissions')
        const json = await res.json()
        setSubmissions(json.results || [])
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user])

  const handleResubmit = async (sub: Submission) => {
    try {
      const res = await fetch('/api/submissions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: sub.id, action: 'resubmit' }),
      })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error)
        return
      }

      toast.success(data.message)
      setSubmissions((prev) => prev.filter((s) => s.id !== sub.id))
    } catch {
      toast.error('Ошибка')
    }
  }

  const handleDelete = async (sub: Submission) => {
    try {
      const res = await fetch('/api/submissions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: sub.id, action: 'delete' }),
      })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error)
        return
      }

      toast.success(data.message)
      setSubmissions((prev) => prev.filter((s) => s.id !== sub.id))
    } catch {
      toast.error('Ошибка')
    }
  }

  const handleSaveAvatar = async () => {
    const url = avatarUrl.trim()
    if (url && !url.match(/^https?:\/\/.+/)) {
      toast.error('Введите корректную ссылку (https://...)')
      return
    }
    setAvatarSaving(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: url }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Ошибка')
        return
      }
      toast.success('Аватарка обновлена')
      setShowAvatarEdit(false)
      await update()
    } catch {
      toast.error('Ошибка')
    } finally {
      setAvatarSaving(false)
    }
  }

  const statusColor: Record<string, string> = {
    pending: 'bg-yellow-500/10 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/30',
    approved: 'bg-green-500/10 dark:bg-green-500/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-500/30',
    rejected: 'bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/30',
    revision: 'bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-500/30',
  }

  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="px-4 pt-6 pb-4"
      >
        <div className="glass rounded-2xl p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold mb-2">Войдите, чтобы открыть все функции</h2>
          <p className="text-sm text-muted-foreground mb-6">Регистрация и вход бесплатны</p>
          <Button onClick={() => setShowAuth(true)} className="h-12 px-8 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold">
            <LogIn className="w-4 h-4 mr-2" />
            Войти / Зарегистрироваться
          </Button>
        </div>
        <AnimatePresence>
          {showAuth && <AuthModal key="auth-modal" onClose={() => setShowAuth(false)} />}
        </AnimatePresence>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="px-4 pt-6 pb-4"
    >
      {/* Profile header */}
      <div className="glass rounded-2xl p-5 mb-5">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar className="h-14 w-14 shrink-0">
              {avatarUrl && <AvatarImage src={avatarUrl} alt={user.name} />}
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white text-lg font-bold">
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <button
              onClick={() => { setAvatarUrl((user as any)?.image || ''); setShowAvatarEdit(true) }}
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-secondary border border-border flex items-center justify-center hover:bg-blue-500/20 transition-colors"
            >
              <Edit3 className="w-3 h-3 text-muted-foreground" />
            </button>
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold truncate">{user.name}</h2>
            <Badge variant="outline" className="mt-1">
              {(user as any).role === 'admin' ? 'Админ' : 'Пользователь'}
            </Badge>
            <UserTagsBadge userId={(user as any)?.userId || (user as any)?.id || ''} size="md" className="mt-1" />
          </div>
        </div>
      </div>

      {/* 3D tilt toggle */}
      <div className="glass rounded-2xl p-4 mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
            <span className="text-base">✨</span>
          </div>
          <div>
            <p className="text-sm font-semibold">3D эффект карточек</p>
            <p className="text-[11px] text-muted-foreground">{tiltEnabled ? 'Включен' : 'Выключен'}</p>
          </div>
        </div>
        <button
          onClick={() => {
            const newVal = !tiltEnabled
            setTiltEnabled(newVal)
            if (typeof localStorage !== 'undefined') {
              localStorage.setItem('tiltEnabled', String(newVal))
            }
            toast.success(newVal ? '3D эффект включен' : '3D эффект выключен')
          }}
          className={`relative w-12 h-7 rounded-full transition-colors duration-300 ${tiltEnabled ? 'bg-gradient-to-r from-blue-600 to-cyan-500' : 'bg-muted'}`}
        >
          <motion.div
            layout
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-md ${tiltEnabled ? 'left-6' : 'left-1'}`}
          />
        </button>
      </div>

      {/* 3D Top-10 toggle */}
      <div className="flex items-center justify-between py-3 border-t border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange-500/15 flex items-center justify-center">
            <span className="text-base">🏆</span>
          </div>
          <div>
            <p className="text-sm font-semibold">3D эффект в Топ-10</p>
            <p className="text-[11px] text-muted-foreground">{tiltTop10 ? 'Включен' : 'Выключен'}</p>
          </div>
        </div>
        <button
          onClick={() => {
            const newVal = !tiltTop10
            setTiltTop10(newVal)
            if (typeof localStorage !== 'undefined') {
              localStorage.setItem('tiltTop10', String(newVal))
            }
            toast.success(newVal ? '3D в Топ-10 включен' : '3D в Топ-10 выключен')
          }}
          className={`relative w-12 h-7 rounded-full transition-colors duration-300 ${tiltTop10 ? 'bg-gradient-to-r from-orange-500 to-red-500' : 'bg-muted'}`}
        >
          <motion.div
            layout
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-md ${tiltTop10 ? 'left-6' : 'left-1'}`}
          />
        </button>
      </div>

      {/* Avatar edit modal */}
      {showAvatarEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowAvatarEdit(false)}>
          <div className="glass rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">Изменить аватарку</h3>
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="h-16 w-16">
                {avatarUrl && <AvatarImage src={avatarUrl} />}
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white text-xl font-bold">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Превью</p>
                <p className="text-xs text-muted-foreground truncate">{avatarUrl || 'Нет картинки'}</p>
              </div>
            </div>
            <div className="mb-4">
              <label className="text-sm text-muted-foreground mb-1.5 block">Ссылка на изображение</label>
              <Input
                placeholder="https://example.com/avatar.jpg"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="rounded-xl bg-secondary border-border"
              />
              <p className="text-[10px] text-muted-foreground mt-1">Поддерживаются JPG, PNG, GIF, WebP</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleSaveAvatar}
                disabled={avatarSaving}
                className="flex-1 h-10 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold"
              >
                {avatarSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Сохранить'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowAvatarEdit(false)}
                className="h-10 rounded-xl"
              >
                Отмена
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Submissions */}
      <div className="mb-4">
        <h3 className="text-base sm:text-lg font-bold mb-3">Мои заявки</h3>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          </div>
        ) : submissions.length === 0 ? (
          <div className="glass rounded-2xl p-6 text-center">
            <p className="text-muted-foreground text-sm">У вас пока нет заявок</p>
          </div>
        ) : (
          <div className="space-y-3">
            {submissions.map((sub) => (
              <div key={sub.id} className="glass rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-sm sm:text-base truncate">{sub.scammerName}</p>
                  <Badge variant="outline" className={`shrink-0 ml-2 text-[10px] sm:text-xs ${statusColor[sub.status] || ''}`}>
                    {sub.statusLabel}
                  </Badge>
                </div>

                {sub.revisionReason && (
                  <div className="mt-2 p-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
                    <p className="text-xs text-orange-400">
                      <AlertTriangle className="w-3 h-3 inline mr-1" />
                      {sub.revisionReason}
                    </p>
                  </div>
                )}

                {sub.status === 'revision' && (
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleResubmit(sub)}
                      className="text-xs h-8 rounded-lg"
                    >
                      <Edit3 className="w-3 h-3 mr-1" />
                      Отправить
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(sub)}
                      className="text-xs h-8 rounded-lg text-red-500 dark:text-red-400 hover:text-red-400 dark:hover:text-red-300 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Удалить
                    </Button>
                  </div>
                )}

                <p className="text-xs text-muted-foreground mt-2">
                  {new Date(sub.createdAt).toLocaleDateString('ru-RU', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Admin panel button */}
      {(user as any).role === 'admin' && (
        <a
          href="/panel"
          className="flex items-center justify-center gap-2 w-full mt-4 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-semibold transition-all"
        >
          <Shield className="w-4 h-4" />
          Админ-панель
        </a>
      )}

      {/* Logout */}
      <button
        onClick={handleLogoutClick}
        onMouseDown={handleLogoutDown}
        onMouseUp={handleLogoutUp}
        onMouseLeave={handleLogoutUp}
        onTouchStart={handleLogoutDown}
        onTouchEnd={handleLogoutUp}
        className={`w-full mt-4 py-3 rounded-2xl border transition-all flex items-center justify-center gap-2 ${drunkMode ? 'border-yellow-500/50 text-yellow-400 bg-yellow-500/10 hover:bg-yellow-500/20 animate-drunk-btn' : 'border-border text-muted-foreground hover:text-red-400 hover:border-red-500/30'}`}
      >
        <LogOut className="w-4 h-4" />
        {drunkMode ? 'Протрезветь' : 'Выйти'}
      </button>

      {/* Delete account */}
      <button
        onClick={async () => {
          if (!confirm('Вы уверены? Это действие необратимо! Все ваши данные будут удалены.')) return
          if (!confirm('Точно уверены? Аккаунт будет удалён навсегда.')) return
          try {
            const res = await fetch('/api/profile', { method: 'DELETE' })
            const data = await res.json()
            if (!res.ok) { toast.error(data.error); return }
            toast.success('Аккаунт удалён')
            await signOut({ callbackUrl: '/' })
          } catch {
            toast.error('Ошибка')
          }
        }}
        className="w-full mt-3 py-3 rounded-2xl border border-red-500/20 text-red-500/60 hover:text-red-400 hover:border-red-500/40 hover:bg-red-500/5 transition-all flex items-center justify-center gap-2"
      >
        <Trash2 className="w-4 h-4" />
        Удалить аккаунт
      </button>
    </motion.div>
  )
}

// ==================== LIKE/DISLIKE BUTTON ====================
function LikeButton({ scammerId, initialLikes, initialDislikes, large }: { scammerId: string; initialLikes: number; initialDislikes: number; large?: boolean }) {
  const [likes, setLikes] = useState(initialLikes)
  const [dislikes, setDislikes] = useState(initialDislikes)
  const [neutrals, setNeutrals] = useState(0)
  const [myVote, setMyVote] = useState<'like' | 'neutral' | 'dislike' | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLikes(initialLikes)
    setDislikes(initialDislikes)
    fetch(`/api/vote?scammerId=${scammerId}`)
      .then(r => r.json())
      .then(d => {
        setMyVote(d.voteType)
        if (d.likeCount !== undefined) setLikes(d.likeCount)
        if (d.dislikeCount !== undefined) setDislikes(d.dislikeCount)
        if (d.neutralCount !== undefined) setNeutrals(d.neutralCount)
      })
      .catch(() => {})
  }, [scammerId, initialLikes, initialDislikes])

  const handleVote = async (type: 'like' | 'neutral' | 'dislike') => {
    if (loading) return
    setLoading(true)
    try {
      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scammerId, voteType: type }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error); return }
      setLikes(data.likeCount)
      setDislikes(data.dislikeCount)
      setNeutrals(data.neutralCount)
      setMyVote(data.voted ? data.voteType : null)
    } catch {
      toast.error('Ошибка')
    } finally {
      setLoading(false)
    }
  }

  const sz = large ? 'gap-2 px-3 py-2' : 'gap-1 px-2 py-1'
  const iconSz = large ? 'w-5 h-5' : 'w-3.5 h-3.5'
  const numSz = large ? 'text-sm font-bold' : 'text-[11px] font-semibold'
  const btnPad = large ? 'px-2.5 py-1.5' : 'px-2 py-1'

  return (
    <div className={`flex items-center ${sz}`}>
      <button
        onClick={(e) => { e.stopPropagation(); handleVote('like') }}
        className={`flex items-center gap-1 rounded-lg ${btnPad} transition-all ${
          myVote === 'like' ? 'text-green-600 dark:text-green-400 bg-green-500/10 dark:bg-green-500/20' : 'text-muted-foreground hover:text-green-600 dark:hover:text-green-400 hover:bg-green-500/10'
        } ${loading ? 'opacity-50' : ''}`}
      >
        <ThumbsUp className={iconSz} />
        <span className={numSz}>{likes}</span>
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); handleVote('neutral') }}
        className={`flex items-center gap-1 rounded-lg ${btnPad} transition-all ${
          myVote === 'neutral' ? 'text-yellow-600 dark:text-yellow-400 bg-yellow-500/10 dark:bg-yellow-500/20' : 'text-muted-foreground hover:text-yellow-600 dark:hover:text-yellow-400 hover:bg-yellow-500/10'
        } ${loading ? 'opacity-50' : ''}`}
      >
        <span className={`${iconSz} font-bold leading-none`}>~</span>
        <span className={numSz}>{neutrals}</span>
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); handleVote('dislike') }}
        className={`flex items-center gap-1 rounded-lg ${btnPad} transition-all ${
          myVote === 'dislike' ? 'text-red-600 dark:text-red-400 bg-red-500/10 dark:bg-red-500/20' : 'text-muted-foreground hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10'
        } ${loading ? 'opacity-50' : ''}`}
      >
        <ThumbsDown className={iconSz} />
        <span className={numSz}>{dislikes}</span>
      </button>
    </div>
  )
}

// ==================== COPY BUTTON ====================
function CopyButton({ text, label }: { text: string | (() => string); label?: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    const value = typeof text === 'function' ? text() : text
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      toast.success('Скопировано!')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Не удалось скопировать')
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="w-8 h-8 rounded-full bg-muted/60 hover:bg-secondary flex items-center justify-center transition-colors shrink-0"
      title={copied ? 'Скопировано!' : label || 'Скопировать'}
    >
      {copied ? (
        <Check className="w-3.5 h-3.5 text-green-400" />
      ) : (
        <Copy className="w-3.5 h-3.5 text-muted-foreground" />
      )}
    </button>
  )
}

// ==================== STATUS BADGE ====================
function StatusBadge({ status, size = 'md', color, textColor }: { status: string; size?: 'sm' | 'md'; color?: string; textColor?: string }) {
  const sizeClasses = size === 'sm' ? 'text-[10px] px-2 py-0' : 'text-xs px-2.5 py-0.5'
  const glowColor = color || '#ef4444'

  const style = color ? {
    backgroundColor: color + '22',
    color: textColor || color,
    borderColor: color + '55',
    boxShadow: `0 0 8px ${color}44, 0 0 16px ${color}22`,
  } : {
    boxShadow: '0 0 8px rgba(239,68,68,0.25), 0 0 16px rgba(239,68,68,0.12)',
  }

  const fallbackClasses = !color ? 'bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/30' : ''

  return (
    <span
      className={`${sizeClasses} rounded-full border font-semibold ${fallbackClasses} animate-pulse-slow`}
      style={style}
    >
      {status}
      <style>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.78; }
        }
        .animate-pulse-slow { animation: pulse-slow 2.5s ease-in-out infinite; }
      `}</style>
    </span>
  )
}

// ==================== BOTTOM NAV ====================
function BottomNav() {
  const { data: session } = useSession()
  const { activeTab, setActiveTab, setCreateModalOpen } = useAppStore()
  const isLogged = !!session

  const tabs = [
    { id: 'search' as const, icon: Search, label: 'Поиск' },
    { id: 'top10' as const, icon: TrendingUp, label: 'Топ-10' },
    ...(isLogged ? [{ id: 'plus' as const, icon: Plus, label: '' }] : []),
    { id: 'stats' as const, icon: BarChart3, label: 'Стат.' },
    { id: 'profile' as const, icon: User, label: 'Профиль' },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1">
      <div className="glassmorphism-nav rounded-2xl max-w-lg mx-auto">
        <nav className="flex items-center justify-around py-2">
          {tabs.map((tab) => {
            if (tab.id === 'plus') {
              return (
                <motion.button
                  key="plus"
                  whileTap={{ scale: 0.85 }}
                  onClick={() => setCreateModalOpen(true)}
                  className="relative -mt-5"
                >
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:shadow-xl transition-all duration-300 ring-1 ring-white/20 dark:ring-white/20 ring-inset">
                    <Plus className="w-7 h-7 text-white" strokeWidth={2.5} />
                  </div>
                </motion.button>
              )
            }

            const isActive = activeTab === tab.id
            const Icon = tab.icon

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-0.5 px-4 py-1 rounded-xl transition-all duration-300 ${
                  isActive ? 'text-blue-400' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className="relative"
                >
                  <Icon className="w-5 h-5" />
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-400"
                    />
                  )}
                </motion.div>
                <span className="text-[10px] font-medium">{tab.label}</span>
              </button>
            )
          })}
        </nav>
      </div>
    </div>
  )
}

// ==================== 3D TILT CHOICE DIALOG ====================
function TiltChoiceDialog({ onChoose }: { onChoose: (enabled: boolean) => void }) {
  const [preview3D, setPreview3D] = useState(true)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative z-10 w-full max-w-sm"
      >
        <div className="glass-strong rounded-3xl p-6 text-center">
          <div className="mb-5">
            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-2xl">✨</span>
            </div>
            <h3 className="text-xl font-bold mb-1">3D эффект карточек</h3>
            <p className="text-sm text-muted-foreground">Включить крутой 3D наклон карточек?</p>
          </div>

          {/* Live preview */}
          <div className="relative mb-5 p-3 rounded-2xl bg-gradient-to-b from-blue-50/40 to-gray-100/60 dark:from-blue-950/40 dark:to-gray-950/30">
            <motion.div
              key={preview3D ? '3d' : 'flat'}
              initial={{ scale: 0.92, opacity: 0.5 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            >
              <TiltCard
                enabled={preview3D}
                className="rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/10 backdrop-blur-md border border-border p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">S</div>
                  <div>
                    <p className="font-semibold text-sm">Пример карточки</p>
                    <p className="text-[10px] text-muted-foreground">Наведите чтобы увидеть</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  <span>123 поисков</span>
                  <span>•</span>
                  <span>45 лайков</span>
                </div>
              </TiltCard>
            </motion.div>
            <p className="text-[10px] text-muted-foreground/60 mt-2">
              {preview3D ? 'Наведите на карточку — 3D эффект активен' : 'Обычный вид без 3D'}
            </p>
          </div>

          {/* Toggle preview */}
          <button
            onClick={() => setPreview3D(!preview3D)}
            className="w-full mb-5 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-secondary transition-colors"
          >
            {preview3D ? 'Посмотреть без 3D' : 'Посмотреть с 3D'}
          </button>

          {/* Two choice buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => onChoose(false)}
              className="flex-1 py-3 rounded-xl border border-border text-sm font-medium hover:bg-secondary transition-all"
            >
              Без 3D
            </button>
            <button
              onClick={() => onChoose(true)}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-sm font-semibold hover:from-blue-700 hover:to-cyan-600 transition-all shadow-lg shadow-blue-500/20"
            >
              Включить 3D
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ==================== LOADING SPINNER ====================
function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
    </div>
  )
}

// ==================== MAIN APP ====================
export default function Home() {
  const { data: session, status } = useSession()
  const { activeTab, isCreateModalOpen, setCreateModalOpen, selectedScammer, setSelectedScammer, tiltEnabled, setTiltEnabled, tiltTop10, setTiltTop10, drunkMode, setDrunkMode } = useAppStore()
  const [showTiltChoice, setShowTiltChoice] = useState(false)

  // Drunk mode: toggle class on <html> — lives in Home so it persists across tabs
  useEffect(() => {
    if (drunkMode) {
      document.documentElement.classList.add('drunk-mode')
    } else {
      document.documentElement.classList.remove('drunk-mode')
    }
    return () => document.documentElement.classList.remove('drunk-mode')
  }, [drunkMode])

  // Load tilt preferences from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return
    const saved = localStorage.getItem('tiltEnabled')
    if (saved === null) {
      // First visit — show choice dialog
      setShowTiltChoice(true)
    } else {
      setTiltEnabled(saved === 'true')
    }
    const savedTop10 = localStorage.getItem('tiltTop10')
    if (savedTop10 !== null) {
      setTiltTop10(savedTop10 === 'true')
    }
  }, [setTiltEnabled, setTiltTop10])

  const handleTiltChoice = (enabled: boolean) => {
    setTiltEnabled(enabled)
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('tiltEnabled', String(enabled))
    }
    setShowTiltChoice(false)
  }

  if (status === 'loading') {
    return <LoadingSpinner />
  }

  return (
    <div className="min-h-screen relative">
      <main className="relative z-10 max-w-lg mx-auto pb-28 min-h-screen">
        <AnimatePresence mode="wait">
          {activeTab === 'search' && <SearchView key="search" />}
          {activeTab === 'top10' && <Top10View key="top10" />}
          {activeTab === 'stats' && <StatsView key="stats" />}
          {activeTab === 'profile' && <ProfileView key="profile" user={session?.user} />}
        </AnimatePresence>
      </main>
      <BottomNav />
      <AnimatePresence>
        {isCreateModalOpen && session?.user && <CreateModal key="create-modal" open={isCreateModalOpen} onClose={() => setCreateModalOpen(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {selectedScammer && <ScamerDetailModal key="detail-modal" scammer={selectedScammer} onClose={() => setSelectedScammer(null)} />}
      </AnimatePresence>
      {showTiltChoice && <TiltChoiceDialog onChoose={handleTiltChoice} />}
    </div>
  )
}
