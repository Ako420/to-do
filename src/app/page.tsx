'use client'

import { useEffect, useState, Suspense } from 'react'
import  supabase  from './lib/config/supabaseclient'
import TodoList from './components/TodoList'
import TodoForm from './components/TodoForm'
import AuthForm from './components/AuthForm'
import { motion, AnimatePresence } from 'framer-motion'
import { FiPlus, FiRefreshCw, FiUser, FiLogOut,} from 'react-icons/fi'
import Image from 'next/image'
import ThemeToggle from './components/ThemeToggle'

export default function HomePage() {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const [user, setUser] = useState<any>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingTodo, setEditingTodo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [authView, setAuthView] = useState<'login' | 'signup' | null>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    getUser()

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event,session) => {
        setUser(session?.user ?? null)
        setLoading(false)
        if (session?.user) {
          setAuthView(null) // Close auth form when user logs in
        }
      }
    )

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const handleEditTodo = (todo: any) => {
    setEditingTodo(todo)
    setShowForm(true)
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingTodo(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <FiRefreshCw className="animate-spin text-4xl text-blue-500" />
      </div>
    )
  }

  return (
    <div className=" dark:bg-gradient-to-br dark:from-black/25 dark:to-black  min-h-screen bg-gradient-to-br from-purple-50 to-blue-100">
      {/* Navigation */}
      <nav className="bg-white/80 dark:bg-black dark:text-white/80 backdrop-blur-sm border-b border-white/20 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 relative">
                <Image
                  src="/logo.svg"
                  alt="Todo App Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-xl hidden md:block font-bold dark:text-white/80 text-gray-800">TodoApp</span>
            </div>

            <div className="flex items-center gap-4">
              {/* <ThemeToggle /> */}
              {user ? (
                <>
                  <div className="flex items-center gap-2 dark:text-white/50 text-gray-700">
                    <FiUser className="text-lg" />
                    <span className="hidden sm:inline">{user.email}</span>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                  >
                    <FiLogOut />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <div className="flex gap-4">
                  <button
                    onClick={() => setAuthView('login')}
                    className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => setAuthView('signup')}
                    className="px-4 py-2 rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition-colors"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <AnimatePresence>
          {/* Show auth form if user is not logged in */}
          {!user && authView && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="max-w-md mx-auto mb-8"
            >
              <AuthForm 
                view={authView} 
                onSuccess={() => setAuthView(null)}
                onViewChange={setAuthView}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Show todo app if user is logged in */}
        {user ? (
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl font-bold dark:text-white text-gray-800"
              >
                My Tasks
              </motion.h1>
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <FiPlus />
                Add Task
              </motion.button>
            </div>

            <AnimatePresence>
              {(showForm || editingTodo) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-8"
                >
                  <TodoForm 
                    onSuccess={handleFormSuccess} 
                    editingTodo={editingTodo}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <Suspense fallback={
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 shadow border border-white/20 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            }>
              <TodoList onEdit={handleEditTodo} />
            </Suspense>
          </div>
        ) : (
          // Show welcome message when not logged in and no auth form is open
          !authView && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-md mx-auto text-center"
            >
              <div className="mx-auto h-64 w-64 relative mb-8">
                <Image
                  src="/welcome.svg"
                  alt="Welcome Illustration"
                  fill
                  className="object-contain"
                />
              </div>
              <h1 className="text-3xl font-bold dark:text-white text-gray-800 mb-4">
                Welcome to Todo App
              </h1>
              <p className="text-gray-600 dark:text-white/60 mb-8">
                Please sign in or create an account to start managing your tasks
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setAuthView('login')}
                  className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Sign In
                </button>
                <button
                  onClick={() => setAuthView('signup')}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Sign Up
                </button>
              </div>
            </motion.div>
          )
        )}
      </main>
    </div>
  )
}