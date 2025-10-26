"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Zap, Shield, TrendingUp, Users, Coins, CheckCircle2, Sparkles } from "lucide-react"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-primary via-primary to-accent rounded-xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">PARAM</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              How It Works
            </a>
            <a
              href="#benefits"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Benefits
            </a>
          </div>
          <Link href="/dashboard">
            <Button className="bg-primary hover:bg-primary/90 font-semibold">Get Started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section - Premium Design */}
      <section className="pt-40 pb-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/15 rounded-full blur-3xl opacity-60"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/15 rounded-full blur-3xl opacity-60"></div>
          <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-primary/10 rounded-full blur-3xl opacity-40 -translate-x-1/2 -translate-y-1/2"></div>
        </div>

        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 bg-primary/10 border border-primary/30 rounded-full hover:border-primary/50 transition-colors">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <span className="text-sm font-semibold text-primary">Decentralized Revenue Allocation</span>
          </div>

          <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold mb-8 text-balance leading-tight tracking-tight">
            Autonomous Rewards for{" "}
            <span className="bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
              AI & Humans
            </span>
          </h1>

          <p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground mb-12 text-balance max-w-3xl mx-auto leading-relaxed font-light">
            PARAM Protocol enables transparent, autonomous allocation of rewards to Human Data
            contributors as well as AI agents. Built on blockchain for trust and transparency.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
            <Link href="/dashboard">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-base font-semibold px-8 h-12 rounded-full shadow-lg hover:shadow-xl transition-all"
              >
                Get Started <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="text-base font-semibold px-8 h-12 rounded-full border-2 bg-transparent"
            >
              Learn More
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-24 pt-16 border-t border-border/40">
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-3">
                100%
              </div>
              <p className="text-sm font-medium text-muted-foreground">On-Chain Transparency</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-3">
                Instant
              </div>
              <p className="text-sm font-medium text-muted-foreground">Reward Distribution</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-3">
                Secure
              </div>
              <p className="text-sm font-medium text-muted-foreground">Smart Contract Audited</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-card/50 border-y border-border/40">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold mb-6 tracking-tight">Powerful Features</h2>
            <p className="text-muted-foreground text-lg font-light">
              Everything you need to manage autonomous reward allocation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: "Data Storage",
                description: "Register tasks as NFTs with complete metadata and ownership tracking",
              },
              {
                icon: Users,
                title: "ZK-Verification",
                description: "Assign multiple contributors with customizable reward shares",
              },
              {
                icon: Coins,
                title: "Token Distribution",
                description: "Automatic proportional reward distribution using ERC20 tokens",
              },
              {
                icon: Shield,
                title: "Secure & Audited",
                description: "Built on OpenZeppelin standards with full security considerations",
              },
              {
                icon: TrendingUp,
                title: "Probabilistic Rewards",
                description: "Track tasks, rewards, and contributor performance in real-time",
              },
              {
                icon: CheckCircle2,
                title: "Transparent Ledger",
                description: "Complete on-chain history of all transactions and allocations",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="p-8 rounded-2xl border border-border/40 bg-background hover:border-primary/40 hover:shadow-lg transition-all duration-300 group"
              >
                <feature.icon className="w-10 h-10 text-primary mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="font-bold text-lg mb-3">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold mb-6 tracking-tight">How It Works</h2>
            <p className="text-muted-foreground text-lg font-light">Simple steps to get started with PARAM Protocol</p>
          </div>

          <div className="space-y-8">
            {[
              {
                step: "1",
                title: "Share Secure Data (ZK-Proof)",
                description: "Create a new task and mint it as an NFT with detailed metadata",
              },
              {
                step: "2",
                title: "Upload on IPFS",
                description: "Add contributors and define their reward share percentages",
              },
              {
                step: "3",
                title: "Fetch PTK Tokens",
                description: "Deposit PARAM tokens into the protocol for distribution",
              },
              {
                step: "4",
                title: "GGenerate AI Augmented DATA",
                description: "Automatically distribute rewards based on defined shares",
              },
            ].map((item, i) => (
              <div key={i} className="flex gap-8 items-start group">
                <div className="flex-shrink-0 w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border-2 border-primary/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="font-bold text-lg text-primary">{item.step}</span>
                </div>
                <div className="flex-1 pt-2">
                  <h3 className="font-bold text-xl mb-3">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary/10 to-accent/10 border-y border-border/40">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold mb-8 tracking-tight">Ready to Get Started?</h2>
          <p className="text-lg text-muted-foreground mb-10 font-light">
            Join the future of autonomous reward allocation
          </p>
          <Link href="/dashboard">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-base font-semibold px-8 h-12 rounded-full shadow-lg"
            >
              Launch Dashboard <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-4 sm:px-6 lg:px-8 border-t border-border/40 bg-card/30">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-lg">PARAM</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Predictive Autonomous Revenue Allocation Mechanism
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-6">Product</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Docs
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6">Company</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6">Legal</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Security
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/40 pt-8 flex flex-col sm:flex-row justify-between items-center text-sm text-muted-foreground">
            <p>&copy; 2025 PARAM Protocol. All rights reserved.</p>
            <div className="flex gap-8 mt-6 sm:mt-0">
              <a href="#" className="hover:text-foreground transition-colors">
                Twitter
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Discord
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
