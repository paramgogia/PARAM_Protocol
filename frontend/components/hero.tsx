"use client"

import { ArrowRight, Zap } from "lucide-react"

export default function Hero() {
  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background via-background to-card/20">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                <Zap size={16} className="text-primary" />
                <span className="text-sm font-medium text-primary">Autonomous Revenue Allocation</span>
              </div>
              <h1 className="text-5xl sm:text-6xl font-bold text-foreground leading-tight text-balance">
                Decentralized Rewards for AI & Humans
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed text-balance">
                PARAM Protocol enables transparent, autonomous allocation of rewards between AI agents and human
                contributors. Built on blockchain for complete transparency and trust.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="px-8 py-3 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/20 flex items-center justify-center gap-2 group">
                Launch App
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-8 py-3 rounded-full border border-primary/30 text-foreground font-semibold hover:bg-primary/5 transition-colors">
                Read Whitepaper
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-border">
              <div>
                <div className="text-2xl font-bold text-primary">100%</div>
                <p className="text-sm text-muted-foreground">On-Chain Transparent</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">ERC20+721</div>
                <p className="text-sm text-muted-foreground">Token Standards</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">Gas Optimized</div>
                <p className="text-sm text-muted-foreground">Efficient Distribution</p>
              </div>
            </div>
          </div>

          {/* Right Visual */}
          <div className="relative h-96 lg:h-full min-h-96">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl blur-3xl" />
            <div className="relative h-full rounded-2xl border border-primary/20 bg-card/50 backdrop-blur-sm p-8 flex flex-col justify-center items-center space-y-6">
              <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-primary/40 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-primary" />
                </div>
              </div>
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">Smart Contract Protocol</p>
                <p className="text-lg font-semibold text-foreground">Ethereum Sepolia</p>
              </div>
              <div className="w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              <div className="grid grid-cols-2 gap-4 w-full">
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-center">
                  <p className="text-xs text-muted-foreground">Tasks</p>
                  <p className="text-lg font-bold text-primary">NFT</p>
                </div>
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-center">
                  <p className="text-xs text-muted-foreground">Rewards</p>
                  <p className="text-lg font-bold text-primary">ERC20</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
