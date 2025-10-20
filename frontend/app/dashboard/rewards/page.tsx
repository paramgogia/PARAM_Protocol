"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

const rewardData = [
  { date: "Jan 1", distributed: 2400, pending: 1200 },
  { date: "Jan 8", distributed: 3200, pending: 1400 },
  { date: "Jan 15", distributed: 2800, pending: 1800 },
  { date: "Jan 22", distributed: 3900, pending: 1200 },
  { date: "Jan 29", distributed: 4200, pending: 900 },
]

export default function RewardsPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Rewards</h1>
            <p className="text-muted-foreground">Track and manage reward distributions</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" /> Distribute Rewards
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 border-border/40">
          <p className="text-sm text-muted-foreground mb-2">Total Distributed</p>
          <p className="text-3xl font-bold">45.2K PARAM</p>
        </Card>
        <Card className="p-6 border-border/40">
          <p className="text-sm text-muted-foreground mb-2">Pending Distribution</p>
          <p className="text-3xl font-bold">8.5K PARAM</p>
        </Card>
        <Card className="p-6 border-border/40">
          <p className="text-sm text-muted-foreground mb-2">Average per Task</p>
          <p className="text-3xl font-bold">1.88K PARAM</p>
        </Card>
      </div>

      {/* Chart */}
      <Card className="p-6 border-border/40 mb-8">
        <h3 className="font-semibold mb-6">Reward Distribution Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={rewardData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="date" stroke="var(--color-muted-foreground)" />
            <YAxis stroke="var(--color-muted-foreground)" />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--color-card)",
                border: "1px solid var(--color-border)",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Line type="monotone" dataKey="distributed" stroke="var(--color-primary)" strokeWidth={2} />
            <Line type="monotone" dataKey="pending" stroke="var(--color-accent)" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Recent Distributions */}
      <Card className="border-border/40">
        <div className="p-6 border-b border-border/40">
          <h3 className="font-semibold">Recent Distributions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/40 bg-card/50">
                <th className="text-left py-4 px-6 text-muted-foreground font-medium">Task ID</th>
                <th className="text-left py-4 px-6 text-muted-foreground font-medium">Amount</th>
                <th className="text-left py-4 px-6 text-muted-foreground font-medium">Recipients</th>
                <th className="text-left py-4 px-6 text-muted-foreground font-medium">Date</th>
                <th className="text-left py-4 px-6 text-muted-foreground font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                { taskId: "#1001", amount: "2.5K PARAM", recipients: 3, date: "Jan 28", status: "Completed" },
                { taskId: "#1002", amount: "1.8K PARAM", recipients: 2, date: "Jan 27", status: "Completed" },
                { taskId: "#1003", amount: "3.2K PARAM", recipients: 5, date: "Jan 26", status: "Pending" },
              ].map((dist, i) => (
                <tr key={i} className="border-b border-border/40 hover:bg-card/50 transition">
                  <td className="py-4 px-6 font-mono text-primary">{dist.taskId}</td>
                  <td className="py-4 px-6 font-semibold">{dist.amount}</td>
                  <td className="py-4 px-6">{dist.recipients}</td>
                  <td className="py-4 px-6 text-muted-foreground">{dist.date}</td>
                  <td className="py-4 px-6">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        dist.status === "Completed"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-yellow-500/20 text-yellow-400"
                      }`}
                    >
                      {dist.status}
                    </span>
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
