import React, { useState } from 'react'
import { Book, Play, Download, Clock, Users, Heart, AlertCircle, CheckCircle } from 'lucide-react'

const Education = () => {
  const [activeTab, setActiveTab] = useState('getting-started')

  const educationalContent = {
    'getting-started': {
      title: 'Getting Started',
      articles: [
        {
          id: 1,
          title: 'Your First Blood Donation: What to Expect',
          description: 'A comprehensive guide for first-time donors covering the entire donation process.',
          readTime: '8 min read',
          category: 'Beginner',
          image: 'https://images.pexels.com/photos/6823568/pexels-photo-6823568.jpeg',
          content: 'Learn everything you need to know about your first blood donation experience...'
        },
        {
          id: 2,
          title: 'Eligibility Requirements for Blood Donation',
          description: 'Understand who can donate blood and what factors might affect your eligibility.',
          readTime: '5 min read',
          category: 'Beginner',
          image: 'https://images.pexels.com/photos/6823553/pexels-photo-6823553.jpeg',
          content: 'Discover the basic requirements and health guidelines for blood donation...'
        },
        {
          id: 3,
          title: 'Preparing for Your Donation',
          description: 'Tips and guidelines on how to prepare yourself before donating blood.',
          readTime: '6 min read',
          category: 'Beginner',
          image: 'https://images.pexels.com/photos/6823564/pexels-photo-6823564.jpeg',
          content: 'Follow these essential preparation steps for a successful donation...'
        }
      ]
    },
    'health-safety': {
      title: 'Health & Safety',
      articles: [
        {
          id: 4,
          title: 'Blood Safety and Testing Procedures',
          description: 'Learn about the rigorous testing and safety measures in place for donated blood.',
          readTime: '10 min read',
          category: 'Safety',
          image: 'https://images.pexels.com/photos/6823572/pexels-photo-6823572.jpeg',
          content: 'Understand the comprehensive safety protocols that protect donors and recipients...'
        },
        {
          id: 5,
          title: 'Post-Donation Care and Recovery',
          description: 'Essential information about caring for yourself after blood donation.',
          readTime: '7 min read',
          category: 'Health',
          image: 'https://images.pexels.com/photos/6823569/pexels-photo-6823569.jpeg',
          content: 'Follow these guidelines to ensure proper recovery after your donation...'
        },
        {
          id: 6,
          title: 'Common Side Effects and When to Seek Help',
          description: 'Understand normal reactions and when to contact medical professionals.',
          readTime: '6 min read',
          category: 'Safety',
          image: 'https://images.pexels.com/photos/6823570/pexels-photo-6823570.jpeg',
          content: 'Recognize normal donation reactions versus situations requiring medical attention...'
        }
      ]
    },
    'blood-types': {
      title: 'Blood Types & Compatibility',
      articles: [
        {
          id: 7,
          title: 'Understanding Blood Types: ABO and Rh Systems',
          description: 'A complete guide to blood group systems and genetic inheritance.',
          readTime: '12 min read',
          category: 'Science',
          image: 'https://images.pexels.com/photos/6823576/pexels-photo-6823576.jpeg',
          content: 'Explore the science behind blood types and compatibility matching...'
        },
        {
          id: 8,
          title: 'Universal Donors and Recipients',
          description: 'Learn about O-negative universal donors and AB-positive universal recipients.',
          readTime: '8 min read',
          category: 'Science',
          image: 'https://images.pexels.com/photos/6823577/pexels-photo-6823577.jpeg',
          content: 'Discover why certain blood types are called universal and their importance...'
        },
        {
          id: 9,
          title: 'Blood Compatibility Chart and Transfusion Rules',
          description: 'Visual guide to safe blood transfusion compatibility.',
          readTime: '5 min read',
          category: 'Reference',
          image: 'https://images.pexels.com/photos/6823574/pexels-photo-6823574.jpeg',
          content: 'Reference chart showing which blood types can safely donate to others...'
        }
      ]
    },
    'impact-stories': {
      title: 'Impact Stories',
      articles: [
        {
          id: 10,
          title: 'Sarah\'s Story: How Blood Donation Saved My Life',
          description: 'A personal account from a blood recipient about the importance of donation.',
          readTime: '10 min read',
          category: 'Personal Story',
          image: 'https://images.pexels.com/photos/6823575/pexels-photo-6823575.jpeg',
          content: 'Read Sarah\'s inspiring story of survival thanks to blood donors...'
        },
        {
          id: 11,
          title: 'The Ripple Effect: One Donation, Multiple Lives',
          description: 'Discover how a single blood donation can help save up to three lives.',
          readTime: '8 min read',
          category: 'Impact',
          image: 'https://images.pexels.com/photos/6823571/pexels-photo-6823571.jpeg',
          content: 'Learn about the far-reaching impact of your generous donation...'
        },
        {
          id: 12,
          title: 'Community Heroes: Local Donors Making a Difference',
          description: 'Meet regular blood donors and learn about their motivation to help others.',
          readTime: '12 min read',
          category: 'Community',
          image: 'https://images.pexels.com/photos/6823573/pexels-photo-6823573.jpeg',
          content: 'Inspiring stories from dedicated blood donors in your community...'
        }
      ]
    }
  }

  const quickFacts = [
    {
      icon: Heart,
      title: 'Every 2 seconds',
      description: 'Someone in the US needs blood',
      color: 'text-red-600 bg-red-100'
    },
    {
      icon: Users,
      title: '6.8 million',
      description: 'People donate blood annually in the US',
      color: 'text-blue-600 bg-blue-100'
    },
    {
      icon: AlertCircle,
      title: 'Only 3%',
      description: 'Of eligible Americans donate blood',
      color: 'text-yellow-600 bg-yellow-100'
    },
    {
      icon: CheckCircle,
      title: '1 donation',
      description: 'Can save up to 3 lives',
      color: 'text-green-600 bg-green-100'
    }
  ]

  const bloodTypeCompatibility = {
    'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
    'O+': ['O+', 'A+', 'B+', 'AB+'],
    'A-': ['A-', 'A+', 'AB-', 'AB+'],
    'A+': ['A+', 'AB+'],
    'B-': ['B-', 'B+', 'AB-', 'AB+'],
    'B+': ['B+', 'AB+'],
    'AB-': ['AB-', 'AB+'],
    'AB+': ['AB+']
  }

  const faqs = [
    {
      question: 'How often can I donate blood?',
      answer: 'You can donate whole blood every 56 days (8 weeks). For platelets, you can donate every 7 days up to 24 times per year.'
    },
    {
      question: 'What should I eat before donating?',
      answer: 'Eat a healthy meal within 3 hours of donation. Include iron-rich foods like red meat, fish, poultry, beans, spinach, and iron-fortified cereals.'
    },
    {
      question: 'How long does the donation process take?',
      answer: 'The entire process takes about 60 minutes. The actual blood collection takes 8-10 minutes.'
    },
    {
      question: 'Can I donate if I have tattoos or piercings?',
      answer: 'Yes, but you must wait 3 months after getting a tattoo or piercing from an unregulated facility. Licensed facilities require no waiting period.'
    },
    {
      question: 'What happens if I feel dizzy during donation?',
      answer: 'Let the staff know immediately. They will stop the donation, have you lie down, and provide fluids and snacks until you feel better.'
    }
  ]

  const tabs = [
    { id: 'getting-started', name: 'Getting Started' },
    { id: 'health-safety', name: 'Health & Safety' },
    { id: 'blood-types', name: 'Blood Types' },
    { id: 'impact-stories', name: 'Impact Stories' }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Blood Donation Education</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Learn everything you need to know about blood donation, from basic eligibility to the life-saving impact of your contribution.
          </p>
        </div>

        {/* Quick Facts */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {quickFacts.map((fact, index) => (
            <div key={index} className="card p-6 text-center">
              <div className={`inline-flex items-center justify-center h-12 w-12 rounded-lg mb-4 ${fact.color}`}>
                <fact.icon className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{fact.title}</h3>
              <p className="text-gray-600">{fact.description}</p>
            </div>
          ))}
        </div>

        {/* Content Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content Articles */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {educationalContent[activeTab].articles.map((article) => (
            <div key={article.id} className="card overflow-hidden hover:shadow-lg transition-shadow">
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="bg-primary-100 text-primary-600 text-xs px-3 py-1 rounded-full">
                    {article.category}
                  </span>
                  <div className="flex items-center text-gray-500 text-sm">
                    <Clock className="h-4 w-4 mr-1" />
                    {article.readTime}
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{article.title}</h3>
                <p className="text-gray-600 mb-4">{article.description}</p>
                <div className="flex items-center justify-between">
                  <button className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center">
                    <Book className="h-4 w-4 mr-1" />
                    Read Article
                  </button>
                  <button className="text-gray-400 hover:text-gray-600">
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Blood Type Compatibility Chart (only show on blood-types tab) */}
        {activeTab === 'blood-types' && (
          <div className="card p-6 mb-12">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Blood Type Compatibility Chart</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Blood Type</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-900">Can Donate To</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(bloodTypeCompatibility).map(([donor, recipients]) => (
                    <tr key={donor} className="border-b border-gray-100">
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-sm mr-3">
                            {donor}
                          </div>
                          <span className="font-medium">{donor}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-2 justify-center">
                          {recipients.map((recipient) => (
                            <span
                              key={recipient}
                              className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm"
                            >
                              {recipient}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* FAQ Section */}
        <div className="card p-6 mb-12">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Frequently Asked Questions</h3>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                <h4 className="font-semibold text-gray-900 mb-2">{faq.question}</h4>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-primary-600 rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Ready to Make a Difference?</h3>
          <p className="text-primary-100 mb-6 max-w-2xl mx-auto">
            Now that you're informed about blood donation, take the next step and schedule your appointment. 
            Your donation could save up to three lives.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <button className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Schedule Donation
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors">
              Find Blood Banks
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Education