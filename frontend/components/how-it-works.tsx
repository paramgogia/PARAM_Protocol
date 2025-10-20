"use client"

const steps = [
  {
    number: "01",
    title: "Register Task",
    description: "Create a new task and mint it as an NFT with metadata describing the work to be done.",
  },
  {
    number: "02",
    title: "Assign Contributors",
    description: "Define contributors and their reward share percentages. Shares must total 100%.",
  },
  {
    number: "03",
    title: "Deposit Rewards",
    description: "Deposit ERC20 tokens into the protocol to fund reward distribution.",
  },
  {
    number: "04",
    title: "Distribute Rewards",
    description: "Trigger automatic distribution. Tokens are sent to contributors based on their shares.",
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-card/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground text-balance">How PARAM Works</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
            A simple four-step process to manage decentralized rewards
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-20 left-[60%] w-[calc(100%+24px)] h-0.5 bg-gradient-to-r from-primary/50 to-transparent" />
              )}

              <div className="relative p-6 rounded-xl border border-border bg-background hover:border-primary/50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary/20 border border-primary/30">
                      <span className="text-lg font-bold text-primary">{step.number}</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-2">{step.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
