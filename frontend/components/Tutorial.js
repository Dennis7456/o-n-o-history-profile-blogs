import { useState, useEffect } from 'react'
import { X, ChevronLeft, ChevronRight, Play, CheckCircle } from 'lucide-react'

const tutorialSteps = [
  {
    id: 'welcome',
    title: 'Welcome to Kennedy Ogeto CMS',
    content: 'This tutorial will guide you through the main features of the content management system.',
    target: null,
    action: null
  },
  {
    id: 'create-post',
    title: 'Creating a New Blog Post',
    content: 'Click the "New Post" button to create a new legal case or article. Fill in all the required fields including title, category, and content.',
    target: '[href="/admin/blog/create"]',
    action: 'highlight'
  },
  {
    id: 'edit-post',
    title: 'Editing Blog Posts',
    content: 'Use the edit icon (pencil) next to any blog post to modify its content. You can update all fields and save changes.',
    target: '[title="Edit Post"]',
    action: 'highlight'
  },
  {
    id: 'archive-post',
    title: 'Archiving Posts',
    content: 'Use the archive icon to hide posts from the public without deleting them. Archived posts can be restored later.',
    target: '[title="Archive Post"]',
    action: 'highlight'
  },
  {
    id: 'view-post',
    title: 'Viewing Posts',
    content: 'Click the eye icon to view how the post appears to the public on the website.',
    target: '[title="View Post"]',
    action: 'highlight'
  },
  {
    id: 'profile-management',
    title: 'Profile Management',
    content: 'Update Kennedy Ogeto\'s professional information, education, and career details in the Profile section.',
    target: '[href="/admin/profile"]',
    action: 'highlight'
  },
  {
    id: 'sync-check',
    title: 'Ensuring Data Accuracy',
    content: 'Always verify that changes in the admin panel are reflected on the public website. Use the "View Post" feature to check.',
    target: null,
    action: null
  },
  {
    id: 'complete',
    title: 'Tutorial Complete!',
    content: 'You\'re now ready to manage the Kennedy Ogeto CMS. Remember to regularly check that your changes appear correctly on the public site.',
    target: null,
    action: null
  }
]

export default function Tutorial({ isOpen, onClose, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [highlightedElement, setHighlightedElement] = useState(null)

  useEffect(() => {
    if (isOpen && tutorialSteps[currentStep]?.target) {
      const element = document.querySelector(tutorialSteps[currentStep].target)
      if (element) {
        setHighlightedElement(element)
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        element.classList.add('tutorial-highlight')
      }
    }

    return () => {
      if (highlightedElement) {
        highlightedElement.classList.remove('tutorial-highlight')
      }
    }
  }, [currentStep, isOpen, highlightedElement])

  const nextStep = () => {
    if (highlightedElement) {
      highlightedElement.classList.remove('tutorial-highlight')
    }
    
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      completeTutorial()
    }
  }

  const prevStep = () => {
    if (highlightedElement) {
      highlightedElement.classList.remove('tutorial-highlight')
    }
    
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const completeTutorial = () => {
    if (highlightedElement) {
      highlightedElement.classList.remove('tutorial-highlight')
    }
    
    // Mark tutorial as completed in localStorage
    localStorage.setItem('ogetto_tutorial_completed', 'true')
    onComplete?.()
    onClose()
  }

  const skipTutorial = () => {
    if (highlightedElement) {
      highlightedElement.classList.remove('tutorial-highlight')
    }
    
    localStorage.setItem('ogetto_tutorial_skipped', 'true')
    onClose()
  }

  if (!isOpen) return null

  const step = tutorialSteps[currentStep]
  const isLastStep = currentStep === tutorialSteps.length - 1

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" />
      
      {/* Tutorial Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center">
              <div className="bg-primary-100 p-2 rounded-full mr-3">
                <Play className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-500">
                  Step {currentStep + 1} of {tutorialSteps.length}
                </p>
              </div>
            </div>
            <button
              onClick={skipTutorial}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-gray-700 leading-relaxed">
              {step.content}
            </p>

            {/* Progress Bar */}
            <div className="mt-6">
              <div className="flex justify-between text-sm text-gray-500 mb-2">
                <span>Progress</span>
                <span>{Math.round(((currentStep + 1) / tutorialSteps.length) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t bg-gray-50">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </button>

            <div className="flex space-x-2">
              {tutorialSteps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index <= currentStep ? 'bg-primary-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            {isLastStep ? (
              <button
                onClick={completeTutorial}
                className="flex items-center bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Complete
              </button>
            ) : (
              <button
                onClick={nextStep}
                className="flex items-center text-primary-600 hover:text-primary-700"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tutorial Styles */}
      <style jsx global>{`
        .tutorial-highlight {
          position: relative;
          z-index: 45;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5), 0 0 0 8px rgba(59, 130, 246, 0.2);
          border-radius: 4px;
          animation: tutorial-pulse 2s infinite;
        }

        @keyframes tutorial-pulse {
          0%, 100% {
            box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5), 0 0 0 8px rgba(59, 130, 246, 0.2);
          }
          50% {
            box-shadow: 0 0 0 6px rgba(59, 130, 246, 0.7), 0 0 0 12px rgba(59, 130, 246, 0.3);
          }
        }
      `}</style>
    </>
  )
}