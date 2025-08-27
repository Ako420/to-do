
'use client'

import { useEffect, useState } from 'react'
import  supabase  from '../lib/config/supabaseclient'
import TodoItem from './TodoItem'
import { motion, AnimatePresence } from 'framer-motion'
import { FiInbox, FiFilter } from 'react-icons/fi'

interface Todo {
  id: string
  title: string
  description: string | null
  is_complete: boolean
  inserted_at: string
  priority: 'low' | 'medium' | 'high'
  status: 'pending' | 'in-progress' | 'completed'
}

interface TodoListProps {
  onEdit: (todo: Todo) => void
}

export default function TodoList({ onEdit }: TodoListProps) {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'in-progress' | 'completed'>('all')

  useEffect(() => {
    fetchTodos()
    
    // Set up real-time subscription
    const subscription = supabase
      .channel('todos-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'todos',
        },
        (payload) => {
          // Handle real-time updates
          if (payload.eventType === 'INSERT') {
            setTodos(prev => [payload.new as Todo, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setTodos(prev => prev.map(todo => 
              todo.id === payload.new.id ? payload.new as Todo : todo
            ))
          } else if (payload.eventType === 'DELETE') {
            setTodos(prev => prev.filter(todo => todo.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const fetchTodos = async () => {
    try {
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .order('inserted_at', { ascending: false })

      if (error) throw error
      setTodos(data || [])
    } catch (error) {
      console.error('Error fetching todos:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredTodos = todos.filter(todo => {
    if (filter === 'all') return true
    return todo.status === filter
  })

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 shadow border border-white/20 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    )
  }

  if (todos.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-12 text-center"
      >
        <FiInbox className="text-4xl text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-700 mb-2">No tasks yet</h3>
        <p className="text-gray-500">Get started by creating your first task!</p>
      </motion.div>
    )
  }

  return (
    <div>
      {/* Filter controls */}
      <div className="flex items-center gap-2 mb-6">
        <FiFilter className="text-gray-500" />
        <span className="text-sm text-gray-600 mr-2">Filter:</span>
        {(['all', 'pending', 'in-progress', 'completed'] as const).map((option) => (
          <button
            key={option}
            onClick={() => setFilter(option)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              filter === option
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {option.charAt(0).toUpperCase() + option.slice(1)}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {filteredTodos.map((todo) => (
            <motion.div
              key={todo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <TodoItem todo={todo} onEdit={onEdit} />
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredTodos.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8 text-gray-500"
          >
            No {filter !== 'all' ? filter : ''} tasks found.
          </motion.div>
        )}
      </div>
    </div>
  )
}