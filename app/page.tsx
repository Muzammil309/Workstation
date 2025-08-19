"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { LoginForm } from '@/components/auth/login-form'
import { SignupForm } from '@/components/auth/signup-form'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { Rocket, Zap, Target, Users, BarChart3, Clock, ArrowRight, CheckCircle, Globe, Lightbulb, TrendingUp } from 'lucide-react'


export default function HomePage() {
  const [isLogin, setIsLogin] = useState(true)

  const features = [
    {
      icon: Lightbulb,
      title: "Strategic Consulting",
      description: "Expert guidance for organizational transformation"
    },
    {
      icon: TrendingUp,
      title: "Change Management",
      description: "Proven methodologies for successful transitions"
    },
    {
      icon: Globe,
      title: "Digital Transformation",
      description: "Modernize operations with cutting-edge technology"
    },
    {
      icon: Target,
      title: "Process Optimization",
      description: "Streamline workflows and boost efficiency"
    },
    {
      icon: Users,
      title: "Team Development",
      description: "Build high-performing, adaptive teams"
    },
    {
      icon: CheckCircle,
      title: "Quality Assurance",
      description: "Ensure excellence in every implementation"
    }
  ]



  return (
    <div className="min-h-screen gradient-bg relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-neon-blue/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-neon-purple/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-neon-pink/10 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 p-6">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center space-x-3"
          >
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold text-black">cm</div>
              <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
            </div>
            <span className="text-2xl font-bold gradient-text">Change Mechanics</span>
          </motion.div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                <span className="text-white">Transform Your</span>
                <br />
                <span className="gradient-text">Organization</span>
              </h1>
              <p className="text-xl text-gray-300 leading-relaxed">
                Empowering organizations through strategic change management, digital transformation, 
                and innovative business solutions. Drive sustainable growth and operational excellence.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="glass-card rounded-lg p-4 hover:neon-glow transition-all duration-300"
                >
                  <feature.icon className="w-6 h-6 text-neon-blue mb-2" />
                  <h3 className="font-semibold text-white text-sm">{feature.title}</h3>
                  <p className="text-gray-400 text-xs">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Side - Auth Forms */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex justify-center"
          >
            <div className="w-full max-w-md">
              <div className="glass-card rounded-2xl p-8 backdrop-blur-xl">
                {/* Auth Tabs */}
                <div className="flex space-x-1 mb-8 bg-gray-800/50 rounded-lg p-1">
                  <button
                    onClick={() => setIsLogin(true)}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                      isLogin
                        ? 'bg-neon-blue text-white shadow-lg'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Client Portal
                  </button>
                  <button
                    onClick={() => setIsLogin(false)}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                      !isLogin
                        ? 'bg-neon-blue text-white shadow-lg'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Request Consultation
                  </button>
                </div>

                {/* Auth Forms */}
                <motion.div
                  key={isLogin ? 'login' : 'signup'}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {isLogin ? <LoginForm /> : <SignupForm />}
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Call to Action Section */}
      <section className="relative z-10 py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Ready to Transform Your Organization?
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Join leading organizations that have already experienced the Change Mechanics difference. 
              Let's discuss how we can help you achieve your transformation goals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" variant="neon" className="text-lg px-8 py-4">
                Schedule Free Consultation
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-4">
                Download Brochure
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-8 text-center text-gray-400">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div className="text-left">
              <div className="flex items-center space-x-2 mb-4">
                <div className="text-xl font-bold text-white">cm</div>
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              </div>
              <p className="text-sm">
                Empowering organizations through strategic change management and digital transformation.
              </p>
            </div>
            <div className="text-left">
              <h4 className="font-semibold text-white mb-3">Services</h4>
              <ul className="text-sm space-y-2">
                <li>Strategic Consulting</li>
                <li>Change Management</li>
                <li>Digital Transformation</li>
                <li>Process Optimization</li>
              </ul>
            </div>
            <div className="text-left">
              <h4 className="font-semibold text-white mb-3">Contact</h4>
              <p className="text-sm">www.changemechanics.pk</p>
              <p className="text-sm">info@changemechanics.pk</p>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-6">
            <p>&copy; 2024 Change Mechanics. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
