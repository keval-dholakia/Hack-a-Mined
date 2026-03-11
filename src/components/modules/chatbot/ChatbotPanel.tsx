'use client'

import React, { useState, useRef, useEffect } from 'react'
import styles from './ChatbotPanel.module.scss'
import { askChatbot, uploadDocument } from '@/app/actions/chatbot'

type Message = {
  role: 'user' | 'bot'
  text: string
}

export default function ChatbotPanel({ roleId }: { roleId: number }) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'chat' | 'upload'>('chat')
  
  // Chat state
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', text: 'Hello! I am your AI assistant. Ask me anything about the company documents.' }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Upload state
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<{type: 'success' | 'error', msg: string} | null>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // --- Chat Handlers ---
  const handleChatParams = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isTyping) return

    const userMsg = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: userMsg }])
    setIsTyping(true)

    const res = await askChatbot(userMsg)
    
    setIsTyping(false)
    if (res.error) {
      setMessages(prev => [...prev, { role: 'bot', text: `Error: ${res.error}` }])
    } else {
      setMessages(prev => [...prev, { role: 'bot', text: res.reply || 'No response.' }])
    }
  }

  // --- Upload Handlers ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setUploadStatus(null)
    }
  }

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    setIsUploading(true)
    setUploadStatus(null)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('role_id', roleId.toString())

    const res = await uploadDocument(formData)
    
    setIsUploading(false)
    if (res.error) {
      setUploadStatus({ type: 'error', msg: res.error })
    } else {
      setUploadStatus({ type: 'success', msg: 'Document uploaded and indexed successfully!' })
      setFile(null)
    }
  }

  return (
    <div className={styles.panelContainer}>
      <button 
        className={`${styles.toggleBtn} ${isOpen ? styles.panelOpen : ''}`} 
        onClick={() => setIsOpen(!isOpen)}
        title={isOpen ? "Close AI Assistant" : "Open AI Assistant"}
      >
        {isOpen ? '◀' : '▶'} AI Chat
      </button>

      <div className={`${styles.panel} ${isOpen ? styles.open : ''}`}>
        <div className={styles.header}>
          <button 
            className={activeTab === 'chat' ? styles.active : ''}
            onClick={() => setActiveTab('chat')}
          >
            Chat
          </button>
          <button 
            className={activeTab === 'upload' ? styles.active : ''}
            onClick={() => setActiveTab('upload')}
          >
            Upload Docs
          </button>
        </div>

        <div className={styles.content}>
          {activeTab === 'chat' && (
            <>
              <div className={styles.messageList}>
                {messages.map((m, i) => (
                  <div key={i} className={`${styles.message} ${styles[m.role]}`}>
                    {m.text}
                  </div>
                ))}
                {isTyping && (
                  <div className={`${styles.message} ${styles.bot}`}>
                    Typing...
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              <form className={styles.inputForm} onSubmit={handleChatParams}>
                <input 
                  type="text" 
                  value={input} 
                  onChange={e => setInput(e.target.value)} 
                  placeholder="Ask a question..."
                  disabled={isTyping}
                />
                <button type="submit" disabled={isTyping || !input.trim()}>
                  Send
                </button>
              </form>
            </>
          )}

          {activeTab === 'upload' && (
            <form className={styles.uploadForm} onSubmit={handleUploadSubmit}>
              <div className={styles.fileInput}>
                <label>
                  <input 
                    type="file" 
                    accept=".pdf,.txt" 
                    onChange={handleFileChange}
                    disabled={isUploading}
                  />
                  <span>Click to select PDF or TXT file</span>
                  {file && <span className={styles.fileSelected}>{file.name}</span>}
                </label>
              </div>

              <button type="submit" disabled={!file || isUploading}>
                {isUploading ? 'Processing & Indexing...' : 'Upload & Index Document'}
              </button>

              {uploadStatus && (
                <div className={`${styles.status} ${styles[uploadStatus.type]}`}>
                  {uploadStatus.msg}
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
