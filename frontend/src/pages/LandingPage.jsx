import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { Video, Users, Shield, Zap, MessageSquare, Monitor, Sparkles, Lock, Clock, ArrowRight } from "lucide-react"

export default function LandingPage() {
  const navigate = useNavigate()
  const [scrollY, setScrollY] = useState(0)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener('scroll', handleScroll)
    window.addEventListener('mousemove', handleMouseMove)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  const features = [
    {
      icon: <Video className="w-8 h-8" />,
      title: "Crystal Clear HD Video",
      description: "Experience flawless video quality with adaptive bitrate streaming up to 1080p"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Unlimited Participants",
      description: "Host meetings with unlimited participants without any restrictions"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "End-to-End Encryption",
      description: "Military-grade encryption ensures your conversations stay private and secure"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Lightning Fast",
      description: "Ultra-low latency with WebRTC technology for real-time communication"
    },
    {
      icon: <MessageSquare className="w-8 h-8" />,
      title: "Real-time Chat",
      description: "Instant messaging with file sharing and emoji reactions during calls"
    },
    {
      icon: <Monitor className="w-8 h-8" />,
      title: "Screen Sharing",
      description: "Share your entire screen or specific windows with one click"
    }
  ]

  const stats = [
    { value: "100K+", label: "Active Users" },
    { value: "500K+", label: "Meetings Hosted" },
    { value: "99.9%", label: "Uptime SLA" },
    { value: "150+", label: "Countries" }
  ]

  return (
    <div className="min-h-screen bg-white text-gray-900 relative overflow-hidden">
      {/* Animated cursor follower - Gray gradient */}
      <div 
        className="fixed w-96 h-96 bg-gray-200/30 rounded-full blur-3xl pointer-events-none transition-all duration-1000 ease-out z-0"
        style={{
          left: mousePosition.x - 192,
          top: mousePosition.y - 192,
        }}
      />

      {/* Floating geometric shapes */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div 
          className="absolute w-64 h-64 border-2 border-gray-200 rounded-full"
          style={{
            top: '10%',
            left: '5%',
            transform: `translateY(${scrollY * 0.2}px) rotate(${scrollY * 0.1}deg)`
          }}
        />
        <div 
          className="absolute w-48 h-48 border-2 border-gray-300"
          style={{
            top: '60%',
            right: '10%',
            transform: `translateY(${scrollY * -0.15}px) rotate(${scrollY * -0.1}deg)`
          }}
        />
        <div 
          className="absolute w-32 h-32 bg-gradient-to-br from-gray-100 to-transparent rounded-2xl"
          style={{
            top: '30%',
            right: '20%',
            transform: `translateY(${scrollY * 0.3}px) rotate(${scrollY * 0.15}deg)`
          }}
        />
      </div>

      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-xl border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
              <Video className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-black">
              MeetHub
            </span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-600 hover:text-black transition-colors font-medium">Features</a>
            <a href="#pricing" className="text-gray-600 hover:text-black transition-colors font-medium">Pricing</a>
            <a href="#about" className="text-gray-600 hover:text-black transition-colors font-medium">About</a>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/login")}
              className="px-6 py-2.5 text-black hover:bg-gray-100 rounded-lg transition-all font-semibold"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate("/register")}
              className="px-6 py-2.5 bg-black text-white hover:bg-gray-900 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl hover:scale-105"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 px-6 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left - Text */}
            <div 
              className="space-y-8"
              style={{
                transform: `translateY(${scrollY * 0.1}px)`,
                transition: 'transform 0.3s ease-out'
              }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 border border-gray-300 rounded-full">
                <Sparkles className="w-4 h-4 text-gray-900" />
                <span className="text-sm text-gray-900 font-medium">Now with AI-powered features</span>
              </div>

              <h1 className="text-6xl md:text-7xl font-black leading-tight">
                Meet without
                <br />
                <span className="relative">
                  boundaries
                  <div className="absolute -bottom-2 left-0 w-full h-1 bg-black"></div>
                </span>
              </h1>

              <p className="text-xl text-gray-600 leading-relaxed max-w-xl">
                Experience the future of video conferencing. Connect with your team, 
                clients, or friends with crystal-clear quality and zero hassle.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate("/register")}
                  className="group px-8 py-4 bg-black text-white hover:bg-gray-900 rounded-xl font-semibold text-lg transition-all hover:scale-105 hover:shadow-2xl flex items-center justify-center gap-2"
                >
                  Start Free Meeting
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => navigate("/login")}
                  className="px-8 py-4 bg-white text-black hover:bg-gray-50 rounded-xl font-semibold text-lg transition-all border-2 border-gray-300 hover:border-black"
                >
                  Join a Meeting
                </button>
              </div>

              <div className="flex items-center gap-8 pt-4">
                <div className="flex -space-x-2">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 border-2 border-white"></div>
                  ))}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">100,000+ Users</p>
                  <p className="text-xs text-gray-500">Join our community</p>
                </div>
              </div>
            </div>

            {/* Right - Visual */}
            <div 
              className="relative"
              style={{
                transform: `translateY(${scrollY * -0.1}px)`,
                transition: 'transform 0.3s ease-out'
              }}
            >
              <div className="relative">
                {/* Main card */}
                <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-8 border-2 border-gray-200 shadow-2xl">
                  <div className="aspect-video bg-white rounded-2xl flex items-center justify-center border border-gray-200 overflow-hidden relative">
                    {/* Grid pattern */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
                    
                    {/* Floating elements */}
                    <div className="absolute top-4 right-4 bg-black text-white px-4 py-2 rounded-lg text-sm font-semibold">
                      ● LIVE
                    </div>
                    
                    <div className="relative text-center z-10">
                      <div className="w-20 h-20 bg-gradient-to-br from-gray-900 to-gray-700 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                        <Video className="w-10 h-10 text-white" />
                      </div>
                      <p className="text-gray-600 font-medium">Premium video quality</p>
                    </div>
                  </div>
                </div>

                {/* Floating stat cards */}
                <div className="absolute -bottom-4 -left-4 bg-white rounded-xl p-4 shadow-xl border-2 border-gray-200 animate-bounce" style={{animationDuration: '3s'}}>
                  <p className="text-2xl font-bold text-black">99.9%</p>
                  <p className="text-xs text-gray-500">Uptime</p>
                </div>

                <div className="absolute -top-4 -right-4 bg-black text-white rounded-xl p-4 shadow-xl border-2 border-black animate-bounce" style={{animationDuration: '2s', animationDelay: '0.5s'}}>
                  <p className="text-2xl font-bold">HD</p>
                  <p className="text-xs text-gray-300">Quality</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section 
        className="relative py-20 px-6 bg-gray-50"
        style={{
          transform: `translateY(${Math.max(0, 200 - scrollY * 0.5)}px)`,
          opacity: Math.min(1, scrollY / 300)
        }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div 
                key={i} 
                className="text-center p-6 bg-white rounded-2xl border-2 border-gray-200 hover:border-black hover:shadow-xl transition-all hover:-translate-y-2"
              >
                <div className="text-5xl md:text-6xl font-black text-black mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="relative py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-black mb-6">
              Signature
              <span className="relative ml-4">
                style
                <div className="absolute -bottom-2 left-0 w-full h-1 bg-black"></div>
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need for professional video conferencing
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div
                key={i}
                className="group p-8 bg-white rounded-2xl border-2 border-gray-200 hover:border-black transition-all hover:shadow-2xl hover:-translate-y-2"
              >
                <div className="w-16 h-16 bg-gray-100 group-hover:bg-black rounded-xl flex items-center justify-center mb-5 transition-all text-black group-hover:text-white">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-black">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="relative py-20 px-6 bg-black text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-black mb-6">
            Ready to get started?
          </h2>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Join thousands of teams already using MeetHub
          </p>
          <button
            onClick={() => navigate("/register")}
            className="px-12 py-5 bg-white text-black hover:bg-gray-100 rounded-xl font-bold text-lg transition-all shadow-2xl hover:scale-110"
          >
            Get Started - It's Free
          </button>
          <p className="text-sm text-gray-500 mt-6">No credit card required • Unlimited meetings</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative py-12 px-6 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                <Video className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-black">MeetHub</span>
            </div>
            
            <div className="flex gap-8 text-sm text-gray-600">
              <a href="#" className="hover:text-black transition-colors">Privacy</a>
              <a href="#" className="hover:text-black transition-colors">Terms</a>
              <a href="#" className="hover:text-black transition-colors">Contact</a>
            </div>

            <div className="text-sm text-gray-600">
              © 2026 MeetHub. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}