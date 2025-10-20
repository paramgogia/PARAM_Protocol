"use client"

import { TrendingUp, Users, Zap, Globe } from "lucide-react"

const benefits = [
  {
    icon: TrendingUp,
    title: "Scalable Revenue Sharing",
    description: "Distribute rewards to unlimited contributors with automatic proportional allocation.",
  },
  {
    icon: Users,
    title: "AI + Human Collaboration",
    description: "Enable seamless collaboration between AI agents and human contributors with fair compensation.",
  },
  {
    icon: Zap,
    title: "Instant Settlement",
    description: "Rewards settle instantly on-chain with no intermediaries or delays.",
  },
  {
    icon: Globe,
    title: "Global & Borderless",
    description: "Operate across borders with blockchain-based payments and no geographic restrictions.",
  },
]

export default function Benefits() {
  return (
    <section id="benefits" className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground text-balance">Why Choose PARAM?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
            Built for the future of decentralized work and autonomous systems
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon
            return (
              <div
                key={index}
                className="flex gap-6 p-6 rounded-xl border border-border bg-card/50 hover:bg-card transition-colors"
              >
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary/20">
                    <Icon size={24} className="text-primary" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-2">{benefit.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{benefit.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
