'use client'

import { motion } from 'framer-motion'
import { FiAlertTriangle, FiCheck } from 'react-icons/fi'


interface DeleteConfirmationProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
}

export default function DeleteConfirmation({
  isOpen,
  onClose,
  onConfirm,
  title,
}: DeleteConfirmationProps) {
  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white/90 backdrop-blur-md rounded-2xl p-6 max-w-md w-full shadow-xl border border-white/20"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-100 rounded-full">
            <FiAlertTriangle className="text-red-600 text-xl" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Confirm Delete</h3>
        </div>
        
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete <span className="font-medium">{title}</span>?
        </p>
        
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center gap-2 transition-colors"
          >
            <FiCheck size={16} />
            Delete
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}