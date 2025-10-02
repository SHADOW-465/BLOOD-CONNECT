import React, { useState } from 'react'
import { Send, Search, MoreVertical, Phone, Video, Info, Paperclip, Smile } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const Messages = () => {
  const { user } = useAuth()
  const [selectedChat, setSelectedChat] = useState(1)
  const [newMessage, setNewMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const mockChats = [
    {
      id: 1,
      name: 'Dr. Sarah Wilson',
      role: 'Blood Bank Coordinator',
      avatar: 'SW',
      lastMessage: 'Your blood donation appointment is confirmed for tomorrow at 10 AM.',
      timestamp: '2024-02-14T15:30:00',
      unread: 2,
      online: true,
      type: 'medical'
    },
    {
      id: 2,
      name: 'Metro General Support',
      role: 'Blood Bank',
      avatar: 'MG',
      lastMessage: 'Thank you for your donation! We have processed your request.',
      timestamp: '2024-02-14T12:15:00',
      unread: 0,
      online: false,
      type: 'support'
    },
    {
      id: 3,
      name: 'Emergency Response Team',
      role: 'BloodConnect',
      avatar: 'ER',
      lastMessage: 'Urgent: O- blood needed at City Hospital. Can you help?',
      timestamp: '2024-02-14T10:45:00',
      unread: 1,
      online: true,
      type: 'emergency'
    },
    {
      id: 4,
      name: 'Mike Chen',
      role: 'Donor',
      avatar: 'MC',
      lastMessage: 'Thanks for connecting me with the blood bank!',
      timestamp: '2024-02-13T18:20:00',
      unread: 0,
      online: false,
      type: 'donor'
    }
  ]

  const mockMessages = {
    1: [
      {
        id: 1,
        sender: 'Dr. Sarah Wilson',
        content: 'Hello John! Thank you for scheduling your blood donation appointment.',
        timestamp: '2024-02-14T14:00:00',
        isOwn: false
      },
      {
        id: 2,
        sender: 'You',
        content: 'Hi Dr. Wilson! Happy to help. What time should I arrive?',
        timestamp: '2024-02-14T14:05:00',
        isOwn: true
      },
      {
        id: 3,
        sender: 'Dr. Sarah Wilson',
        content: 'Please arrive 15 minutes before your scheduled time at 10 AM. This will give us time for the pre-donation screening.',
        timestamp: '2024-02-14T14:10:00',
        isOwn: false
      },
      {
        id: 4,
        sender: 'You',
        content: 'Perfect! Should I eat anything specific beforehand?',
        timestamp: '2024-02-14T14:12:00',
        isOwn: true
      },
      {
        id: 5,
        sender: 'Dr. Sarah Wilson',
        content: 'Yes! Please make sure to eat a good meal and stay hydrated. Avoid fatty foods for 24 hours before donation.',
        timestamp: '2024-02-14T14:15:00',
        isOwn: false
      },
      {
        id: 6,
        sender: 'Dr. Sarah Wilson',
        content: 'Your blood donation appointment is confirmed for tomorrow at 10 AM. See you then!',
        timestamp: '2024-02-14T15:30:00',
        isOwn: false
      }
    ]
  }

  const selectedChatData = mockChats.find(chat => chat.id === selectedChat)
  const messages = mockMessages[selectedChat] || []

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const formatLastMessageTime = (timestamp) => {
    const now = new Date()
    const msgTime = new Date(timestamp)
    const diffInHours = (now - msgTime) / (1000 * 60 * 60)
    
    if (diffInHours < 24) {
      return formatTime(timestamp)
    } else {
      return msgTime.toLocaleDateString()
    }
  }

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return
    
    console.log('Sending message:', newMessage)
    setNewMessage('')
  }

  const getChatTypeColor = (type) => {
    switch (type) {
      case 'emergency': return 'bg-red-500'
      case 'medical': return 'bg-blue-500'
      case 'support': return 'bg-green-500'
      case 'donor': return 'bg-purple-500'
      default: return 'bg-gray-500'
    }
  }

  const filteredChats = mockChats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="h-screen bg-gray-50 flex">
      {/* Chat List */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-900">Messages</h1>
          <div className="mt-3 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {filteredChats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => setSelectedChat(chat.id)}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                selectedChat === chat.id ? 'bg-primary-50 border-primary-200' : ''
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="relative">
                  <div className={`h-12 w-12 ${getChatTypeColor(chat.type)} text-white rounded-full flex items-center justify-center font-semibold`}>
                    {chat.avatar}
                  </div>
                  {chat.online && (
                    <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-400 border-2 border-white rounded-full"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">
                      {chat.name}
                    </h3>
                    <span className="text-xs text-gray-500">
                      {formatLastMessageTime(chat.timestamp)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-1">{chat.role}</p>
                  <p className="text-sm text-gray-600 truncate">{chat.lastMessage}</p>
                  {chat.unread > 0 && (
                    <div className="mt-1">
                      <span className="inline-flex items-center justify-center h-5 w-5 bg-primary-600 text-white text-xs rounded-full">
                        {chat.unread}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      {selectedChatData ? (
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className={`h-10 w-10 ${getChatTypeColor(selectedChatData.type)} text-white rounded-full flex items-center justify-center font-semibold`}>
                  {selectedChatData.avatar}
                </div>
                {selectedChatData.online && (
                  <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-400 border-2 border-white rounded-full"></div>
                )}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{selectedChatData.name}</h2>
                <p className="text-sm text-gray-600">
                  {selectedChatData.role} • {selectedChatData.online ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                <Phone className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                <Video className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                <Info className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                <MoreVertical className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.isOwn
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-900'
                }`}>
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.isOwn ? 'text-primary-100' : 'text-gray-500'
                  }`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="bg-white border-t border-gray-200 p-4">
            <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
              <button
                type="button"
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <Paperclip className="h-5 w-5" />
              </button>
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                >
                  <Smile className="h-5 w-5" />
                </button>
              </div>
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="p-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="h-24 w-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a conversation</h3>
            <p className="text-gray-600">Choose a conversation from the sidebar to start messaging</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default Messages