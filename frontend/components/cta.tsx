"use client"

import { ArrowRight, Github } from "lucide-react"

export default function CTA() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-card/50">
      <div className="max-w-4xl mx-auto">
        <div className="rounded-2xl border border-primary/30 bg-card/50 backdrop-blur-sm p-12 text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground text-balance">Ready to Build the Future?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
              Deploy PARAM Protocol on Ethereum Sepolia and start managing decentralized rewards today.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-3 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/20 flex items-center justify-center gap-2 group">
              Launch Dashboard
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="px-8 py-3 rounded-full border border-primary/30 text-foreground font-semibold hover:bg-primary/5 transition-colors flex items-center justify-center gap-2">
              <Github size={18} />
              View on GitHub
            </button>
          </div>

          <div className="pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground mb-4">Deployed on Ethereum Sepolia Testnet</p>
            <div className="flex flex-wrap justify-center gap-3">
              <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-sm text-primary font-medium">
                ERC20 + ERC721
              </span>
              <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-sm text-primary font-medium">
                OpenZeppelin Audited
              </span>
              <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-sm text-primary font-medium">
                MIT License
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
