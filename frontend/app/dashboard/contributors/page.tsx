"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Search } from "lucide-react"
import { Input } from "@/components/ui/input"

export default function ContributorsPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Contributors</h1>
            <p className="text-muted-foreground">Manage contributors and their reward allocations</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" /> Add Contributor
          </Button>
        </div>

        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search contributors..." className="pl-10" />
          </div>
        </div>
      </div>

      {/* Contributors Table */}
      <Card className="border-border/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/40 bg-card/50">
                <th className="text-left py-4 px-6 text-muted-foreground font-medium">Name</th>
                <th className="text-left py-4 px-6 text-muted-foreground font-medium">Address</th>
                <th className="text-left py-4 px-6 text-muted-foreground font-medium">Tasks</th>
                <th className="text-left py-4 px-6 text-muted-foreground font-medium">Total Rewards</th>
                <th className="text-left py-4 px-6 text-muted-foreground font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: "Alice Chen", address: "0x1234...5678", tasks: 8, rewards: "12.5K PARAM" },
                { name: "Bob Smith", address: "0x2345...6789", tasks: 5, rewards: "8.2K PARAM" },
                { name: "Carol Davis", address: "0x3456...7890", tasks: 12, rewards: "18.9K PARAM" },
                { name: "David Wilson", address: "0x4567...8901", tasks: 3, rewards: "4.1K PARAM" },
              ].map((contributor, i) => (
                <tr key={i} className="border-b border-border/40 hover:bg-card/50 transition">
                  <td className="py-4 px-6 font-medium">{contributor.name}</td>
                  <td className="py-4 px-6 font-mono text-xs text-muted-foreground">{contributor.address}</td>
                  <td className="py-4 px-6">{contributor.tasks}</td>
                  <td className="py-4 px-6 font-semibold text-primary">{contributor.rewards}</td>
                  <td className="py-4 px-6">
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
