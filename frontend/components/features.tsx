"use client"

import { Lock, Zap, Share2, BarChart3, Shield, Layers } from "lucide-react"

const features = [
  {
    icon: Lock,
    title: "Transparent Allocation",
    description:
      "Every task, contribution, and reward is recorded on-chain for complete transparency and auditability.",
  },
  {
    icon: Zap,
    title: "Autonomous Distribution",
    description: "Rewards distribute automatically based on predefined contributor shares without manual intervention.",
  },
  {
    icon: Share2,
    title: "Multi-Contributor Support",
    description: "Assign multiple contributors to tasks with proportional reward splits based on percentage shares.",
  },
  {
    icon: BarChart3,
    title: "Task Management",
    description: "Register, track, and complete tasks as NFTs with permanent on-chain records and metadata.",
  },
  {
    icon: Shield,
    title: "Security First",
    description: "Built on audited OpenZeppelin contracts with ownership controls and safe token transfers.",
  },
  {
    icon: Layers,
    title: "Modular & Extensible",
    description: "Designed for future integration with oracles, bridges, and autonomous AI agents.",
  },
]

export default function Features() {
  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground text-balance">
            Powerful Features for Modern Protocols
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
            Everything you need to manage decentralized rewards and autonomous revenue allocation
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="group p-6 rounded-xl border border-border bg-card/50 hover:bg-card hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Icon size={24} className="text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
